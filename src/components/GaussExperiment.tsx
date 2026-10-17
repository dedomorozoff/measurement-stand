import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Eraser, Play, Sigma, Zap } from "lucide-react";
import { formatNumber } from "../utils/measurements";

const BINS = 46;
const RANGE = 6; // ±6 мм от истинного значения
const TRUE_VALUE = 100;

const SIGMAS = [
  { label: "точный прибор", s: 0.5 },
  { label: "средний класс", s: 1.0 },
  { label: "грубый прибор", s: 1.8 },
];

/** Box-Muller: отклонение с нулевым средним и заданным СКО. */
function gauss(sigma: number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function GaussExperiment() {
  const samplesRef = useRef<number[]>([]);
  const dispRef = useRef<Float64Array>(new Float64Array(BINS));
  const fallRef = useRef<{ bin: number; t: number; x: number }[]>([]);
  const [version, bump] = useReducer((value: number) => value + 1, 0);
  const [sigma, setSigma] = useState(SIGMAS[1]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const add = (count: number) => {
    const samples = samplesRef.current;
    for (let index = 0; index < count; index++) {
      const value = gauss(sigma.s);
      if (samples.length < 5000) samples.push(value);
      const bin = Math.max(
        0,
        Math.min(
          BINS - 1,
          Math.floor(((value + RANGE) / (2 * RANGE)) * BINS),
        ),
      );
      fallRef.current.push({ bin, t: -index * 0.012, x: Math.random() * 10 - 5 });
    }
    if (fallRef.current.length > 60)
      fallRef.current.splice(0, fallRef.current.length - 60);
    bump();
  };

  const reset = () => {
    samplesRef.current = [];
    dispRef.current = new Float64Array(BINS);
    fallRef.current = [];
    bump();
  };

  useEffect(() => {
    let frame = 0;
    let canvasWidth = 600;
    let canvasHeight = 360;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const reduced = prefersReducedMotion();

    const observer = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      canvasWidth = wrapRef.current.clientWidth;
      canvasHeight = Math.max(300, Math.min(380, canvasWidth * 0.42));
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    });
    if (wrapRef.current) observer.observe(wrapRef.current);

    const draw = () => {
      const target = new Float64Array(BINS);
      for (const value of samplesRef.current) {
        const bin = Math.max(
          0,
          Math.min(
            BINS - 1,
            Math.floor(((value + RANGE) / (2 * RANGE)) * BINS),
          ),
        );
        target[bin]++;
      }
      const disp = dispRef.current;
      for (let i = 0; i < BINS; i++)
        disp[i] += (target[i] - disp[i]) * (reduced ? 0.5 : 0.16);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const padL = 34;
      const padR = 14;
      const padT = 22;
      const padB = 30;
      const plotWidth = canvasWidth - padL - padR;
      const plotHeight = canvasHeight - padT - padB;
      const binWidth = plotWidth / BINS;

      const n = samplesRef.current.length;
      const unitWidth = (2 * RANGE) / BINS;
      const peakTheory =
        n > 0 ? (n * unitWidth) / (sigma.s * Math.sqrt(2 * Math.PI)) : 0;
      let maxCount = 0;
      for (let i = 0; i < BINS; i++) maxCount = Math.max(maxCount, disp[i]);
      const yMax = Math.max(6, maxCount * 1.14, peakTheory * 1.22);
      const y = (count: number) => padT + plotHeight - (count / yMax) * plotHeight;
      const x = (index: number) => padL + index * binWidth;

      ctx.strokeStyle = "#ece7f2";
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const yy = padT + (plotHeight * g) / 4;
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(canvasWidth - padR, yy);
        ctx.stroke();
        ctx.fillStyle = "#a89ab5";
        ctx.font = "10px Manrope, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(String(Math.round(yMax * (1 - g / 4))), padL - 7, yy + 4);
      }

      ctx.textAlign = "center";
      [-RANGE, 0, RANGE].forEach((delta) => {
        const xx = padL + ((delta + RANGE) / (2 * RANGE)) * plotWidth;
        ctx.fillStyle = delta === 0 ? "#8864cb" : "#a89ab5";
        ctx.fillText(
          delta === 0 ? "Xист" : `${delta > 0 ? "+" : ""}${delta}`,
          xx,
          canvasHeight - 9,
        );
      });

      for (let i = 0; i < BINS; i++) {
        const height = padT + plotHeight - y(disp[i]);
        if (height < 0.5) continue;
        ctx.fillStyle = "rgba(137,103,204,0.2)";
        ctx.fillRect(x(i) + 1, y(disp[i]), binWidth - 2, height);
        ctx.fillStyle = "rgba(137,103,204,0.9)";
        ctx.fillRect(x(i) + 1, y(disp[i]), binWidth - 2, 2);
      }

      if (n > 4) {
        ctx.beginPath();
        ctx.strokeStyle = "#c98f6b";
        ctx.lineWidth = 1.8;
        for (let px = 0; px <= plotWidth; px += 2) {
          const value = (px / plotWidth) * 2 * RANGE - RANGE;
          const pdf =
            Math.exp(-(value * value) / (2 * sigma.s * sigma.s)) /
            (sigma.s * Math.sqrt(2 * Math.PI));
          const count = n * unitWidth * pdf;
          const yy = padT + plotHeight - (count / yMax) * plotHeight;
          if (px === 0) ctx.moveTo(padL + px, yy);
          else ctx.lineTo(padL + px, yy);
        }
        ctx.stroke();
      }

      if (!reduced) {
        const dt = 1 / 60;
        fallRef.current = fallRef.current.filter((fall) => fall.t < 1.15);
        for (const fall of fallRef.current) {
          fall.t += dt * 2.6;
          if (fall.t < 0) continue;
          const progress = Math.min(1, fall.t);
          const ease = 1 - (1 - progress) * (1 - progress);
          const xx = padL + (fall.bin + 0.5) * binWidth + fall.x;
          const yy = padT + (y(disp[fall.bin]) - 8 - padT) * ease;
          ctx.beginPath();
          ctx.arc(xx, yy, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(137,103,204,${1.05 - fall.t * 0.85})`;
          ctx.fill();
        }
      }

      ctx.strokeStyle = "rgba(136,100,203,0.45)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padL + plotWidth / 2, padT);
      ctx.lineTo(padL + plotWidth / 2, padT + plotHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sigma]);

  const stats = useMemo(() => {
    void version;
    const samples = samplesRef.current;
    const n = samples.length;
    if (n === 0) return { n: 0, mean: 0, s: 0 };
    const mean = samples.reduce((a, b) => a + b, 0) / n;
    const s =
      n > 1
        ? Math.sqrt(
            samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1),
          )
        : 0;
    return { n, mean, s };
  }, [version]);

  return (
    <div className="lab-workbench">
      <div className="lab-figure">
        <div className="experiment-topline">
          <span>
            Гистограмма отклонений Δ, мм<b>деталь 100,00 мм</b>
          </span>
          <span>
            Серия<b>фиолетовым</b>
            <b className="curve-key">кривая — норм. распред.</b>
          </span>
        </div>
        <div ref={wrapRef} className="gauss-canvas">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Гистограмма ${stats.n} отклонений. Среднее ${formatNumber(
              TRUE_VALUE + stats.mean,
              3,
            )} мм, среднее квадратическое отклонение ${formatNumber(stats.s, 3)} мм.`}
          />
        </div>
      </div>
      <aside className="lab-controls">
        <span className="eyebrow">РАЗБРОС ПРИБОРА</span>
        <div className="sigma-list">
          {SIGMAS.map((option) => (
            <button
              key={option.label}
              className={sigma.label === option.label ? "active" : ""}
              aria-pressed={sigma.label === option.label}
              onClick={() => setSigma(option)}
            >
              <strong>σ = {option.s.toFixed(1)}</strong>
              <small>{option.label}</small>
            </button>
          ))}
        </div>
        <div className="lab-actions">
          <button className="secondary-button" onClick={() => add(10)}>
            <Play size={14} /> n +10
          </button>
          <button className="primary-button" onClick={() => add(150)}>
            <Zap size={14} /> Серия ×150
          </button>
          <button className="icon-button" aria-label="Сбросить серию" onClick={reset}>
            <Eraser size={17} />
          </button>
        </div>
        <div className="lab-stats">
          <span className="eyebrow">
            <Sigma size={13} /> ОБРАБОТКА РЕЗУЛЬТАТОВ
          </span>
          <div className="lab-figures">
            {[
              { k: "n", v: String(stats.n), hint: "измерений" },
              {
                k: "x̄",
                v: formatNumber(TRUE_VALUE + stats.mean, 3),
                hint: "среднее, мм",
              },
              { k: "s", v: formatNumber(stats.s, 3), hint: "СКО, мм" },
            ].map((cell) => (
              <div key={cell.k}>
                <span>{cell.k}</span>
                <b>{cell.v}</b>
                <small>{cell.hint}</small>
              </div>
            ))}
          </div>
          <div className="lab-formulas">
            <div>x̄ = (1/n) · Σxᵢ</div>
            <div>s = √[ Σ(xᵢ − x̄)² / (n − 1) ]</div>
          </div>
        </div>
        <p className="theory-advice">
          <span>
            При n → велико <b>x̄ → 100,000</b>, а разброс описывает СКО s ≈ σ.
            У точного прибора колокол уже и выше: точность задаётся разбросом σ и
            может быть повышена усреднением.
          </span>
        </p>
      </aside>
    </div>
  );
}