import { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Phone } from "lucide-react";
import {
  KNOWLEDGE,
  SMALL_TALK,
  FALLBACK,
  OPENING,
  OPENING_CHIPS,
} from "../data/chatKnowledge";
import { findAnswer } from "../lib/faqSearch";
import { PHONE_DISPLAY, PHONE_TEL } from "../data/content";
import { scrollToHash } from "./Navbar";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

/**
 * The on-site assistant.
 *
 * IT IS NOT AN AI, AND THAT IS ON PURPOSE. It cannot write a sentence. Every
 * reply it gives is one of the fixed answers in `data/chatKnowledge.js`,
 * printed word for word, and every one of those was written from what Hynson
 * publishes about itself. Anything it cannot match confidently gets the
 * fallback: it says it doesn't know and offers to have Eugene ring back.
 *
 * A real language model would handle unusual phrasing better. It would also,
 * asked "what warranty do you give", produce a confident invented number —
 * and this codebase has already shipped a fake 15-year guarantee once. See the
 * honesty rule in CLAUDE.md. Costs nothing, needs no account, no API key, and
 * cannot phone home.
 *
 * Load: this file is imported lazily from Home.jsx, so none of it — including
 * the knowledge base — is in the first download.
 */

const EASE = [0.16, 1, 0.3, 1];

// How long the "typing" pause lasts before an answer appears. Purely so the
// conversation doesn't snap, since the lookup itself takes under a
// millisecond. Short enough never to feel like waiting.
const THINKING_MS = 260;

/**
 * Chips that do something on the page rather than ask another question.
 * Matched by their exact label, so the knowledge file stays plain data.
 */
const ACTIONS = {
  "Send an enquiry": { hash: "#contact" },
  "Book a site inspection": { hash: "#contact" },
  "Get a quote": { hash: "#contact" },
  "Get in touch": { hash: "#contact" },
  "Try the instant estimator": { hash: "#calculator" },
  "Read the review": { hash: "#testimonials" },
  "Call now": { tel: true },
};

let nextId = 0;

/**
 * The launcher mark.
 *
 * Deliberately not a speech bubble — every site has one and it says nothing
 * about who you are ringing. This is a roof: two slopes meeting at a ridge,
 * with the barge line under it, drawn in the same weight as the header logo,
 * and given a single speech tail at the bottom left so it still reads as
 * "talk to us" rather than as decoration.
 *
 * Square rather than round, because the site's buttons are square; the round
 * back-to-top button sits beside it and the two need to read as two different
 * controls, not a pair.
 */
