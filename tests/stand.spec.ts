import { expect, test } from "@playwright/test";

test("overview, interactive example, classification and saved progress", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Погрешности");
  await expect(page.locator(".hero-visual img")).toBeVisible();
  await page.locator("#quick-measurement").focus();
  await page.locator("#quick-measurement").press("End");
  await expect(page.locator(".experiment-results")).toContainText("+0,5 мм");
  await expect(page.locator(".experiment-results")).toContainText("2%");
  await page.getByRole("button", { name: "Начать изучение" }).click();
  await expect(page.locator(".error-explanation h2")).toHaveText(
    "Абсолютная погрешность",
  );
  await page.getByRole("tab", { name: "По характеру проявления" }).click();
  await page.getByRole("button", { name: /Случайная/ }).click();
  await expect(page.locator(".error-explanation h2")).toHaveText(
    "Случайная погрешность",
  );
  await page.getByRole("tab", { name: "По условиям измерения" }).click();
  await page.getByRole("button", { name: /Дополнительная/ }).click();
  await expect(page.locator(".error-explanation h2")).toHaveText(
    "Дополнительная погрешность",
  );
  await page.getByRole("tab", { name: "По источнику возникновения" }).click();
  await page.getByRole("button", { name: /Методическая/ }).click();
  await expect(page.locator(".error-explanation h2")).toHaveText(
    "Методическая погрешность",
  );
  await page.getByRole("button", { name: "Отметить как изученный" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "20",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Раздел изучен" }),
  ).toBeDisabled();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "20",
  );
});

test("all virtual instruments respond to the scale and properties expand", async ({
  page,
}) => {
  await page.goto("/#instruments");
  await page.locator("#instrument-slider").focus();
  await page.locator("#instrument-slider").press("End");
  await expect(page.locator(".instrument-slider output")).toHaveText("150 мм");
  await page.getByRole("tab", { name: "Линейка", exact: true }).click();
  await expect(page.locator(".instrument-slider output")).toHaveText("125 мм");
  await page.getByRole("tab", { name: "Микрометр", exact: true }).click();
  await expect(page.locator(".instrument-slider output")).toHaveText("8,25 мм");
  await page.getByRole("tab", { name: "Вольтметр", exact: true }).click();
  await expect(page.locator(".instrument-slider output")).toHaveText("18 В");
  await page.locator("#instrument-slider").focus();
  await page.locator("#instrument-slider").press("End");
  await expect(page.locator(".instrument-slider output")).toHaveText("30 В");
  await page.getByRole("button", { name: /Класс точности/ }).click();
  await expect(page.locator("#property-4")).toBeVisible();
  await expect(page.locator("#property-4")).toContainText("±0,45 В");
  await page.getByRole("button", { name: /Порог чувствительности/ }).click();
  await expect(page.locator("#property-3")).toContainText("Наименьшее изменение");
});

test("measurement means explorer shows flow and examples", async ({ page }) => {
  await page.goto("/#instruments");
  await expect(page.locator(".si-explanation h3")).toHaveText("Мера");
  await expect(page.locator(".flow-diagram")).toContainText("мера");
  await page.getByRole("tab", { name: /Измерительный преобразователь/ }).click();
  await expect(page.locator(".si-explanation h3")).toHaveText(
    "Измерительный преобразователь",
  );
  await expect(page.locator(".flow-diagram")).toContainText("термопара");
  await expect(page.locator(".example-chips")).toContainText("тензодатчик");
  await page.getByRole("tab", { name: /Измерительная система/ }).click();
  await expect(page.locator(".si-explanation h3")).toHaveText(
    "Измерительная система",
  );
});

test("voltmeter trainer checks the reading against half a division", async ({
  page,
}) => {
  await page.goto("/#instruments");
  await page.getByRole("tab", { name: "Вольтметр", exact: true }).click();
  await page.getByRole("button", { name: /Тренироваться/ }).click();
  await expect(page.locator(".trainer-task")).toBeVisible();
  await page.locator(".trainer-controls input").fill("0");
  await page.getByRole("button", { name: "Ответ", exact: true }).click();
  await expect(page.locator(".answer-feedback")).toContainText(
    "больше половины деления",
  );
  await expect(page.locator(".stat-tiles")).toContainText("0 / 1");
});

test("lab experiments count shots and build a normal distribution", async ({
  page,
}) => {
  await page.goto("/#lab");
  await expect(page.locator(".target-svg")).toBeVisible();
  await page.getByRole("button", { name: /Серия ×12/ }).click();
  await expect(page.locator(".experiment-topline")).toContainText("12");
  await page.getByRole("button", { name: /Случайная/ }).click();
  await page.getByRole("button", { name: /Отсчёт ×1/ }).click();
  await expect(page.locator(".experiment-topline")).toContainText("13");
  await page.getByRole("tab", { name: /Гистограмма/ }).click();
  await page.getByRole("button", { name: /Серия ×150/ }).click();
  await page.getByRole("button", { name: /Серия ×150/ }).click();
  await expect(page.locator(".lab-figures")).toContainText("300");
  // Среднее 300 случайных отклонений с σ = 1 держится у 100,00 мм.
  const mean = Number(
    (await page.locator(".lab-figures > div").nth(1).locator("b").innerText())
      .replace(",", "."),
  );
  expect(mean).toBeGreaterThan(99.8);
  expect(mean).toBeLessThan(100.2);
  await page.getByRole("button", { name: "Сбросить серию" }).click();
  await expect(page.locator(".lab-figures")).toContainText("0");
});

