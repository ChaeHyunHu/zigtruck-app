import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { getPriceTrend, getPublicPriceTrend } from "@/src/api/public";
import { appColors } from "@/src/constants/colors";
import { formatPrice } from "@/src/features/home/utils";
import { PriceTrendPreparingView } from "@/src/features/price-trend/PriceTrendPreparingView";

import {
  computePriceRangePercentages,
  computeUserPricePercentage,
  getMarkerBadgeOffset,
  getPriceLevelStyle,
  getSliderRangeMarks,
} from "./priceTrendSliderUtils";
import type { PriceInfoResponse, ProductSearchParams } from "./types";
import { buildPriceTrendQueryParams } from "./utils";

type CarPriceTrendInfoViewProps = {
  searchParams: ProductSearchParams;
  apiType?: "public" | "private";
  showPriceComparison?: boolean;
  /** 만원 단위 (상세 페이지 판매가) */
  price?: number | null;
};

type PriceComparisonMarkerProps = {
  userPricePct: number;
  levelColor: string;
  levelBackgroundColor: string;
  levelDesc: string;
};

/** 웹 CarPriceTrendInfo 마커(뱃지 + 점선 + 원) 레이아웃
 *  점선과 뱃지는 항상 원(마커) 중앙을 기준으로 수직 정렬되며,
 *  뱃지만 양 끝에서 잘리지 않도록 가로로 살짝 이동시킨다. */
function PriceComparisonMarker({
  userPricePct,
  levelColor,
  levelBackgroundColor,
  levelDesc,
}: PriceComparisonMarkerProps) {
  const badgeOffset = getMarkerBadgeOffset(userPricePct);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: `${userPricePct}%`,
        top: -4,
        width: 18,
        marginLeft: -9,
        alignItems: "center",
        zIndex: 2,
      }}
    >
      {/* 뱃지 + 점선: 원 중앙(가로) 기준으로 위에 절대배치 */}
      <View
        style={{
          position: "absolute",
          bottom: 9,
          width: 18,
          alignItems: "center",
        }}
      >
        <View style={{ transform: [{ translateX: -badgeOffset }] }}>
          <View
            className="min-w-[72px] flex-row items-center justify-center rounded-full border px-2 py-1"
            style={{
              borderColor: levelColor,
              backgroundColor: levelBackgroundColor,
            }}
          >
            <Ionicons
              name="bus-outline"
              size={14}
              color={levelColor}
              style={{ marginRight: 4 }}
            />
            <Text
              className="text-[12px] font-medium"
              style={{ color: levelColor }}
            >
              {levelDesc}
            </Text>
          </View>
        </View>
        <View
          style={{
            width: 0,
            height: 14,
            borderLeftWidth: 1,
            borderStyle: "dashed",
            borderColor: levelColor,
          }}
        />
      </View>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: levelColor,
          borderWidth: 2,
          borderColor: "#ffffff",
        }}
      />
    </View>
  );
}

export function CarPriceTrendInfoView({
  searchParams,
  apiType = "public",
  showPriceComparison = false,
  price,
}: CarPriceTrendInfoViewProps) {
  const [loading, setLoading] = useState(true);
  const [isNone, setIsNone] = useState<boolean | undefined>();
  const [priceInfo, setPriceInfo] = useState<PriceInfoResponse | null>(null);

  const queryParams = useMemo(
    () =>
      buildPriceTrendQueryParams(
        searchParams,
        showPriceComparison && price != null ? { price } : undefined,
      ),
    [searchParams, showPriceComparison, price],
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (Object.keys(queryParams).length < 4) {
        setLoading(false);
        setIsNone(true);
        return;
      }
      setLoading(true);
      try {
        const data =
          apiType === "public"
            ? await getPublicPriceTrend(queryParams)
            : await getPriceTrend(queryParams);
        if (!mounted) return;
        if (!data?.id || data?.result === "N") {
          setIsNone(true);
          setPriceInfo(null);
        } else {
          setIsNone(false);
          setPriceInfo(data as PriceInfoResponse);
        }
      } catch {
        if (mounted) {
          setIsNone(true);
          setPriceInfo(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [apiType, queryParams]);

  if (loading || isNone !== false) {
    return <PriceTrendPreparingView />;
  }

  const resolvedPriceInfo = priceInfo as PriceInfoResponse;
  const { lowPct, highPct } = computePriceRangePercentages(resolvedPriceInfo);
  const rangeMarks = getSliderRangeMarks(resolvedPriceInfo, price);
  const trackWidthPct = Math.max(highPct - lowPct, 2);
  const { pct: userPricePct, hideMarker } = computeUserPricePercentage(
    resolvedPriceInfo,
    price,
  );
  const levelStyle = getPriceLevelStyle(resolvedPriceInfo.level?.code);
  const showMarker = showPriceComparison && !hideMarker && price != null;

  return (
    <View className="mt-2 pb-2">
      {showPriceComparison &&
      String(resolvedPriceInfo.lowPrice ?? "") === "0" &&
      resolvedPriceInfo.level?.code ? (
        <Text className="mx-4 mb-4 text-center text-[15px] leading-[22px] text-gray800">
          해당 차량은 평균 시세 대비{" "}
          <Text style={{ color: levelStyle.color }} className="font-semibold">
            '{resolvedPriceInfo.level.code}'
          </Text>
          입니다.
        </Text>
      ) : null}

      <View className={`items-center ${showMarker ? "mb-14" : "mb-4 mt-4"}`}>
        <Text className="mb-1 text-[14px] text-gray700">직거래 평균시세</Text>
        <Text className="text-center text-[20px] font-semibold leading-[28px] text-gray900">
          {formatPrice(Number(priceInfo?.lowPrice ?? 0))} ~{" "}
          {formatPrice(Number(priceInfo?.highPrice ?? 0))}
        </Text>
      </View>

      <View className={`relative mx-4 overflow-visible px-[9px] `}>
        <View className="relative h-[10px] justify-center overflow-visible rounded-full bg-gray300">
          <View
            className={`absolute top-0 h-[10px] rounded-full bg-primary `}
            style={{
              left: `${lowPct}%`,
              width: `${trackWidthPct}%`,
            }}
          />
          {showMarker ? (
            <PriceComparisonMarker
              userPricePct={userPricePct}
              levelColor={levelStyle.color}
              levelBackgroundColor={levelStyle.backgroundColor}
              levelDesc={resolvedPriceInfo.level?.desc ?? ""}
            />
          ) : null}
        </View>
      </View>

      <View className="mx-4 mt-3 flex-row px-[9px]">
        {rangeMarks.map((mark, index) => (
          <Text
            key={`${mark.label}-${index}`}
            className="flex-1 text-center text-[12px] leading-[14px]"
            style={{
              color: mark.highlight ? levelStyle.color : appColors.gray600,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {mark.label}
          </Text>
        ))}
      </View>

      <View className="mx-4 mt-5 rounded-xl bg-gray200 px-4 py-4">
        <Text className="text-[14px] leading-[22px] text-gray700">
          * 차량 주행거리, 차량 상태, 차량 옵션 등으로 시세 차이가 발생할 수
          있습니다.
        </Text>
      </View>
    </View>
  );
}
