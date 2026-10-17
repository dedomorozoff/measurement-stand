import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, Shuffle, Target } from "lucide-react";
import { Reveal, Section } from "./ui";
import { cn } from "../utils/cn";

const VMAX = 300;
const TICK_STEP = 10; // цена деления, В
const CX = 180, CY = 200, R = 150;

const angleOf = (v: number) => -60 + (v / VMAX) * 120;
const polar = (deg: number, r: number) => ({
  x: CX + r * Math.sin((deg * Math.PI) / 180),
  y: CY - r * Math.cos((deg * Math.PI) / 180),
});
const arcPath = (v0: number, v1: number, r: number) => {
  const a = polar(angleOf(v0), r), b = polar(angleOf(v1), r);
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${v1 - v0 > VMAX / 2 ? 1 : 0} 1 ${b.x} ${b.y}`;
};

const GRADES = [0.5, 1.0, 1.5, 2.5, 4.0];

export default function VirtualGauge() {
  const [mode, setMode] = useState<"demo" | "train">("demo");
  const [trueV, setTrueV] = useState(210);
  const [grade, setGrade] = useState(1.5);

  /* trainer */
  const [task, setTask] = useState(() => Math.round((Math.random() * 0.7 + 0.15) * 600) / 2);
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState<null | { ok: boolean; err: number }>(null);
  const [score, setScore] = useState({ ok: 0, n: 0 });

  const dDop = useMemo(() => (grade * VMAX) / 100, [grade]);
  const shown = mode === "demo" ? trueV : task;
  const bandLo = Math.max(0, shown - dDop);
  const bandHi = Math.min(VMAX, shown + dDop);

  const newTask = () => {
    setTask(Math.round((Math.random() * 0.7 + 0.15) * 600) / 2);
    setAnswer("");
    setVerdict(null);
  };

  const check = () => {
    const v = parseFloat(answer.replace(",", "."));
    if (Number.isNaN(v)) return;
    const err = Math.abs(v - task);
    const ok = err <= TICK_STEP / 2 + 0.001;
    setVerdict({ ok, err });
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
  };

  return (
    <Section
      id="gauge"
      chapter="06"
      kicker="тренажёр · виртуальный вольтметр"
      title={
        <>
          Прибор на <span className="text-amber">вашем столе</span>
        </>}
      lede="Стрелочный вольтметр 0–300 В, цена деления 10 В. В режиме «демонстрация» задайте величину и класс точности — увидите полосу допустимой погрешности. В режиме «тренажёр» — снимите показание и проверьте себя."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* gauge */}
        <Reveal className="panel rounded-sm p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
            <span>вольтметр · кл. {String(grade).replace(".", ",")}</span>
            <div className="flex gap-1">
              {(["demo", "train"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); if (m === "train") { setAnswer(""); setVerdict(null); } }}
                  className={cn(
                    "border px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-all",
                    mode === m ? "border-amber bg-amber/10 text-amber" : "border-line text-fog hover:text-paper",
                  )}
                >
                  {m === "demo" ? "демонстрация" : "тренажёр"}
                </button>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 360 240" className="mx-auto w-full max-w-xl select-none">
            <defs>
              <linearGradient id="face2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#171c22" />
                <stop offset="1" stopColor="#0d1013" />
              </linearGradient>
            </defs>
            {/* face */}
            <path d={`M ${polar(-62, R + 14).x} ${polar(-62, R + 14).y} A ${R + 14} ${R + 14} 0 1 1 ${polar(62, R + 14).x} ${polar(62, R + 14).y} L 300 232 L 60 232 Z`} fill="url(#face2)" stroke="#2e3741" strokeWidth="1.4" />
            {/* error band */}
            <path d={arcPath(bandLo, bandHi, R - 2)} fill="none" stroke="rgba(62,224,245,0.28)" strokeWidth="14" strokeLinecap="round" />
            {/* ticks */}
            {Array.from({ length: VMAX / TICK_STEP + 1 }, (_, i) => {
              const v = i * TICK_STEP;
              const a = angleOf(v);
              const major = v % 60 === 0;
              const p1 = polar(a, major ? R - 16 : R - 9);
              const p2 = polar(a, R);
              const lp = polar(a, R - 30);
              return (
                <g key={v}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={major ? "#8b98a4" : "#3a4650"} strokeWidth={major ? 1.8 : 1} />
                  {major && (
                    <text x={lp.x} y={lp.y + 3} textAnchor="middle" fill="#8b98a4" fontSize="11" fontFamily="JetBrains Mono">{v}</text>
                  )}
                </g>
              );
            })}
            <text x={CX} y={92} textAnchor="middle" fill="#ffb320" fontSize="13" fontFamily="JetBrains Mono" letterSpacing="4">V</text>
            <text x={CX} y={110} textAnchor="middle" fill="#5f6c78" fontSize="8" fontFamily="JetBrains Mono" letterSpacing="2">0–300 В · КЛАСС {String(grade).replace(".", ",")}</text>
            {/* needle */}
            <g style={{ transform: `rotate(${angleOf(shown)}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform .7s cubic-bezier(.34,1.4,.4,1)" }}>
              <line x1={CX} y1={CY} x2={CX} y2={CY - R + 24} stroke="#ffb320" strokeWidth="2.6" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,179,32,.6))" }} />
            </g>
            <circle cx={CX} cy={CY} r="10" fill="#0a0c0e" stroke="#ffb320" strokeWidth="2" />
            {/* readout */}
            <rect x={CX - 52} y={207} width={104} height={20} fill="#0a0c0e" stroke="#2e3741" />
            <text x={CX} y={221} textAnchor="middle" fill="#62e6a8" fontSize="12" fontFamily="JetBrains Mono" className="tabular">
              {shown.toFixed(1)} В
            </text>
          </svg>
          <p className="mt-2 text-center font-mono text-[10px] tracking-[0.2em] uppercase text-fog/60">
            <span className="text-cyanx">голубая полоса</span> — допустимый разброс показаний ±Δ<sub>доп</sub>
          </p>
        </Reveal>

        {/* controls */}
        <Reveal delay={0.1}>
          <AnimatePresence mode="wait">
            {mode === "demo" ? (
              <motion.div key="demo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="panel rounded-sm p-5">
                  <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
                    <span>истинное напряжение</span>
                    <span className="text-paper tabular text-sm">{trueV} В</span>
                  </div>
                  <input type="range" min={0} max={300} step={1} value={trueV} onChange={(e) => setTrueV(+e.target.value)} className="w-full" />
                </div>
                <div className="panel rounded-sm p-5">
                  <div className="mb-3 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">класс точности κ</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {GRADES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGrade(g)}
                        className={cn(
                          "border px-2 py-2.5 font-mono text-sm transition-all",
                          grade === g ? "border-amber bg-amber/10 text-amber" : "border-line text-fog hover:text-paper",
                        )}
                      >
                        {String(g).replace(".", ",")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { k: "цена деления C", v: `${TICK_STEP} В/дел`, c: "text-paper" },
                    { k: "Δдоп = κ·300/100", v: `± ${dDop.toFixed(2)} В`, c: "text-amber" },
                    { k: "в делениях шкалы", v: `± ${(dDop / TICK_STEP).toFixed(2)} дел`, c: "text-cyanx" },
                    { k: "δmax при 300 В", v: `${grade.toFixed(2)} %`, c: "text-mint" },
                  ].map((r) => (
                    <div key={r.k} className="border border-line bg-ink px-4 py-3">
                      <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-fog">{r.k}</div>
                      <div className={cn("mt-1 font-mono text-base tabular sm:text-lg", r.c)}>{r.v}</div>
                    </div>
                  ))}
                </div>
                <p className="border-l-2 border-amber/60 bg-panel p-4 text-sm leading-relaxed text-fog">
                  Для прибора одинаковая Δ<sub>доп</sub> по всей шкале — её считают от{" "}
                  <span className="text-paper">предела</span>, а не от показания. Поэтому в начале шкалы относительная
                  погрешность резко растёт.
                </p>
              </motion.div>
            ) : (
              <motion.div key="train" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                <div className="panel rounded-sm p-5">
                  <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
                    <Target size={13} className="text-amber" /> задача: снимите показание
                  </div>
                  <p className="text-sm leading-relaxed text-fog">
                    Запишите показание вольтметра в вольтах. Ответ засчитывается с точностью до половины деления
                    (±5 В) — такова отсчётная погрешность.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <input
                      type="number"
                      value={answer}
                      onChange={(e) => { setAnswer(e.target.value); setVerdict(null); }}
                      onKeyDown={(e) => e.key === "Enter" && check()}
                      placeholder="напр., 215"
                      className="w-full border border-line bg-ink px-4 py-3 font-mono text-lg text-paper outline-none transition-colors focus:border-amber"
                    />
                    <button onClick={check} className="glow-amber border border-amber bg-amber px-5 py-3 font-mono text-[11px] font-bold tracking-[0.15em] uppercase text-ink transition-transform hover:-translate-y-0.5">
                      <Check size={14} className="mr-1 inline" /> ответ
                    </button>
                    <button onClick={newTask} className="border border-line-2 px-4 py-3 text-fog transition-all hover:border-paper hover:text-paper">
                      <Shuffle size={15} />
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    {verdict && (
                      <motion.div
                        key={String(verdict.ok) + verdict.err}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn("mt-4 border p-4 text-sm", verdict.ok ? "border-mint/50 bg-mint/5 text-mint" : "border-rose/50 bg-rose/5 text-rose")}
                      >
                        {verdict.ok
                          ? <>Верно. Стрелка стоит на {(Math.round(task / TICK_STEP) * TICK_STEP).toFixed(0)} В — отсчёт с точностью до полуделения выполнен правильно.</>
                          : <>Стрелка показывает <span className="font-mono">{task.toFixed(1)} В</span>. Ваш отсчёт отличается на <span className="font-mono">{verdict.err.toFixed(1)} В</span> — больше полуделения. Посмотрите на соседние штрихи: между цифрами 10 В на деление.</>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-line bg-ink px-4 py-3">
                    <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-fog">верных отсчётов</div>
                    <div className="mt-1 font-mono text-lg text-mint tabular">{score.ok} / {score.n}</div>
                  </div>
                  <button
                    onClick={() => setScore({ ok: 0, n: 0 })}
                    className="border border-line px-4 py-3 text-left font-mono text-[10px] tracking-[0.15em] uppercase text-fog transition-colors hover:text-paper"
                  >
                    <RotateCcw size={13} className="mb-1 text-fog" /> сброс счёта
                  </button>
                </div>
                <p className="border-l-2 border-cyanx/60 bg-panel p-4 text-sm leading-relaxed text-fog">
                  Правило отсчёта: цифры результата берут до той цифры, которой соответствует отсчётная погрешность —
                  обычно <span className="text-paper">±0.5 цены деления</span> шкалы.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </Section>
  );
}
