/**
 * Русская форма числительного: plural(5, ["шаг", "шага", "шагов"]) → "шагов".
 */
export function plural(count: number, forms: [string, string, string]) {
  const mod100 = Math.abs(count) % 100;
  const mod10 = Math.abs(count) % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}