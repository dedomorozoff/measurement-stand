import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, Calculator, CircleAlert, Lightbulb } from "lucide-react";
import { Reveal, Section } from "./ui";
import { cn } from "../utils/cn";

type Tab = "abs" | "lead" | "grade";

const CLASSES = [0.1, 0.2, 0.5, 1.0, 1.5, 2.5, 4.0];
const num = (s: string) => {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
};

function Field({
  symbol,
  label,
  unit,
  value,
  onChange,
  step = 0.1,
}: {
  symbol: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-fog">
        <span>
          <span className="text-amber">{symbol}</span> · {label}
        </span>
        <span>{unit}</span>
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line bg-ink px-4 py-3 font-mono text-lg text-paper outline-none transition-colors focus:border-amber"
      />
    </label>
  );
}

function Readout({ title, value, unit, tone = "amber" }: { title: string; value: string; unit?: string; tone?: "amber" | "cyan" | "mint" }) {
  const color = tone === "amber" ? "text-amber" : tone === "cyan" ? "text-cyanx" : "text-mint";
  return (
    <div className="border border-line bg-ink px-5 py-4">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-fog">{title}</div>
      <div className={cn("mt-1.5 font-mono text-2xl tabular sm:text-3xl", color)}>
        {value}
        {unit && <span className="ml-2 text-sm text-fog">{unit}</span>}
      </div>
    </div>
  );
}

