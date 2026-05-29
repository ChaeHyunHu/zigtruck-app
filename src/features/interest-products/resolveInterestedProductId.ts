export function resolveInterestedProductId(
  data: Record<string, unknown> | null | undefined,
): number | null {
  if (!data) return null;
  const nested = data.interestProduct;
  const candidates = [
    data.interestedProductId,
    data.interestProductId,
    typeof nested === "object" && nested !== null
      ? (nested as { id?: unknown }).id
      : undefined,
    data.interestProductsId,
  ];
  for (const candidate of candidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}
