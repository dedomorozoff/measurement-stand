import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Award, CircleHelp, RotateCcw } from "lucide-react";
import { Reveal, Section } from "./ui";
import { cn } from "../utils/cn";

type Q = { q: string; options: string[]; correct: number; why: string };

const QUESTIONS: Q[] = [
  {
    q: "Погрешность, остающаяся постоянной или закономерно изменяющаяся при повторных измерениях одной величины — это…",
    options: ["случайная", "систематическая", "грубая (промах)", "динамическая"],
    correct: 1,
    why: "Систематическая погрешность действует в одну сторону: её выявляют по смещению результатов и устраняют калибровкой или поправкой.",
  },
  {
    q: "Абсолютная погрешность измерения вычисляется по формуле:",
    options: ["Δ = Xизм − Xист", "δ = Δ / X · 100 %", "γ = Δ / XN · 100 %", "s = Σ(xi − x̄)²"],
    correct: 0,
    why: "Δ = Xизм − Xист. Она выражается в единицах измеряемой величины и пишется в записи результата: X = Xизм ± Δ.",
  },
  {
    q: "Приведённая погрешность γ — это отношение абсолютной погрешности к…",
    options: ["измеренному значению Xизм", "истинному значению Xист", "нормирующему значению XN", "среднеквадратичному отклонению"],
    correct: 2,
    why: "γ = (Δ / XN) · 100 %. Нормирующее значение обычно равно пределу шкалы — именно по γ определяют класс точности.",
  },
  {
    q: "Вольтметр 0–300 В, класс точности 1.5. Предел допустимой погрешности прибора:",
    options: ["±1.5 В", "±2.25 В", "±4.5 В", "±15 В"],
    correct: 2,
    why: "Δдоп = κ·XN/100 = 1.5·300/100 = ±4.5 В — и одинаков для любой точки шкалы.",
  },
  {
    q: "Термопара, преобразующая температуру в ЭДС, относится к виду средств измерений:",
    options: ["мера", "измерительный прибор", "измерительный преобразователь", "измерительная система"],
    correct: 2,
    why: "Преобразователь переводит измеряемую величину в другую, удобную для передачи и обработки: T → ЭДС.",
  },
  {
    q: "Мера — это средство измерений, которое…",
    options: [
      "преобразует величину в сигнал связи",
      "вырабатывает показание на шкале",
      "воспроизводит величину заданного размера",
      "объединяет несколько приборов в схему",
    ],
    correct: 2,
    why: "Гиря в 1 кг или образцовое сопротивление имеют известное заранее значение — это и есть мера.",
  },
  {
    q: "Грубую погрешность (промах) в ряду результатов следует…",
    options: ["усреднить вместе с остальными", "исключить из обработки", "уменьшить вдвое", "считать систематической"],
    correct: 1,
    why: "Промах резко отличается от остальных отсчётов: он портит выборку, поэтому его находят по критериям и удаляют.",
  },
  {
    q: "Цена деления шкалы прибора — это…",
    options: [
      "стоимость одного деления шкалы",
      "число делений всей шкалы",
      "значение величины, вызывающее перемещение указателя на одно деление",
      "погрешность отсчёта по шкале",
    ],
    correct: 2,
    why: "C = XN / Nдел. Например, при шкале 0–300 В и 150 делениях C = 2 В/дел.",
  },
];

const LETTERS = ["А", "Б", "В", "Г"];

