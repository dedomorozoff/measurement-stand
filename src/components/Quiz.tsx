import { useState } from "react";
import { handleChoiceKeys } from "../utils/keyboard";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  Lightbulb,
  RotateCcw,
  X,
} from "lucide-react";
import { questions } from "../data";

type Props = {
  savedScore: number | null;
  onComplete: (score: number) => void;
  onTheory: () => void;
};

export default function Quiz({ savedScore, onComplete, onTheory }: Props) {
  const [answers, setAnswers] = useState<number[]>(questions.map(() => -1));
  const [checked, setChecked] = useState<boolean[]>(questions.map(() => false));
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(savedScore !== null);
  const [score, setScore] = useState(savedScore ?? 0);
  const question = questions[index];
  const isChecked = checked[index];
  const isCorrect = answers[index] === question.correct;

  function restart() {
    setAnswers(questions.map(() => -1));
    setChecked(questions.map(() => false));
    setIndex(0);
    setFinished(false);
  }
  function advance() {
    if (index < questions.length - 1) setIndex(index + 1);
    else {
      const total = answers.filter(
        (answer, questionIndex) => answer === questions[questionIndex].correct,
      ).length;
      setScore(total);
      setFinished(true);
      onComplete(total);
    }
  }

  return (
    <div className="learning-page quiz-page">
      <div className="page-heading">
        <span className="eyebrow">04 / ЗАКРЕПЛЯЕМ ГЛАВНОЕ</span>
        <h1>Проверка знаний</h1>
        <p>
          Шесть вопросов без таймера. После каждого ответа разберёмся, почему он
          верный.
        </p>
      </div>
      {finished ? (
        <motion.div
          className="quiz-result-panel"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="score-circle">
            <svg viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#eeebf5"
                strokeWidth="7"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="68"
                fill="none"
                stroke="#8966ce"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={427.26}
                initial={{ strokeDashoffset: 427.26 }}
                animate={{
                  strokeDashoffset: 427.26 * (1 - score / questions.length),
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                transform="rotate(-90 80 80)"
              />
            </svg>
            <div>
              <strong>{score}</strong>
              <span>из {questions.length}</span>
            </div>
          </div>
          <span className="eyebrow">ТЕСТ ЗАВЕРШЁН</span>
          <h2>
            {score === 6
              ? "Точность в ваших руках!"
              : score >= 4
                ? "Хорошая основа уже есть"
                : "Каждый ответ - шаг к пониманию"}
          </h2>
          <p>
            {score === 6
              ? "Вы уверенно ориентируетесь в погрешностях и свойствах приборов."
              : "Посмотрите правильные ответы и вернитесь к теории, чтобы закрепить сложные моменты."}
          </p>
          <div className="result-button-group">
            <button className="primary-button" onClick={restart}>
              <RotateCcw size={16} /> Пройти ещё раз
            </button>
            <button className="secondary-button" onClick={onTheory}>
              Вернуться к теории <ArrowRight size={16} />
            </button>
          </div>
          <details className="answer-review">
            <summary>
              Разобрать правильные ответы <ChevronDown size={17} />
            </summary>
            <div>
              {questions.map((item, questionIndex) => (
                <article key={item.question}>
                  <span className="review-number">
                    {String(questionIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{item.question}</h3>
                    <p className="review-correct">
                      <Check size={15} />
                      {item.options[item.correct]}
                    </p>
                    <p>{item.explanation}</p>
                    {answers[questionIndex] >= 0 &&
                      answers[questionIndex] !== item.correct && (
                        <p className="review-wrong">
                          Ваш ответ: {item.options[answers[questionIndex]]}
                        </p>
                      )}
                  </div>
                </article>
              ))}
            </div>
          </details>
        </motion.div>
      ) : (
        <div className="quiz-workbench">
          <div className="quiz-topline">
            <span>
              ВОПРОС <b>{String(index + 1).padStart(2, "0")}</b>
              <span> / {String(questions.length).padStart(2, "0")}</span>
            </span>
            <span>{question.topic}</span>
          </div>
          <div className="quiz-progress">
            <motion.span
              animate={{
                width: `${((index + (isChecked ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="question-heading">{question.question}</h2>
            <div
              className="quiz-options"
              role="radiogroup"
              aria-label="Варианты ответа"
              onKeyDown={handleChoiceKeys}
            >
              {question.options.map((option, optionIndex) => {
                const selected = answers[index] === optionIndex;
                const correct = isChecked && optionIndex === question.correct;
                const wrong = isChecked && selected && !correct;
                return (
                  <button
                    key={option}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={
                      selected || (answers[index] < 0 && optionIndex === 0)
                        ? 0
                        : -1
                    }
                    disabled={isChecked}
                    className={`quiz-option ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                    onClick={() =>
                      setAnswers((previous) =>
                        previous.map((value, questionIndex) =>
                          questionIndex === index ? optionIndex : value,
                        ),
                      )
                    }
                  >
                    <span className="option-letter">
                      {["А", "Б", "В", "Г"][optionIndex]}
                    </span>
                    <span>{option}</span>
                    <span className="option-indicator">
                      {correct ? (
                        <Check size={16} />
                      ) : wrong ? (
                        <X size={16} />
                      ) : selected ? (
                        <span />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            {isChecked && (
              <motion.div
                className={`answer-feedback ${isCorrect ? "is-correct" : "is-wrong"}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div>
                  <Lightbulb size={20} />
                </div>
                <div>
                  <strong>
                    {isCorrect
                      ? "Верно! Разберёмся подробнее."
                      : "Не совсем. Вот как рассуждать."}
                  </strong>
                  <p>{question.explanation}</p>
                </div>
              </motion.div>
            )}
            <div className="quiz-bottomline">
              <button
                className="back-question"
                onClick={() => setIndex(index - 1)}
                disabled={index === 0}
              >
                <ArrowLeft size={16} /> Назад
              </button>
              {isChecked ? (
                <button className="primary-button" onClick={advance}>
                  {index === questions.length - 1
                    ? "Завершить тест"
                    : "Следующий вопрос"}
                  {index === questions.length - 1 ? (
                    <CheckCheck size={17} />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                </button>
              ) : (
                <button
                  className="primary-button"
                  disabled={answers[index] < 0}
                  onClick={() =>
                    setChecked((previous) =>
                      previous.map((value, questionIndex) =>
                        questionIndex === index ? true : value,
                      ),
                    )
                  }
                >
                  Проверить ответ <ArrowRight size={17} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
      <p className="quiz-footnote">
        <Lightbulb size={16} /> Здесь можно ошибаться. Важно понять причину и
        попробовать снова.
      </p>
    </div>
  );
}
