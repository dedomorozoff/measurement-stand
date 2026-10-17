import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AudioWaveform, Cable, Gauge, Grid3x3, Package, Radio, Ruler, Split, Workflow } from "lucide-react";
import { Reveal, Section, staggerChild, staggerParent } from "./ui";
import { cn } from "../utils/cn";

const SI_TYPES = [
  {
    id: "measure",
    name: "Мера",
    def: "Средство измерений, предназначенное для воспроизведения физической величины заданного размера. Значение меры известно заранее — с ним сравнивают измеряемую величину.",
    ex: ["гиря 1 кг", "концевая мера длины", "образцовое сопротивление", "нормальный элемент (мера ЭДС)"],
    flow: { inp: "эталон единицы", dev: "мера", out: "величина известного размера" },
  },
  {
    id: "transducer",
    name: "Измерительный преобразователь",
    def: "СИ, преобразующее измеряемую величину в другую величину, удобную для передачи, обработки и хранения. Сегодня его чаще называют датчиком.",
    ex: ["термопара: T → ЭДС", "тензодатчик: F → R", "преобразователь давления"],
    flow: { inp: "Т = 400 °C", dev: "термопара", out: "ЭДС = 23.1 мВ" },
  },
  {
    id: "device",
    name: "Измерительный прибор",
    def: "СИ, вырабатывающее сигнал измерительной информации в форме, доступной для непосредственного восприятия наблюдателем.",
    ex: ["вольтметр, амперметр", "манометр", "осциллограф", "термометр"],
    flow: { inp: "U = 220 В", dev: "вольтметр", out: "показание 220 В на шкале" },
  },
  {
    id: "setup",
    name: "Измерительная установка",
    def: "Совокупность сопряжённых средств измерений и вспомогательных устройств, собранная в одном месте для получения результата с заданной точностью.",
    ex: ["установка поверки вольтметров", "лабораторный стенд", "калибровочная линия"],
    flow: { inp: "объект + эталон", dev: "установка", out: "результат поверки, Δ ≤ 0.5 %" },
  },
  {
    id: "system",
    name: "Измерительная система",
    def: "Совокупность средств измерений, соединённых каналами связи, для измерений в нескольких точках объекта и совместной обработки данных.",
    ex: ["АСУ ТП", "телеметрия ракеты", "мониторинг моста", "SCADA-сеть"],
    flow: { inp: "датчики × N точек", dev: "система + каналы", out: "данные в реальном времени" },
  },
];

const METRO_CHARS = [
  { icon: Ruler, name: "Диапазон измерений", def: "область значений, в пределах которой работает СИ", chip: "0 … 300 В" },
  { icon: Split, name: "Цена деления", def: "значение величины, соответствующее перемещению указателя на одно деление шкалы", chip: "C = X_N / N_дел = 2 В/дел" },
  { icon: AudioWaveform, name: "Чувствительность S", def: "отношение изменения выходного сигнала к вызвавшему его изменению входной величины", chip: "S = ΔВыход / ΔВход" },
  { icon: Radio, name: "Порог чувствительности", def: "наименьшее изменение входной величины, которое прибор ещё способен заметить", chip: "напр., 0.1 В для стрелочного" },
  { icon: Gauge, name: "Класс точности κ", def: "обобщённая характеристика: пределы основной и дополнительной погрешностей, % от X_N", chip: "0.1 | 0.2 | 0.5 | 1.0 | 1.5 | 2.5 | 4.0" },
  { icon: Workflow, name: "Динамические свойства", def: "быстродействие и инерционность: как СИ отслеживает изменение входа во времени", chip: "время установления, АЧХ" },
];

export default function Instruments() {
  const [active, setActive] = useState(SI_TYPES[0]);

  return (
    <Section
      id="instruments"
      chapter="05"
      kicker="средства измерений"
      title={
        <>
          Средства измерений: <span className="text-stroke">от гири до системы</span>
        </>}
      lede="Средство измерений (СИ) — техническое средство, применяемое при измерениях и имеющее нормированные метрологические характеристики. По конструктивной сложности и роли их делят на пять видов — разберите каждый."
    >
      {/* SI type explorer */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Reveal className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pr-2 lg:pb-0">
          {SI_TYPES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              className={cn(
                "shrink-0 border px-5 py-4 text-left transition-all duration-300",
                active.id === t.id ? "border-amber bg-amber/10" : "border-line text-fog hover:border-line-2 hover:text-paper",
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-xs font-semibold uppercase tracking-wide sm:text-sm">{t.name}</span>
                <span className={cn("font-mono text-[10px]", active.id === t.id ? "text-amber" : "text-fog/50")}>0{i + 1}</span>
              </div>
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.08}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="panel h-full rounded-sm p-6 sm:p-8"
            >
              <h3 className="font-display text-xl font-semibold uppercase tracking-wide sm:text-2xl">{active.name}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fog sm:text-base">{active.def}</p>

              {/* flow diagram */}
              <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs sm:text-sm">
                <span className="border border-line-2 bg-ink px-4 py-3 text-fog">{active.flow.inp}</span>
                <ArrowRight size={16} className="text-amber" />
                <span className="border border-amber/60 bg-amber/10 px-4 py-3 uppercase tracking-[0.1em] text-amber">{active.flow.dev}</span>
                <ArrowRight size={16} className="text-amber" />
                <span className="border border-cyanx/50 bg-cyanx/10 px-4 py-3 text-cyanx">{active.flow.out}</span>
              </div>

              <div className="mt-6">
                <div className="mb-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">примеры</div>
                <div className="flex flex-wrap gap-2">
                  {active.ex.map((e) => (
                    <span key={e} className="border border-line bg-ink px-3 py-1.5 font-mono text-[11px] text-paper/80">{e}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>

      {/* metrological characteristics */}
      <div className="mt-20">
        <Reveal>
          <div className="mb-6 flex items-center gap-3">
            <Grid3x3 size={16} className="text-cyanx" />
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide sm:text-xl">
              Метрологические характеристики СИ
            </h3>
          </div>
        </Reveal>
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"
        >
          {METRO_CHARS.map((m, i) => (
            <motion.div key={i} variants={staggerChild} className="group relative overflow-hidden bg-ink-2 p-6 transition-colors hover:bg-panel">
              <m.icon size={20} strokeWidth={1.5} className="text-cyanx transition-transform duration-300 group-hover:scale-110" />
              <h4 className="mt-4 font-display text-sm font-semibold uppercase tracking-wide">{m.name}</h4>
              <p className="mt-2 min-h-14 text-[13px] leading-snug text-fog">{m.def}</p>
              <div className="mt-4 inline-block border border-line bg-ink px-3 py-1.5 font-mono text-[11px] text-amber">{m.chip}</div>
              <span className="absolute right-0 top-0 font-mono text-[10px] tracking-[0.2em] text-fog/30 p-2">МХ/{String(i + 1).padStart(2, "0")}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* note strip */}
      <Reveal delay={0.1} className="mt-10">
        <div className="panel flex flex-col items-start gap-4 rounded-sm p-6 sm:flex-row sm:items-center">
          <Package size={20} className="shrink-0 text-amber" />
          <p className="text-sm leading-relaxed text-fog">
            <span className="text-paper">Главное свойство любого СИ:</span> его погрешность нормирована. Прибор без
            указанных метрологических характеристик — не средство измерений, а индикатор.
          </p>
          <Cable size={20} className="shrink-0 rotate-180 text-fog/30 sm:ml-auto" strokeWidth={1} />
        </div>
      </Reveal>
    </Section>
  );
}
