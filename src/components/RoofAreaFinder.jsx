import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Info, MapPin, Check, ChevronDown } from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/**
 * "Find my roof size" — address in, roof area out.
 *
 * Most people have no idea what their roof area is, and that is the single
 * thing standing between them and a usable estimate. This looks the address up
 * against LINZ's open building-outline data and fills the number in for them.
 *
 * Rules that shape the whole component:
 *
 *  - A footprint is not a roof area. LINZ gives the flat outline seen from
 *    above; a pitched roof is bigger than the ground it covers. The pitch
 *    factor is applied here and the working is shown in full, so nobody thinks
 *    the number is more precise than it is.
 *  - Never guess. If the address or building can't be found we say so in one
 *    sentence and leave the slider alone.
 *
 * PRIVACY: the address goes to our own function by POST (never a URL), is used
 * once, and is not stored. Suggestions are cached in memory for the session
 * only — going back a step doesn't re-query — and that cache dies with the tab.
 */

// Geometric pitch correction: roof surface ÷ footprint = 1 / cos(pitch).
// These match the three pitch buttons in the calculator.
export const PITCH_FACTORS = { low: 1.04, medium: 1.1, steep: 1.22 };
const PITCH_WORDS = { low: "low pitch", medium: "medium pitch", steep: "steep pitch" };

// 120ms, down from 220ms.
//
// A debounce only pays for itself while a request is expensive. The lookup
// used to take ~3 seconds, so waiting was the least of the problem; now that
// the server answers in ~120ms the debounce is a real share of the delay the
// visitor feels, and it can come down. Below about 100ms it stops saving
// requests at all — a fast typist fires one per key — so this is roughly the
// floor worth using.
const DEBOUNCE_MS = 120;
const MIN_QUERY = 3;

// The server returns at most this many suggestions. Knowing the cap matters:
// if a query came back full, the list was truncated, and narrowing it locally
// could hide a match that never made it into the cached page. Local filtering
// is therefore only trusted when the cached list was short of the cap.
const SUGGEST_CAP = 6;

// How long a request may be in flight before the spinner appears. Under this,
// the answer arrives first and no spinner is ever painted — a spinner that
// flashes for 90ms makes a fast interface look busy rather than quick.
const SPINNER_AFTER_MS = 250;

// Buildings shown before the "others nearby" expander.
const VISIBLE_BUILDINGS = 3;

/**
 * Where the serverless function lives.
 *
 * `/api/roof-area` is the tidy path from netlify.toml. It only exists once
 * Netlify's redirects are in play — under `netlify dev`, or in production.
 * If the site is opened straight on the CRA dev server (port 3000) that path
 * doesn't exist, and CRA answers with index.html instead. So we fall back to
 * the raw function path, and if THAT also returns a page we say so out loud
 * rather than silently showing nothing.
 */
const ENDPOINTS = ["/api/roof-area", "/.netlify/functions/roof-area"];

// Once one endpoint has answered with real JSON, every later call goes
// straight to it. Without this, a dev server that answers `/api/roof-area`
// with HTML costs a wasted round trip on every single keystroke.
let knownEndpoint = null;

/**
 * POSTs to the function and insists on real JSON coming back.
 *
 * The previous version wrapped this in `catch { setSuggestions([]) }`, which
 * made a dead function, a bad key, an HTTP error and a genuinely unknown
 * address all look identical on screen: nothing. Every failure now carries a
 * reason, gets logged to the console, and is shown differently to the visitor.
 */
