import { useRef, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowDown, Gauge, Sigma, TrendingUp } from "lucide-react";

/* animated analog dial */
function Dial() {
  const needle = useRef<SVGLineElement>(null);
  const [val, setVal] = useState("220.0");
  const t0 = useRef(Math.PI / 4 + Math.random());

  useAnimationFrame((t) => {
    const time = t / 1000;
    const base = Math.sin(time * 0.55 + t0.current) * 38;
    const jitter = (Math.random() - 0.5) * 1.6; // random error
    const angle = base + 6 + jitter; // +6 = systematic error
    if (needle.current) needle.current.setAttribute("transform", `rotate(${angle} 150 160)`);
    if ((t | 0) % 5 === 0) setVal(((angle / 76) * 300 + 150).toFixed(1));
  });

  const ticks = Array.from({ length: 25 }, (_, i) => {
    const a = (-38 + (i / 24) * 76) * (Math.PI / 180);
    const outer = 118;
    const inner = i % 4 === 0 ? 102 : 110;
    return {
      x1: 150 + Math.sin(a) * inner,
      y1: 160 - Math.cos(a) * inner,
      x2: 150 + Math.sin(a) * outer,
      y2: 160 - Math.cos(a) * outer,
      major: i % 4 === 0,
    };
  });

  return (
    <div className="relative">
      <svg viewBox="0 0 300 210" className="w-full max-w-md drop-shadow-[0_0_40px_rgba(255,179,32,0.12)]">
        <defs>
          <linearGradient id="dialFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#161b20" />
            <stop offset="1" stopColor="#0d1013" />
          </linearGradient>
        </defs>
        {/* face */}
        <path d="M 20 160 A 130 130 0 0 1 280 160 L 286 160 L 286 196 L 14 196 L 14 160 Z" fill="url(#dialFace)" stroke="#2e3741" strokeWidth="1.4" />
        <path d="M 40 160 A 110 110 0 0 1 260 160" fill="none" stroke="#2e3741" strokeWidth="1" />
        {/* ticks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.major ? "#8b98a4" : "#3a4650"} strokeWidth={t.major ? 1.6 : 1} />
        ))}
        <text x="150" y="70" textAnchor="middle" fill="#ffb320" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="3">V</text>
        <text x="150" y="86" textAnchor="middle" fill="#8b98a4" fontSize="7" fontFamily="JetBrains Mono" letterSpacing="2">КЛАСС 1.5</text>
        {/* needle */}
        <line ref={needle} x1="150" y1="160" x2="150" y2="52" stroke="#ffb320" strokeWidth="2.4" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,179,32,.7))" }} />
        <circle cx="150" cy="160" r="9" fill="#0a0c0e" stroke="#ffb320" strokeWidth="2" />
        {/* zero offset markers */}
        <text x="34" y="152" fill="#8b98a4" fontSize="9" fontFamily="JetBrains Mono">0</text>
        <text x="258" y="152" fill="#8b98a4" fontSize="9" fontFamily="JetBrains Mono">300</text>
        {/* digital readout */}
        <rect x="118" y="172" width="64" height="16" fill="#0a0c0e" stroke="#2e3741" />
        <text x="150" y="184" textAnchor="middle" fill="#62e6a8" fontSize="10" fontFamily="JetBrains Mono">{val}</text>
      </svg>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="panel absolute -left-2 top-6 hidden rounded-sm px-4 py-3 font-mono text-[10px] leading-relaxed text-fog sm:block"
      >
        <span className="text-cyanx">Δсист</span> = +18 В<br />
        <span className="text-amber">σ</span> = 2.3 В
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="panel absolute -right-2 bottom-14 hidden rounded-sm px-4 py-3 font-mono text-[10px] leading-relaxed text-fog sm:block"
      >
        X<span className="text-[7px] align-sub">ист</span> = 227.0 В<br />
        n → ∞
      </motion.div>
    </div>
  );
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section id="top" className="bg-blueprint relative flex min-h-screen flex-col overflow-hidden">
      {/* glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-amber/8 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[380px] w-[420px] rounded-full bg-cyanx/6 blur-[110px]" />

      {/* vertical ruler decoration */}
      <div className="pointer-events-none absolute right-6 top-24 hidden h-[70vh] w-px bg-line-2 xl:block">
        {Array.from({ length: 21 }).map((_, i) => (
          <span key={i} className="absolute right-0 h-px bg-line-2" style={{ top: `${(i / 20) * 100}%`, width: i % 5 === 0 ? 18 : 8 }} />
        ))}
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-14 px-5 pt-32 pb-10 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.4em] uppercase text-amber"
          >
            <span className="inline-block h-px w-10 bg-amber" /> учебный стенд · метрология
          </motion.p>

          <h1 className="font-display text-[clamp(2rem,6.5vw,4.6rem)] font-bold uppercase leading-[1.02] tracking-tight">
            <motion.span className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.05, ease }}>
              Погрешности
            </motion.span>
            <motion.span className="text-stroke block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.15, ease }}>
              измерений
            </motion.span>
            <motion.span className="block text-amber" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease }}>
              и средства<span className="text-paper"> их изучения</span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
            className="mt-7 max-w-xl text-base leading-relaxed text-fog sm:text-lg"
          >
            Классификация погрешностей с интерактивными моделями, симулятор серии измерений,
            калькулятор погрешностей и виртуальный измерительный прибор — всё для практического
            освоения темы.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a href="#lab" className="group relative overflow-hidden border border-amber bg-amber px-7 py-3.5 font-mono text-xs font-bold tracking-[0.2em] uppercase text-ink transition-transform hover:-translate-y-0.5">
              <span className="relative z-10 transition-colors duration-300 group-hover:text-amber">В лабораторию</span>
              <span className="absolute inset-0 translate-y-full bg-ink transition-transform duration-300 group-hover:translate-y-0" />
            </a>
            <a href="#theory" className="border border-line-2 px-7 py-3.5 font-mono text-xs tracking-[0.2em] uppercase text-fog transition-all hover:border-paper hover:text-paper">
              Начать с теории
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease }}
          className="relative flex justify-center lg:justify-end"
        >
          <Dial />
        </motion.div>
      </div>

      {/* stats strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="mx-auto w-full max-w-7xl px-5 pb-10 sm:px-10 lg:px-16"
      >
        <div className="grid grid-cols-2 divide-line border-y border-line sm:grid-cols-4 sm:divide-x">
          {[
            { icon: Sigma, k: "3 типа", v: "погрешностей разобраны" },
            { icon: TrendingUp, k: "2 модели", v: "интерактивных симулятора" },
            { icon: Gauge, k: "5 классов", v: "точности приборов" },
            { icon: ArrowDown, k: "8 вопросов", v: "итогового контроля" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-5">
              <s.icon size={20} strokeWidth={1.5} className="shrink-0 text-amber" />
              <div>
                <div className="font-display text-sm font-semibold uppercase sm:text-base">{s.k}</div>
                <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-fog">{s.v}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
