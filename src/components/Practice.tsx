import { useState } from "react";
import { handleChoiceKeys } from "../utils/keyboard";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Calculator,
  Check,
  FlaskConical,
  Info,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  formatNumber,
  formatSigned,
  getSeriesStats,
  parseNumber,
} from "../utils/measurements";

type PracticeProps = { onComplete: () => void };
type Task = "single" | "series" | "accuracy";
type Result = {
  title: string;
  items: { label: string; value: string; unit: string }[];
  steps: string[];
  note: string;
  series?: number[];
};

const tasks: { id: Task; title: string; subtitle: string }[] = [
  {
    id: "single",
    title: "Одно измерение",
    subtitle: "Абсолютная и относительная погрешности",
  },
  {
    id: "series",
    title: "Серия измерений",
    subtitle: "Среднее значение и случайный разброс",
  },
  {
    id: "accuracy",
    title: "Класс точности",
    subtitle: "Допускаемая погрешность прибора",
  },
];

export function QuickExperiment({ onOpen }: { onOpen: () => void }) {
  const [value, setValue] = useState(25.25);
  const delta = value - 25;
  const percent = Math.abs(delta / 25) * 100;

  return (
    <section className="quick-experiment" aria-labelledby="experiment-heading">
      <div className="experiment-intro">
        <span className="eyebrow">ПОПРОБУЙТЕ ПРЯМО СЕЙЧАС</span>
        <h2 id="experiment-heading">
          Небольшое отклонение.
          <br />
          Измеримая разница.
        </h2>
        <p>
          Измените показание и посмотрите,
          <br className="desktop-break" /> как меняется погрешность.
        </p>
        <button className="text-link" onClick={onOpen}>
          Перейти в практикум <ArrowRight size={15} />
        </button>
      </div>
      <div className="experiment-interactive">
        <div className="experiment-topline">
          <span>
            Опорное значение <b>25,00 мм</b>
          </span>
          <span className="experiment-reading">
            {value.toFixed(2).replace(".", ",")} <small>мм</small>
          </span>
        </div>
        <svg
          className="quick-ruler"
          viewBox="0 0 560 83"
          role="img"
          aria-label={`Отклонение от 25 мм: ${formatSigned(delta, 2)} мм`}
        >
          <line x1="15" y1="48" x2="545" y2="48" stroke="#dddfe8" />
          {Array.from({ length: 51 }, (_, i) => (
            <g key={i}>
              <line
                x1={15 + i * 10.6}
                y1={i % 10 === 0 ? 23 : i % 5 === 0 ? 31 : 37}
                x2={15 + i * 10.6}
                y2="48"
                stroke={i === 25 ? "#8a69cc" : "#c1c4cf"}
                strokeWidth={i === 25 ? 2 : 1}
              />
              {i % 10 === 0 && (
                <text
                  x={15 + i * 10.6}
                  y="71"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#9598a5"
                >
                  {(24.5 + i / 50).toFixed(1).replace(".", ",")}
                </text>
              )}
            </g>
          ))}
          <line
            x1="280"
            y1="15"
            x2="280"
            y2="53"
            stroke="#b7a3df"
            strokeDasharray="3 3"
          />
          <motion.g
            animate={{ x: 15 + (value - 24.5) * 530 }}
            transition={{ type: "spring", stiffness: 230, damping: 28 }}
          >
            <path d="M-5 13 L0 21 L5 13 Z" fill="#8b69cf" />
            <line y1="22" y2="52" stroke="#8b69cf" strokeWidth="2" />
          </motion.g>
        </svg>
        <label className="sr-only" htmlFor="quick-measurement">
          Измеренное значение, мм
        </label>
        <input
          id="quick-measurement"
          className="range-input"
          type="range"
          min="24.5"
          max="25.5"
          step="0.01"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
        <div className="experiment-results">
          <span>
            Δx{" "}
            <strong>
              {formatSigned(Math.abs(delta) < 1e-9 ? 0 : delta, 2)} мм
            </strong>
          </span>
          <span>
            |δ| <strong>{formatNumber(percent, 2)}%</strong>
          </span>
          <span className="drag-hint">Двигайте ползунок</span>
        </div>
      </div>
    </section>
  );
}

