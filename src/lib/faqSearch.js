/**
 * The matching engine behind the on-site assistant.
 *
 * This is deliberately NOT an AI model. It does not generate text: it scores
 * what someone typed against a fixed list of answers written from Hynson's own
 * published information, and prints the best one word for word. If nothing
 * scores well enough it says it doesn't know.
 *
 * That constraint is the feature. A language model asked "what warranty do you
 * offer" will produce a confident, plausible, completely invented number; this
 * physically cannot, because there is no sentence anywhere in it that contains
 * one. See the honesty rule in CLAUDE.md.
 *
 * It costs nothing to run, needs no API key or account, works offline, and
 * adds about 3KB to the page.
 *
 * What it handles:
 *  - typos and misspellings, via edit distance ("guttering", "gutteirng")
 *  - partial words, via prefix matching ("emerg", "reroof")
 *  - word order, because it scores tokens rather than strings
 *  - filler words, which are dropped before scoring
 *
 * What it does not handle, and where a paid AI model would genuinely be
 * better: a question phrased with none of the words in the vocabulary, two
 * questions in one message, or a follow-up that only makes sense in the
 * context of the previous answer. Those fall through to the "I'll get Eugene
 * to call you" reply, which is the right outcome but not a clever one.
 */

// Words that carry no meaning for matching. Dropping them stops "do you do
// roof painting" scoring a generic entry highly just because it shares "do
// you do" with it.
//
// Deliberately NOT in here, despite being obvious candidates: "much" (because
// "how much" is the price question), "get" ("get a quote"), "who" ("who are
// you"), "need" ("do I need a new roof") and "cover" ("do you cover Henderson").
// Each of those is the only load-bearing word in a real question people ask.
const STOPWORDS = new Set(
  ("a an the is are am was were be been do does did doing done have has had i " +
    "we you they he she it me my our your their this that these those of for " +
    "to in on at by with from about please can could would should will shall " +
    "may might if and or but so as any some there here what whats which " +
    "when where why got getting able els im ive " +
    "youre dont doesnt cant just really very more most also too").split(" ")
);

/**
 * Lowercase, strip accents and punctuation, collapse whitespace.
 *
 * NFD splits an accented letter into the plain letter plus a combining mark,
 * and the a-z0-9 filter on the next line then drops the mark — so "Te Atatū"
 * matches someone typing "te atatu", with no accent table needed.
 */
export function normalise(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Three characters, not two. Two-letter words in English are almost all
// function words — "go", "in", "my", "at" — and letting them through gave them
// the full unknown-word penalty, which was enough to sink "do you go to
// Hamilton" below the confidence floor on the strength of the word "go".
const MIN_TOKEN = 3;

export function tokenise(s) {
  const words = normalise(s)
    .split(" ")
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t));
  const kept = words.filter((t) => t.length >= MIN_TOKEN);
  // "hi" and "hey" are two letters and are the entire message. Rather than
  // special-case a greeting list, if the length rule leaves nothing at all we
  // take what there was.
  return kept.length ? kept : words;
}

/**
 * Damerau-Levenshtein edit distance, capped.
 *
 * Damerau rather than plain Levenshtein because a swapped pair of adjacent
 * letters is the single most common way people mistype a word — "paitn" for
 * "paint", "gutteirng" for "guttering". Plain Levenshtein charges two edits
 * for that, which pushes an obvious typo outside the allowance; Damerau
 * charges one, which is what a reader's eye does.
 *
 * Bails out as soon as the whole row exceeds `max`, so a long word compared
 * against a completely different long word costs almost nothing.
 */
function editDistance(a, b, max) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  // Three rows, because a transposition needs to look two back.
  let prev2 = null;
  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        v = Math.min(v, prev2[j - 2] + 1);
      }
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
    cur = prev2 === cur ? new Array(b.length + 1) : new Array(b.length + 1);
  }
  return prev[b.length];
}

/**
 * How well one typed word matches one vocabulary word, 0 to 1.
 *
 * The typo allowance scales with length on purpose: two edits inside a
 * four-letter word is a different word, but two edits inside "guttering" is
 * still obviously "guttering".
 */
function wordScore(typed, known) {
  if (typed === known) return 1;
  if (typed.length >= 4 && known.startsWith(typed)) return 0.9;
  if (known.length >= 4 && typed.startsWith(known)) return 0.85;
  if (typed.length >= 5 && known.length >= 5 && known.includes(typed)) return 0.7;
  const allowed = typed.length >= 8 ? 2 : typed.length >= 4 ? 1 : 0;
  if (!allowed) return 0;
  const d = editDistance(typed, known, allowed);
  if (d > allowed) return 0;
  return d === 1 ? 0.72 : 0.55;
}

/**
 * Pre-tokenises an entry's vocabulary once, and caches it on the entry.
 *
 * Note this does NOT use `tokenise`. That function drops words under three
 * letters, which is right for what a visitor types but wrong here: it silently
 * deleted "hi" and "yo" from the greeting entry's own vocabulary, so typing
 * "hi" matched nothing at all. A vocabulary keeps every word it was given.
 */
function entryVocab(entry) {
  if (!entry.__vocab) {
    const words = new Set(
      `${entry.k || ""} ${entry.q || ""}`
        .split(/\s+/)
        .map(normalise)
        .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    );
    entry.__vocab = [...words];
  }
  return entry.__vocab;
}