test("calculators handle decimal commas, zero references and invalid inputs", async ({
  page,
}) => {
  await page.goto("/#practice");
  const calculate = page.getByRole("button", {
    name: "Рассчитать",
    exact: true,
  });
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("+0,4 мм");
  await expect(page.locator(".result-numbers")).toContainText("1,6 %");
  await page.getByLabel("Опорное значение").fill("0");
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("Не определён");
  await page.getByLabel("Опорное значение").fill("abc");
  await calculate.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("tab", { name: "Серия измерений" }).click();
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("25,3 мм");
  await expect(page.locator(".result-numbers")).toContainText("0,158114 мм");
  await expect(page.locator(".result-numbers")).toContainText("0,070711 мм");
  await page.getByLabel("Результаты измерений").fill("1; 1; 1");
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("1 мм");
  await page.getByRole("tab", { name: "Класс точности", exact: true }).click();
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("±0,45 В");
  await expect(page.locator(".result-numbers")).toContainText("±2,25 %");
  await page.getByLabel("Показание прибора", { exact: true }).fill("31");
  await calculate.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Очистить", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: /Класс точности/ }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Подставить пример" }).click();
  await expect(
    page.getByLabel("Показание прибора", { exact: true }),
  ).toHaveValue("20");
  await page.getByRole("tab", { name: "Приведённая погрешность" }).click();
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("1,5");
  await expect(page.locator(".result-numbers")).toContainText("±0,45 В");
  await expect(page.locator(".scale-insight")).toContainText("¼ шкалы");
  await page.getByLabel("Предельная погрешность").fill("2");
  await calculate.click();
  await expect(page.locator(".result-numbers")).toContainText("6,666667");
  await expect(page.locator(".result-numbers")).not.toContainText("±0,45 В");
});

test("quiz explains answers, persists result and progress can be reset", async ({
  page,
}) => {
  await page.goto("/#quiz");
  await expect(
    page.getByRole("button", { name: "Проверить ответ" }),
  ).toBeDisabled();
  const answers = [0, 1, 2, 3, 1, 2, 0, 2, 2, 2, 1];
  for (const [index, answer] of answers.entries()) {
    await page.getByRole("radio").nth(answer).click();
    await page.getByRole("button", { name: "Проверить ответ" }).click();
    await expect(page.locator(".answer-feedback")).toContainText("Верно!");
    await page
      .getByRole("button", {
        name: index === answers.length - 1 ? "Завершить тест" : "Следующий вопрос",
      })
      .click();
  }
  await expect(page.locator(".score-circle strong")).toHaveText("11");
  await expect(page.locator(".quiz-result-panel h2")).toHaveText(
    "Точность в ваших руках!",
  );
  await page.reload();
  await expect(page.locator(".score-circle strong")).toHaveText("11");
  await page.getByText("Разобрать правильные ответы").click();
  await expect(page.locator(".answer-review article")).toHaveCount(11);
  await page.getByRole("button", { name: "Помощь по учебному стенду" }).click();
  await page
    .getByRole("button", { name: "Сбросить прогресс изучения" })
    .click();
  await page.getByRole("button", { name: "Да, сбросить прогресс" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "0",
  );
  await expect(page.locator(".overview-hero")).toBeVisible();
});

test("reference dialog is keyboard accessible and routes have no runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "overview",
    "errors",
    "lab",
    "instruments",
    "practice",
    "quiz",
  ]) {
    await page.goto(`/#${route}`);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Шпаргалка с формулами" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".formula-reference > div")).toHaveCount(6);
  await expect(page.locator(".formula-reference")).toContainText("C = −Δx");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("theme switches between light and dark and survives a reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  const toggle = page.getByRole("button", { name: "Включить тёмную тему" });
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // Тёмная тема должна реально менять фон, а не только атрибут.
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "rgb(18, 17, 22)",
  );
  await expect(page.getByRole("button", { name: "Включить светлую тему" })).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Включить светлую тему" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test.describe("phone layout", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("navigation and every lesson fit a narrow screen", async ({ page }) => {
    await page.goto("/");
    for (const name of [
      "Погрешности измерений",
      "Лаборатория",
      "Средства измерений",
      "Практикум",
      "Проверка знаний",
      "Обзор темы",
    ]) {
      await page.getByRole("button", { name: "Открыть меню разделов" }).click();
      await expect(page.locator(".sidebar")).toHaveClass(/is-open/);
      await page
        .getByRole("navigation")
        .getByRole("button", { name, exact: true })
        .click();
      await expect(page.locator(".sidebar")).not.toHaveClass(/is-open/);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});

test("lessons and quiz support keyboard choice navigation", async ({
  page,
}) => {
  await page.goto("/#errors");
  await page.getByRole("tab", { name: "По способу выражения" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "По характеру проявления" }),
  ).toHaveAttribute("aria-selected", "true");
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#errors$/);
  await expect(page.locator("#main-content")).toBeFocused();
  await page.goto("/#quiz");
  await page.getByRole("radio").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio").nth(1)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Открыть меню разделов" }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".sidebar")).not.toHaveClass(/is-open/);
});

test("an incorrect quiz answer explains the error without losing previous answers", async ({
  page,
}) => {
  await page.goto("/#quiz");
  await page.getByRole("radio").nth(1).click();
  await page.getByRole("button", { name: "Проверить ответ" }).click();
  await expect(page.locator(".answer-feedback")).toContainText("Не совсем");
  await expect(page.getByRole("radio").first()).toHaveClass(/correct/);
  await expect(page.getByRole("radio").nth(1)).toHaveClass(/wrong/);
  await page.getByRole("button", { name: "Следующий вопрос" }).click();
  await page.getByRole("button", { name: "Назад", exact: true }).click();
  await expect(page.getByRole("radio").nth(1)).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByRole("radio").nth(1)).toBeDisabled();
  await expect(page.locator(".answer-feedback")).toContainText("Не совсем");
});
