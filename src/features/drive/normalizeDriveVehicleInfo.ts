import type { DriveEnumField, DriveVehicleInfo } from "@/src/features/drive/types";
import { pickArray } from "@/src/utils/pickArray";

function normalizeEnumField(
  value: unknown,
  fallbackDesc?: string,
): DriveEnumField {
  if (value == null) return { code: "", desc: "" };
  if (typeof value === "string") {
    return { code: value, desc: fallbackDesc ?? value };
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const code = String(record.code ?? "");
    const desc = String(record.desc ?? record.name ?? fallbackDesc ?? code);
    return { code, desc };
  }
  return { code: "", desc: "" };
}

/** GET /api/v1/drive-vehicle-info/my 응답(배열 또는 단건)을 폼·홈에서 쓰는 형태로 변환 */
export function normalizeDriveVehicleInfo(payload: unknown): DriveVehicleInfo | null {
  const rows = pickArray(payload);
  const raw =
    rows.length > 0
      ? (rows[0] as Record<string, unknown>)
      : payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : null;

  if (!raw) return null;

  const id = Number(raw.id);
  if (!Number.isFinite(id) || id <= 0) return null;

  return {
    id,
    tons: raw.tons != null ? Number(raw.tons) : undefined,
    axis: normalizeEnumField(raw.axis),
    loaded: normalizeEnumField(raw.loaded),
    loadedInnerLength:
      raw.loadedInnerLength != null ? Number(raw.loadedInnerLength) : undefined,
    fuelEfficiency:
      raw.fuelEfficiency != null ? Number(raw.fuelEfficiency) : undefined,
    fee: raw.fee != null ? Number(raw.fee) : undefined,
    insuranceFee:
      raw.insuranceFee != null ? Number(raw.insuranceFee) : undefined,
    capitalFee:
      raw.capitalFee != null ? Number(raw.capitalFee) : undefined,
  };
}
