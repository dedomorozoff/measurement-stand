import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, GitFork, ShieldCheck, Wrench } from "lucide-react";
import { Reveal, Section } from "./ui";
import { cn } from "../utils/cn";

type ErrType = {
  name: string;
  symbol: string;
  short: string;
  causes: string[];
  fix: string;
};

type Category = {
  id: string;
  title: string;
  caption: string;
  types: ErrType[];
};

const TAXONOMY: Category[] = [
  {
    id: "nature",
    title: "По характеру проявления",
    caption: "главный принцип деления — что происходит при повторных измерениях",
    types: [
      {
        name: "Систематическая",
        symbol: "Δс (θ)",
        short: "Остаётся постоянной или закономерно изменяется при повторных измерениях одной и той же величины. Всегда смещает результат в одну сторону.",
        causes: ["ненастроенная шкала прибора", "износ, неточность градуировки", "влияние температуры и полей", "ошибка методики измерения", "привычки самого наблюдателя"],
        fix: "Выявить причину → откалибровать прибор или ввести поправку в результат.",
      },
      {
        name: "Случайная",
        symbol: "Δσ (ε)",
        short: "Изменяется случайным образом (и по знаку, и по величине) при повторных измерениях. Неустранима, но статистически изучаема: подчиняется нормальному распределению Гаусса.",
        causes: ["дрожание питающего напряжения", "вибрации, шумы, трение в осях", "субъективность отсчёта", "тепловые флуктуации"],
        fix: "Провести серию из n измерений → взять среднее арифметическое → оценить СКО.",
      },
      {
        name: "Грубая (промах)",
        symbol: "Δгр",
        short: "Значительно превышает терпимую погрешность при данных условиях измерений. Результат с промахом — брак, он портит всю выборку.",
        causes: ["невнимательность при отсчёте", "неправильный предел измерения", "резкая помеха, сбой прибора", "невыполнение методики"],
        fix: "Обнаружить по критериям аномальности → исключить результат из ряда измерений.",
      },
    ],
  },
  {
    id: "form",
    title: "По способу выражения",
    caption: "в каких единицах измерить саму ошибку",
    types: [
      {
        name: "Абсолютная",
        symbol: "Δ, ед. величины",
        short: "Разность между результатом и истинным значением, выраженная в единицах измеряемой величины — вольтах, граммах, метрах.",
        causes: ["Δ = Xизм − Xист"],
        fix: "Удобна для записи результата в виде X ± Δ, но не говорит о качестве измерения.",
      },
      {
        name: "Относительная",
        symbol: "δ, %",
        short: "Отношение абсолютной погрешности к значению величины. Безразмерная, выражается в процентах или долях.",
        causes: ["δ = (Δ / X) · 100 %"],
        fix: "По δ сравнивают точность разных измерений: чем меньше δ — тем точнее.",
      },
      {
        name: "Приведённая",
        symbol: "γ, %",
        short: "Отношение абсолютной погрешности к нормирующему значению XN — обычно к пределу шкалы прибора. Всегда в процентах.",
        causes: ["γ = (Δ / XN) · 100 %"],
        fix: "Определяет класс точности прибора: γп = 0.5 → прибор класса 0.5.",
      },
    ],
  },
  {
    id: "time",
    title: "По условиям изменения во времени",
    caption: "меняется ли измеряемая величина в ходе опыта",
    types: [
      {
        name: "Статическая",
        symbol: "Δст",
        short: "Погрешность при измерении величины, принимаемой за постоянную в течение времени измерения.",
        causes: ["медленно меняющиеся процессы", "размер детали", "масса тела", "сопротивление резистора"],
        fix: "Классическая задача лаборатории: серия отсчётов и статистическая обработка.",
      },
      {
        name: "Динамическая",
        symbol: "Δдин",
        short: "Возникает при измерении изменяющейся величины из-за инерционности средства измерений: прибор не успевает за сигналом.",
        causes: ["быстрые переходные процессы", "пульсации давления", "изменение температуры реактора"],
        fix: "Выбирать средство измерения по быстродействию, учитывать его АЧХ/инерционность.",
      },
    ],
  },
  {
    id: "conditions",
    title: "По зависимости от условий",
    caption: "работает прибор в нормальных условиях или нет",
    types: [
      {
        name: "Основная",
        symbol: "Δосн",
        short: "Погрешность средства измерений при нормальных условиях применения, указанных производителем: температура 20 °C, номинальное питание и т.д.",
        causes: ["нормальные условия заданы в паспорте СИ"],
        fix: "Нормируется пределами: именно её класс точности и описывает.",
      },
      {
        name: "Дополнительная",
        symbol: "Δдоп",
        short: "Составляющая погрешности, возникающая при отклонении влияющей величины от нормального значения.",
        causes: ["перегрев или переохлаждение прибора", "влажность, давление", "девиация напряжения сети", "внешние магнитные поля"],
        fix: "Ограничить условия эксплуатации или ввести поправки по влияющим величинам.",
      },
    ],
  },
];

