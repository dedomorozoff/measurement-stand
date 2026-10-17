import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Compass,
  Info,
  Lightbulb,
  Menu,
  Moon,
  MoveUpRight,
  Play,
  RotateCcw,
  Sliders,
  Sun,
  Target,
  X,
} from "lucide-react";
import {
  classifications,
  instruments,
  measurementMeans,
  modules,
  navigation,
  properties,
  questions,
} from "./data";
import type { ErrorKind, LearningSection, Section } from "./data";
import GaussExperiment from "./components/GaussExperiment";
import GaugeTrainer from "./components/GaugeTrainer";
import InstrumentVisual from "./components/InstrumentVisual";
import Practice, { QuickExperiment } from "./components/Practice";
import Quiz from "./components/Quiz";
import TargetExperiment from "./components/TargetExperiment";
import { formatNumber } from "./utils/measurements";
import { handleChoiceKeys } from "./utils/keyboard";
import { plural } from "./utils/plural";

type Progress = { completed: LearningSection[]; quizScore: number | null };
const storageKey = "metrika-learning-v1";
const themeKey = "metrika-theme";
type Theme = "light" | "dark";
const emptyProgress: Progress = { completed: [], quizScore: null };

/** Тему выставляет скрипт в index.html до первой отрисовки. */
function getTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function loadProgress(): Progress {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (!stored || !Array.isArray(stored.completed)) return emptyProgress;
    return {
      completed: [
        ...new Set(
          stored.completed.filter((id: unknown) =>
            modules.some((item) => item.id === id),
          ),
        ),
      ] as LearningSection[],
      quizScore:
        Number.isInteger(stored.quizScore) &&
        stored.quizScore >= 0 &&
        stored.quizScore <= questions.length
          ? stored.quizScore
          : null,
    };
  } catch {
    return emptyProgress;
  }
}

function getSection(): Section {
  const hash = window.location.hash.slice(1);
  return navigation.some((item) => item.id === hash)
    ? (hash as Section)
    : "overview";
}

function Logo() {
  return (
    <>
      <svg
        width="32"
        height="35"
        viewBox="0 0 32 35"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 24.5V12.5L9 9V28L3 24.5Z" fill="#a98cdd" />
        <path d="M13 30V7L19 3.5V33.5L13 30Z" fill="#8663cc" />
        <path d="M23 25V10L29 6.5V21.5L23 25Z" fill="#bba4e5" />
      </svg>
      <span>
        метрика<span className="logo-dot">.</span>
      </span>
    </>
  );
}

function SectionComplete({
  completed,
  onComplete,
  onNext,
  nextLabel,
}: {
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="section-complete">
      <button
        className={`secondary-button completion-button ${completed ? "completed" : ""}`}
        onClick={onComplete}
        disabled={completed}
      >
        <Check size={17} />
        {completed ? "Раздел изучен" : "Отметить как изученный"}
      </button>
      <button className="text-link" onClick={onNext}>
        {nextLabel} <ArrowRight size={16} />
      </button>
    </div>
  );
}

