import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Building2, Siren, Wrench, Layers, Droplets, PaintRoller, ArrowUpRight } from "lucide-react";
import { SERVICES } from "../data/content";
import { scrollToHash } from "./Navbar";

const ICONS = {
  residential: Home,
  commercial: Building2,
  emergency: Siren,
  repair: Wrench,
  "new-install": Layers,
  gutters: Droplets,
  painting: PaintRoller,
};

// The two featured (wide) tiles get a real job photo behind them instead of
// flat colour — breaks up the text-heavy grid without touching the other five.
const FEATURED_IMAGES = {
  residential: "/img/proj-residential-roof-replacement.webp",
  painting: "/img/about.jpg",
};

export default function Services() {
  return (
    <section id="services" className="bg-ink-900 py-28 sm:py-36" data-testid="services-section">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-brand-ember uppercase">— What we do</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4rem)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-zinc-50">
              Specialists, <span className="text-stroke">not generalists</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm text-zinc-400">
              Specialist roofing crews across Auckland, one point of contact from quote to sign-off.
            </p>
            {/* This section is a summary now — the seven cards below are the
                pick of twelve, and the hub page carries all of them with a
                page each for the six people actually search for. */}
            <Link
              to="/services"
              className="btn-lift mt-5 inline-flex items-center gap-2 border border-line-strong bg-surface px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-content hover:border-accent hover:text-accent"
              data-testid="services-see-all"
            >
              All 12 services <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-px bg-ink-700/30 sm:grid-cols-2 lg:grid-cols-3" data-testid="services-bento-grid">
          {SERVICES.map((s, i) => {
            const Icon = ICONS[s.id];
            const featured = i === 0 || i === 6;
            const photo = FEATURED_IMAGES[s.id];
            return (
              <motion.a
                key={s.id}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHash("#contact");
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                className={`group relative flex flex-col overflow-hidden p-8 transition-colors duration-200 ${
                  photo ? "" : "bg-ink-850 hover:bg-ink-800"
                } ${featured ? "lg:col-span-2" : ""}`}
                data-testid={`service-card-${s.id}`}
              >
                {photo && (
                  <>
                    {/* Decorative: the card's own heading already names the
                        service, so an alt here would just be read out twice. */}
                    <img
                      src={photo}
                      alt=""
                      aria-hidden="true"
                      width="1024"
                      height="1024"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
                  </>
                )}
                <div className="relative flex items-start justify-between">
                  <motion.span
                    whileHover={{ scale: 1.15 }}
                    className={`font-mono text-xs tracking-[0.25em] transition-colors duration-200 group-hover:text-brand ${photo ? "text-white/50" : "text-zinc-600"}`}
                  >
                    {s.num}
                  </motion.span>
                  <Icon className={`h-6 w-6 transition-transform duration-200 group-hover:-translate-y-1 ${photo ? "text-brand-bright" : "text-brand"}`} />
                </div>
                <p className="relative mt-8 font-mono text-[10px] tracking-[0.25em] text-brand-ember uppercase">{s.tag}</p>
                <h3 className={`relative mt-2 font-display text-xl font-bold uppercase tracking-tight ${photo ? "text-white" : "text-zinc-50"}`}>{s.title}</h3>
                <p className={`relative mt-3 flex-1 text-sm leading-relaxed ${photo ? "text-white/80" : "text-zinc-400"}`}>{s.desc}</p>
                <ul className="relative mt-5 space-y-1.5">
                  {s.points.map((p) => (
                    <li key={p} className={`flex items-center gap-2 text-xs ${photo ? "text-white/70" : "text-zinc-500"}`}>
                      <span className="h-1 w-1 rotate-45 bg-brand" /> {p}
                    </li>
                  ))}
                </ul>
                <div
                  className={`relative mt-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors group-hover:text-brand-ember ${photo ? "text-white/70" : "text-zinc-500"}`}
                >
                  Enquire <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <span className="absolute bottom-0 left-0 z-10 h-[2px] w-0 bg-brand transition-all duration-500 group-hover:w-full" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
