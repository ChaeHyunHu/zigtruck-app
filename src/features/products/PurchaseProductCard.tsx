import { LinearGradient } from "expo-linear-gradient";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  InteractionManager,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { RemoteImageWithSkeleton } from "@/src/components/common/RemoteImageWithSkeleton";
import { formatPrice } from "@/src/features/home/utils";
import { AssuranceInspectionBadge } from "@/src/features/products/AssuranceInspectionBadge";
import {
  isAssuranceMaintenanceSale,
  isAssuranceProduct,
} from "@/src/features/products/assuranceInspection";
import { ProductYoutubeIcon } from "@/src/features/products/ProductYoutubeIcon";
import {
  LIST_CARD_MAIN_HEIGHT,
  LIST_CARD_MAIN_PIXEL,
  LIST_THUMB_GAP,
  LIST_THUMB_HEIGHT,
  LIST_THUMB_PIXEL,
  LIST_THUMB_WIDTH,
  buildListCardImageSource,
} from "@/src/features/products/listCardImage";
import {
  fetchProductListImages,
  getCachedProductListImages,
} from "@/src/features/products/productListImageCache";
import type { ProductListItem } from "@/src/features/products/types";
import {
  enumCode,
  enumDesc,
  formatDistanceManKm,
  formatLoadedLength,
  formatPower,
  formatYearMonth,
  toText,
} from "@/src/features/products/utils";

/** 판매유형별 배지 그라데이션 (zigtruck-front FilledBadge 색상 기준) */
const SALES_TYPE_BADGE_GRADIENT = {
  /** 위탁판매: blueGradient-blue-to-blue */
  CONSIGNMENT: ["#535AFF", "#397AFF", "#10ACFF"],
  /** 직거래: primary-10 (네이비) */
  NORMAL: ["#234FBF", "#1E42A6"],
  /** 직트럭 상품용: green-0 */
  ASSURANCE: ["#34A853", "#34A853"],
  /** 타사딜러: gray-8 */
  THIRD_PARTY_DEALER: ["#414141", "#414141"],
} as const;

type GradientColors = readonly [string, string, ...string[]];

function getSalesTypeBadgeColors(code?: string): GradientColors {
  switch (code) {
    case "CONSIGNMENT":
      return SALES_TYPE_BADGE_GRADIENT.CONSIGNMENT;
    case "ASSURANCE":
      return SALES_TYPE_BADGE_GRADIENT.ASSURANCE;
    case "THIRD_PARTY_DEALER":
      return SALES_TYPE_BADGE_GRADIENT.THIRD_PARTY_DEALER;
    case "NORMAL":
    default:
      return SALES_TYPE_BADGE_GRADIENT.NORMAL;
  }
}
const MAIN_IMAGE_STYLE = {
  width: "100%" as const,
  height: LIST_CARD_MAIN_HEIGHT,
};
const THUMB_IMAGE_STYLE = { width: "100%" as const, height: "100%" as const };

type ThumbnailProps = {
  uri: string;
  itemId: number;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
};

const ProductCardThumbnail = memo(function ProductCardThumbnail({
  uri,
  itemId,
  index,
  isSelected,
  onSelect,
}: ThumbnailProps) {
  const source = useMemo(
    () => buildListCardImageSource(uri, LIST_THUMB_PIXEL),
    [uri],
  );

  const handlePress = useCallback(() => {
    onSelect(index);
  }, [index, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: LIST_THUMB_WIDTH,
        height: LIST_THUMB_HEIGHT,
        borderRadius: 8,
        overflow: "hidden",
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? "#1E42A6" : "#e5e5e5",
      }}
    >
      <RemoteImageWithSkeleton
        source={source}
        style={THUMB_IMAGE_STYLE}
        imageStyle={THUMB_IMAGE_STYLE}
        contentFit="cover"
        recyclingKey={`${itemId}-thumb-${uri}`}
        priority="normal"
        allowDownscaling
      />
    </Pressable>
  );
});

type Props = {
  item: ProductListItem;
  onPress: (id: number) => void;
};

function buildCardImageUrls(item: ProductListItem): string[] {
  const urls = item.imageUrls?.length ? [...item.imageUrls] : [];
  if (item.representImageUrl && !urls.includes(item.representImageUrl)) {
    urls.unshift(item.representImageUrl);
  }
  if (urls.length > 0) return urls;
  if (item.representImageUrl) return [item.representImageUrl];
  return [];
}

