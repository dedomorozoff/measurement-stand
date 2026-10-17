import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eraser, Play, Sigma, Zap } from "lucide-react";
import { Reveal, Section } from "./ui";
import { cn } from "../utils/cn";

const BINS = 46;
const RANGE = 6; // ±6 мм от истинного значения

const SIGMAS = [
  { label: "точный прибор", s: 0.5 },
  { label: "средний класс", s: 1.0 },
  { label: "грубый прибор", s: 1.8 },
];

function gauss(sigma: number) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default function GaussSim() {
  const samplesRef = useRef<number[]>([]);
  const dispRef = useRef<Float64Array>(new Float64Array(BINS));
  const fallRef = useRef<{ bin: number; t: number; x: number }[]>([]);
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const [sigma, setSigma] = useState(SIGMAS[1]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const add = (n: number) => {
    const arr = samplesRef.current;
    for (let i = 0; i < n; i++) {
      const v = gauss(sigma.s);
      if (arr.length < 5000) arr.push(v);
      const bin = Math.max(0, Math.min(BINS - 1, Math.floor(((v + RANGE) / (2 * RANGE)) * BINS)));
      fallRef.current.push({ bin, t: -i * 0.012, x: Math.random() * 10 - 5 });
    }
    if (fallRef.current.length > 60) fallRef.current.splice(0, fallRef.current.length - 60);
    bump();
  };

  const reset = () => {
    samplesRef.current = [];
    dispRef.current = new Float64Array(BINS);
    fallRef.current = [];
    bump();
  };

  /* ---- drawing loop ---- */
  useEffect(() => {
    let raf = 0;
    let cw = 600, ch = 360;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const ro = new ResizeObserver(() => {
      if (wrapRef.current) {
        cw = wrapRef.current.clientWidth;
        ch = Math.max(300, Math.min(380, cw * 0.42));
        cv.width = cw * dpr;
        cv.height = ch * dpr;
        cv.style.width = `${cw}px`;
        cv.style.height = `${ch}px`;
      }
    });
    if (wrapRef.current) ro.observe(wrapRef.current);

    const draw = () => {
      // target bins
      const target = new Float64Array(BINS);
      for (const v of samplesRef.current) {
        const b = Math.max(0, Math.min(BINS - 1, Math.floor(((v + RANGE) / (2 * RANGE)) * BINS)));
        target[b]++;
      }
      const disp = dispRef.current;
      for (let i = 0; i < BINS; i++) disp[i] += (target[i] - disp[i]) * 0.16;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const padL = 30, padR = 14, padT = 26, padB = 30;
      const w = cw - padL - padR, h = ch - padT - padB;
      const binW = w / BINS;

      // y scale
      const n = samplesRef.current.length;
      const binWidth = (2 * RANGE) / BINS;
      const peakTheory = n > 0 ? (n * binWidth) / (sigma.s * Math.sqrt(2 * Math.PI)) : 0;
      let maxCount = 0;
      for (let i = 0; i < BINS; i++) maxCount = Math.max(maxCount, disp[i]);
      const yMax = Math.max(6, maxCount * 1.14, peakTheory * 1.22);
      const y = (c: number) => padT + h - (c / yMax) * h;
      const x = (i: number) => padL + i * binW;

      // grid
      ctx.strokeStyle = "rgba(46,55,65,0.5)";
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const yy = padT + (h * g) / 4;
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(cw - padR, yy);
        ctx.stroke();
        ctx.fillStyle = "#5f6c78";
        ctx.font = "9px 'JetBrains Mono'";
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round(yMax * (1 - g / 4))), padL - 6, yy + 3);
      }

      // x axis labels
      ctx.textAlign = "center";
      [-Math.round(RANGE), 0, Math.round(RANGE)].forEach((dv) => {
        const xx = padL + ((dv + RANGE) / (2 * RANGE)) * w;
        ctx.fillStyle = dv === 0 ? "#ffb320" : "#5f6c78";
        ctx.fillText(dv === 0 ? "Xист" : `${dv > 0 ? "+" : ""}${dv}`, xx, ch - 10);
      });

      // bars
      for (let i = 0; i < BINS; i++) {
        const hgt = padT + h - y(disp[i]);
        if (hgt < 0.5) continue;
        const cx = x(i);
        ctx.fillStyle = "rgba(255,179,32,0.22)";
        ctx.fillRect(cx + 1, y(disp[i]), binW - 2, hgt);
        ctx.fillStyle = "rgba(255,179,32,0.9)";
        ctx.fillRect(cx + 1, y(disp[i]), binW - 2, 2);
      }

      // theory curve
      if (n > 4) {
        ctx.beginPath();
        ctx.strokeStyle = "#3ee0f5";
        ctx.lineWidth = 1.6;
        for (let px = 0; px <= w; px += 2) {
          const v = (px / w) * 2 * RANGE - RANGE;
          const pdf = Math.exp(-(v * v) / (2 * sigma.s * sigma.s)) / (sigma.s * Math.sqrt(2 * Math.PI));
          const c = n * binWidth * pdf;
          const yy = padT + h - (c / yMax) * h;
          px === 0 ? ctx.moveTo(padL + px, yy) : ctx.lineTo(padL + px, yy);
        }
        ctx.stroke();
      }

      // falling dots
      const dt = 1 / 60;
      fallRef.current = fallRef.current.filter((f) => f.t < 1.15);
      for (const f of fallRef.current) {
        f.t += dt * 2.6;
        if (f.t < 0) continue;
        const tt = Math.min(1, f.t);
        const ease = 1 - (1 - tt) * (1 - tt);
        const xx = padL + (f.bin + 0.5) * binW + f.x;
        const yy = padT + (y(disp[f.bin]) - 8 - padT) * ease;
        ctx.beginPath();
        ctx.arc(xx, yy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,179,32," + (1.05 - f.t * 0.85) + ")";
        ctx.fill();
      }

      // zero line
      ctx.strokeStyle = "rgba(255,179,32,0.5)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padL + w / 2, padT);
      ctx.lineTo(padL + w / 2, padT + h);
      ctx.stroke();
      ctx.setLineDash([]);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [sigma]);

  /* ---- stats ---- */
  const stats = useMemo(() => {
    void version;
    const a = samplesRef.current;
    const n = a.length;
    if (n === 0) return { n: 0, mean: 0, s: 0 };
    const mean = a.reduce((x, y) => x + y, 0) / n;
    const s = n > 1 ? Math.sqrt(a.reduce((x, y) => x + (y - mean) ** 2, 0) / (n - 1)) : 0;
    return { n, mean, s };
  }, [version]);

  return (
    <Section
      id="gauss"
      chapter="03.2"
      kicker="лаборатория · эксперимент 2"
      title={
        <>
          Закон <span className="text-cyanx">больших чисел</span> глазами
        </>}
      lede="Измеряем длину эталонной детали 100.00 мм многократно. Каждая точка — отдельное измерение со случайной погрешностью; на графике — отклонения от истинного значения. Запустите серию и наблюдайте, как разброс обретает форму колокола Гаусса, а среднее арифметическое стягивается к истине."
      accent="cyan"
    >
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        {/* canvas panel */}
        <Reveal className="panel rounded-sm p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
            <span>гистограмма отклонений Δ, мм</span>
            <span className="flex gap-4">
              <span className="text-amber">▮ серия</span>
              <span className="text-cyanx">━━ норм. распред.</span>
            </span>
          </div>
          <div ref={wrapRef}>
            <canvas ref={canvasRef} className="block" />
          </div>
        </Reveal>

        {/* controls */}
        <Reveal delay={0.1} className="space-y-4">
          <div className="panel rounded-sm p-5">
            <div className="mb-3 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">σ прибора (разброс)</div>
            <div className="grid grid-cols-3 gap-2">
              {SIGMAS.map((g) => (
                <button
                  key={g.label}
                  onClick={() => setSigma(g)}
                  className={cn(
                    "border px-3 py-2.5 font-mono text-[10px] tracking-[0.1em] uppercase transition-all",
                    sigma.label === g.label ? "border-cyanx bg-cyanx/10 text-cyanx" : "border-line text-fog hover:text-paper",
                  )}
                >
                  σ={g.s.toFixed(1)}
                  <span className="block text-[9px] normal-case text-fog">{g.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => add(10)} className="flex-1 border border-line-2 px-3 py-3 font-mono text-[11px] tracking-[0.15em] uppercase text-fog transition-all hover:border-paper hover:text-paper">
                <Play size={12} className="mr-1.5 inline" />n +10
              </button>
              <button onClick={() => add(150)} className="flex-1 border border-cyanx bg-cyanx px-3 py-3 font-mono text-[11px] font-bold tracking-[0.15em] uppercase text-ink transition-transform hover:-translate-y-0.5">
                <Zap size={12} className="mr-1.5 inline" />серия ×150
              </button>
              <button onClick={reset} className="border border-line px-3 py-3 text-fog transition-colors hover:text-paper" aria-label="Сброс">
                <Eraser size={15} />
              </button>
            </div>
          </div>

          {/* stats */}
          <div className="panel rounded-sm p-5">
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
              <Sigma size={13} className="text-cyanx" /> обработка результатов
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { k: "n", v: String(stats.n), hint: "измерений" },
                { k: "x̄", v: (100 + stats.mean).toFixed(3), hint: "среднее, мм" },
                { k: "s", v: stats.s.toFixed(3), hint: "СКО, мм" },
              ].map((c) => (
                <div key={c.k} className="border border-line bg-ink px-2 py-3">
                  <div className="font-mono text-xs text-fog">{c.k}</div>
                  <div className="mt-1 font-mono text-base text-paper tabular sm:text-lg">{c.v}</div>
                  <div className="mt-0.5 font-mono text-[9px] tracking-[0.1em] uppercase text-fog/60">{c.hint}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 font-mono text-[11px] leading-relaxed text-fog">
              <div className="border border-line bg-ink px-3 py-2 text-center">x̄ = (1/n)·Σx<sub>i</sub></div>
              <div className="border border-line bg-ink px-3 py-2 text-center">s = √[ Σ(x<sub>i</sub> − x̄)² / (n − 1) ]</div>
            </div>
          </div>

          <motion.p key={sigma.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-l-2 border-cyanx/60 bg-panel p-4 text-sm leading-relaxed text-fog">
            Смотрите: при n → велико <span className="text-paper">x̄ → 100.000</span>, а разброс описывает СКО s ≈ σ.
            У точного прибора колокол уже и выше — точность определяется разбросом σ и может быть снижена усреднением.
          </motion.p>
        </Reveal>
      </div>
    </Section>
  );
}