async function postJson(payload, signal) {
  let lastError = null;
  const order = knownEndpoint
    ? [knownEndpoint, ...ENDPOINTS.filter((u) => u !== knownEndpoint)]
    : ENDPOINTS;

  for (const url of order) {
    try {
      const res = await fetch(url, {
        method: "POST", // never GET — a GET would put the address in the URL
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });
      const type = res.headers.get("content-type") || "";
      if (!type.includes("application/json")) {
        // Getting HTML back is the signature of the function not running.
        throw new Error(
          `${url} replied ${res.status} with "${type || "no content-type"}" instead of JSON — ` +
            `the lookup function isn't running. Start the site with \`netlify dev\`.`
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(`${url} replied HTTP ${res.status}`);
      knownEndpoint = url;
      return data;
    } catch (err) {
      // A cancelled request is not a failure — a newer keystroke replaced it.
      if (err && err.name === "AbortError") throw err;
      lastError = err;
      // Try the next endpoint before giving up.
    }
  }
  throw lastError || new Error("No lookup endpoint responded.");
}

/** Normalised cache key — case and run-of-spaces insensitive. */
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

export default function RoofAreaFinder({ pitch, onPick }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // "idle" | "short" | "searching" | "ok" | "empty" | "error" — four of these
  // used to be indistinguishable (an empty box). Each now reads differently.
  const [suggestState, setSuggestState] = useState("idle");
  const [suggestError, setSuggestError] = useState(null);
  const [state, setState] = useState({ status: "idle" });
  // Index of the building currently applied to the slider, and whether the
  // "other buildings" list is unfolded.
  const [chosen, setChosen] = useState(0);
  const [showAll, setShowAll] = useState(false);
  // Only true once a request has been slow enough to be worth a spinner.
  const [slow, setSlow] = useState(false);

  // query → { list, truncated }. Lives for the tab's lifetime only.
  const cache = useRef(new Map());
  const inFlight = useRef(null);
  const warmed = useRef(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const blurTimer = useRef(null);
  // Height of the collapsed building list, in px, captured before it expands.
  // Unfolding the extras then scrolls inside exactly that box instead of
  // growing the panel, so nothing below it moves at all.
  const listBox = useRef(null);
  const [collapsedH, setCollapsedH] = useState(null);
  const reduceMotion = usePrefersReducedMotion();

  const listId = `${useId()}-addresses`;
  const factor = PITCH_FACTORS[pitch] ?? 1;

  /**
   * Answers from the cache alone, if it honestly can.
   *
   * If "72 hals" came back with three addresses and was not truncated, then
   * "72 halse" can only be those three narrowed down — the server would run
   * the same prefix match. Filtering them here is exact, not approximate, and
   * costs no network at all, so continuing to type feels instant.
   *
   * The truncation check is what keeps this honest: a full page of results may
   * have had more behind it, and narrowing a partial page could hide the very
   * address being typed.
   */
  const fromCache = useCallback((q) => {
    const key = norm(q);
    const exact = cache.current.get(key);
    if (exact) return exact.list;

    let best = null;
    for (const [k, v] of cache.current) {
      if (!key.startsWith(k) || v.truncated || !v.list.length) continue;
      if (!best || k.length > best.key.length) best = { key: k, list: v.list };
    }
    if (!best) return null;
    return best.list.filter((s) => norm(s.label).startsWith(key));
  }, []);

  // Type-ahead. Debounced, cancellable, and answered from memory whenever
  // memory can answer it truthfully.
  useEffect(() => {
    const q = query.trim();
    if (q.length === 0) {
      setSuggestions([]);
      setSuggestState("idle");
      return undefined;
    }
    if (q.length < MIN_QUERY) {
      setSuggestions([]);
      setSuggestState("short");
      return undefined;
    }

    const cached = fromCache(q);
    if (cached && cached.length) {
      setSuggestions(cached);
      setSuggestState("ok");
      return undefined;
    }

    setSuggestError(null);
    setSlow(false);
    let cancelled = false;

    // The spinner is armed, not shown. If the answer beats it, it never
    // appears — which for a ~120ms lookup is nearly every time.
    const spinner = setTimeout(() => {
      if (!cancelled) {
        setSlow(true);
        setSuggestState((s) => (s === "ok" ? s : "searching"));
      }
    }, SPINNER_AFTER_MS);

    const t = setTimeout(async () => {
      // Cancel whatever is still in the air. Without this, a slow reply to
      // "72 h" can land after a fast reply to "72 halsey" and overwrite it
      // with the wrong list.
      if (inFlight.current) inFlight.current.abort();
      const ctl = new AbortController();
      inFlight.current = ctl;
      const t0 = performance.now();
      try {
        const data = await postJson({ mode: "suggest", q }, ctl.signal);
        if (cancelled) return;
        const list = data.suggestions || [];
        cache.current.set(norm(q), {
          list,
          truncated: list.length >= SUGGEST_CAP,
        });
        setSuggestions(list);
        setSuggestState(list.length ? "ok" : "empty");
        if (process.env.NODE_ENV !== "production") {
          console.info(
            `[roof-area] "${q}" → ${list.length} in ${Math.round(performance.now() - t0)}ms ` +
              `(server ${data.ms ?? "?"}ms, ${data.source || "-"})`
          );
        }
      } catch (err) {
        if (cancelled || (err && err.name === "AbortError")) return;
        // Logged in full so it can be read in the console and pasted back.
        console.error("[roof-area] address suggestions failed:", err);
        setSuggestions([]);
        setSuggestError(err.message);
        setSuggestState("error");
      } finally {
        clearTimeout(spinner);
        if (!cancelled) setSlow(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
      clearTimeout(spinner);
    };
  }, [query, fromCache]);

  useEffect(
    () => () => {
      clearTimeout(blurTimer.current);
      if (inFlight.current) inFlight.current.abort();
    },
    []
  );

  /**
   * Wakes the lookup up when the box is focused, before a key is pressed.
   *
   * It sends no address and asks no question. All it does is pay the costs
   * that would otherwise land on the first keystroke — DNS, the TLS
   * handshake, and Netlify starting the function if it has gone cold. By the
   * time someone has typed three characters the connection is already open.
   */
  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    postJson({ mode: "warm" }).catch(() => {
      // A failed warm-up changes nothing — the real request will report it.
    });
  }, []);

  const runLookup = useCallback(async (payload) => {
    setOpen(false);
    setState({ status: "loading" });
    setChosen(0);
    setShowAll(false);
    try {
      const data = await postJson(payload);
      if (!data.ok) {
        setState({ status: "error", message: data.message || "That lookup didn't work." });
        return;
      }
      setState({
        status: "done",
        buildings: data.buildings,
        confidence: data.confidence,
        // Kept so the map step can open on the right house rather than making
        // someone find it from a view of the whole of Auckland.
        lat: payload.lat ?? data.lat ?? null,
        lon: payload.lon ?? data.lon ?? null,
        label: payload.label || data.matched || null,
      });
    } catch (err) {
      console.error("[roof-area] lookup failed:", err);
      setState({ status: "error", message: err.message });
    }
  }, []);

  /**
   * Hands the most likely building straight to the calculator.
   *
   * Selecting an address used to produce a list of about ten outlines and no
   * default, so the common case — one house, one roof — still cost a decision
   * and a click, and the list was long enough to push the Next button off a
   * phone screen. The server now ranks them (the outline the address point
   * falls inside comes first) and the top one is applied on arrival. Everything
   * else is still there to correct it with; nothing is hidden, it is just no
   * longer in the way.
   */
  useEffect(() => {
    if (state.status !== "done" || !state.buildings || !state.buildings.length) return;
    const b = state.buildings[0];
    onPick(Math.round(b.footprint * factor), {
      footprint: b.footprint,
      factor,
      pitch,
      lat: state.lat,
      lon: state.lon,
      label: state.label,
      confidence: state.confidence,
    });
    // Deliberately keyed on the result alone, not on `pitch` or `onPick`.
    // Changing the pitch afterwards is the calculator's business, and
    // re-firing here would fight the slider if the visitor has since moved it
    // by hand.
  }, [state.status, state.buildings]); // eslint-disable-line

  const pickBuilding = (b, i) => {
    setChosen(i);
    onPick(Math.round(b.footprint * factor), {
      footprint: b.footprint,
      factor,
      pitch,
      lat: state.lat,
      lon: state.lon,
      label: state.label,
      confidence: state.confidence,
    });
  };

  const chooseSuggestion = (s) => {
    setQuery(s.label);
    setSuggestions([]);
    // The suggestion already carries its coordinate, so no second geocode.
    runLookup({ lat: s.lat, lon: s.lon, label: s.label });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (open && active >= 0 && suggestions[active]) {
      chooseSuggestion(suggestions[active]);
      return;
    }
    const q = query.trim();
    if (q.length < 5) {
      setState({ status: "error", message: "Enter a street address, suburb and city." });
      return;
    }
    runLookup({ address: q });
  };

  const onKeyDown = (e) => {
    if (!open || !suggestions.length) {
      if (e.key === "ArrowDown" && suggestions.length) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      chooseSuggestion(suggestions[active]);
    }
  };

  // The panel opens for anything worth saying — including "keep typing" and
  // the two failure cases. It must never just sit there empty.
  const showList = open && suggestState !== "idle";

  const buildings = state.status === "done" ? state.buildings : [];
  const extras = Math.max(0, buildings.length - VISIBLE_BUILDINGS);
  const shown = showAll ? buildings : buildings.slice(0, VISIBLE_BUILDINGS);

  return (
    // No `overflow-hidden` here. It used to clip the suggestions list to a
    // sliver — the backdrop image is clipped by its own wrapper instead.
    <div
      className="relative border border-ink-700/40 bg-ink-850/60 p-5 sm:p-7"
      data-testid="roof-area-finder"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Faint aerial texture behind the address entry.
          This is a real Hynson drone shot (hero-bg-original — a re-roof with
          the scaffold still up), pre-blurred and pre-darkened into a 4KB WebP
          so the browser never runs an expensive blur filter.

          14%, not the 7% first tried: at 7% it was genuinely invisible against
          this panel and was costing a DOM node for nothing. At 14% it reads as
          a faint tonal shift and still never as a photograph. Compared both
          side by side before settling on it.

          Safe in both themes because the estimator section is always dark (it
          carries its own `dark` class for the page's dark-band rhythm), so
          this never sits on a light ground. Decorative only: aria-hidden, lazy
          loaded, gradient-masked so it fades rather than ending on a hard edge.
          No stock or generated imagery — every photo on this site is a real
          Hynson job. */}
      <img
        src="/img/estimator-backdrop.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width="1000"
        height="640"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
      />
      </div>

      <div className="relative">
      <p className="font-display text-base font-bold uppercase tracking-tight text-zinc-50">
        Don't know your roof size?
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        Start typing and we'll work out how big your roof is.
      </p>

      <form onSubmit={onSubmit} className="relative mt-5 flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => {
              setOpen(true);
              warm();
            }}
            // Delayed so a click on a suggestion lands before the list closes.
            onBlur={() => {
              blurTimer.current = setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={onKeyDown}
            placeholder="Start typing your address…"
            autoComplete="off"
            // Combobox semantics, so screen readers announce the list and the
            // highlighted option rather than just an unlabelled text box.
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-label="Your street address"
            // text-base (16px) is deliberate: anything smaller makes iOS Safari
            // zoom the whole page in when the field is focused.
            className="h-[54px] w-full border border-ink-700/40 bg-ink-900 px-4 text-base text-zinc-100 placeholder-zinc-600 outline-none transition-colors duration-200 focus:border-brand"
            data-testid="roof-finder-input"
          />
          {slow && (
            <Loader2
              className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 ${
                reduceMotion ? "" : "animate-spin"
              }`}
              data-testid="roof-finder-spinner"
            />
          )}

          {showList && (
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Address suggestions"
              // Rendered IN FLOW, not as an absolute overlay. An overlay was
              // being clipped twice over — by this panel and by the estimator's
              // animated-height wrapper, both of which need overflow-hidden —
              // so suggestions appeared as an unreadable sliver. In flow the
              // panel simply grows (the height ResizeObserver picks it up), and
              // on a phone the list pushes content down instead of sitting
              // under the on-screen keyboard.
              className="mt-2 max-h-64 overflow-y-auto overscroll-contain border border-ink-700/50 bg-ink-900"
              data-lenis-prevent
              data-testid="roof-finder-suggestions"
            >
              {suggestions.map((s, i) => (
                <li key={`${s.label}-${i}`} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    // onMouseDown, not onClick: mousedown fires before the
                    // input's blur, so the list is still open when it lands.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      chooseSuggestion(s);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-start gap-2.5 px-4 py-3 text-left text-sm transition-colors duration-150 ${
                      i === active ? "bg-brand/15 text-zinc-50" : "text-zinc-300 hover:bg-ink-850"
                    }`}
                    data-testid={`roof-finder-suggestion-${i}`}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                    {s.label}
                  </button>
                </li>
              ))}
              {suggestState === "short" && (
                <li className="px-4 py-3 text-sm text-zinc-500" data-testid="roof-finder-hint">
                  Keep typing — {MIN_QUERY} characters or more.
                </li>
              )}
              {suggestState === "searching" && !suggestions.length && (
                <li className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-500" data-testid="roof-finder-searching">
                  <Loader2 className={`h-3.5 w-3.5 ${reduceMotion ? "" : "animate-spin"}`} />
                  Searching addresses…
                </li>
              )}
              {suggestState === "empty" && (
                <li className="px-4 py-3 text-sm text-zinc-500" data-testid="roof-finder-nomatch">
                  No matches — enter your roof size with the slider instead.
                </li>
              )}
              {suggestState === "error" && (
                <li className="px-4 py-3" data-testid="roof-finder-suggest-error">
                  <p className="text-sm text-brand-ember">The address lookup isn't responding.</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Use the slider above instead. Details are in the browser console.
                  </p>
                </li>
              )}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={state.status === "loading"}
          className="btn-lift flex h-[54px] shrink-0 items-center justify-center gap-2 bg-brand px-6 font-mono text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors duration-200 hover:bg-brand-bright disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="roof-finder-submit"
        >
          {state.status === "loading" ? (
            <>
              <Loader2 className={`h-4 w-4 ${reduceMotion ? "" : "animate-spin"}`} /> Looking
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Find
            </>
          )}
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-3 text-sm text-brand-ember" data-testid="roof-finder-error">
          {state.message} You can still set your roof size with the slider above.
        </p>
      )}

      {state.status === "done" && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
          data-testid="roof-finder-results"
        >
          <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">
            {state.confidence === "high"
              ? "Roof size filled in below"
              : "Nearest building — check this is yours"}
          </p>

          {/* Capped and scrollable rather than allowed to grow.
              Some sections come back with half a dozen outlines. Letting the
              list run to full height pushed the estimator's Next button off a
              phone screen, so the extras scroll inside this box instead. The
              cap is the height the list already had when collapsed, measured
              rather than guessed, because a card is one line taller on a phone
              than on a desktop — so unfolding moves nothing by even a pixel. */}
          <div
            ref={listBox}
            className={`mt-3 grid gap-2 ${showAll ? "overflow-y-auto overscroll-contain pr-1" : ""}`}
            style={showAll && collapsedH ? { maxHeight: collapsedH } : undefined}
            data-lenis-prevent
          >
            {shown.map((b, i) => {
              const roof = Math.round(b.footprint * factor);
              const isChosen = i === chosen;
              return (
                <button
                  key={b.id || i}
                  type="button"
                  aria-pressed={isChosen}
                  onClick={() => pickBuilding(b, i)}
                  className={`group flex items-center justify-between gap-4 border px-4 py-3.5 text-left transition-colors duration-200 ${
                    isChosen
                      ? "border-brand bg-brand/10"
                      : "border-ink-700/40 bg-ink-900 hover:border-brand/60 hover:bg-ink-850"
                  }`}
                  data-testid={`roof-finder-building-${i}`}
                >
                  <span className="min-w-0">
                    {/* The size leads, because the size is what identifies it
                        to the person standing outside the house. */}
                    <span className="block font-display text-lg font-bold text-zinc-50">
                      Roof approx. {roof} m²
                    </span>
                    {/* The working, in full — footprint, pitch, result. */}
                    <span className="mt-0.5 block font-mono text-[10px] tracking-[0.12em] text-zinc-500 uppercase">
                      Footprint {b.footprint} m² · {PITCH_WORDS[pitch] || "pitch"} ×{factor}
                      {b.distance === 0
                        ? " · your address is on this one"
                        : b.distance != null && ` · ${b.distance}m from your address`}
                    </span>
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors duration-200 ${
                      isChosen ? "text-brand" : "text-zinc-500 group-hover:text-brand"
                    }`}
                  >
                    {isChosen ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Using this
                      </>
                    ) : (
                      "Use this"
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {extras > 0 && (
            <button
              type="button"
              onClick={() => {
                // Measured on the way out of the collapsed state, so the box
                // keeps exactly the size it already occupies.
                if (!showAll && listBox.current) {
                  setCollapsedH(Math.round(listBox.current.getBoundingClientRect().height));
                }
                setShowAll((v) => !v);
              }}
              aria-expanded={showAll}
              className="mt-2 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-zinc-500 uppercase transition-colors hover:text-brand"
              data-testid="roof-finder-more-buildings"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`}
              />
              {showAll ? "Show fewer" : `${extras} other building${extras > 1 ? "s" : ""} nearby`}
            </button>
          )}

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Measured from the national property records. A look at the roof gives the exact figure.
          </p>
        </motion.div>
      )}
      </div>
    </div>
  );
}
