import { useEffect, useState } from "react";
import { Check } from "lucide-react";

/**
 * Work a roof size out from a description of the house.
 *
 * The fallback for anyone whose address doesn't resolve, who can't find their
 * house from the air, or who simply doesn't want to click a map. Nobody has to
 * measure anything or know anything technical — just how many bedrooms, how
 * many storeys, and roughly how old.
 *
 * WHERE THE NUMBERS COME FROM, and why this is honest.
 *
 * These are floor-area bands, not Hynson's data and not presented as such. A
 * three-bedroom single-storey New Zealand house has a fairly predictable
 * footprint, and a two-storey house of the same bedroom count has roughly half
 * the roof, because the same rooms are stacked rather than spread. The era
 * adjustment is the same idea: houses have got larger over time, and a 1940s
 * three-bedroom is genuinely smaller than a 2015 three-bedroom.
 *
 * It is deliberately shown as a RANGE and labelled an estimate, because that
 * is what it is. It says "about this much" and then invites the address or the
 * map for something firmer. No claim is made about Hynson, no price is
 * attached to it, and no figure here is presented as a measurement.
 */

const BEDROOMS = [
  { id: "1-2", label: "1–2 bedrooms", base: 78 },
  { id: "3", label: "3 bedrooms", base: 112 },
  { id: "4", label: "4 bedrooms", base: 148 },
  { id: "5", label: "5 or more", base: 195 },
];

const STOREYS = [
  // A two-storey house stacks the same floor area onto half the footprint,
  // so its roof is roughly 55-60% of the single-storey equivalent.
  { id: "one", label: "Single storey", factor: 1 },
  { id: "two", label: "Two storeys", factor: 0.58 },
];

const ERA = [
  { id: "pre70", label: "Before 1970", factor: 0.88 },
  { id: "70-99", label: "1970s–1990s", factor: 1 },
  { id: "2000s", label: "2000 or later", factor: 1.15 },
];

const btn = (on) =>
  `btn-lift border px-4 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
    on
      ? "border-accent bg-accent/10 text-accent"
      : "border-line-strong bg-surface text-content-muted hover:border-accent/60 hover:text-content"
  }`;

export default function HouseDescriber({ onArea, pitchFactor = 1 }) {
  const [beds, setBeds] = useState(null);
  const [storeys, setStoreys] = useState(null);
  const [era, setEra] = useState(null);

  const complete = beds && storeys && era;

  const b = BEDROOMS.find((x) => x.id === beds);
  const s = STOREYS.find((x) => x.id === storeys);
  const e = ERA.find((x) => x.id === era);

  const footprint = complete ? Math.round(b.base * s.factor * e.factor) : 0;
  const roof = Math.round(footprint * pitchFactor);
  // ±15%, rounded to the nearest 5, because a tidy-looking single number would
  // imply a precision this method does not have.
  const low = Math.round((roof * 0.85) / 5) * 5;
  const high = Math.round((roof * 1.15) / 5) * 5;

  useEffect(() => {
    if (complete && footprint > 0) {
      onArea({ footprint, roof, low, high });
    } else {
      onArea(null);
    }
    // eslint-disable-next-line
  }, [footprint, roof, complete]);

  const Group = ({ title, options, value, set, testid }) => (
    <div>
      <p className="t-label text-content-faint">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2" data-testid={testid}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => set(o.id)}
            aria-pressed={value === o.id}
            className={btn(value === o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div data-testid="house-describer">
      <p className="t-small text-content-muted">
        No measuring, no map. Three questions about the house and we'll give you a sensible
        range to work with.
      </p>

      <div className="mt-6 grid gap-6">
        <Group title="How many bedrooms?" options={BEDROOMS} value={beds} set={setBeds} testid="describe-beds" />
        <Group title="How many storeys?" options={STOREYS} value={storeys} set={setStoreys} testid="describe-storeys" />
        <Group title="Roughly when was it built?" options={ERA} value={era} set={setEra} testid="describe-era" />
      </div>

      {complete && (
        <div
          className="mt-6 flex items-start gap-3 border border-accent/40 bg-accent/10 p-5"
          data-testid="describe-result"
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            <p className="font-display text-xl font-bold text-content">
              Roof likely {low}–{high} m²
            </p>
            <p className="mt-1 t-small text-content-muted">
              A typical {b.label.toLowerCase()} {s.label.toLowerCase()} home of that era. For
              something firmer, try your address or trace the roof on the map — both take under
              a minute.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