function SeriesPlot({ values }: { values: number[] }) {
  const { mean } = getSeriesStats(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, Math.abs(mean) * 0.01, 0.1);
  const points = values.slice(0, 40).map((value, index, shown) => ({
    x: 30 + index * (440 / Math.max(shown.length - 1, 1)),
    y: 95 - ((value - mean) / spread) * 95,
  }));
  return (
    <svg
      className="series-plot"
      viewBox="0 0 500 158"
      role="img"
      aria-label="График разброса результатов относительно среднего значения"
    >
      <line
        x1="20"
        y1="95"
        x2="480"
        y2="95"
        stroke="#b5a1db"
        strokeDasharray="5 5"
      />
      <text x="475" y="86" textAnchor="end" fontSize="10" fill="#9b84c6">
        среднее: {formatNumber(mean)}
      </text>
      <polyline
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        fill="none"
        stroke="#b7a2df"
        strokeWidth="1.5"
      />
      {points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#8a68ce"
          stroke="white"
          strokeWidth="2"
        />
      ))}
      <text x="250" y="147" textAnchor="middle" fontSize="10" fill="#9699a4">
        {values.length > 40
          ? "Первые 40 измерений"
          : "Последовательность измерений"}
      </text>
    </svg>
  );
}

export default function Practice({ onComplete }: PracticeProps) {
  const [task, setTask] = useState<Task>("single");
  const [reference, setReference] = useState("25");
  const [measured, setMeasured] = useState("25,4");
  const [unit, setUnit] = useState("мм");
  const [series, setSeries] = useState("25,2; 25,4; 25,3; 25,5; 25,1");
  const [accuracy, setAccuracy] = useState("1,5");
  const [limit, setLimit] = useState("30");
  const [indication, setIndication] = useState("20");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function invalidate() {
    setError("");
    setResult(null);
  }
  function selectTask(next: Task) {
    setTask(next);
    invalidate();
  }

  function fillExample() {
    setReference("25");
    setMeasured("25,4");
    setUnit("мм");
    setSeries("25,2; 25,4; 25,3; 25,5; 25,1");
    setAccuracy("1,5");
    setLimit("30");
    setIndication("20");
    invalidate();
  }

  function reset() {
    if (task === "single") {
      setReference("");
      setMeasured("");
    }
    if (task === "series") setSeries("");
    if (task === "accuracy") {
      setAccuracy("");
      setLimit("");
      setIndication("");
    }
    invalidate();
  }

  function calculate(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (task === "single") {
      const ref = parseNumber(reference);
      const value = parseNumber(measured);
      if (ref === null || value === null) {
        setError(
          "Введите корректные числа в оба поля. Можно использовать точку или запятую.",
        );
        return;
      }
      const delta = value - ref;
      const relative = ref === 0 ? null : Math.abs(delta / ref) * 100;
      setResult({
        title: "Погрешности рассчитаны",
        items: [
          {
            label: "Абсолютная погрешность",
            value: formatSigned(delta, 6),
            unit,
          },
          {
            label: "Модуль относительной",
            value:
              relative === null ? "Не определён" : formatNumber(relative, 6),
            unit: relative === null ? "" : "%",
          },
        ],
        steps: [
          `Δx = ${formatNumber(value)} − (${formatNumber(ref)}) = ${formatSigned(delta)} ${unit}`,
          relative === null
            ? "Деление на ноль невозможно: опорное значение равно нулю."
            : `|δ| = ${formatNumber(Math.abs(delta))} / ${formatNumber(Math.abs(ref))} × 100% = ${formatNumber(relative)}%`,
        ],
        note: "Знак Δx показывает направление отклонения. Для исправления известного смещения используют поправку C = −Δx.",
      });
    } else if (task === "series") {
      const tokens = series
        .trim()
        .split(/[;\s]+/)
        .filter(Boolean);
      const parsed = tokens.map(parseNumber);
      if (
        parsed.length < 2 ||
        parsed.length > 1000 ||
        parsed.some((value) => value === null)
      ) {
        setError(
          "Введите от 2 до 1000 чисел, разделённых точкой с запятой или переносом строки. Десятичный знак: точка или запятая.",
        );
        return;
      }
      const values = parsed as number[];
      const { mean, deviation, standardError } = getSeriesStats(values);
      setResult({
        title: "Серия обработана",
        items: [
          { label: "Среднее значение x̄", value: formatNumber(mean, 6), unit },
          {
            label: "Выборочное отклонение s",
            value: formatNumber(deviation, 6),
            unit,
          },
          {
            label: "Стандартная ошибка среднего",
            value: formatNumber(standardError, 6),
            unit,
          },
        ],
        steps: [
          `Количество независимых измерений: n = ${values.length}`,
          `x̄ = Σxᵢ / n = ${formatNumber(mean, 6)} ${unit}`,
          `s = √[Σ(xᵢ − x̄)² / (n − 1)] = ${formatNumber(deviation, 6)} ${unit}`,
          `s(x̄) = s / √n = ${formatNumber(standardError, 6)} ${unit}`,
        ],
        note: "Стандартная ошибка среднего описывает случайный разброс при независимых измерениях. Это не полная погрешность и не доверительный интервал; систематические составляющие здесь не учтены.",
        series: values,
      });
    } else {
      const k = parseNumber(accuracy);
      const range = parseNumber(limit);
      const value = parseNumber(indication);
      if (
        k === null ||
        range === null ||
        value === null ||
        k <= 0 ||
        k > 100 ||
        range <= 0 ||
        value < 0 ||
        value > range
      ) {
        setError(
          "Класс должен быть больше 0 и не больше 100, верхний предел - больше 0. Показание должно находиться в диапазоне от 0 до верхнего предела.",
        );
        return;
      }
      const delta = (k * range) / 100;
      const relative = value === 0 ? null : (delta / value) * 100;
      setResult({
        title: "Предел погрешности определён",
        items: [
          {
            label: "Допускаемая абсолютная",
            value: `±${formatNumber(delta, 6)}`,
            unit: "В",
          },
          {
            label: "Относительный предел при показании",
            value:
              relative === null
                ? "Не определён"
                : `±${formatNumber(relative, 6)}`,
            unit: relative === null ? "" : "%",
          },
        ],
        steps: [
          `Δдоп = ±k × XN / 100 = ±${formatNumber(k)} × ${formatNumber(range)} / 100 = ±${formatNumber(delta)} В`,
          relative === null
            ? "Для нулевого показания относительный предел не определён."
            : `δдоп = ±${formatNumber(delta)} / ${formatNumber(value)} × 100% = ±${formatNumber(relative)}%`,
        ],
        note: "Учебная модель: шкала начинается с нуля, класс указан простой цифрой, XN равен верхнему пределу. Для других обозначений и приборов используйте паспортную формулу.",
      });
    }
    onComplete();
  }

  return (
    <div className="learning-page">
      <div className="page-heading">
        <span className="eyebrow">03 / ПРИМЕНЯЕМ ЗНАНИЯ</span>
        <h1>Практикум</h1>
        <p>
          Переходите от формул к результатам. Введите свои данные или начните с
          примера.
        </p>
      </div>
      <div
        className="tab-list practice-tabs"
        role="tablist"
        aria-label="Вид расчёта"
        onKeyDown={handleChoiceKeys}
      >
        {tasks.map((item) => (
          <button
            key={item.id}
            role="tab"
            id={`practice-${item.id}`}
            aria-controls="practice-panel"
            aria-selected={task === item.id}
            tabIndex={task === item.id ? 0 : -1}
            onClick={() => selectTask(item.id)}
            className={task === item.id ? "active" : ""}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div
        className="practice-workbench"
        id="practice-panel"
        role="tabpanel"
        aria-labelledby={`practice-${task}`}
      >
        <form onSubmit={calculate} className="calculation-form">
          <div className="workbench-caption">
            <span className="small-icon">
              <Calculator size={18} />
            </span>
            <span>ВАШИ ИСХОДНЫЕ ДАННЫЕ</span>
          </div>
          <h2>{tasks.find((item) => item.id === task)?.subtitle}</h2>
          {task === "single" && (
            <>
              <label className="field-label" htmlFor="reference-value">
                Опорное значение <span>xоп</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="reference-value"
                  inputMode="decimal"
                  placeholder="Например, 25"
                  value={reference}
                  onChange={(event) => {
                    setReference(event.target.value);
                    invalidate();
                  }}
                />
                <span>{unit}</span>
              </div>
              <label className="field-label" htmlFor="measured-value">
                Измеренное значение <span>xизм</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="measured-value"
                  inputMode="decimal"
                  placeholder="Например, 25,4"
                  value={measured}
                  onChange={(event) => {
                    setMeasured(event.target.value);
                    invalidate();
                  }}
                />
                <span>{unit}</span>
              </div>
            </>
          )}
          {task === "series" && (
            <>
              <label className="field-label" htmlFor="measurement-series">
                Результаты измерений
              </label>
              <textarea
                id="measurement-series"
                rows={5}
                value={series}
                placeholder="25,2; 25,4; 25,3; 25,5; 25,1"
                onChange={(event) => {
                  setSeries(event.target.value);
                  invalidate();
                }}
              />
              <span className="field-help">
                Разделяйте числа точкой с запятой или переносом строки. Нужно не
                менее двух измерений.
              </span>
            </>
          )}
          {task === "accuracy" && (
            <>
              <label className="field-label" htmlFor="accuracy-class">
                Класс точности <span>k</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="accuracy-class"
                  inputMode="decimal"
                  value={accuracy}
                  onChange={(event) => {
                    setAccuracy(event.target.value);
                    invalidate();
                  }}
                />
                <span>%</span>
              </div>
              <label className="field-label" htmlFor="range-limit">
                Верхний предел шкалы <span>XN</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="range-limit"
                  inputMode="decimal"
                  value={limit}
                  onChange={(event) => {
                    setLimit(event.target.value);
                    invalidate();
                  }}
                />
                <span>В</span>
              </div>
              <label className="field-label" htmlFor="instrument-indication">
                Показание прибора
              </label>
              <div className="input-with-unit">
                <input
                  id="instrument-indication"
                  inputMode="decimal"
                  value={indication}
                  onChange={(event) => {
                    setIndication(event.target.value);
                    invalidate();
                  }}
                />
                <span>В</span>
              </div>
            </>
          )}
          {task !== "accuracy" && (
            <div className="unit-select">
              <label htmlFor="measurement-unit">Единицы измерения</label>
              <select
                id="measurement-unit"
                value={unit}
                onChange={(event) => {
                  setUnit(event.target.value);
                  invalidate();
                }}
              >
                {["мм", "см", "м", "В", "г"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button calculate-button" type="submit">
            Рассчитать <ArrowRight size={17} />
          </button>
          <div className="form-actions">
            <button type="button" onClick={fillExample}>
              <Sparkles size={14} /> Подставить пример
            </button>
            <button type="button" onClick={reset}>
              <RotateCcw size={14} /> Очистить
            </button>
          </div>
        </form>
        <div className="calculation-output" aria-live="polite">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={`${task}-result`}
                initial={{ opacity: 0, y: 9 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="calculation-result"
              >
                <span className="result-success">
                  <Check size={15} /> {result.title}
                </span>
                <div
                  className={`result-numbers ${result.items.length === 3 ? "three-results" : ""}`}
                >
                  {result.items.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>
                        {item.value} <small>{item.unit}</small>
                      </strong>
                    </div>
                  ))}
                </div>
                {result.series && <SeriesPlot values={result.series} />}
                <div className="solution-steps">
                  <span className="eyebrow">ХОД РЕШЕНИЯ</span>
                  {result.steps.map((step, index) => (
                    <p key={step}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {step}
                    </p>
                  ))}
                </div>
                <p className="result-note">
                  <Info size={17} />
                  <span>{result.note}</span>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-result"
              >
                <div className="empty-result-illustration">
                  <FlaskConical size={48} strokeWidth={1.2} />
                  <span className="illustration-orbit" />
                </div>
                <h3>Здесь появится ваш результат</h3>
                <p>
                  Введите данные и нажмите «Рассчитать».
                  <br />
                  Покажем не только ответ, но и ход решения.
                </p>
                <span className="empty-formula">Δx = xизм − xоп</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="under-workbench">
        <Info size={15} /> Результаты показываются с точностью до 6 знаков после
        запятой. Итоговое округление выбирайте с учётом исходных данных.
      </p>
    </div>
  );
}
