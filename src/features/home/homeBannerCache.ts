import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";

import { getBanner } from "@/src/api/public";
import type { BannerItem } from "@/src/features/home/types";

const STORAGE_KEY = "@zigtruck/home_banners_v1";

let cachedBanners: BannerItem[] | null = null;
let loadPromise: Promise<BannerItem[]> | null = null;
let storedPromise: Promise<BannerItem[] | null> | null = null;

const isDisplayableBanner = (banner: BannerItem) =>
  banner.display !== false && Boolean(banner.contents?.trim());

export function getCachedHomeBanners(): BannerItem[] | null {
  return cachedBanners;
}

/**
 * 이전 실행에서 AsyncStorage에 저장해둔 배너 목록을 읽는다.
 * 앱을 다시 켜도 네트워크 응답을 기다리지 않고 즉시 배너(이미지 URL)를 그릴 수 있어,
 * expo-image 디스크 캐시와 합쳐지면 이미지가 화면과 함께 바로 뜬다.
 */
export function getStoredHomeBanners(): Promise<BannerItem[] | null> {
  if (cachedBanners) return Promise.resolve(cachedBanners);
  if (!storedPromise) {
    storedPromise = AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return null;
        const parsed = JSON.parse(raw) as BannerItem[];
        if (!Array.isArray(parsed) || parsed.length === 0) return null;
        if (!cachedBanners) cachedBanners = parsed;
        prefetchBanners(parsed);
        return parsed;
      })
      .catch(() => null);
  }
  return storedPromise;
}

function persistBanners(banners: BannerItem[]): void {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(banners)).catch(
    () => undefined,
  );
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

  // 저장된 배너가 있으면 즉시 이미지 prefetch부터 시작(네트워크 응답 대기 없이)
  void getStoredHomeBanners();

  if (!loadPromise) {
    loadPromise = getBanner()
      .then((data) => {
        const banners = Array.isArray(data) ? data : [];
        cachedBanners = banners;
        persistBanners(banners);
        prefetchBanners(banners);
        return banners;
      })
      .catch(() => {
        loadPromise = null;
        return cachedBanners ?? [];
      });
  }

  return loadPromise;
}

/**
 * 스플래시(직트럭 로고) 표시 중 호출.
 * 배너 목록을 로드하고 "첫 홈 배너 이미지"가 캐시에 들어올 때까지(최대 timeoutMs) 기다린다.
 * 홈 진입 시 첫 배너가 이미 준비돼 있어 이미지만 늦게 뜨는 현상을 막는다.
 * (나머지 배너·팝업 이미지는 preloadHomeBanners 내부에서 백그라운드로 계속 prefetch)
 */
export async function prepareHomeBannersForSplash(
  timeoutMs = 3000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  const remaining = () => Math.max(0, deadline - Date.now());

  const banners = await Promise.race([
    preloadHomeBanners().catch(() => cachedBanners ?? []),
    new Promise<BannerItem[]>((resolve) =>
      setTimeout(() => resolve(cachedBanners ?? []), remaining()),
    ),
  ]);

  const firstHomeUri = banners
    .filter(
      (banner) =>
        banner.bannerLocation?.code === "HOME" && isDisplayableBanner(banner),
    )
    .map((banner) => banner.contents.trim())[0];

  if (!firstHomeUri) return;

  await Promise.race([
    prefetchBannerImageUris([firstHomeUri]),
    new Promise<void>((resolve) => setTimeout(resolve, remaining())),
  ]);
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