export default function Calculators() {
  const [tab, setTab] = useState<Tab>("abs");

  /* tab 1 */
  const [xIsm, setXIsm] = useState("59.2");
  const [xIst, setXIst] = useState("60.0");
  const t1 = useMemo(() => {
    const a = num(xIsm), b = num(xIst);
    if (Number.isNaN(a) || Number.isNaN(b) || b === 0) return null;
    const d = a - b;
    return { d, rel: (Math.abs(d) / Math.abs(b)) * 100 };
  }, [xIsm, xIst]);

  /* tab 2 */
  const [dMax, setDMax] = useState("0.06");
  const [xN, setXN] = useState("2");
  const t2 = useMemo(() => {
    const d = num(dMax), n = num(xN);
    if (Number.isNaN(d) || Number.isNaN(n) || n === 0) return null;
    const g = (Math.abs(d) / Math.abs(n)) * 100;
    const cls = CLASSES.find((c) => g <= c) ?? null;
    return { g, cls };
  }, [dMax, xN]);

  /* tab 3 */
  const [grade, setGrade] = useState(2.5);
  const [xMax, setXMax] = useState("150");
  const [xShow, setXShow] = useState("100");
  const t3 = useMemo(() => {
    const mx = num(xMax), sh = num(xShow);
    if (Number.isNaN(mx) || mx === 0 || Number.isNaN(sh)) return null;
    const dd = (grade * Math.abs(mx)) / 100;
    const rel = sh !== 0 ? (dd / Math.abs(sh)) * 100 : null;
    return { dd, rel, pos: Math.min(1, Math.abs(sh) / Math.abs(mx)) };
  }, [grade, xMax, xShow]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "abs", label: "Δ и δ" },
    { id: "lead", label: "γ → класс" },
    { id: "grade", label: "класс → Δдоп" },
  ];

  return (
    <Section
      id="calc"
      chapter="04"
      kicker="инструментарий"
      title={
        <>
          Калькулятор <span className="text-amber">погрешностей</span>
        </>}
      lede="Три рабочие схемы из практики лаборатории. Меняйте исходные данные — расчёт мгновенный, с подстановкой в формулы. Примеры можно загрузить одним нажатием."
    >
      <Reveal>
        <div className="panel rounded-sm">
          {/* tab bar */}
          <div className="flex flex-wrap items-center gap-1 border-b border-line p-3">
            <Calculator size={16} className="ml-1 mr-2 text-amber" />
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "border px-4 py-2.5 font-mono text-[11px] tracking-[0.15em] uppercase transition-all",
                  tab === t.id ? "border-amber bg-amber/10 text-paper" : "border-transparent text-fog hover:text-paper",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2"
            >
              {/* ABS */}
              {tab === "abs" && (
                <>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-fog">
                      Измеряемое напряжение: вольтметр показал <span className="text-paper">Xизм</span>, а
                      эталон — <span className="text-paper">Xист</span>. Найдём абсолютную и относительную погрешности.
                    </p>
                    <Field symbol="Xизм" label="результат измерения" unit="В" value={xIsm} onChange={setXIsm} />
                    <Field symbol="Xист" label="истинное значение" unit="В" value={xIst} onChange={setXIst} />
                    <button
                      onClick={() => { setXIsm("59.2"); setXIst("60.0"); }}
                      className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-fog transition-colors hover:text-amber"
                    >
                      <BookMarked size={12} /> загрузить пример 59.2 / 60.0
                    </button>
                  </div>
                  {t1 ? (
                    <div className="grid content-start gap-3">
                      <div className="border border-line bg-ink px-5 py-3 font-mono text-sm text-fog">
                        Δ = {xIsm || "?"} − {xIst || "?"} = <span className="text-amber">{t1.d.toFixed(2)} В</span>
                        <span className="mx-3 text-line-2">|</span>
                        δ = |{t1.d.toFixed(2)}| / {xIst} · 100% = <span className="text-cyanx">{t1.rel.toFixed(2)} %</span>
                      </div>
                      <Readout title="абсолютная погрешность Δ" value={t1.d.toFixed(2)} unit="В" />
                      <Readout title="относительная погрешность δ" value={t1.rel.toFixed(2)} unit="%" tone="cyan" />
                      <Readout title="запись результата" value={`${(num(xIsm)).toFixed(1)} ± ${Math.abs(t1.d).toFixed(2)}`} unit="В" tone="mint" />
                    </div>
                  ) : (
                    <p className="self-center font-mono text-sm text-rose">Введите корректные числа (Xист ≠ 0)</p>
                  )}
                </>
              )}

              {/* LEAD */}
              {tab === "lead" && (
                <>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-fog">
                      Известна наибольшая абсолютная погрешность прибора и его шкала. Вычислим приведённую
                      погрешность и назначим класс точности из стандартного ряда.
                    </p>
                    <Field symbol="Δmax" label="наиб. погрешность по точкам шкалы" unit="А" value={dMax} onChange={setDMax} step={0.01} />
                    <Field symbol="XN" label="нормирующее значение (предел)" unit="А" value={xN} onChange={setXN} />
                    <button
                      onClick={() => { setDMax("0.06"); setXN("2"); }}
                      className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-fog transition-colors hover:text-amber"
                    >
                      <BookMarked size={12} /> загрузить пример 0.06 / 2
                    </button>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="font-mono text-[10px] uppercase text-fog/60">стандартный ряд:</span>
                      {CLASSES.map((c) => (
                        <span key={c} className={cn("border px-2 py-0.5 font-mono text-[10px]", t2?.cls === c ? "border-mint text-mint" : "border-line text-fog/50")}>{c}</span>
                      ))}
                    </div>
                  </div>
                  {t2 ? (
                    <div className="grid content-start gap-3">
                      <div className="border border-line bg-ink px-5 py-3 font-mono text-sm text-fog">
                        γ = |{dMax || "?"}| / {xN || "?"} · 100% = <span className="text-amber">{t2.g.toFixed(2)} %</span>
                      </div>
                      <Readout title="приведённая погрешность γ" value={t2.g.toFixed(2)} unit="%" />
                      <Readout
                        title="назначенный класс точности"
                        value={t2.cls !== null ? t2.cls.toFixed(1).replace(".0", "") : "> 4.0"}
                        tone="mint"
                      />
                      <div className="flex gap-3 border border-line bg-panel p-4 text-[13px] leading-relaxed text-fog">
                        <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber" />
                        Класс — ближайшее большее (или равное) стандартное значение: так гарантируется, что реальная
                        погрешность прибора не выйдет за его пределы.
                      </div>
                    </div>
                  ) : (
                    <p className="self-center font-mono text-sm text-rose">Введите корректные числа (XN ≠ 0)</p>
                  )}
                </>
              )}

              {/* GRADE */}
              {tab === "grade" && (
                <>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-fog">
                      Вольтметр известного класса точности. Найдём его допустимую погрешность по всей шкале и
                      оценим, где на шкале измерять выгоднее.
                    </p>
                    <div>
                      <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] uppercase text-fog">класс точности κ, %</span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {CLASSES.slice(2).map((c) => (
                          <button
                            key={c}
                            onClick={() => setGrade(c)}
                            className={cn(
                              "border px-2 py-2.5 font-mono text-sm transition-all",
                              grade === c ? "border-amber bg-amber/10 text-amber" : "border-line text-fog hover:text-paper",
                            )}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Field symbol="XN" label="предел шкалы" unit="В" value={xMax} onChange={setXMax} step={10} />
                    <Field symbol="Xпок" label="показание прибора" unit="В" value={xShow} onChange={setXShow} step={5} />
                  </div>
                  {t3 ? (
                    <div className="grid content-start gap-3">
                      <div className="border border-line bg-ink px-5 py-3 font-mono text-sm text-fog">
                        Δ<sub>доп</sub> = κ·X<sub>N</sub>/100 = {grade}·{xMax || "?"}/100 = <span className="text-amber">{t3.dd.toFixed(2)} В</span>
                      </div>
                      <Readout title="предел допустимой погрешности" value={`± ${t3.dd.toFixed(2)}`} unit="В" />
                      {t3.rel !== null && (
                        <Readout title={`δ в точке ${xShow} В`} value={t3.rel.toFixed(2)} unit="%" tone="cyan" />
                      )}
                      {/* scale visual */}
                      <div className="border border-line bg-ink p-4">
                        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase text-fog">
                          <span>шкала прибора</span>
                          <span>0 … {xMax} В</span>
                        </div>
                        <div className="relative h-2 overflow-hidden rounded-full bg-line">
                          <div className="absolute inset-y-0 left-1/2 w-px bg-paper/40" />
                          <motion.div className="h-full rounded-full bg-gradient-to-r from-rose/70 via-amber to-mint" animate={{ width: `${t3.pos * 100}%` }} transition={{ duration: 0.4 }} />
                        </div>
                        {t3.pos < 0.5 && (
                          <div className="mt-3 flex gap-2 text-[13px] leading-snug text-amber/90">
                            <CircleAlert size={15} className="mt-0.5 shrink-0" />
                            Показание в первой половине шкалы: δ здесь в {Math.round((1 / Math.max(t3.pos, 0.01)))}× выше, чем у предела. Возьмите прибор с меньшим пределом.
                          </div>
                        )}
                        {t3.pos >= 0.5 && (
                          <div className="mt-3 text-[13px] leading-snug text-mint/90">Измерение во второй половине шкалы — так δ минимальна. Верный выбор предела!</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="self-center font-mono text-sm text-rose">Введите корректные числа</p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}
