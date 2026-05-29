export const pickArray = (payload: unknown): unknown[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const record = payload as Record<string, unknown>;
  const candidates = [
    record.content,
    record.data,
    record.items,
    record.list,
    record.results,
    (record.data as Record<string, unknown> | undefined)?.content,
    (record.data as Record<string, unknown> | undefined)?.items,
    (record.data as Record<string, unknown> | undefined)?.list,
    (record.result as Record<string, unknown> | undefined)?.content,
    (record.result as Record<string, unknown> | undefined)?.items,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};
