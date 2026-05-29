import type { DriveEnumField, OtherExpensesCategory } from "@/src/features/drive/types";

export function normalizeOtherExpensesCategory(
  item: unknown,
): OtherExpensesCategory | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const id = Number(row.id);
  if (!Number.isFinite(id)) return null;
  const rawType = row.type;
  let type: DriveEnumField;
  if (rawType && typeof rawType === "object" && "code" in rawType) {
    const t = rawType as DriveEnumField;
    type = { code: String(t.code), desc: String(t.desc ?? "") };
  } else {
    type = { code: String(row.type ?? ""), desc: "" };
  }
  return {
    id,
    name: String(row.name ?? ""),
    type,
  };
}
