import { motion } from "framer-motion";
import { BookOpen, Equal, MoveDiagonal, ScanLine, TriangleAlert } from "lucide-react";
import { Formula, Reveal, Section, staggerChild, staggerParent } from "./ui";

const CONCEPTS = [
  {
    icon: BookOpen,
    term: "Измерение",
    def: "нахождение значения физической величины опытным путём с помощью специальных технических средств.",
    tag: "сущ. процесса",
  },
  {
    icon: ScanLine,
    term: "Истинное значение",
    def: "X_ист — значение, идеальным образом отражающее свойство объекта. Оно непознаваемо абсолютно: на практике применяют действительное значение, принятое за истинное.",
    tag: "Xист",
  },
  {
    icon: Equal,
    term: "Результат измерения",
    def: "X_изм — значение, полученное в результате измерения. Всегда содержит погрешность, то есть отличается от истинного значения.",
    tag: "Xизм",
  },
  {
    icon: TriangleAlert,
    term: "Погрешность измерения",
    def: "отклонение результата измерения от истинного значения измеряемой величины. Оценочная характеристика точности.",
    tag: "Δ",
  },
];

export default function Theory() {
  return (
    <Section
      id="theory"
      chapter="01"
      kicker="основные понятия"
      title={
        <>
          Измерить точно <span className="text-stroke">невозможно —</span>
          <br />
          но ошибку можно <span className="text-amber">понять</span>
        </>}
      lede="Погрешность — неизбежный спутник любого измерения, порождённый несовершенством приборов, методов и органов чувств человека. Метрология учит не исключать ошибки бессмысленно, а оценивать их и называть точность числом."
    >
      {/* concepts grid */}
      <motion.div
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-px border border-line bg-line sm:grid-cols-2"
      >
        {CONCEPTS.map((c, i) => (
          <motion.div key={i} variants={staggerChild} className="group relative bg-ink-2 p-7 transition-colors duration-300 hover:bg-panel">
            <div className="flex items-start justify-between">
              <c.icon size={22} strokeWidth={1.5} className="text-amber transition-transform duration-300 group-hover:-translate-y-1" />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-fog/60">{c.tag}</span>
            </div>
            <h3 className="mt-5 font-display text-base font-semibold uppercase tracking-wide sm:text-lg">{c.term}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fog">{c.def}</p>
            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-amber transition-all duration-500 group-hover:w-full" />
          </motion.div>
        ))}
      </motion.div>

      {/* notation example */}
      <Reveal delay={0.1} className="mt-10">
        <div className="panel flex flex-col items-start gap-4 rounded-sm p-6 sm:flex-row sm:items-center sm:gap-8">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-fog">как записывают результат</span>
          <div className="font-mono text-xl text-paper sm:text-2xl">
            X = 220.0 <span className="text-amber">± 0.5</span> В
          </div>
          <p className="text-sm leading-relaxed text-fog sm:ml-auto sm:max-w-sm">
            Значение после «±» — границы погрешности: истинное значение с высокой вероятностью лежит в интервале
            <span className="text-paper"> [219.5 … 220.5] В</span>.
          </p>
        </div>
      </Reveal>

      {/* formulas */}
      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        <Reveal>
          <Formula
            formula={<>Δ = X<sub>изм</sub> − X<sub>ист</sub></>}
            legend={[
              ["Δ", "абсолютная погрешность, в единицах измеряемой величины"],
              ["Xизм", "результат измерения"],
              ["Xист", "истинное значение"],
            ]}
          />
          <p className="mt-3 font-mono text-[10px] tracking-[0.2em] uppercase text-fog">показывает «на сколько» ошиблись</p>
        </Reveal>
        <Reveal delay={0.08}>
          <Formula
            formula={<>δ = <span className="text-paper">Δ / X</span><sub>ист</sub> · 100 %</>}
            legend={[
              ["δ", "относительная погрешность, в процентах"],
              ["Δ", "абсолютная погрешность"],
              ["Xист", "значение измеряемой величины"],
            ]}
          />
          <p className="mt-3 font-mono text-[10px] tracking-[0.2em] uppercase text-fog">показывает качество измерения</p>
        </Reveal>
        <Reveal delay={0.16}>
          <Formula
            formula={<>γ = <span className="text-paper">Δ / X</span><sub>N</sub> · 100 %</>}
            legend={[
              ["γ", "приведённая погрешность, в процентах"],
              ["Δ", "абсолютная погрешность"],
              ["X_N", "нормирующее значение (предел шкалы)"],
            ]}
          />
          <p className="mt-3 font-mono text-[10px] tracking-[0.2em] uppercase text-fog">основа класса точности приборов</p>
        </Reveal>
      </div>

      {/* correction note */}
      <Reveal delay={0.1} className="mt-10">
        <div className="relative overflow-hidden border border-cyanx/30 bg-cyanx/5 p-6 sm:p-8">
          <MoveDiagonal size={20} className="mb-4 text-cyanx" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h3 className="font-display text-base font-semibold uppercase tracking-wide">Поправка — брат погрешности</h3>
              <p className="mt-2 text-sm leading-relaxed text-fog">
                Если погрешность известна, результат можно исправить: прибавить к показанию поправку. Для систематической
                составляющей так и поступают — вводят поправку в результат.
              </p>
            </div>
            <div className="grid gap-3 font-mono text-base sm:grid-cols-2 sm:text-lg lg:ml-auto">
              <div className="border border-line bg-ink px-5 py-3 text-center">
                P = −Δ
              </div>
              <div className="border border-cyanx/40 bg-ink px-5 py-3 text-center text-cyanx">
                X<sub>ист</sub> ≈ X<sub>изм</sub> + P
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
