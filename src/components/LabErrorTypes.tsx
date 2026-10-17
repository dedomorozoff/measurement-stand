import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Eraser, ListOrdered, Target } from "lucide-react";
import { Reveal, Section } from "./ui";
import { cn } from "../utils/cn";

type Mode = "sys" | "rand" | "gross";

const MODES: Record<Mode, { label: string; desc: string }> = {
  sys: {
    label: "Систематическая",
    desc: "Каждый «выстрел» — повторное измерение. Все результаты кучные, но смещены от истинного значения в одну сторону: работает постоянная причина (прибор не отцентрован, несброшенный ноль).",
  },
  rand: {
    label: "Случайная",
    desc: "Результаты правильные «в среднем», но разбросаны вокруг истинного значения случайным образом. Уменьшается усреднением серии: x̄ приближается к истине при росте n.",
  },
  gross: {
    label: "Грубая (промах)",
    desc: "Почти все точки лежат кучно, но одна-две оторваны от общей группы — результат грубой ошибки или сбоя. Такие точки в метрологии обязаны исключаться из обработки.",
  },
};

function gauss(mu = 0, sigma = 1) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function makeShot(mode: Mode): { x: number; y: number } {
  if (mode === "sys") return { x: gauss(62, 9), y: gauss(-40, 9) };
  if (mode === "rand") return { x: gauss(0, 52), y: gauss(0, 52) };
  if (Math.random() < 0.22) return { x: gauss(0, 130), y: gauss(0, 130) };
  return { x: gauss(12, 8), y: gauss(6, 8) };
}

export default function LabErrorTypes() {
  const [mode, setMode] = useState<Mode>("sys");
  const [shots, setShots] = useState<{ x: number; y: number; id: number }[]>([]);
  const idRef = useRef(0);

  const fire = useCallback(
    (n: number) => {
      const batch = Array.from({ length: n }, () => ({ ...makeShot(mode), id: idRef.current++ }));
      setShots((s) => [...s, ...batch].slice(-80));
    },
    [mode],
  );

  const clear = () => setShots([]);

  const stats = useMemo(() => {
    if (shots.length < 2) return null;
    const mx = shots.reduce((a, s) => a + s.x, 0) / shots.length;
    const my = shots.reduce((a, s) => a + s.y, 0) / shots.length;
    const theta = Math.hypot(mx, my);
    const sigma = Math.sqrt(shots.reduce((a, s) => a + (s.x - mx) ** 2 + (s.y - my) ** 2, 0) / shots.length);
    return { mx, my, theta, sigma };
  }, [shots]);

  return (
    <Section
      id="lab"
      chapter="03"
      kicker="лаборатория · эксперимент 1"
      title={
        <>
          Мишень <span className="text-stroke">истинного значения</span>
        </>}
      lede="Представьте, что каждый «выстрел» — результат измерения одной и той же величины. Центр мишени — истинное значение. Выберите вид погрешности и посмотрите, как меняется картина попаданий и её числовая оценка."
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* target */}
        <Reveal className="panel relative rounded-sm p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
            <span className="flex items-center gap-2"><Target size={13} className="text-amber" /> поле измерений</span>
            <span>попаданий: <span className="text-paper tabular">{shots.length}</span></span>
          </div>
          <svg viewBox="-170 -170 340 340" className="mx-auto aspect-square w-full max-w-lg select-none">
            {/* rings */}
            {[150, 100, 50].map((r) => (
              <circle key={r} r={r} fill="none" stroke="#232a31" strokeWidth="1.5" />
            ))}
            <circle r="164" fill="none" stroke="#2e3741" strokeWidth="1" strokeDasharray="4 6" />
            <line x1="-164" y1="0" x2="164" y2="0" stroke="#232a31" strokeWidth="1" />
            <line x1="0" y1="-164" x2="0" y2="164" stroke="#232a31" strokeWidth="1" />
            {/* mean marker */}
            {stats && (
              <motion.g animate={{ x: stats.mx, y: stats.my }} transition={{ type: "spring", stiffness: 60, damping: 14 }}>
                <rect x="-7" y="-7" width="14" height="14" fill="none" stroke="#3ee0f5" strokeWidth="1.6" />
                <line x1="-11" y1="0" x2="11" y2="0" stroke="#3ee0f5" strokeWidth="1" />
                <line x1="0" y1="-11" x2="0" y2="11" stroke="#3ee0f5" strokeWidth="1" />
              </motion.g>
            )}
            {/* shots */}
            <AnimatePresence>
              {shots.map((s, i) => (
                <motion.circle
                  key={s.id}
                  cx={s.x}
                  cy={s.y}
                  r="4.5"
                  fill={mode === "sys" ? "#ffb320" : mode === "rand" ? "#3ee0f5" : i % 5 === 0 ? "#ff5d73" : "#62e6a8"}
                  initial={{ opacity: 0, scale: 3 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
            {/* bullseye */}
            <g>
              <circle r="9" fill="none" stroke="#e8eef3" strokeWidth="1.4" />
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#e8eef3" strokeWidth="1" />
              <line x1="0" y1="-16" x2="0" y2="16" stroke="#e8eef3" strokeWidth="1" />
            </g>
            <text y="-178" x="-160" fill="#8b98a4" fontSize="10" fontFamily="JetBrains Mono">● — результат измерения</text>
            <text y="-178" x="60" fill="#8b98a4" fontSize="10" fontFamily="JetBrains Mono">□ — среднее x̄</text>
          </svg>
          <p className="mt-3 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-fog/60">
            центр прицела = X<sub>ист</sub>
          </p>
        </Reveal>

        {/* controls */}
        <Reveal delay={0.1}>
          <div className="space-y-3">
            <div className="grid gap-2">
              {(Object.keys(MODES) as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex items-center justify-between border px-5 py-4 text-left transition-all duration-300",
                    mode === m ? "border-amber bg-amber/10" : "border-line hover:border-line-2",
                  )}
                >
                  <span className="font-display text-xs font-semibold uppercase tracking-wide sm:text-sm">{MODES[m].label}</span>
                  <span className={cn("size-2 rounded-full", mode === m ? "bg-amber" : "bg-line-2")} />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => fire(1)} className="flex-1 border border-line-2 px-4 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-fog transition-all hover:border-paper hover:text-paper">
                <Crosshair size={13} className="mr-2 inline-block" />отсчёт ×1
              </button>
              <button onClick={() => fire(12)} className="glow-amber flex-1 border border-amber bg-amber px-4 py-3 font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-ink transition-transform hover:-translate-y-0.5">
                <ListOrdered size={13} className="mr-2 inline-block" />серия ×12
              </button>
              <button onClick={clear} className="border border-line px-4 py-3 text-fog transition-colors hover:text-paper" aria-label="Сброс">
                <Eraser size={15} />
              </button>
            </div>

            {/* stats */}
            <div className="panel space-y-4 rounded-sm p-5">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-fog">оценка по выборке</div>
              {[
                { label: "θ — смещение среднего x̄ от Xист", v: stats?.theta ?? 0, max: 150, color: "bg-amber", name: "систематическая" },
                { label: "σ — разброс повторных отсчётов", v: stats?.sigma ?? 0, max: 150, color: "bg-cyanx", name: "случайная" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-xs text-fog">{row.label}</span>
                    <span className="font-mono text-sm text-paper tabular">{row.v.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                    <motion.div className={cn("h-full rounded-full", row.color)} animate={{ width: `${Math.min(100, (row.v / row.max) * 100)}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="border-l-2 border-amber/60 bg-panel p-4 text-sm leading-relaxed text-fog"
              >
                {MODES[mode].desc}
              </motion.p>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
