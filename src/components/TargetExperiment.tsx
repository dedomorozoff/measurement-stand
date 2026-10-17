import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crosshair, Eraser, ListOrdered } from "lucide-react";

type Mode = "sys" | "rand" | "gross";

const MODES: Record<Mode, { label: string; short: string; desc: string }> = {
  sys: {
    label: "Систематическая",
    short: "Кучно, но со сдвигом",
    desc: "Каждый выстрел - повторное измерение одной и той же величины. Результаты кучные, но смещены от истинного значения в одну сторону: действует постоянная причина, например не сброшенный ноль прибора. Усреднение не помогает.",
  },
  rand: {
    label: "Случайная",
    short: "Разброс вокруг истины",
    desc: "Результаты в среднем верны, но разбросаны вокруг истинного значения случайным образом. Повторение и усреднение уменьшают влияние этой составляющей: среднее приближается к истине при росте числа измерений.",
  },
  gross: {
    label: "Грубая (промах)",
    short: "Выбросы в общей группе",
    desc: "Почти все точки лежат кучно, но одна-две оторваны от группы. Так выглядит грубая ошибка или сбой прибора. Подобные результаты обязаны быть обнаружены и исключены из обработки.",
  },
};

const SHOT_COLORS: Record<Mode, { base: string; outlier: string }> = {
  sys: { base: "var(--warm)", outlier: "var(--warm)" },
  rand: { base: "var(--info)", outlier: "var(--info)" },
  gross: { base: "var(--ok)", outlier: "var(--bad)" },
};

/** Box-Muller: нормальная случайная величина. */
function gauss(mu = 0, sigma = 1) {
  let u = 0;
  let v = 0;
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

export default function TargetExperiment() {
  const [mode, setMode] = useState<Mode>("sys");
  const [shots, setShots] = useState<{ x: number; y: number; id: number }[]>([]);
  const idRef = useRef(0);

  const fire = useCallback(
    (n: number) => {
      const batch = Array.from({ length: n }, () => ({
        ...makeShot(mode),
        id: idRef.current++,
      }));
      setShots((previous) => [...previous, ...batch].slice(-80));
    },
    [mode],
  );

  const stats = useMemo(() => {
    if (shots.length < 2) return null;
    const mx = shots.reduce((sum, shot) => sum + shot.x, 0) / shots.length;
    const my = shots.reduce((sum, shot) => sum + shot.y, 0) / shots.length;
    const theta = Math.hypot(mx, my);
    const sigma = Math.sqrt(
      shots.reduce(
        (sum, shot) => sum + (shot.x - mx) ** 2 + (shot.y - my) ** 2,
        0,
      ) / shots.length,
    );
    return { mx, my, theta, sigma };
  }, [shots]);

  const palette = SHOT_COLORS[mode];

  return (
    <div className="lab-workbench">
      <div className="lab-figure">
        <div className="experiment-topline">
          <span>
            Поле измерений<b>● результат</b>
          </span>
          <span>
            Попаданий<b>{shots.length}</b>
          </span>
        </div>
        <svg
          className="target-svg"
          viewBox="-170 -170 340 340"
          role="img"
          aria-label={`Мишень с ${shots.length} результатами измерений. Крестик отмечает среднее значение.`}
        >
          {[150, 100, 50].map((radius) => (
            <circle key={radius} r={radius} fill="none" stroke="var(--viz-axis)" strokeWidth="1.5" />
          ))}
          <circle
            r="164"
            fill="none"
            stroke="var(--viz-axis)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <line x1="-164" y1="0" x2="164" y2="0" stroke="var(--viz-axis)" strokeWidth="1" />
          <line x1="0" y1="-164" x2="0" y2="164" stroke="var(--viz-axis)" strokeWidth="1" />
          {stats && (
            <motion.g
              animate={{ x: stats.mx, y: stats.my }}
              transition={{ type: "spring", stiffness: 60, damping: 14 }}
            >
              <rect
                x="-7"
                y="-7"
                width="14"
                height="14"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.6"
              />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="var(--accent)" strokeWidth="1" />
              <line x1="0" y1="-12" x2="0" y2="12" stroke="var(--accent)" strokeWidth="1" />
            </motion.g>
          )}
          <AnimatePresence>
            {shots.map((shot) => {
              const isOutlier =
                mode === "gross" && Math.hypot(shot.x, shot.y) > 90;
              return (
                <motion.circle
                  key={shot.id}
                  cx={shot.x}
                  cy={shot.y}
                  r="4.5"
                  fill={isOutlier ? palette.outlier : palette.base}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                  initial={{ opacity: 0, scale: 3 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              );
            })}
          </AnimatePresence>
          <g>
            <circle r="9" fill="none" stroke="var(--accent)" strokeWidth="1.4" />
            <line x1="-16" y1="0" x2="16" y2="0" stroke="var(--accent)" strokeWidth="1" />
            <line x1="0" y1="-16" x2="0" y2="16" stroke="var(--accent)" strokeWidth="1" />
          </g>
        </svg>
        <div className="range-endpoints">
          <span>центр прицела = Xист</span>
          <span>крестик = среднее x̄</span>
        </div>
      </div>
      <aside className="lab-controls">
        <span className="eyebrow">ВИД ПОГРЕШНОСТИ</span>
        <div className="lab-mode-list">
          {(Object.keys(MODES) as Mode[]).map((value) => (
            <button
              key={value}
              className={mode === value ? "active" : ""}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              <span
                className="mode-mark"
                style={{ background: SHOT_COLORS[value].base }}
              />
              <span>
                <strong>{MODES[value].label}</strong>
                <small>{MODES[value].short}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="lab-actions">
          <button className="secondary-button" onClick={() => fire(1)}>
            <Crosshair size={15} /> Отсчёт ×1
          </button>
          <button className="primary-button" onClick={() => fire(12)}>
            <ListOrdered size={15} /> Серия ×12
          </button>
          <button
            className="icon-button"
            aria-label="Очистить мишень"
            onClick={() => setShots([])}
          >
            <Eraser size={17} />
          </button>
        </div>
        <div className="lab-stats">
          <span className="eyebrow">ОЦЕНКА ПО ВЫБОРКЕ</span>
          {[
            {
              label: "θ - смещение среднего x̄ от Xист",
              value: stats?.theta ?? 0,
              name: "систематическая составляющая",
            },
            {
              label: "σ - разброс повторных отсчётов",
              value: stats?.sigma ?? 0,
              name: "случайная составляющая",
            },
          ].map((row) => (
            <div key={row.label}>
              <div className="lab-stat-head">
                <span>{row.label}</span>
                <b>{row.value.toFixed(1)}</b>
              </div>
              <div className="progress-track">
                <motion.span
                  animate={{ width: `${Math.min(100, (row.value / 150) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <small>{row.name}</small>
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            className="theory-advice"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <span>{MODES[mode].desc}</span>
          </motion.p>
        </AnimatePresence>
      </aside>
    </div>
  );
}