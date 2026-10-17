import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Lightbulb, RotateCcw, Shuffle, Target } from "lucide-react";
import { formatNumber, parseNumber } from "../utils/measurements";

type Props = {
  /** Показание прибора в задании (управляется снаружи, чтобы двигать стрелку). */
  task: number;
  /** Цена деления шкалы в единицах измерения. */
  resolution: number;
  max: number;
  onNewTask: () => void;
};

/**
 * Отсчётная погрешность равна половине цены деления, поэтому ответ
 * засчитывается с допуском ±C/2.
 */
export default function GaugeTrainer({
  task,
  resolution,
  max,
  onNewTask,
}: Props) {
  const tolerance = resolution / 2;
  const [answer, setAnswer] = useState("");
  const [verdict, setVerdict] = useState<{ ok: boolean; error: number } | null>(
    null,
  );
  const [score, setScore] = useState({ ok: 0, attempts: 0 });

  const nextTask = () => {
    onNewTask();
    setAnswer("");
    setVerdict(null);
  };

  const check = () => {
    const value = parseNumber(answer);
    if (value === null) return;
    const error = Math.abs(value - task);
    const ok = error <= tolerance + 0.001;
    setVerdict({ ok, error });
    setScore((previous) => ({
      ok: previous.ok + (ok ? 1 : 0),
      attempts: previous.attempts + 1,
    }));
  };

  return (
    <div className="trainer-body">
      <p className="trainer-task">
        <Target size={18} />
        <span>
          Снимите показание стрелочного прибора. Ответ засчитывается с точностью до
          половины деления (±{formatNumber(tolerance)} В) - такой будет и записанная
          погрешность.
        </span>
      </p>
      <div className="trainer-controls">
        <div className="input-with-unit">
          <input
            type="text"
            inputMode="decimal"
            value={answer}
            aria-label="Ваш отсчёт в вольтах"
            placeholder="напр., 12"
            onChange={(event) => {
              setAnswer(event.target.value);
              setVerdict(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") check();
            }}
          />
          <span>В</span>
        </div>
        <button className="primary-button" onClick={check}>
          <Check size={16} /> Ответ
        </button>
        <button className="secondary-button" onClick={nextTask}>
          <Shuffle size={16} /> Заново
        </button>
        <button
          className="icon-button"
          onClick={() => setScore({ ok: 0, attempts: 0 })}
          aria-label="Сбросить счёт"
        >
          <RotateCcw size={17} />
        </button>
      </div>
      <div className="stat-tiles">
        <div>
          <span>Верных отсчётов</span>
          <b>
            {score.ok} / {score.attempts}
          </b>
          <small>
            {score.attempts === 0
              ? "начните с любой задачи"
              : `${Math.round((score.ok / score.attempts) * 100)}% попаданий`}
          </small>
        </div>
        <div>
          <span>Отсчётная погрешность</span>
          <b>±{formatNumber(tolerance)} В</b>
          <small>половина цены деления</small>
        </div>
        <div>
          <span>Шкала прибора</span>
          <b>
            0...{formatNumber(max)} В
          </b>
          <small>цена деления {formatNumber(resolution)} В</small>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {verdict && (
          <motion.div
            key={`${verdict.ok}-${verdict.error.toFixed(2)}`}
            className={`answer-feedback ${verdict.ok ? "is-correct" : "is-wrong"}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              <Lightbulb size={20} />
            </div>
            <div>
              <strong>
                {verdict.ok
                  ? "Верно. Отсчёт выполнен правильно."
                  : "Пока не то. Смотрите на соседние штрихи."}
              </strong>
              <p>
                {verdict.ok ? (
                  <>
                    Показание {formatNumber(task)} В отличается от истинного не более
                    чем на половину деления. Так и записывают результат:{" "}
                    {formatNumber(task)} ± {formatNumber(tolerance)} В.
                  </>
                ) : (
                  <>
                    Прибор показывает {formatNumber(task)} В, ваш отсчёт отличается на{" "}
                    {formatNumber(verdict.error)} В - это больше половины деления.
                    Правило простое: цифры результата берут до той цифры, которой
                    соответствует отсчётная погрешность.
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}