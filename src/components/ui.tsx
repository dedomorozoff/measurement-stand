import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

/* ---------- scroll reveal ---------- */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ---------- section shell ---------- */
export function Section({
  id,
  chapter,
  kicker,
  title,
  lede,
  children,
  className,
  accent = "amber",
}: {
  id: string;
  chapter: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  className?: string;
  accent?: "amber" | "cyan";
}) {
  const acc = accent === "amber" ? "text-amber" : "text-cyanx";
  return (
    <section id={id} className={cn("relative scroll-mt-24 px-5 py-24 sm:px-10 lg:px-16 lg:py-32", className)}>
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-4 flex items-center gap-4 font-mono text-[11px] tracking-[0.35em] uppercase text-fog">
            <span className={acc}>{chapter}</span>
            <span className="h-px w-14 bg-line-2" />
            <span>{kicker}</span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display text-[clamp(1.6rem,4.2vw,3.4rem)] font-semibold leading-[1.08] uppercase tracking-tight">
            {title}
          </h2>
        </Reveal>
        {lede && (
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-fog sm:text-lg">{lede}</p>
          </Reveal>
        )}
        <div className="mt-12 lg:mt-16">{children}</div>
      </div>
    </section>
  );
}

/* ---------- marquee ---------- */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink-2 py-3">
      <div className="flex w-max animate-marquee gap-0 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center font-mono text-xs tracking-[0.3em] uppercase text-fog">
            <span className="px-6">{t}</span>
            <span className="text-amber">+</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- formula block ---------- */
export function Formula({
  formula,
  legend,
  className,
}: {
  formula: ReactNode;
  legend: [string, string][];
  className?: string;
}) {
  return (
    <div className={cn("panel rounded-sm p-5", className)}>
      <div className="rounded-sm border border-line-2 bg-ink px-4 py-4 text-center font-mono text-lg text-amber sm:text-xl">
        {formula}
      </div>
      <dl className="mt-4 space-y-1.5">
        {legend.map(([sym, def]) => (
          <div key={sym} className="flex gap-3 text-[13px] leading-snug">
            <dt className="min-w-16 font-mono text-cyanx">{sym}</dt>
            <dd className="text-fog">— {def}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
