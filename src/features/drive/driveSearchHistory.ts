import { deleteSearchHistory, getSearchHistory } from "@/src/api/public";
import {
  DRIVE_HISTORY_LOCATE,
  DRIVE_HISTORY_TRANSPORT_COMPANY,
  DRIVE_HISTORY_TRANSPORT_ITEM,
} from "@/src/features/drive/driveConstants";
import { pickArray } from "@/src/utils/pickArray";

export type SearchHistoryItem = {
  id: number;
  keyword: string;
};

function parseSearchHistoryList(payload: unknown): SearchHistoryItem[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const list = pickArray(record.data ?? record);
  return list
    .map((item) => {
      const row = item as Record<string, unknown>;
      const id = Number(row.id);
      const keyword = String(row.keyword ?? "");
      if (!Number.isFinite(id) || !keyword) return null;
      return { id, keyword };
    })
    .filter((item): item is SearchHistoryItem => item != null);
}

export async function fetchLocateSearchHistory(): Promise<SearchHistoryItem[]> {
  const res = await getSearchHistory({
    type: DRIVE_HISTORY_LOCATE,
    page: 1,
    size: 8,
  });
  return parseSearchHistoryList(res.data);
}

export async function fetchTransportCompanyHistory(): Promise<SearchHistoryItem[]> {
  const res = await getSearchHistory({
    type: DRIVE_HISTORY_TRANSPORT_COMPANY,
    page: 1,
    size: 8,
  });
  return parseSearchHistoryList(res.data);
}

export async function fetchTransportItemHistory(): Promise<SearchHistoryItem[]> {
  const res = await getSearchHistory({
    type: DRIVE_HISTORY_TRANSPORT_ITEM,
    page: 1,
    size: 8,
  });
  return parseSearchHistoryList(res.data);
}

export async function removeSearchHistoryItem(id: number) {
  return deleteSearchHistory(id);
}

export type TransportSearchKind = "company" | "item";

export function fetchTransportSearchHistory(kind: TransportSearchKind) {
  return kind === "company"
    ? fetchTransportCompanyHistory()
    : fetchTransportItemHistory();
}