export const PurchaseProductCard = memo(function PurchaseProductCard({
  item,
  onPress,
}: Props) {
  const [images, setImages] = useState(() => buildCardImageUrls(item));

  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeImage = images[selectedIndex] ?? images[0] ?? "";
  const showThumbnails = images.length > 1;

  const mainImageSource = useMemo(
    () =>
      activeImage
        ? buildListCardImageSource(activeImage, LIST_CARD_MAIN_PIXEL)
        : null,
    [activeImage],
  );

  useEffect(() => {
    const nextImages = buildCardImageUrls(item);
    setImages(nextImages);
    setSelectedIndex(0);

    if (nextImages.length > 1) return;

    const cached = getCachedProductListImages(item.id);
    if (cached && cached.length > 1) {
      setImages(cached);
      return;
    }

    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      void fetchProductListImages(item.id, item.representImageUrl).then(
        (urls) => {
          if (cancelled || urls.length <= 1) return;
          setImages(urls);
        },
      );
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [item.id, item.imageUrls, item.representImageUrl]);

  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  const handleSelectThumbnail = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const showAssuranceInspection = isAssuranceProduct(item.salesType);
  const isMaintenance = isAssuranceMaintenanceSale(
    item.salesType,
    item.status,
  );
  const hasYoutube = Boolean(item.youtubeUrl?.trim());

  const specLine = useMemo(() => {
    const parts = [
      formatYearMonth(item.firstRegistrationDate),
      item.transmission ? enumDesc(item.transmission) : undefined,
      formatDistanceManKm(item.distance),
      item.power ? formatPower(item.power) : undefined,
      formatLoadedLength(item.loadedInnerLength),
      item.region || undefined,
    ].filter((part): part is string => Boolean(part && part !== "-"));
    return parts.join(" · ");
  }, [
    item.distance,
    item.firstRegistrationDate,
    item.loadedInnerLength,
    item.power,
    item.region,
    item.transmission,
  ]);

  return (
    <View className="mb-5">
      <Pressable onPress={handlePress}>
        <View className="overflow-hidden rounded-[12px] bg-gray200">
          <View className="relative">
            {mainImageSource ? (
              <RemoteImageWithSkeleton
                source={mainImageSource}
                style={MAIN_IMAGE_STYLE}
                contentFit="cover"
                recyclingKey={`${item.id}-main-${selectedIndex}`}
                priority="normal"
                allowDownscaling
              />
            ) : (
              <View style={MAIN_IMAGE_STYLE} className="bg-gray200" />
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.55)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 72,
              }}
              pointerEvents="none"
            />

            <View className="absolute left-3 top-3">
              <LinearGradient
                colors={getSalesTypeBadgeColors(enumCode(item.salesType))}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="rounded-[8px] px-3 py-1"
              >
                <Text className="text-[14px] font-bold text-white">
                  {enumDesc(item.salesType) ?? "직거래 차량"}
                </Text>
              </LinearGradient>
            </View>

            {item.productsNumber !== undefined ? (
              <View className="absolute bottom-3 left-3">
                <Text className="text-[14px] font-semibold text-white">
                  매물번호 {toText(item.productsNumber, "-")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>

      {showThumbnails ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={false}
          contentContainerStyle={{
            paddingTop: 10,
            gap: LIST_THUMB_GAP,
          }}
          style={{ flexGrow: 0 }}
        >
          {images.map((uri, index) => (
            <ProductCardThumbnail
              key={`${item.id}-thumb-${index}-${uri}`}
              uri={uri}
              itemId={item.id}
              index={index}
              isSelected={index === selectedIndex}
              onSelect={handleSelectThumbnail}
            />
          ))}
        </ScrollView>
      ) : null}

      {showAssuranceInspection ? (
        <AssuranceInspectionBadge isMaintenance={isMaintenance} />
      ) : null}

      <Pressable onPress={handlePress} className="px-0.5 pt-3">
        <View className="flex-row items-start">
          {hasYoutube ? <ProductYoutubeIcon size={24} /> : null}
          <Text
            className="flex-1 text-[18px] font-bold leading-6 text-gray900"
            numberOfLines={2}
          >
            {toText(item.truckName, "차량 정보 없음")}
          </Text>
        </View>

        {specLine ? (
          <Text className="mt-2 text-[14px] leading-5 text-gray700">
            {specLine}
          </Text>
        ) : null}

        <View className="mt-2 flex-row items-center">
          <Text className="text-[22px] font-extrabold text-gray900">
            {formatPrice(item.price)}
          </Text>
          {item.isLicense === 1 ? (
            <View className="ml-2 rounded-md border border-[#d6a900] bg-[#ffe27a] px-2 py-0.5">
              <Text className="text-[12px] font-bold text-[#7a5a00]">
                {toText(item.truckNumber, "")}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
});
