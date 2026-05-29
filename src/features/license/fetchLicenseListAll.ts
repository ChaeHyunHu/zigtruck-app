import { getLicenseList } from "@/src/api/license";
import type { LicenseItem, LicenseSearchParams } from "@/src/features/license/types";
import { buildLicenseSearchQuery } from "@/src/features/license/utils";
import { pickArray } from "@/src/utils/pickArray";

type LicenseListPagePayload = {
  data?: unknown[];
  totalPages?: number;
  totalElements?: number;
};

const toLicenseItems = (payload: unknown): LicenseItem[] =>
  pickArray(payload).map((raw) => raw as LicenseItem);

const fetchLicensePage = async (
  params: LicenseSearchParams,
  page: number,
): Promise<LicenseListPagePayload> => {
  const res = await getLicenseList(buildLicenseSearchQuery(params, page));
  return (res.data ?? {}) as LicenseListPagePayload;
};

/** 검색 조건에 맞는 번호판 목록 전 페이지 조회 */
export async function fetchLicenseListAll(
  params: LicenseSearchParams,
): Promise<{ items: LicenseItem[]; totalElements: number }> {
  const first = await fetchLicensePage(params, 1);
  const totalPages = Math.max(1, Number(first.totalPages) || 1);
  const items = toLicenseItems(first);

  if (totalPages <= 1) {
    return {
      items,
      totalElements: Number(first.totalElements) || items.length,
    };
  }

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchLicensePage(params, index + 2),
    ),
  );

  for (const page of rest) {
    items.push(...toLicenseItems(page));
  }

  return {
    items,
    totalElements: Number(first.totalElements) || items.length,
  };
}
