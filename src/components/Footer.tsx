import { Crosshair, Sigma, BookOpen, Gauge } from "lucide-react";
import { Reveal } from "./ui";

const FORMULAS = [
  { f: "Δ = Xизм − Xист", t: "абсолютная погрешность" },
  { f: "δ = Δ/X · 100 %", t: "относительная погрешность" },
  { f: "γ = Δ/XN · 100 %", t: "приведённая погрешность" },
  { f: "Δдоп = κ·XN / 100", t: "предел по классу точности" },
  { f: "s = √[Σ(xi − x̄)² / (n − 1)]", t: "оценка СКО (Бессель)" },
  { f: "P = −Δ", t: "поправка к результату" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink-2 px-5 pt-16 pb-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-8 flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] uppercase text-fog">
            <Sigma size={14} className="text-amber" />
            формулы на вынос · шпаргалка стенда
          </div>
        </Reveal>

        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FORMULAS.map((x) => (
            <div key={x.f} className="group bg-ink-2 p-5 transition-colors hover:bg-panel">
              <div className="font-mono text-sm text-amber sm:text-base">{x.f}</div>
              <div className="mt-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-fog">{x.t}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-8 border-t border-line pt-8 md:flex-row md:items-center">
          <a href="#top" className="group flex items-center gap-3">
            <span className="grid size-9 place-items-center border border-amber/60 bg-amber/10 text-amber transition-colors group-hover:bg-amber group-hover:text-ink">
              <Crosshair size={17} strokeWidth={1.8} />
            </span>
            <span className="font-display text-sm font-semibold tracking-[0.18em] uppercase">
              Метро<span className="text-amber">стенд</span>
            </span>
          </a>

          <div className="flex flex-wrap items-center gap-6 font-mono text-[10px] tracking-[0.2em] uppercase text-fog">
            <span className="flex items-center gap-2"><BookOpen size={12} /> погрешности измерений · классификация</span>
            <span className="flex items-center gap-2"><Gauge size={12} /> средства измерений · свойства</span>
          </div>

          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fog/50">
            учебный стенд · метрология · глава 01–02
          </span>
        </div>
      </div>
    </footer>
  );
}
