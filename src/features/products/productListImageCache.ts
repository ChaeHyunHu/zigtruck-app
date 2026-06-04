import { fetchProductDetail } from "@/src/api/products/getProducts";
import { collectListItemImageUrls } from "@/src/features/products/utils";

const cache = new Map<number, string[]>();
const inflight = new Map<number, Promise<string[]>>();

export function getCachedProductListImages(
  productId: number,
): string[] | null {
  return cache.get(productId) ?? null;
}

export function fetchProductListImages(
  productId: number,
  representImageUrl?: string,
): Promise<string[]> {
  const cached = cache.get(productId);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(productId);
  if (pending) return pending;

  const promise = fetchProductDetail(productId)
    .then((data) => {
      const urls = collectListItemImageUrls({
        ...(data ?? {}),
        representImageUrl:
          data?.representImageUrl ?? representImageUrl ?? undefined,
      });
      cache.set(productId, urls);
      inflight.delete(productId);
      return urls;
    })
    .catch(() => {
      inflight.delete(productId);
      return [] as string[];
    });

  inflight.set(productId, promise);
  return promise;
}