function RoofMark({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {/*
        One solid silhouette, traced anticlockwise from the ridge: down the
        right pitch to the eave, in under the overhang, down the wall, along
        the bottom, out into the speech tail, back up, and up the left side to
        the ridge again.

        Drawn as a filled shape rather than strokes because at 32px on a phone
        a stroked outline turns to mush, and because the site's logo mark is
        solid too. The eaves deliberately overhang the walls — that step is the
        one detail that makes it read as a roof rather than a generic house
        pin, and it is the thing the company actually sells.
      */}
      <path
        fill="currentColor"
        d="M16 3 L31 15.5 L26.5 15.5 L26.5 23 L15 23 L7 30 L10 23 L5.5 23 L5.5 15.5 L1 15.5 Z"
      />
    </svg>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => [
    { id: nextId++, from: "bot", text: OPENING, chips: OPENING_CHIPS },
  ]);

  const scroller = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const timer = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const panelId = `${useId()}-chat`;

  useEffect(() => () => clearTimeout(timer.current), []);

  // Keep the newest message in view. `block: "nearest"` so it never drags the
  // page behind the panel around with it.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, thinking, reduceMotion]);

  // Focus goes into the field on open and back to the launcher on close, so
  // the panel can be opened, used and dismissed without touching a mouse.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else launcherRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const say = useCallback((text) => {
    const question = text.trim();
    if (!question) return;

    setMessages((m) => [...m, { id: nextId++, from: "you", text: question }]);
    setDraft("");
    setThinking(true);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const { entry, confident } = findAnswer(question, KNOWLEDGE, SMALL_TALK);
      setThinking(false);
      setMessages((m) => [
        ...m,
        confident && entry
          ? { id: nextId++, from: "bot", text: entry.a, chips: entry.chips || [] }
          : {
              id: nextId++,
              from: "bot",
              text: FALLBACK,
              chips: ["Send an enquiry", "Call now"],
              unsure: true,
            },
      ]);
    }, THINKING_MS);
  }, []);

  const runChip = (label) => {
    const action = ACTIONS[label];
    if (!action) {
      say(label);
      return;
    }
    if (action.tel) {
      window.location.href = `tel:${PHONE_TEL}`;
      return;
    }
    setOpen(false);
    // After the panel has gone, so the section isn't scrolled to underneath it.
    setTimeout(() => scrollToHash(action.hash), 120);
  };

  return (
    <>
      {/* ---- launcher ----
          A square orange block on its own said nothing about what it did, so
          it now carries a word. On a phone it stays a square icon, because
          there is not room for both this and the back-to-top button with
          text; from `sm` up it opens out into a labelled pill. */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close the roofing assistant" : "Ask a roofing question"}
        className="btn-lift fixed bottom-5 left-5 z-40 flex h-14 items-center gap-2.5 bg-accent px-3.5 text-accent-on shadow-card hover:bg-accent-hover sm:h-14 sm:pr-5"
        data-testid="chatbot-launcher"
      >
        {open ? <X className="h-6 w-6" /> : <RoofMark className="h-7 w-7 shrink-0" />}
        <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.18em] sm:block">
          {open ? "Close" : "Ask a question"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Roofing assistant"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE }}
            // Anchored above the launcher, and on a phone it spans the width
            // with the same 20px margins as everything else. `flex-col` with
            // the scroller as the only growing child, never `items-center`
            // plus `overflow-y-auto` — that combination centres a too-tall
            // panel and clips its top off where nothing can scroll to it.
            className="fixed bottom-24 left-5 right-5 z-50 flex max-h-[min(600px,calc(100vh-9rem))] flex-col border border-line bg-surface shadow-lifted sm:right-auto sm:w-[400px]"
            data-testid="chatbot-panel"
          >
            {/* A solid orange header, so the panel reads as one object rather
                than three stacked grey bars. */}
            <header className="flex shrink-0 items-center justify-between gap-3 bg-accent px-4 py-4 text-accent-on">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/15">
                  <RoofMark className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold uppercase tracking-tight">
                    Ask about your roof
                  </p>
                  <p className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/70">
                    Straight answers · no sales pitch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 p-1.5 text-white/70 transition-colors hover:text-white"
                data-testid="chatbot-close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* data-lenis-prevent is not optional here. Lenis calls
                preventDefault on wheel events for the whole page, so without
                it this list cannot be scrolled with a wheel at all. */}
            <div
              ref={scroller}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-surface-sunken p-4"
              data-lenis-prevent
              // Replies are announced as they arrive, rather than a screen
              // reader user having to go looking for them.
              aria-live="polite"
              aria-atomic="false"
              data-testid="chatbot-messages"
            >
              {messages.map((m) => (
                <div key={m.id}>
                  <div
                    className={
                      m.from === "you"
                        ? "ml-auto w-fit max-w-[85%] bg-accent px-4 py-3 text-sm leading-relaxed text-accent-on"
                        : `w-fit max-w-[94%] border px-4 py-3 text-sm leading-relaxed shadow-card ${
                            m.unsure
                              ? "border-warning/40 bg-warning/10 text-content"
                              : "border-line bg-surface text-content"
                          }`
                    }
                    data-testid={`chatbot-msg-${m.from}`}
                  >
                    {m.text}
                  </div>
                  {!!(m.chips && m.chips.length) && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => runChip(c)}
                          className="border border-line-strong bg-surface px-3 py-2 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-content-muted transition-colors hover:border-accent hover:text-accent"
                          data-testid="chatbot-chip"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {thinking && (
                <p className="t-label text-content-faint" data-testid="chatbot-thinking">
                  Looking that up…
                </p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                say(draft);
              }}
              className="flex shrink-0 items-center gap-2 border-t border-line bg-surface p-3"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your question…"
                aria-label="Your question"
                autoComplete="off"
                // 16px so iOS Safari doesn't zoom the page on focus.
                className="h-11 min-w-0 flex-1 border border-line bg-surface-sunken px-3.5 text-base text-content outline-none transition-colors placeholder:text-content-faint focus:border-accent"
                data-testid="chatbot-input"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-accent-on transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                data-testid="chatbot-send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <a
              href={`tel:${PHONE_TEL}`}
              className="flex shrink-0 items-center justify-center gap-2 border-t border-line bg-surface-sunken px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-content-muted transition-colors hover:text-accent"
              data-testid="chatbot-call"
            >
              <Phone className="h-3 w-3 text-accent" /> Or just ring {PHONE_DISPLAY}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
