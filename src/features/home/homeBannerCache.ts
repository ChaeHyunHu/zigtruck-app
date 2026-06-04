import { Image } from "expo-image";

import { getBanner } from "@/src/api/public";
import type { BannerItem } from "@/src/features/home/types";

let cachedBanners: BannerItem[] | null = null;
let loadPromise: Promise<BannerItem[]> | null = null;

const isDisplayableBanner = (banner: BannerItem) =>
  banner.display !== false && Boolean(banner.contents?.trim());

export function getCachedHomeBanners(): BannerItem[] | null {
  return cachedBanners;
}

export function prefetchBannerImageUris(uris: string[]): Promise<void> {
  const unique = [...new Set(uris.map((uri) => uri.trim()).filter(Boolean))];
  if (unique.length === 0) return Promise.resolve();

  return Promise.all(
    unique.map((uri) => Image.prefetch(uri).catch(() => undefined)),
  ).then(() => undefined);
}

function collectBannerImageUris(banners: BannerItem[]): string[] {
  return banners.filter(isDisplayableBanner).map((banner) => banner.contents.trim());
}

function prefetchBanners(banners: BannerItem[]): void {
  void prefetchBannerImageUris(collectBannerImageUris(banners));
}

export function preloadHomeBanners(): Promise<BannerItem[]> {
  if (cachedBanners) {
    prefetchBanners(cachedBanners);
    return Promise.resolve(cachedBanners);
  }

  if (!loadPromise) {
    loadPromise = getBanner()
      .then((data) => {
        const banners = Array.isArray(data) ? data : [];
        cachedBanners = banners;
        prefetchBanners(banners);
        return banners;
      })
      .catch(() => {
        loadPromise = null;
        return [];
      });
  }

  return loadPromise;
}

export async function prefetchPopupBannerImages(
  banners: BannerItem[],
  timeoutMs = 1200,
): Promise<void> {
  const uris = banners
    .filter(
      (banner) =>
        banner.bannerLocation?.code === "HOME_POP_UP" && isDisplayableBanner(banner),
    )
    .map((banner) => banner.contents.trim());

  if (uris.length === 0) return;

  await Promise.race([
    prefetchBannerImageUris(uris),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
