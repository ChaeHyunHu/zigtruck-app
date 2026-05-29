import { getOtherExpensesCategory, getOtherExpensesHistory } from "@/src/api/drive/getDrive";
import { createOtherExpensesCategory, createOtherExpensesHistory } from "@/src/api/drive/createDrive";
import { deleteOtherExpensesCategory } from "@/src/api/drive/deleteDrive";
import { deleteOtherExpensesHistory } from "@/src/api/drive/deleteDrive";
import { updateOtherExpensesCategory } from "@/src/api/drive/updateDrive";
import { updateOtherExpensesHistory } from "@/src/api/drive/updateDrive";
import { normalizeOtherExpensesCategory } from "@/src/features/drive/normalizeOtherExpensesCategory";
import { pickArray } from "@/src/utils/pickArray";
import {
  deleteFuelingHistory,
  deleteTransportInfo,
  getDriveHistory,
  getDriveMyVehicleInfo,
  getFuelingHistory,
  getTransportInfoOutstandingAmount,
  patchDriveHistory,
  patchDriveVehicleInfo,
  patchFuelingHistory,
  patchTransportInfoOutstandingAmount,
  postDriveHistory,
  postDriveVehicleInfo,
  postFuelingHistory,
} from "@/src/api/public";
import { uploadFuelingReceiptMultipart } from "@/src/features/drive/uploadFuelingReceipt";
import { normalizeDriveVehicleInfo } from "@/src/features/drive/normalizeDriveVehicleInfo";
import type {
  DriveInfoResponse,
  DriveVehicleInfo,
  FuelingHistoryResponse,
  OtherExpenseHistoryResponse,
  OtherExpensesCategory,
  OutstandingAmountResponse,
} from "@/src/features/drive/types";

export async function fetchDriveVehicleInfo(): Promise<DriveVehicleInfo | null> {
  const res = await getDriveMyVehicleInfo();
  return normalizeDriveVehicleInfo(res.data);
}

export async function fetchDriveHistory(params: {
  driveVehicleInfoId: number;
  baseYearMonth: string;
  baseDay: string;
}): Promise<DriveInfoResponse> {
  const res = await getDriveHistory({
    driveVehicleInfoId: params.driveVehicleInfoId,
    baseYearMonth: params.baseYearMonth,
    baseDay: params.baseDay,
  });
  return (res.data ?? {}) as DriveInfoResponse;
}

export async function fetchFuelingHistory(
  params: Record<string, string | number>,
): Promise<FuelingHistoryResponse> {
  const res = await getFuelingHistory(params);
  return (res.data ?? {}) as FuelingHistoryResponse;
}

export async function fetchOtherExpensesHistory(
  params: Record<string, string | number>,
): Promise<OtherExpenseHistoryResponse> {
  const payload = await getOtherExpensesHistory(params);
  if (!payload || typeof payload !== "object") {
    return { response: [], totalExpense: 0, totalIncome: 0 };
  }
  const record = payload as Record<string, unknown>;
  const data =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : record;
  const response = Array.isArray(data.response)
    ? data.response
    : pickArray(data.response ?? data);
  return {
    response: response as OtherExpenseHistoryResponse["response"],
    totalExpense: Number(data.totalExpense ?? 0),
    totalIncome: Number(data.totalIncome ?? 0),
  };
}

export async function fetchOtherExpensesCategories(
  driveVehicleInfoId: number,
): Promise<OtherExpensesCategory[]> {
  const payload = await getOtherExpensesCategory({
    driveVehicleInfoId: String(driveVehicleInfoId),
  });
  return pickArray(payload)
    .map(normalizeOtherExpensesCategory)
    .filter((c): c is OtherExpensesCategory => c !== null);
}

export async function createOtherExpensesCategoryItem(body: {
  driveVehicleInfoId: number;
  name: string;
  type: string;
}): Promise<OtherExpensesCategory> {
  const res = await createOtherExpensesCategory(body);
  const payload = (res as { data?: unknown }).data ?? res;
  const row =
    payload && typeof payload === "object" && "data" in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  const normalized = normalizeOtherExpensesCategory(row);
  if (!normalized) throw new Error("Invalid category response");
  return normalized;
}

export async function updateOtherExpensesCategoryItem(body: {
  otherExpensesCategoryId: number;
  name: string;
}): Promise<OtherExpensesCategory> {
  const res = await updateOtherExpensesCategory(body);
  const payload = (res as { data?: unknown }).data ?? res;
  const row =
    payload && typeof payload === "object" && "data" in (payload as object)
      ? (payload as { data: unknown }).data
      : payload;
  const normalized = normalizeOtherExpensesCategory(row);
  if (!normalized) throw new Error("Invalid category response");
  return normalized;
}

export async function removeOtherExpensesCategoryItem(
  otherExpensesCategoryId: number,
): Promise<void> {
  await deleteOtherExpensesCategory(otherExpensesCategoryId);
}

export async function fetchOutstandingAmount(
  params: Record<string, string | number>,
): Promise<OutstandingAmountResponse> {
  const res = await getTransportInfoOutstandingAmount(params);
  return (res.data ?? {}) as OutstandingAmountResponse;
}

export async function saveDriveHistory(body: Record<string, unknown>) {
  return postDriveHistory(body);
}

export async function updateDriveHistory(id: number, body: Record<string, unknown>) {
  return patchDriveHistory({ id, body });
}

export async function removeDriveHistory(id: number) {
  return deleteTransportInfo(id);
}

export async function saveFuelingHistory(body: Record<string, unknown>) {
  return postFuelingHistory(body);
}

export async function updateFuelingHistory(id: number, body: Record<string, unknown>) {
  return patchFuelingHistory({ id: String(id), body });
}

export async function removeFuelingHistory(id: number) {
  return deleteFuelingHistory(id);
}

export async function uploadFuelingReceipt(file: {
  uri: string;
  name: string;
  type: string;
}) {
  return uploadFuelingReceiptMultipart(file);
}

export async function saveOtherExpenseHistory(body: Record<string, unknown>) {
  return createOtherExpensesHistory(body);
}

export async function updateOtherExpenseHistory(
  id: number,
  formData: Record<string, unknown>,
) {
  return updateOtherExpensesHistory({ id, formData });
}

export async function removeOtherExpenseHistories(ids: number[]) {
  return deleteOtherExpensesHistory(ids);
}

export async function patchOutstandingReceived(
  items: Array<{ transportInfoId: number; isReceived: boolean }>,
) {
  return patchTransportInfoOutstandingAmount({
    transportInfoIdWithIsReceived: items,
  });
}

export {
  postDriveVehicleInfo,
  patchDriveVehicleInfo,
};
