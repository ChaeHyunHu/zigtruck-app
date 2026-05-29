import { formatNumberWithComma } from "@/src/features/home/utils";

import type { PriceInfoResponse } from "./types";

export type SliderRangeMark = {
  label: string;
  /** 판매가가 축 범위 밖일 때 끝 눈금 강조 */
  highlight?: boolean;
};

export function formatSliderMarkLabel(value?: string | number | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric) || numeric <= 0) return "-";
  return formatNumberWithComma(numeric);
}

/** 웹 CarPriceTrendInfo와 동일: firstRange~sixthRange 축 기준 low/high 위치(%) */
export function computePriceRangePercentages(priceInfo: PriceInfoResponse) {
  const firstRange = Number(priceInfo.firstRange ?? priceInfo.lowPrice ?? 0);
  const sixthRange = Number(priceInfo.sixthRange ?? priceInfo.highPrice ?? 0);
  const lowPrice = Number(priceInfo.lowPrice ?? 0);
  const highPrice = Number(priceInfo.highPrice ?? 0);
  const rangeDiff = sixthRange - firstRange;

  if (rangeDiff <= 0) {
    return { lowPct: 0, highPct: 100 };
  }

  const lowPct = ((lowPrice - firstRange) / rangeDiff) * 100;
  const highPct = ((highPrice - firstRange) / rangeDiff) * 100;

  return {
    lowPct: Math.max(0, Math.min(100, lowPct)),
    highPct: Math.max(0, Math.min(100, highPct)),
  };
}

const LEVEL_COLORS: Record<string, { color: string; backgroundColor: string }> = {
  HIGH: { color: "#F5222D", backgroundColor: "#FFE3E0" },
  MIDDLE: { color: "#1E42A6", backgroundColor: "#F1F5FF" },
  LOW: { color: "#34A853", backgroundColor: "#F6FFED" },
};

export function getPriceLevelStyle(code?: string) {
  return LEVEL_COLORS[code ?? "MIDDLE"] ?? LEVEL_COLORS.MIDDLE;
}

/** 상세 시세 비교: 차량 가격(만원)의 슬라이더 위치(%) — 범위 밖이면 0/100으로 클램프 */
export function computeUserPricePercentage(
  priceInfo: PriceInfoResponse,
  userPriceManwon?: number | null,
) {
  const userPrice = Number(userPriceManwon ?? 0);
  if (!userPrice) return { pct: 0, hideMarker: true };

  const firstRange = Number(priceInfo.firstRange ?? priceInfo.lowPrice ?? 0);
  const sixthRange = Number(priceInfo.sixthRange ?? priceInfo.highPrice ?? 0);
  const rangeDiff = sixthRange - firstRange;
  if (rangeDiff <= 0) return { pct: 0, hideMarker: true };

  let pct = ((userPrice - firstRange) / rangeDiff) * 100;
  if (userPrice < firstRange) pct = 0;
  else if (userPrice > sixthRange) pct = 100;

  return {
    pct: Math.max(0, Math.min(100, pct)),
    hideMarker: false,
  };
}

/** 웹과 동일: 우측/좌측 끝일 때 뱃지가 잘리지 않도록 오프셋 */
export function getMarkerBadgeOffset(userPricePct: number) {
  if (userPricePct > 90 && userPricePct <= 100) return 30;
  if (userPricePct >= 0 && userPricePct < 10) return -30;
  return 0;
}

/** 웹 CarPriceTrendInfo marks: 범위 밖 판매가는 양 끝 눈금 라벨로 표시 */
export function getSliderRangeMarks(
  priceInfo: PriceInfoResponse,
  userPriceManwon?: number | null,
): SliderRangeMark[] {
  const firstRange = Number(priceInfo.firstRange ?? priceInfo.lowPrice ?? 0);
  const sixthRange = Number(priceInfo.sixthRange ?? priceInfo.highPrice ?? 0);
  const userPrice = Number(userPriceManwon ?? 0);

  const highlightFirst = userPrice > 0 && userPrice < firstRange;
  const highlightLast = userPrice > 0 && userPrice > sixthRange;

  const firstLabel = highlightFirst
    ? formatSliderMarkLabel(userPrice)
    : formatSliderMarkLabel(priceInfo.firstRange ?? priceInfo.lowPrice);

  const sixthLabel = highlightLast
    ? formatSliderMarkLabel(userPrice)
    : formatSliderMarkLabel(priceInfo.sixthRange ?? priceInfo.highPrice);

  return [
    { label: firstLabel, highlight: highlightFirst },
    { label: formatSliderMarkLabel(priceInfo.secondRange) },
    { label: formatSliderMarkLabel(priceInfo.thirdRange) },
    { label: formatSliderMarkLabel(priceInfo.forthRange) },
    { label: formatSliderMarkLabel(priceInfo.fifthRange) },
    { label: sixthLabel, highlight: highlightLast },
  ];
}
