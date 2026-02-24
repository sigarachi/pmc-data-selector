export function buildBinsByCount(min: number, max: number, count: number) {
  const step = (max - min) / count;

  return Array.from({ length: count + 1 }, (_, i) =>
    Math.round(min + i * step),
  );
}
