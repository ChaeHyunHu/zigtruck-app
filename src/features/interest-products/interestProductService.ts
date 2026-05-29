import { getInterestProducts, postInterestProducts } from "@/src/api/public";
import { MAINTENANCE_SALE, PRODUCT_STATUS_SALE } from "@/src/constants/products";

import { resolveInterestedProductId } from "./resolveInterestedProductId";
import { normalizeInterestProducts } from "./utils";
import type { InterestProductItem } from "./types";

export { resolveInterestedProductId };

let cachedOnSaleItems: InterestProductItem[] | null = null;
let cachedAllItems: InterestProductItem[] | null = null;
let onSaleCacheTimestamp = 0;
let allCacheTimestamp = 0;
const CACHE_TTL_MS = 30_000;

export function invalidateInterestProductsCache() {
  cachedOnSaleItems = null;
  cachedAllItems = null;
  onSaleCacheTimestamp = 0;
  allCacheTimestamp = 0;
}

export async function fetchAllInterestProducts(force = false): Promise<InterestProductItem[]> {
  const isFresh = cachedAllItems && Date.now() - allCacheTimestamp < CACHE_TTL_MS;
  if (!force && isFresh && cachedAllItems) {
    return cachedAllItems;
  }
  const data = await getInterestProducts();
  cachedAllItems = normalizeInterestProducts(data);
  allCacheTimestamp = Date.now();
  return cachedAllItems;
}

export async function fetchOnSaleInterestProducts(force = false): Promise<InterestProductItem[]> {
  const isFresh = cachedOnSaleItems && Date.now() - onSaleCacheTimestamp < CACHE_TTL_MS;
  if (!force && isFresh && cachedOnSaleItems) {
    return cachedOnSaleItems;
  }
  const statusFilter = `${PRODUCT_STATUS_SALE},${MAINTENANCE_SALE}`;
  const data = await getInterestProducts(statusFilter);
  cachedOnSaleItems = normalizeInterestProducts(data);
  onSaleCacheTimestamp = Date.now();
  return cachedOnSaleItems;
}

export async function findInterestProductIdByProductId(
  productId: number,
  force = false,
): Promise<number | null> {
  const list = await fetchAllInterestProducts(force);
  const match = list.find((item) => Number(item.productId) === Number(productId));
  return match?.id ?? null;
}

export function parseInterestProductIdFromPostResponse(response: {
  data?: unknown;
}): number | null {
  const payload = response?.data;
  if (typeof payload === "number" && payload > 0) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = resolveInterestedProductId(record);
    if (nested) return nested;
    const id = Number(record.id ?? record.interestProductId ?? record.interestedProductId);
    if (Number.isFinite(id) && id > 0) return id;
  }
  return null;
}

export async function createInterestProduct(productId: number): Promise<number | null> {
  const response = await postInterestProducts(productId);
  invalidateInterestProductsCache();
  const createdId = parseInterestProductIdFromPostResponse(response);
  if (createdId) return createdId;
  return findInterestProductIdByProductId(productId, true);
}