export default function Quiz() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[idx];
  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correct) setScore((s) => s + 1);
  };
  const next = () => {
    if (idx + 1 >= QUESTIONS.length) setDone(true);
    else {
      setIdx((i) => i + 1);
      setPicked(null);
    }
  };
  const restart = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const pct = Math.round((score / QUESTIONS.length) * 100);
  const verdict =
    pct >= 88 ? "Метролог СИ-ликвидатор. Тема усвоена отлично." :
    pct >= 63 ? "Уверенное знание темы. Повторите допущенные пункты." :
    "Стоит вернуться к главам стенда и пройти лабораторию ещё раз.";

  return (
    <Section
      id="quiz"
      chapter="07"
      kicker="контроль знаний"
      title={
        <>
          Итоговый <span className="text-amber">тест</span>
        </>}
      lede="Восемь вопросов по обеим частям темы: типы погрешностей, формулы, классы точности и виды средств измерений. После каждого ответа — краткое пояснение."
    >
      <Reveal>
        <div className="panel mx-auto max-w-4xl rounded-sm">
          {/* progress */}
          <div className="h-1 w-full bg-line">
            <motion.div
              className="h-full bg-gradient-to-r from-amber to-cyanx"
              animate={{ width: `${((done ? QUESTIONS.length : idx) / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="mb-6 flex items-center justify-between font-mono text-[11px] tracking-[0.25em] uppercase text-fog">
                    <span className="flex items-center gap-2"><CircleHelp size={14} className="text-amber" /> вопрос</span>
                    <span className="tabular"><span className="text-amber">{String(idx + 1).padStart(2, "0")}</span> / {String(QUESTIONS.length).padStart(2, "0")}</span>
                  </div>

                  <h3 className="min-h-20 font-display text-base font-semibold leading-snug sm:text-xl">{q.q}</h3>

                  <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
                    {q.options.map((o, i) => {
                      const isCorrect = i === q.correct;
                      const isPicked = i === picked;
                      return (
                        <button
                          key={i}
                          onClick={() => pick(i)}
                          disabled={picked !== null}
                          className={cn(
                            "group flex items-center gap-3 border px-4 py-3.5 text-left text-sm transition-all duration-300",
                            picked === null && "border-line hover:border-amber/60 hover:bg-amber/5",
                            picked !== null && isCorrect && "border-mint bg-mint/10 text-mint",
                            picked !== null && isPicked && !isCorrect && "border-rose bg-rose/10 text-rose",
                            picked !== null && !isPicked && !isCorrect && "border-line opacity-40",
                          )}
                        >
                          <span className={cn("grid size-6 shrink-0 place-items-center border font-mono text-[10px]", 
                            picked !== null && isCorrect ? "border-mint text-mint" : picked !== null && isPicked ? "border-rose text-rose" : "border-line-2 text-fog group-hover:border-amber group-hover:text-amber")}>
                            {LETTERS[i]}
                          </span>
                          {o}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {picked !== null && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-5 border border-line bg-ink p-4 text-sm leading-relaxed text-fog">
                          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-cyanx">пояснение — </span>
                          {q.why}
                        </div>
                        <button onClick={next} className="mt-4 flex w-full items-center justify-center gap-2 border border-amber bg-amber px-6 py-3.5 font-mono text-xs font-bold tracking-[0.2em] uppercase text-ink transition-transform hover:-translate-y-0.5 sm:w-auto sm:ml-auto">
                          {idx + 1 === QUESTIONS.length ? "к результату" : "следующий вопрос"} <ArrowRight size={14} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="flex flex-col items-center py-6 text-center">
                  <div className="relative grid place-items-center">
                    <svg viewBox="0 0 120 120" className="size-40 -rotate-90">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#232a31" strokeWidth="8" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none" stroke="#ffb320" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - pct / 100) }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                      />
                    </svg>
                    <div className="absolute">
                      <div className="font-display text-3xl font-bold tabular">{pct}%</div>
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-fog">{score} из {QUESTIONS.length}</div>
                    </div>
                  </div>
                  <Award size={22} className="mt-6 text-amber" />
                  <h3 className="mt-3 font-display text-lg font-semibold uppercase tracking-wide sm:text-xl">{verdict}</h3>
                  <p className="mt-2 max-w-md text-sm text-fog">
                    Повторение — мать измерения. Вернитесь к интерактивным моделям и закрепите слабые места.
                  </p>
                  <button onClick={restart} className="mt-6 flex items-center gap-2 border border-line-2 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-fog transition-all hover:border-amber hover:text-amber">
                    <RotateCcw size={14} /> пройти заново
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
