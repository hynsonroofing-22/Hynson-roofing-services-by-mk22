/** @type {import('tailwindcss').Config} */
// "R G B" custom properties so ink/zinc can be swapped wholesale by the
// dark-theme toggle (see tailwind-source.css :root / .dark) without
// touching a single component file. <alpha-value> is Tailwind's own
// placeholder — it substitutes the opacity modifier (e.g. the 40 in
// bg-ink-950/40) at build time.
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    /* ======================================================================
     * THE TYPE SCALE — five sizes, and these are the ONLY sizes that exist.
     *
     * Tailwind's default size names are replaced, not extended, so every
     * `text-xs` / `text-sm` / `text-lg` already in the components lands on
     * one of the five steps below, and a size outside the scale cannot be
     * written by accident. The names no longer mean their Tailwind defaults:
     *
     *   label    text-xs                      14px   eyebrows, metadata, chips
     *   body     text-sm, text-base           17-18px everything meant to be read
     *   h3       text-lg, text-xl, text-2xl   22-26px card and sub-section titles
     *   h2       text-3xl, text-4xl           32-48px section headings
     *   display  text-5xl … text-7xl          40-80px one per page
     *
     * Many of this site's visitors are older homeowners. Body text is 18px on
     * a desktop and never below 17px on a phone, and nothing anyone has to read
     * is smaller than 14px. See BUILD-BRIEF.md item 5.
     * ====================================================================== */
    fontSize: {
      xs: ["0.875rem", { lineHeight: "1.4" }],
      sm: ["clamp(1.0625rem, 0.3vw + 1rem, 1.125rem)", { lineHeight: "1.6" }],
      base: ["clamp(1.0625rem, 0.3vw + 1rem, 1.125rem)", { lineHeight: "1.6" }],
      lg: ["clamp(1.375rem, 0.8vw + 1.1rem, 1.625rem)", { lineHeight: "1.25" }],
      xl: ["clamp(1.375rem, 0.8vw + 1.1rem, 1.625rem)", { lineHeight: "1.25" }],
      "2xl": ["clamp(1.375rem, 0.8vw + 1.1rem, 1.625rem)", { lineHeight: "1.25" }],
      "3xl": ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1.05" }],
      "4xl": ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1.05" }],
      "5xl": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1" }],
      "6xl": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1" }],
      "7xl": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1" }],
    },
    extend: {
      letterSpacing: {
        /* The one tracking for uppercase mono labels. It was anywhere from
           0.12em to 0.3em; at 14px anything past ~0.12em pulls the letters
           apart into something that reads as a pattern, not a word. */
        label: "0.1em",
      },
      colors: {
        /* The semantic palette. Everything new should use these names —
           `bg-ground`, `bg-surface`, `border-line`, `text-ink-muted` — because
           they say what a colour is FOR, which is the only way a component can
           be right in both themes without being checked twice. */
        ground: v("--ground"),
        surface: {
          DEFAULT: v("--surface"),
          sunken: v("--surface-sunken"),
          hover: v("--surface-hover"),
        },
        line: {
          DEFAULT: v("--line"),
          strong: v("--line-strong"),
        },
        content: {
          DEFAULT: v("--text"),
          muted: v("--text-muted"),
          faint: v("--text-faint"),
        },
        accent: {
          DEFAULT: v("--accent"),
          hover: v("--accent-hover"),
          on: v("--on-accent"),
          /* Orange WORDS. The fill orange fails as text on a light page, so
             anything orange you read (links, the odd highlighted word) uses
             this deeper value, which passes in both themes. */
          ink: v("--accent-text"),
        },
        /* Form-box edges: dark enough to find (3:1), unlike --line. */
        field: v("--field"),
        success: v("--success"),
        warning: v("--warning"),
        danger: v("--danger"),

        /* `brand` is kept as an alias because every existing component uses
           it, but it is no longer a hard-coded hex — it now follows the accent
           token, so the orange brightens in dark mode along with everything
           else. `ember` was always the same value as DEFAULT; it stays as an
           alias so nothing that references it breaks. */
        brand: {
          DEFAULT: v("--accent"),
          bright: v("--accent-hover"),
          ember: v("--accent"),
        },
        ink: {
          700: v("--ink-700"),
          800: v("--ink-800"),
          850: v("--ink-850"),
          900: v("--ink-900"),
          950: v("--ink-950"),
        },
        zinc: {
          50: v("--zinc-50"),
          100: v("--zinc-100"),
          200: v("--zinc-200"),
          300: v("--zinc-300"),
          400: v("--zinc-400"),
          500: v("--zinc-500"),
          600: v("--zinc-600"),
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        /* Radix/shadcn's own `accent` slot. Renamed to `accent-hsl` in the
           stylesheet so it cannot collide with the semantic `accent` above —
           they meant two different things and one was silently shadowing the
           other. */
        "accent-ui": {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
      /* One radius, one shadow. Both are tokens, so "change the corner
         treatment everywhere" is a one-line edit rather than a hunt. */
      borderRadius: {
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
      },
      boxShadow: {
        card: "var(--shadow)",
        lifted: "var(--shadow-lifted)",
      },
      /* The shared spacing rhythm. Sections use these and nothing else, so
         nothing ends up a few pixels adrift from everything else. */
      spacing: {
        section: "7rem",
        "section-sm": "4.5rem",
      },
      maxWidth: {
        measure: "65ch",
        page: "80rem",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        /* The strip's dot markers, growing and shrinking as they travel.
           Transform and opacity only — both composited, neither triggers
           layout or paint, so a dozen of them running at once costs nothing. */
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        "dot-pulse": {
          "0%, 100%": { transform: "scale(0.55)", opacity: "0.45" },
          "50%": { transform: "scale(1.6)", opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        marquee: "marquee 42s linear infinite",
        "dot-pulse": "dot-pulse 3.8s ease-in-out infinite",
        "bounce-soft": "bounce-soft 1.8s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