function Overview({
  onNavigate,
  completed,
}: {
  onNavigate: (section: Section) => void;
  completed: LearningSection[];
}) {
  return (
    <>
      <section className="overview-hero">
        <div className="hero-copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            ОТ ТЕОРИИ К ТОЧНОСТИ
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 17 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.55 }}
          >
            Погрешности
            <br />
            измерений<span className="heading-dot">.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.23, duration: 0.5 }}
          >
            <h2>Средства измерений и их свойства</h2>
            <p>
              Поймите, откуда берутся погрешности, научитесь
              <br className="desktop-break" /> выбирать приборы и доверять своим
              результатам.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => onNavigate("errors")}
              >
                Начать изучение <ArrowRight size={17} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => onNavigate("practice")}
              >
                <span>
                  <Play size={12} fill="currentColor" />
                </span>
                К практике
              </button>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 16, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.12, duration: 0.9, ease: "easeOut" }}
        >
          <img
            src={`${import.meta.env.BASE_URL}images/precision-caliper.png`}
            alt="Стальной штангенциркуль измеряет диаметр металлической детали"
            fetchPriority="high"
          />
        </motion.div>
      </section>
      <section className="learning-route" aria-labelledby="route-heading">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">ВСЁ СЛОЖНОЕ СТАНЕТ ПОНЯТНЫМ</span>
            <h2 id="route-heading">Ваш маршрут изучения</h2>
          </div>
          <span className="route-note">
            {modules.length}{" "}
            {plural(modules.length, ["шаг", "шага", "шагов"])} к точному
            результату <ArrowDown size={15} />
          </span>
        </div>
        <div className="module-grid">
          {modules.map((item, index) => (
            <motion.button
              className={`module-link ${item.color}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.07, duration: 0.4 }}
            >
              <div className="module-top">
                <span className="module-icon">
                  <item.icon size={23} strokeWidth={1.6} />
                </span>
                <span
                  className={`module-number ${completed.includes(item.id) ? "is-complete" : ""}`}
                >
                  {completed.includes(item.id) ? (
                    <Check size={17} />
                  ) : (
                    item.number
                  )}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="module-cta">
                {completed.includes(item.id)
                  ? "Повторить"
                  : item.id === "quiz"
                    ? "Проверить себя"
                    : item.id === "practice"
                      ? "Попробовать"
                      : item.id === "lab"
                        ? "Провести опыт"
                        : "Изучить раздел"}{" "}
                <MoveUpRight size={14} />
              </span>
            </motion.button>
          ))}
        </div>
      </section>
      <QuickExperiment onOpen={() => onNavigate("practice")} />
      <div className="overview-bottom">
        <Lightbulb size={17} />
        <p>
          Погрешность - не ошибка в работе. Это характеристика того, насколько
          точно мы знаем результат.
        </p>
      </div>
    </>
  );
}

function ErrorPlot({ mode }: { mode: ErrorKind["plot"] }) {
  const series =
    mode === "systematic"
      ? [69, 66, 72, 68, 70, 67]
      : mode === "gross"
        ? [108, 101, 105, 28, 110, 102]
        : [88, 122, 96, 114, 78, 107];
  const isSeries = ["systematic", "random", "gross"].includes(mode);
  return (
    <svg
      className="error-plot"
      viewBox="0 0 600 190"
      role="img"
      aria-label={
        isSeries
          ? "Сравнение серии измерений с опорным значением"
          : "Сравнение измеренного и опорного значений"
      }
    >
      <defs>
        <pattern
          id="plot-dots"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r=".7" fill="var(--viz-grid)" />
        </pattern>
      </defs>
      <rect width="600" height="190" fill="url(#plot-dots)" />
      {isSeries ? (
        <>
          <line x1="45" y1="150" x2="555" y2="150" stroke="var(--viz-axis)" />
          <line x1="45" y1="25" x2="45" y2="150" stroke="var(--viz-axis)" />
          <line
            x1="45"
            y1="105"
            x2="555"
            y2="105"
            stroke="var(--ok)"
            strokeDasharray="5 5"
          />
          <text x="551" y="96" textAnchor="end" fontSize="10" fill="var(--ok)">
            Опорное значение
          </text>
          <motion.polyline
            key={mode}
            points={series
              .map((y, index) => `${90 + index * 82},${y}`)
              .join(" ")}
            fill="none"
            stroke="var(--accent-soft)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
          {series.map((y, index) => (
            <g key={index}>
              <circle
                cx={90 + index * 82}
                cy={y}
                r="5"
                fill={mode === "gross" && index === 3 ? "var(--bad)" : "var(--accent)"}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={90 + index * 82}
                y="169"
                textAnchor="middle"
                fontSize="10"
                fill="var(--viz-label)"
              >
                {index + 1}
              </text>
            </g>
          ))}
          <text x="300" y="188" textAnchor="middle" fontSize="9" fill="var(--viz-label)">
            НОМЕР ИЗМЕРЕНИЯ
          </text>
        </>
      ) : mode === "reduced" ? (
        <>
          <text x="300" y="43" textAnchor="middle" fontSize="14" fill="var(--accent)">
            |γ| = 0,45 / 30 × 100% = 1,5%
          </text>
          <rect x="65" y="84" width="470" height="18" rx="4" fill="var(--viz-band)" />
          <rect x="65" y="84" width="7.05" height="18" rx="2" fill="var(--viz-band-fill)" />
          <line x1="65" y1="75" x2="65" y2="114" stroke="var(--viz-band-fill)" />
          <line x1="535" y1="75" x2="535" y2="114" stroke="var(--viz-band-fill)" />
          <text x="65" y="135" fontSize="11" fill="var(--viz-label)">
            0 В
          </text>
          <text x="535" y="135" textAnchor="end" fontSize="11" fill="var(--viz-label)">
            XN = 30 В
          </text>
          <text
            x="300"
            y="170"
            textAnchor="middle"
            fontSize="11"
            fill="var(--viz-label)"
          >
            Полоса: 30 В. Выделенная часть: погрешность 0,45 В.
          </text>
        </>
      ) : (
        <>
          <line
            x1="65"
            y1="116"
            x2="535"
            y2="116"
            stroke="var(--viz-axis)"
            strokeWidth="2"
          />
          {Array.from({ length: 31 }, (_, i) => (
            <line
              key={i}
              x1={65 + i * 15.66}
              y1="116"
              x2={65 + i * 15.66}
              y2={i % 5 === 0 ? 129 : 122}
              stroke="var(--viz-axis)"
            />
          ))}
          <line
            x1="255"
            y1="55"
            x2="255"
            y2="138"
            stroke="var(--ok)"
            strokeDasharray="4 4"
          />
          <text x="247" y="159" textAnchor="end" fontSize="11" fill="var(--ok)">
            xоп = 25,00 мм
          </text>
          <line
            x1="375"
            y1="67"
            x2="375"
            y2="138"
            stroke="var(--accent)"
            strokeWidth="2"
          />
          <circle cx="375" cy="111" r="5" fill="var(--accent)" />
          <text x="383" y="159" fontSize="11" fill="var(--accent)">
            xизм = 25,40 мм
          </text>
          <path
            d="M260 69 L370 69 M265 65 L259 69 L265 73 M365 65 L371 69 L365 73"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          <text x="315" y="51" textAnchor="middle" fontSize="13" fill="var(--accent)">
            {mode === "relative" ? "|δ| = 1,6%" : "Δx = +0,40 мм"}
          </text>
        </>
      )}
    </svg>
  );
}

function ErrorsPage({
  completed,
  onComplete,
  onNext,
}: {
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const category = classifications[categoryIndex];
  const item = category.items[itemIndex];
  return (
    <div className="learning-page">
      <div className="page-heading">
        <span className="eyebrow">01 / РАЗБИРАЕМСЯ В ОСНОВАХ</span>
        <h1>Погрешности измерений</h1>
        <p>
          Любое измерение имеет ограниченную точность. Научимся описывать и
          оценивать это отличие.
        </p>
      </div>
      <div className="theory-definition">
        <Info size={20} />
        <p>
          <strong>Погрешность измерения</strong> - отклонение измеренного
          значения от опорного. Истинное значение обычно неизвестно, поэтому для
          оценки используют эталонное или принятое опорное значение.
        </p>
      </div>
      <div className="classification-heading">
        <h2>Одна погрешность. Несколько признаков.</h2>
        <p>Выберите основание классификации, затем изучите каждый вид.</p>
      </div>
      <div
        className="tab-list classification-tabs"
        role="tablist"
        aria-label="Классификация погрешностей"
        onKeyDown={handleChoiceKeys}
      >
        {classifications.map((group, index) => (
          <button
            key={group.id}
            role="tab"
            id={`classification-${group.id}`}
            aria-controls="classification-panel"
            aria-selected={index === categoryIndex}
            tabIndex={index === categoryIndex ? 0 : -1}
            className={index === categoryIndex ? "active" : ""}
            onClick={() => {
              setCategoryIndex(index);
              setItemIndex(0);
            }}
          >
            {group.title}
          </button>
        ))}
      </div>
      <div
        className="classification-workbench"
        id="classification-panel"
        role="tabpanel"
        aria-labelledby={`classification-${category.id}`}
      >
        <div className="error-kind-list" aria-label="Виды погрешностей">
          {category.items.map((kind, index) => (
            <button
              key={kind.id}
              className={itemIndex === index ? "active" : ""}
              aria-pressed={itemIndex === index}
              onClick={() => setItemIndex(index)}
            >
              <span className="error-symbol">{kind.symbol}</span>
              <span>
                <strong>{kind.name}</strong>
                <small>{kind.short}</small>
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.article
            key={item.id}
            className="error-explanation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <span className="eyebrow">{category.title}</span>
            <h2>{item.name} погрешность</h2>
            <p className="kind-description">{item.description}</p>
            {item.formula && (
              <div className="formula-block">
                <strong>{item.formula}</strong>
                <span>{item.formulaNote}</span>
              </div>
            )}
            <ErrorPlot mode={item.plot} />
            <div className="example-block">
              <span className="eyebrow">НА ПРИМЕРЕ</span>
              <p>{item.example}</p>
            </div>
            <p className="theory-advice">
              <Lightbulb size={18} />
              <span>{item.advice}</span>
            </p>
          </motion.article>
        </AnimatePresence>
      </div>
      <div className="result-notation">
        <div>
          <span className="eyebrow">ЗАПИСЫВАЕМ КОРРЕКТНО</span>
          <h2>Число без погрешности - не вся история.</h2>
          <p>
            Указывайте единицы и смысл интервала. Согласуйте разряды результата
            и границы погрешности.
          </p>
        </div>
        <div>
          <strong>x = (25,40 ± 0,05) мм</strong>
          <span>Пример записи с заданной границей абсолютной погрешности.</span>
        </div>
      </div>
      <SectionComplete
        completed={completed}
        onComplete={onComplete}
        onNext={onNext}
        nextLabel="К средствам измерений"
      />
    </div>
  );
}

function LabPage({
  completed,
  onComplete,
  onNext,
}: {
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const [experiment, setExperiment] = useState(0);
  const experiments = [
    {
      id: "target",
      title: "Мишень истинного значения",
      hint: "систематическая, случайная, грубая",
    },
    { id: "gauss", title: "Гистограмма разброса", hint: "закон больших чисел" },
  ];
  return (
    <div className="learning-page">
      <div className="page-heading">
        <span className="eyebrow">02 / ЛАБОРАТОРНЫЕ ОПЫТЫ</span>
        <h1>Лаборатория погрешностей</h1>
        <p>
          Два опыта, в которых погрешность видна буквально: попадания в мишень и
          форма распределения отклонений. Меняйте вид погрешности и наблюдайте,
          как меняется картина и её численная оценка.
        </p>
      </div>
      <div className="theory-definition">
        <Info size={20} />
        <p>
          <strong>Один объект - много измерений.</strong> Расхождение результатов
          повторных измерений называется <strong>рассеиванием</strong>. Оно
          складывается из постоянного смещения и случайного разброса.
        </p>
      </div>
      <div
        className="tab-list lab-tabs"
        role="tablist"
        aria-label="Лабораторные опыты"
        onKeyDown={handleChoiceKeys}
      >
        {experiments.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            id={`lab-${item.id}`}
            aria-controls="lab-panel"
            aria-selected={index === experiment}
            tabIndex={index === experiment ? 0 : -1}
            className={index === experiment ? "active" : ""}
            onClick={() => setExperiment(index)}
          >
            {item.title}
            <small>{item.hint}</small>
          </button>
        ))}
      </div>
      <div
        className="lab-panel"
        id="lab-panel"
        role="tabpanel"
        aria-labelledby={`lab-${experiments[experiment].id}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={experiment}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {experiment === 0 ? <TargetExperiment /> : <GaussExperiment />}
          </motion.div>
        </AnimatePresence>
      </div>
      <SectionComplete
        completed={completed}
        onComplete={onComplete}
        onNext={onNext}
        nextLabel="К средствам измерений"
      />
    </div>
  );
}

function InstrumentsPage({
  completed,
  onComplete,
  onNext,
}: {
  completed: boolean;
  onComplete: () => void;
  onNext: () => void;
}) {
  const [instrumentIndex, setInstrumentIndex] = useState(0);
  const [value, setValue] = useState(instruments[0].defaultValue);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [meanIndex, setMeanIndex] = useState(0);
  const instrument = instruments[instrumentIndex];
  const mean = measurementMeans[meanIndex];
  const rollTask = () =>
    Math.round(
      (Math.random() * 0.7 + 0.15) * instrument.max * 2,
    ) / 2;
  const [trainerMode, setTrainerMode] = useState(false);
  const [task, setTask] = useState(rollTask);
  const shownValue = trainerMode ? task : value;
  const startTrainer = () => {
    setTask(rollTask());
    setTrainerMode(true);
  };
  return (
    <div className="learning-page">
      <div className="page-heading">
        <span className="eyebrow">03 / ЗНАКОМИМСЯ С ИНСТРУМЕНТАМИ</span>
        <h1>Средства измерений</h1>
        <p>
          Средства измерений - технические средства с нормированными
          метрологическими характеристиками. Разберёмте пять видов, исследуем
          приборы, их шкалы и свойства.
        </p>
      </div>
      <div className="theory-definition">
        <Info size={20} />
        <p>
          <strong>Пять видов средств измерений.</strong> Гиря, термопара,
          вольтметр, поверочный стенд и АСУ - это всё средства измерений, но
          разной сложности и роли в процессе.
        </p>
      </div>
      <div
        className="si-workbench"
        role="tablist"
        aria-label="Виды средств измерений"
        onKeyDown={handleChoiceKeys}
      >
        <div className="si-list">
          {measurementMeans.map((item, index) => (
            <button
              key={item.id}
              role="tab"
              id={`si-${item.id}`}
              aria-controls="si-panel"
              aria-selected={index === meanIndex}
              tabIndex={index === meanIndex ? 0 : -1}
              className={index === meanIndex ? "active" : ""}
              onClick={() => setMeanIndex(index)}
            >
              <span className="property-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.name}
            </button>
          ))}
        </div>
        <div
          className="si-explanation"
          id="si-panel"
          role="tabpanel"
          aria-labelledby={`si-${mean.id}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mean.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <h3>{mean.name}</h3>
              <p className="kind-description">{mean.definition}</p>
              <div className="flow-diagram">
                <span>{mean.flow.input}</span>
                <ArrowRight size={15} />
                <span className="device">{mean.flow.device}</span>
                <ArrowRight size={15} />
                <span className="output">{mean.flow.output}</span>
              </div>
              <div className="example-chips">
                {mean.examples.map((example) => (
                  <span key={example}>{example}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div
        className="tab-list instrument-tabs"
        role="tablist"
        aria-label="Измерительный прибор"
        onKeyDown={handleChoiceKeys}
      >
        {instruments.map((item, index) => (
          <button
            key={item.id}
            role="tab"
            id={`instrument-${item.id}`}
            aria-controls="instrument-panel"
            aria-selected={index === instrumentIndex}
            tabIndex={index === instrumentIndex ? 0 : -1}
            className={index === instrumentIndex ? "active" : ""}
            onClick={() => {
              setInstrumentIndex(index);
              setValue(item.defaultValue);
              setTrainerMode(false);
            }}
          >
            {item.id === "caliper"
              ? "Штангенциркуль"
              : item.id === "ruler"
                ? "Линейка"
                : item.id === "voltmeter"
                  ? "Вольтметр"
                  : item.title}
          </button>
        ))}
      </div>
      <div
        className="instrument-workbench"
        id="instrument-panel"
        role="tabpanel"
        aria-labelledby={`instrument-${instrument.id}`}
      >
        <div className="instrument-main">
          <div className="instrument-heading">
            <div>
              <span className="eyebrow">{instrument.category}</span>
              <h2>{instrument.title}</h2>
            </div>
            <span className="live-label">
              <i /> Виртуальный прибор
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={instrument.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <InstrumentVisual
                type={instrument.id}
                value={shownValue}
                max={instrument.max}
                unit={instrument.unit}
                band={
                  instrument.id === "voltmeter" ? instrument.allowedError : 0
                }
              />
            </motion.div>
          </AnimatePresence>
          <div className="instrument-slider">
            {trainerMode ? (
              <div className="trainer-switch">
                <span className="live-label">
                  <i /> Режим тренажёра
                </span>
                <button
                  className="secondary-button"
                  onClick={() => setTrainerMode(false)}
                >
                  <Sliders size={15} /> Вернуться к шкале
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="instrument-slider">Измените показание</label>
                  <output htmlFor="instrument-slider">
                    {formatNumber(value, 2)} <small>{instrument.unit}</small>
                  </output>
                </div>
                <input
                  className="range-input"
                  id="instrument-slider"
                  type="range"
                  min="0"
                  max={instrument.max}
                  step={instrument.step}
                  value={value}
                  onChange={(event) => setValue(Number(event.target.value))}
                />
                <div className="range-endpoints">
                  <span>0 {instrument.unit}</span>
                  <span>
                    {instrument.max} {instrument.unit}
                  </span>
                </div>
                {instrument.id === "voltmeter" && (
                  <button className="trainer-start" onClick={startTrainer}>
                    <Target size={15} /> Тренироваться: снять показание
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <aside className="instrument-specs">
          <span className="eyebrow">ПАСПОРТ ПРИБОРА</span>
          <p>{instrument.description}</p>
          <dl>
            <div>
              <dt>Диапазон измерений</dt>
              <dd>
                0...{instrument.max} {instrument.unit}
              </dd>
            </div>
            <div>
              <dt>
                {instrument.id === "caliper"
                  ? "Шаг цифрового отсчёта"
                  : "Цена деления"}
              </dt>
              <dd>{instrument.resolution}</dd>
            </div>
            <div>
              <dt>
                {instrument.id === "voltmeter"
                  ? "Класс точности"
                  : "Допускаемая погрешность"}
              </dt>
              <dd>{instrument.accuracy}</dd>
            </div>
            <div>
              <dt>Предел погрешности Δдоп</dt>
              <dd>
                ±{formatNumber(instrument.allowedError, 3)}{" "}
                <small>{instrument.unit}</small>
              </dd>
            </div>
          </dl>
          <p className="spec-note">
            <Info size={15} />
            <span>
              Учебные характеристики. Параметры реального прибора определяют по
              его паспорту.
            </span>
          </p>
        </aside>
      </div>
      {instrument.id === "voltmeter" && trainerMode && (
        <GaugeTrainer
          task={task}
          resolution={1}
          max={instrument.max}
          onNewTask={() => setTask(rollTask())}
        />
      )}
      <section className="properties-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">НА ЧТО ОБРАЩАТЬ ВНИМАНИЕ</span>
            <h2>Свойства, которые имеют значение</h2>
          </div>
          <span className="muted-small">Нажмите, чтобы узнать больше</span>
        </div>
        <div className="property-list">
          {properties.map((property, index) => (
            <div
              key={property.title}
              className={`property-item ${expanded === index ? "expanded" : ""}`}
            >
              <h3>
                <button
                  aria-expanded={expanded === index}
                  aria-controls={`property-${index}`}
                  onClick={() => setExpanded(expanded === index ? null : index)}
                >
                  <span className="property-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {property.title}
                  <ChevronDown size={18} />
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {expanded === index && (
                  <motion.div
                    id={`property-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{property.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
      <SectionComplete
        completed={completed}
        onComplete={onComplete}
        onNext={onNext}
        nextLabel="Попробовать на практике"
      />
    </div>
  );
}

function ReferenceDialog({
  kind,
  onClose,
  onReset,
}: {
  kind: "formulas" | "help";
  onClose: () => void;
  onReset: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => {
    ref.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="reference-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-inner">
        <div className="dialog-heading">
          <span className="small-icon">
            {kind === "formulas" ? (
              <BookOpen size={21} />
            ) : (
              <Compass size={21} />
            )}
          </span>
          <button
            className="icon-button"
            aria-label="Закрыть окно"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <span className="eyebrow">ВСЕГДА ПОД РУКОЙ</span>
        <h2 id="dialog-title">
          {kind === "formulas"
            ? "Коротко о главном"
            : "Добро пожаловать в Метрику"}
        </h2>
        {kind === "formulas" ? (
          <>
            <p className="dialog-intro">
              Основные формулы для теории и практических расчётов.
            </p>
            <div className="formula-reference">
              {[
                {
                  name: "Абсолютная погрешность",
                  formula: "Δx = xизм − xоп",
                  note: "В единицах измеряемой величины. Знак показывает направление отклонения.",
                },
                {
                  name: "Модуль относительной погрешности",
                  formula: "|δ| = |Δx| / |xоп| × 100%",
                  note: "Опорное значение должно отличаться от нуля.",
                },
                {
                  name: "Модуль приведённой погрешности",
                  formula: "|γ| = |Δx| / XN × 100%",
                  note: "XN - нормирующее значение из документации прибора.",
                },
                {
                  name: "Среднее серии измерений",
                  formula: "x̄ = Σxᵢ / n",
                  note: "При независимых измерениях стандартная ошибка среднего: s(x̄) = s / √n.",
                },
                {
                  name: "Простой класс точности k",
                  formula: "Δдоп = ±k × XN / 100",
                  note: "Только для класса, нормированного приведённой погрешностью и обозначенного простой цифрой.",
                },
                {
                  name: "Поправка",
                  formula: "C = −Δx",
                  note: "Число, которое нужно прибавить к результату, чтобы приблизиться к опорному значению. Знак всегда противоположен погрешности.",
                },
              ].map((item) => (
                <div key={item.name}>
                  <h3>{item.name}</h3>
                  <strong>{item.formula}</strong>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="dialog-intro">
              Это интерактивный стенд для самостоятельного изучения погрешностей
              и средств измерений.
            </p>
            <div className="help-steps">
              {[
                {
                  title: "Двигайтесь от простого к сложному",
                  text: "Изучите классификацию, познакомьтесь с приборами, затем переходите к расчётам и тесту.",
                },
                {
                  title: "Экспериментируйте",
                  text: "Перемещайте шкалы, выбирайте приборы и вводите свои данные. Каждый расчёт сопровождается объяснением.",
                },
                {
                  title: "Возвращайтесь в удобное время",
                  text: "Отмечайте изученные разделы. Прогресс и последний результат теста сохраняются в этом браузере.",
                },
              ].map((item, index) => (
                <div key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="reset-progress">
              {confirmReset ? (
                <>
                  <p>Удалить отметки об изучении и результат теста?</p>
                  <div>
                    <button
                      className="danger-button"
                      onClick={() => {
                        onReset();
                        onClose();
                      }}
                    >
                      Да, сбросить прогресс
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => setConfirmReset(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </>
              ) : (
                <button onClick={() => setConfirmReset(true)}>
                  <RotateCcw size={15} /> Сбросить прогресс изучения
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>(getSection);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialog, setDialog] = useState<"formulas" | "help" | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [theme, setTheme] = useState<Theme>(getTheme);
  const current = navigation.find((item) => item.id === section)!;
  const percentage = Math.round(
    (progress.completed.length / modules.length) * 100,
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      /* The stand also works when browser storage is unavailable. */
    }
  }, [progress]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#121116" : "#f8f9fb");
    try {
      localStorage.setItem(themeKey, theme);
    } catch {
      /* Тема не сохранится, но применится. */
    }
  }, [theme]);
  useEffect(() => {
    const handleHistory = () => {
      setSection(getSection());
      setMobileOpen(false);
    };
    window.addEventListener("popstate", handleHistory);
    window.addEventListener("hashchange", handleHistory);
    return () => {
      window.removeEventListener("popstate", handleHistory);
      window.removeEventListener("hashchange", handleHistory);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousFocus = document.activeElement as HTMLElement;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.querySelector<HTMLButtonElement>(".mobile-close")?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      previousFocus?.focus();
    };
  }, [mobileOpen]);

  const navigate = useCallback((next: Section) => {
    setSection(next);
    setMobileOpen(false);
    if (window.location.hash !== `#${next}`)
      window.history.pushState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const complete = useCallback((id: LearningSection, score?: number) => {
    setProgress((previous) => ({
      completed: previous.completed.includes(id)
        ? previous.completed
        : [...previous.completed, id],
      quizScore: score ?? previous.quizScore,
    }));
  }, []);

  function resetProgress() {
    setProgress({ completed: [], quizScore: null });
    setQuizKey((previous) => previous + 1);
    navigate("overview");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a
          className="skip-link"
          href="#main-content"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          Перейти к содержанию
        </a>
        {mobileOpen && (
          <button
            className="sidebar-backdrop"
            aria-label="Закрыть меню"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
          <div className="sidebar-brand">
            <button
              className="brand"
              onClick={() => navigate("overview")}
              aria-label="Метрика: на главную"
            >
              <Logo />
            </button>
            <button
              className="mobile-close icon-button"
              aria-label="Закрыть меню"
              onClick={() => setMobileOpen(false)}
            >
              <X size={21} />
            </button>
          </div>
          <div className="sidebar-subtitle">ЛАБОРАТОРИЯ ЗНАНИЙ</div>
          <div className="navigation-label">ИЗУЧЕНИЕ ТЕМЫ</div>
          <nav className="main-navigation" aria-label="Учебные разделы">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${section === item.id ? "active" : ""}`}
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                {section === item.id && (
                  <motion.span
                    layoutId="active-nav"
                    className="nav-active-background"
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}
                <item.icon size={19} strokeWidth={1.65} />
                <span>{item.title}</span>
                {progress.completed.includes(item.id as LearningSection) && (
                  <Check size={13} className="nav-complete" />
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-quote">
              <Lightbulb size={22} strokeWidth={1.4} />
              <p>
                Точность - это навык.
                <br />
                Его можно развить.
              </p>
            </div>
            <div className="sidebar-progress">
              <div>
                <span>Ваш прогресс</span>
                <strong>{percentage}%</strong>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Прогресс изучения"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.span
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.7 }}
                />
              </div>
              <p>
                {progress.completed.length} из {modules.length} разделов изучено
              </p>
            </div>
            <button
              className="sidebar-help"
              onClick={() => {
                setDialog("help");
                setMobileOpen(false);
              }}
            >
              <CircleHelp size={16} /> Как пользоваться стендом{" "}
              <MoveUpRight size={13} />
            </button>
          </div>
        </aside>
        <div className="main-shell" inert={mobileOpen}>
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="mobile-menu icon-button"
                aria-label="Открыть меню разделов"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={22} />
              </button>
              <span className="breadcrumb-root">Учебный стенд</span>
              <ChevronRight size={14} />
              <span className="breadcrumb-current">{current.title}</span>
            </div>
            <div className="topbar-actions">
              <button
                className="formulas-button"
                onClick={() => setDialog("formulas")}
              >
                <BookOpen size={17} />
                <span>Шпаргалка с формулами</span>
              </button>
              <span className="topbar-divider" />
              <button
                className="icon-button theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={
                  theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
                }
                aria-pressed={theme === "dark"}
                title={
                  theme === "dark" ? "Светлая тема" : "Тёмная тема"
                }
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -40, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 40, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                  >
                    {theme === "dark" ? (
                      <Sun size={20} strokeWidth={1.6} />
                    ) : (
                      <Moon size={20} strokeWidth={1.6} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
              <span className="topbar-divider" />
              <button
                className="icon-button help-icon"
                aria-label="Помощь по учебному стенду"
                title="Как пользоваться стендом"
                onClick={() => setDialog("help")}
              >
                <CircleHelp size={20} strokeWidth={1.6} />
              </button>
            </div>
          </header>
          <main id="main-content" className="main-content" tabIndex={-1}>
            <AnimatePresence mode="wait">
              <motion.div
                key={section}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                {section === "overview" && (
                  <Overview
                    onNavigate={navigate}
                    completed={progress.completed}
                  />
                )}
                {section === "errors" && (
                  <ErrorsPage
                    completed={progress.completed.includes("errors")}
                    onComplete={() => complete("errors")}
                    onNext={() => navigate("instruments")}
                  />
                )}
                {section === "lab" && (
                  <LabPage
                    completed={progress.completed.includes("lab")}
                    onComplete={() => complete("lab")}
                    onNext={() => navigate("instruments")}
                  />
                )}
                {section === "instruments" && (
                  <InstrumentsPage
                    completed={progress.completed.includes("instruments")}
                    onComplete={() => complete("instruments")}
                    onNext={() => navigate("practice")}
                  />
                )}
                {section === "practice" && (
                  <Practice onComplete={() => complete("practice")} />
                )}
                {section === "quiz" && (
                  <Quiz
                    key={quizKey}
                    savedScore={progress.quizScore}
                    onComplete={(score) => complete("quiz", score)}
                    onTheory={() => navigate("errors")}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
          <footer className="site-footer">
            <span>
              <span className="footer-dot" /> МЕТРИКА{" "}
              <span className="footer-slash">/</span> УЧИТЕСЬ ИЗМЕРЯТЬ ОСОЗНАННО
            </span>
            <span>Меньше неопределённости. Больше понимания.</span>
          </footer>
        </div>
        {dialog && (
          <ReferenceDialog
            kind={dialog}
            onClose={() => setDialog(null)}
            onReset={resetProgress}
          />
        )}
      </div>
    </MotionConfig>
  );
}