function TypeCard({ t, i }: { t: ErrType; i: number }) {
  const [open, setOpen] = useState(i === 0);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={cn("panel overflow-hidden rounded-sm transition-colors", open && "border-amber/40")}
    >
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-6">
        <span className="font-mono text-[10px] tracking-[0.2em] text-amber/70">{String(i + 1).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide sm:text-base">{t.name}</h4>
            <span className="font-mono text-xs text-cyanx">{t.symbol}</span>
          </div>
          {!open && <p className="mt-1 truncate text-sm text-fog/70">{t.short}</p>}
        </div>
        <ChevronDown size={18} className={cn("shrink-0 text-fog transition-transform duration-300", open && "rotate-180 text-amber")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid gap-6 border-t border-line p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr_1fr]">
              <p className="text-sm leading-relaxed text-fog">{t.short}</p>
              <div>
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
                  <Wrench size={12} className="text-amber" /> причины
                </div>
                <ul className="space-y-1.5">
                  {t.causes.map((c) => (
                    <li key={c} className="flex gap-2 text-[13px] leading-snug text-fog">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-amber/70" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] uppercase text-fog">
                  <ShieldCheck size={12} className="text-mint" /> метод борьбы
                </div>
                <p className="text-[13px] leading-relaxed text-paper/85">{t.fix}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Classification() {
  const [cat, setCat] = useState(TAXONOMY[0]);

  return (
    <Section
      id="types"
      chapter="02"
      kicker="таксономия ошибок"
      title={
        <>
          Классификация <span className="text-amber">погрешностей</span>
        </>}
      lede="Погрешности делятся по четырём независимым основаниям. Переключайте принцип деления и раскрывайте карточки — у каждого вида свой характер, свои причины и собственный способ борьбы."
    >
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        {/* category rail */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {TAXONOMY.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c)}
                className={cn(
                  "group shrink-0 border px-5 py-4 text-left font-mono text-[11px] tracking-[0.15em] uppercase transition-all duration-300",
                  cat.id === c.id
                    ? "border-amber bg-amber/10 text-paper"
                    : "border-line text-fog hover:border-line-2 hover:text-paper",
                )}
              >
                <div className="flex items-center gap-2">
                  <GitFork size={13} className={cat.id === c.id ? "text-amber" : "text-fog/50"} />
                  {c.title}
                </div>
                <div className={cn("mt-1.5 text-[10px] normal-case tracking-normal", cat.id === c.id ? "text-fog" : "text-fog/50")}>
                  {c.caption}
                </div>
              </button>
            ))}
          </div>
        </Reveal>

        {/* type cards */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={cat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {cat.types.map((t, i) => (
                <TypeCard key={t.name} t={t} i={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* composition strip */}
      <Reveal delay={0.1} className="mt-14">
        <div className="panel flex flex-col items-center gap-6 rounded-sm p-6 text-center sm:p-8">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-fog">итоговая погрешность результата</span>
          <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-lg sm:text-2xl">
            <span className="border border-line-2 bg-ink px-5 py-3">Δ</span>
            <span className="text-fog">=</span>
            <span className="border border-amber/50 bg-amber/10 px-5 py-3 text-amber">θ<sub>сист</sub></span>
            <span className="text-fog">+</span>
            <span className="border border-cyanx/50 bg-cyanx/10 px-5 py-3 text-cyanx">ε<sub>случ</sub></span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-fog">
            Есть и случайная, и систематическая составляющие — оценивают границы систематической θ и доверительный
            интервал случайной части. <span className="text-paper">Грубые промахи из выборки исключают.</span>
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
