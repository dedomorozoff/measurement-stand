export function formatNumber(value: number, digits = 3): string {
  return value.toLocaleString("ru-RU", { maximumFractionDigits: digits });
}

export function formatSigned(value: number, digits = 3): string {
  return `${value > 0 ? "+" : ""}${formatNumber(value, digits)}`;
}

export function parseNumber(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) && Math.abs(value) <= 1e12 ? value : null;
}

export function getSeriesStats(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const deviation = Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      (values.length - 1),
  );
  return {
    mean,
    deviation,
    standardError: deviation / Math.sqrt(values.length),
  };
}