/**
 * How much a word is worth, from how many entries mention it.
 *
 * This turned out to be the whole ball game. Without it, "my roof is leaking"
 * matched the re-roofing entry as well as the leak-repair one, because almost
 * every entry in a roofing knowledge base contains the word "roof" — the one
 * word that carries no information here. Meanwhile "leaking" appears in
 * exactly one entry and is the only word in the sentence that says anything.
 *
 * So each word is weighted by how rare it is across the whole knowledge base:
 * "roof" ends up near zero, "leaking", "spouting" and "henderson" near one.
 * Standard inverse document frequency, scaled into 0-1.
 */
function buildIndex(entries) {
  const df = new Map();
  for (const e of entries) {
    for (const w of entryVocab(e)) df.set(w, (df.get(w) || 0) + 1);
  }
  const n = entries.length;
  const ceiling = Math.log(n + 1);
  const idf = new Map();
  for (const [w, count] of df) {
    idf.set(w, Math.log((n + 1) / (count + 0.5)) / ceiling);
  }
  return idf;
}

// One index per corpus. The corpus is a module constant, so in practice this
// is built once for the life of the page.
const indexCache = new WeakMap();
function indexFor(entries) {
  let idx = indexCache.get(entries);
  if (!idx) {
    idx = buildIndex(entries);
    indexCache.set(entries, idx);
  }
  return idx;
}

// What a word the knowledge base has never heard of is assumed to be worth.
// Above 1 on purpose: an unknown word is usually the distinctive one in the
// sentence — "solar", "deck", "scaffolding", "asbestos" — and it is exactly
// the word that should stop a confident answer. "Do you install solar panels"
// has to fall through to "I don't know", not land on the roofing entry that
// happens to share the word "install".
const UNKNOWN_WEIGHT = 1.2;

/**
 * Finds a token's rarity weight, matching fuzzily against the whole corpus.
 *
 * This is what an unmatched word is weighed by, and getting it wrong was a
 * real bug. A word can be missing from one entry and still be a common word
 * overall — "roof" is absent from the leak-repair entry's vocabulary but is
 * in most others. Charging that absence the full unknown-word penalty made
 * "do you do roof painting" lose to the pricing entry, purely because the
 * pricing entry happened to list "roof" and the painting one didn't.
 *
 * So an unmatched-but-known word is weighed by its own low rarity, and only a
 * genuinely unknown word takes the penalty.
 */
function corpusWeight(token, idf) {
  const exact = idf.get(token);
  if (exact !== undefined) return exact;
  let best = 0;
  let bestIdf = UNKNOWN_WEIGHT;
  for (const [w, v] of idf) {
    const s = wordScore(token, w);
    if (s > best) {
      best = s;
      bestIdf = v;
      if (s === 1) break;
    }
  }
  return best >= 0.7 ? bestIdf : UNKNOWN_WEIGHT;
}

/**
 * Scores one entry against the typed tokens, 0 to 1.
 *
 * A weighted average of how well each typed word matched, where the weight is
 * that word's rarity. Matching the rare words is what counts; matching "roof"
 * barely moves it either way.
 */
function scoreEntry(entry, tokens, idf) {
  const vocab = entryVocab(entry);
  let scored = 0;
  let weight = 0;
  for (const t of tokens) {
    let best = 0;
    let bestWord = null;
    for (const w of vocab) {
      const s = wordScore(t, w);
      if (s > best) {
        best = s;
        bestWord = w;
      }
      if (best === 1) break;
    }
    const w = best > 0 && bestWord ? (idf.get(bestWord) ?? UNKNOWN_WEIGHT) : corpusWeight(t, idf);
    scored += best * w;
    weight += w;
  }
  return weight > 0 ? scored / weight : 0;
}

// Below this, we do not pretend to know. Tuned against the question list in
// the test harness: real roofing questions land between 0.55 and 1.0, and
// things this site genuinely cannot answer ("do you install solar panels",
// "what's the weather", "can you build me a deck") land under 0.3.
const CONFIDENCE_FLOOR = 0.45;

/**
 * Finds the best answer for a typed message.
 *
 * Returns `{ entry, score, confident }`. `confident` false means the caller
 * should use the fallback reply — never the entry — but the entry is still
 * handed back so it can be offered as a "did you mean" suggestion.
 */
export function findAnswer(message, knowledge, smallTalk = []) {
  const tokens = tokenise(message);
  if (!tokens.length) return { entry: null, score: 0, confident: false };

  const idf = indexFor(knowledge);

  let best = null;
  let bestScore = 0;
  // Small talk is only allowed to win on a short message. "Hi, my roof is
  // leaking" is a roofing question with a greeting attached, not a greeting.
  const pool = tokens.length <= 3 ? [...smallTalk, ...knowledge] : knowledge;

  for (const entry of pool) {
    if (entry.exactish && tokens.length > 3) continue;
    const s = scoreEntry(entry, tokens, idf);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }

  return {
    entry: best,
    score: Number(bestScore.toFixed(3)),
    confident: bestScore >= CONFIDENCE_FLOOR,
  };
}

export const _internals = { editDistance, wordScore, scoreEntry, buildIndex, CONFIDENCE_FLOOR };
