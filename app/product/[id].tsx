import { MenuBottomSheet } from "@/src/components/common/MenuBottomSheet";
import { Screen } from "@/src/components/common/Screen";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";

import {
  fetchAuthedProductDetail,
  fetchProductDetail,
  patchProductPrice,
} from "@/src/api/products/getProducts";
import { patchProductComplete } from "@/src/api/products/updateProducts";
import { patchProductPause, patchProductsStatus } from "@/src/api/public";
import {
  APPROVAL_STATUS_APPROVAL,
  APPROVAL_STATUS_WAITING,
  PRODUCT_STATUS_COMPLETE,
  PRODUCT_STATUS_PAUSE,
  PRODUCT_STATUS_SALE,
  SALES_TYPE_ASSURANCE,
} from "@/src/constants/products";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { formatPrice } from "@/src/features/home/utils";
import { findInterestProductIdByProductId } from "@/src/features/interest-products/interestProductService";
import { ProductEditOptionSheet } from "@/src/features/products/edit/ProductEditOptionSheet";
import { InlineProductPriceEditor } from "@/src/features/products/InlineProductPriceEditor";
import { LoanCalculator } from "@/src/features/products/LoanCalculator";
import { PauseSaleModal } from "@/src/features/products/PauseSaleModal";
import { ProductDetailBuyerFooter } from "@/src/features/products/ProductDetailBuyerFooter";
import { ProductDetailLicenseNotice } from "@/src/features/products/ProductDetailLicenseNotice";
import { ProductDetailPriceTrendSection } from "@/src/features/products/ProductDetailPriceTrendSection";
import { ProductDetailRecommendedServices } from "@/src/features/products/ProductDetailRecommendedServices";
import {
  ProductHistorySections,
  type HistoryScrollKey,
} from "@/src/features/products/ProductHistorySections";
import { ProductImageCarousel } from "@/src/features/products/ProductImageCarousel";
import { ProductImageViewer } from "@/src/features/products/ProductImageViewer";
import {
  isDealerMember,
  isDealerProduct,
} from "@/src/features/products/productInquiryUtils";
import {
  ProductPriceReduceNoticeModal,
  shouldShowPriceReduceNotice,
} from "@/src/features/products/ProductPriceReduceNoticeModal";
import { invalidateProductCaches } from "@/src/features/products/productRefresh";
import { ProductSalesTypeBanner } from "@/src/features/products/ProductSalesTypeBanner";
import {
  ApprovalStatusBadge,
  PRODUCT_STATUS_DESC,
  ProductStatusBadge,
} from "@/src/features/products/productStatusBadge";
import { ProductYoutubeIcon } from "@/src/features/products/ProductYoutubeIcon";
import { ProductYoutubePlayer } from "@/src/features/products/ProductYoutubePlayer";
import { SaleCompleteReviewModal } from "@/src/features/products/SaleCompleteReviewModal";
import { SalePriceTipBox } from "@/src/features/products/SalePriceTipBox";
import type { ProductDetail } from "@/src/features/products/types";
import {
  collectListItemImageUrls,
  enumCode,
  enumDesc,
  formatCount,
  formatDateDot,
  formatDistanceKm,
  formatLoadedLength,
  formatPalletCount,
  formatPowerPs,
  formatTons,
  formatViewCount,
  formatYearMonthKorean,
  hasDisplayValue,
  hasLoadedSpecValue,
  normalizeDetail,
  toText,
} from "@/src/features/products/utils";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { showAppAlert } from "@/src/providers/appDialog";
import { useAppLoadingOverlay } from "@/src/providers/AppLoadingProvider";

const SCREEN_WIDTH = Dimensions.get("window").width;
const FALLBACK_IMAGE = `${IMAGE_BASE_URL}/car_none.png`;
const CAROUSEL_HEIGHT = SCREEN_WIDTH * 0.75;

type DetailTab = "info" | "history" | "calc";

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string; mine?: string }>();
  const id = params.id;
  const explicitMine = params.mine === "true";

  const { isAuthenticated, memberId, profile } = useAuth();
  const isDealer = isDealerMember(profile?.memberTypeCode);
  const { bottom: bottomInset, scrollBottomPadding } = useScreenInsets();

  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useAppLoadingOverlay(isLoading || !detail);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const scrollRef = useRef<ScrollView>(null);
  const [historyScrollKey, setHistoryScrollKey] =
    useState<HistoryScrollKey | null>(null);
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [priceInputDigits, setPriceInputDigits] = useState("");
  const [isSavingPrice, setIsSavingPrice] = useState(false);
  const [priceReduceModalOpen, setPriceReduceModalOpen] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const isMine =
    explicitMine ||
    Boolean(detail?.isMine) ||
    (memberId !== undefined &&
      detail?.ownerId !== undefined &&
      Number(memberId) === Number(detail.ownerId));
  const statusCode = enumCode(detail?.status);
  const isAssuranceProduct =
    enumCode(detail?.salesType) === SALES_TYPE_ASSURANCE;
  const youtubeUrl = detail?.youtubeUrl?.trim();
  const latestApprovalCode = detail?.approvalStatusList?.at(-1)?.status?.code;
  const canChangeStatus =
    isMine &&
    (statusCode === PRODUCT_STATUS_SALE ||
      statusCode === PRODUCT_STATUS_PAUSE) &&
    latestApprovalCode !== APPROVAL_STATUS_WAITING;

  const statusMenuItems = useMemo(() => {
    if (statusCode === PRODUCT_STATUS_SALE) {
      return [
        { code: PRODUCT_STATUS_COMPLETE, label: "판매완료" },
        { code: PRODUCT_STATUS_PAUSE, label: "판매중지" },
      ];
    }
    if (statusCode === PRODUCT_STATUS_PAUSE) {
      return [{ code: PRODUCT_STATUS_SALE, label: "판매중" }];
    }
    return [];
  }, [statusCode]);

  const onChangeStatus = useCallback(
    async (nextStatus: string) => {
      if (!detail) return;
      try {
        setIsChangingStatus(true);
        const response = await patchProductsStatus({
          productId: detail.id,
          status: nextStatus,
        });
        const responseData = response.data as ProductDetail;
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                status: responseData?.status ?? {
                  code: nextStatus,
                  desc: PRODUCT_STATUS_DESC[nextStatus],
                },
              }
            : prev,
        );
        setShowStatusSheet(false);
        invalidateProductCaches(detail.id);
        const message =
          nextStatus === PRODUCT_STATUS_SALE
            ? "판매중으로 변경되었어요."
            : nextStatus === PRODUCT_STATUS_PAUSE
              ? "판매중지로 변경되었어요."
              : nextStatus === PRODUCT_STATUS_COMPLETE
                ? "판매완료로 변경되었어요."
                : "상태가 변경되었어요.";
        showAppAlert({ title: "완료", message });
      } catch {
        showAppAlert({ title: "오류", message: "상태 변경에 실패했습니다." });
      } finally {
        setIsChangingStatus(false);
      }
    },
    [detail],
  );

  const onConfirmPause = useCallback(
    async (pauseReason: string) => {
      if (!detail) return;
      try {
        setIsChangingStatus(true);
        const response = await patchProductPause({
          productId: detail.id,
          pauseReason,
        });
        const responseData = response.data as ProductDetail;
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                status: responseData?.status ?? {
                  code: PRODUCT_STATUS_PAUSE,
                  desc: PRODUCT_STATUS_DESC[PRODUCT_STATUS_PAUSE],
                },
              }
            : prev,
        );
        setShowPauseModal(false);
        setShowStatusSheet(false);
        showAppAlert({ title: "완료", message: "판매중지로 변경되었어요." });
      } catch {
        showAppAlert({ title: "오류", message: "상태 변경에 실패했습니다." });
      } finally {
        setIsChangingStatus(false);
      }
    },
    [detail],
  );

  const onPressStatusMenu = useCallback(
    (nextStatus: string) => {
      if (nextStatus === PRODUCT_STATUS_COMPLETE) {
        setShowStatusSheet(false);
        setTimeout(() => setShowCompleteModal(true), 320);
        return;
      }
      if (nextStatus === PRODUCT_STATUS_PAUSE) {
        setShowPauseModal(true);
        return;
      }
      onChangeStatus(nextStatus);
    },
    [onChangeStatus],
  );

  const onConfirmComplete = useCallback(
    async (actualSalePrice: number, completeReason: string) => {
      if (!detail) return;
      try {
        setIsChangingStatus(true);
        const response = await patchProductComplete({
          id: detail.id,
          actualSalePrice,
          completeReason,
        });
        const responseData = response.data as ProductDetail;
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                status: responseData?.status ?? {
                  code: PRODUCT_STATUS_COMPLETE,
                  desc: PRODUCT_STATUS_DESC[PRODUCT_STATUS_COMPLETE],
                },
                actualSalePrice:
                  responseData?.actualSalePrice ?? actualSalePrice,
              }
            : prev,
        );
        setShowCompleteModal(false);
        setShowStatusSheet(false);
        invalidateProductCaches(detail.id);
        showAppAlert({ title: "완료", message: "판매완료로 변경되었어요." });
      } catch {
        showAppAlert({ title: "오류", message: "상태 변경에 실패했습니다." });
      } finally {
        setIsChangingStatus(false);
      }
    },
    [detail],
  );

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const raw = isAuthenticated
        ? await fetchAuthedProductDetail(id).catch(() => fetchProductDetail(id))
        : await fetchProductDetail(id);
      let normalized = normalizeDetail(raw, memberId);
      if (normalized && isAuthenticated && !normalized.interestedProductId) {
        const interestId = await findInterestProductIdByProductId(
          normalized.id,
        );
        if (interestId) {
          normalized = { ...normalized, interestedProductId: interestId };
        }
      }
      setDetail(normalized);
      setPriceInputDigits(
        typeof normalized?.price === "number" ? String(normalized.price) : "",
      );
      setImageVersion((prev) => prev + 1);
    } catch {
      showAppAlert({
        title: "상품 정보 오류",
        message: "상품 정보를 불러오지 못했습니다.",
        onConfirm: () => router.back(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, memberId]);

  useFocusEffect(
    useCallback(() => {
      loadDetail();
    }, [loadDetail]),
  );

  const images = useMemo(() => {
    if (!detail) return [FALLBACK_IMAGE];
    const list = collectListItemImageUrls(detail);
    return list.length > 0 ? list : [FALLBACK_IMAGE];
  }, [detail]);

  useEffect(() => {
    setCarouselIndex(0);
    setImageViewerIndex(0);
  }, [detail?.id]);

  const openImageViewer = useCallback((index: number) => {
    setImageViewerIndex(index);
    setImageViewerOpen(true);
  }, []);

  const handleImageViewerClose = useCallback((index: number) => {
    setImageViewerOpen(false);
    setCarouselIndex(index);
    setImageViewerIndex(index);
  }, []);

  const executeSavePrice = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!detail) return;
      const nextPrice = Number(priceInputDigits.replace(/[^\d]/g, ""));
      if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
        showAppAlert({
          title: "입력 오류",
          message: "판매 가격을 올바르게 입력해 주세요.",
        });
        return;
      }
      const isApproved =
        detail.approvalStatusList?.at(-1)?.status?.code ===
        APPROVAL_STATUS_APPROVAL;
      if (isApproved && detail.price && nextPrice > detail.price) {
        showAppAlert({
          title: "가격 제한",
          message: "승인된 가격보다 높게는 수정이 불가능합니다.",
        });
        return;
      }
      try {
        setIsSavingPrice(true);
        await patchProductPrice(detail.id, nextPrice);
        invalidateProductCaches(detail.id);
        setDetail((prev) => (prev ? { ...prev, price: nextPrice } : prev));
        setPriceInputDigits(String(nextPrice));
        setShowPriceEditor(false);
        if (!options?.silent) {
          showAppAlert({ title: "완료", message: "판매 가격이 변경되었어요." });
        }
      } catch {
        showAppAlert({
          title: "오류",
          message: "판매 가격 변경에 실패했습니다.",
        });
      } finally {
        setIsSavingPrice(false);
      }
    },
    [detail, priceInputDigits],
  );

  const requestSavePrice = useCallback(() => {
    if (!detail) return;
    const nextPrice = Number(priceInputDigits.replace(/[^\d]/g, ""));
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      showAppAlert({
        title: "입력 오류",
        message: "판매 가격을 올바르게 입력해 주세요.",
      });
      return;
    }
    const originalPrice = Number(detail.price ?? 0);
    if (shouldShowPriceReduceNotice(originalPrice, nextPrice)) {
      setPriceReduceModalOpen(true);
      return;
    }
    void executeSavePrice();
  }, [detail, executeSavePrice, priceInputDigits]);

  const onConfirmPriceReduceNotice = useCallback(() => {
    setPriceReduceModalOpen(false);
    void executeSavePrice({ silent: true });
  }, [executeSavePrice]);

  // MenuBottomSheet가 항목 선택 시 시트를 닫고 닫힘 애니메이션 후 onPress를 실행하므로
  // 여기서 추가로 setShowMoreSheet/지연을 두면 이동이 이중으로 늦어진다. 바로 이동한다.
  const goToEdit = useCallback(() => {
    if (!detail) return;
    router.push({
      pathname: "/product/edit/[id]",
      params: { id: String(detail.id) },
    });
  }, [detail]);

  const goToLicensePlate = useCallback(() => {
    router.push("/license/my");
  }, []);

  const productMoreMenuItems = useMemo(() => {
    const items = [{ label: "번호판 관리", onPress: goToLicensePlate }];
    if (statusCode !== PRODUCT_STATUS_COMPLETE) {
      items.unshift({ label: "수정하기", onPress: goToEdit });
    }
    return items;
  }, [goToEdit, goToLicensePlate, statusCode]);

  const headerTitle = toText(detail?.truckNumber ?? detail?.vehicleNumber, "");

  return (
    <Screen
      className="flex-1 bg-white"
      edges={isMine || isLoading || !detail ? ["top", "bottom"] : ["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View className="h-14 flex-row items-center justify-between bg-white px-4">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </Pressable>
        <Text className="text-[18px] font-bold text-gray900">
          {headerTitle}
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.replace("/")} hitSlop={8}>
            <Ionicons name="home-outline" size={24} color="#111" />
          </Pressable>
          {isMine ? (
            <Pressable onPress={() => setShowMoreSheet(true)} hitSlop={8}>
              <Ionicons name="ellipsis-vertical" size={22} color="#111" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {!detail ? (
        <View className="flex-1 bg-white" />
      ) : (
        <View className="flex-1">
          <ScrollView
            ref={scrollRef}
            className="flex-1 bg-white"
            removeClippedSubviews={false}
            contentContainerStyle={{
              paddingBottom: isMine
                ? Math.max(bottomInset, 16)
                : scrollBottomPadding,
            }}
          >
            <View
              style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}
              collapsable={false}
            >
              <ProductImageCarousel
                images={images}
                height={CAROUSEL_HEIGHT}
                activeIndex={carouselIndex}
                onActiveIndexChange={setCarouselIndex}
                onPressImage={openImageViewer}
                imageRefreshKey={imageVersion}
              />
              <View className="absolute bottom-3 left-0 right-0 items-center">
                <View className="rounded-full bg-black/60 px-3 py-1">
                  <Text className="text-[12px] font-semibold text-white">
                    {carouselIndex + 1}/{images.length}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => openImageViewer(carouselIndex)}
                className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-black/40"
              >
                <Ionicons name="expand-outline" size={18} color="#fff" />
              </Pressable>
            </View>

            <View className="px-4 pt-5">
              {isMine ? (
                <View className="flex-row flex-wrap items-center gap-2">
                  {latestApprovalCode === APPROVAL_STATUS_WAITING ? (
                    <ApprovalStatusBadge label="승인 대기중" size="detail" />
                  ) : (
                    <>
                      <ProductStatusBadge
                        size="detail"
                        statusCode={statusCode}
                        statusDesc={enumDesc(detail.status) ?? undefined}
                        canChangeStatus={canChangeStatus}
                        onPress={() => setShowStatusSheet(true)}
                      />
                      {latestApprovalCode === APPROVAL_STATUS_APPROVAL &&
                      isDealerProduct(detail) ? (
                        <ApprovalStatusBadge label="승인 완료" size="detail" />
                      ) : null}
                    </>
                  )}
                </View>
              ) : (
                <View className="self-start rounded-md bg-[#e7f0ff] px-2.5 py-1">
                  <Text className="text-[13px] font-bold text-primary-10">
                    {enumDesc(detail.status) ?? "판매중"}
                  </Text>
                </View>
              )}

              <View className="mt-3 flex-row items-start">
                {youtubeUrl ? <ProductYoutubeIcon size={24} /> : null}
                <Text className="flex-1 text-[20px] font-bold text-gray900">
                  {toText(detail.truckName, "차량 정보 없음")}
                </Text>
              </View>
              {detail.productsNumber !== undefined ? (
                <Text className="mt-1 text-[13px] text-gray700">
                  매물번호 {toText(detail.productsNumber, "-")}
                </Text>
              ) : null}

              {isMine && showPriceEditor && !isDealer ? (
                <View className="mt-3">
                  <InlineProductPriceEditor
                    value={priceInputDigits}
                    onChangeValue={setPriceInputDigits}
                    onSave={requestSavePrice}
                    onCancel={() => {
                      setShowPriceEditor(false);
                      setPriceInputDigits(
                        typeof detail.price === "number"
                          ? String(detail.price)
                          : "",
                      );
                    }}
                    isSaving={isSavingPrice}
                  />
                </View>
              ) : (
                <View className="mt-3 flex-row flex-wrap items-center gap-2">
                  <Text className="text-[26px] font-extrabold text-gray900">
                    {formatPrice(detail.price)}
                  </Text>
                  {isMine && !isDealer && statusCode === PRODUCT_STATUS_SALE ? (
                    <Pressable
                      onPress={() => {
                        setPriceInputDigits(
                          typeof detail.price === "number"
                            ? String(detail.price)
                            : "",
                        );
                        setShowPriceEditor(true);
                      }}
                      className="h-[36px] items-center justify-center rounded-[8px] border border-primary-3 bg-primary-1 px-3"
                    >
                      <Text className="text-[15px] font-bold text-primary-10">
                        가격 수정
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}

              {isMine &&
              !isDealer &&
              enumCode(detail.status) === PRODUCT_STATUS_SALE ? (
                <SalePriceTipBox className="mt-4" />
              ) : null}

              <ProductSalesTypeBanner detail={detail} />

              <ProductDetailLicenseNotice
                license={detail.license}
                truckNumber={detail.truckNumber ?? detail.vehicleNumber}
              />

              <Text className="my-4  text-[13px] text-gray600">
                조회수 {formatViewCount(detail.viewCount)}
              </Text>
            </View>

            {!isAssuranceProduct ? (
              <ProductDetailPriceTrendSection detail={detail} />
            ) : null}

            {youtubeUrl ? (
              <ProductYoutubePlayer youtubeUrl={youtubeUrl} />
            ) : null}

            <ProductDetailRecommendedServices detail={detail} />

            <HistoryBadgeRow
              detail={detail}
              onPressItem={(key) => {
                setActiveTab("history");
                setHistoryScrollKey(key);
              }}
            />

            <TabBar activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === "info" ? (
              <InfoTab detail={detail} />
            ) : activeTab === "history" ? (
              <HistoryTab
                detail={detail}
                scrollTargetKey={historyScrollKey}
                onResolveScroll={(y) => {
                  scrollRef.current?.scrollTo({
                    y: Math.max(0, y - 8),
                    animated: true,
                  });
                  setHistoryScrollKey(null);
                }}
              />
            ) : (
              <CalcTab detail={detail} />
            )}
          </ScrollView>

          {detail ? (
            <ProductImageViewer
              visible={imageViewerOpen}
              images={images}
              initialIndex={imageViewerIndex}
              onClose={handleImageViewerClose}
            />
          ) : null}

          {!isMine && detail ? (
            <ProductDetailBuyerFooter
              product={detail}
              onInterestChange={(interestProductId) =>
                setDetail((prev) =>
                  prev
                    ? { ...prev, interestedProductId: interestProductId }
                    : prev,
                )
              }
            />
          ) : null}
        </View>
      )}

      <ProductPriceReduceNoticeModal
        visible={priceReduceModalOpen}
        onConfirm={onConfirmPriceReduceNotice}
      />

      <MenuBottomSheet
        visible={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        items={productMoreMenuItems}
      />

      {showStatusSheet && !showPauseModal ? (
        <ProductEditOptionSheet
          visible
          title="상태 변경"
          options={statusMenuItems.map((item) => ({
            code: item.code,
            desc: item.label,
          }))}
          selectedCode={statusCode}
          onClose={() => setShowStatusSheet(false)}
          onSelect={(item) => onPressStatusMenu(item.code)}
        />
      ) : null}

      <PauseSaleModal
        visible={showPauseModal}
        loading={isChangingStatus}
        onClose={() => setShowPauseModal(false)}
        onConfirm={onConfirmPause}
      />

      <SaleCompleteReviewModal
        visible={showCompleteModal}
        loading={isChangingStatus}
        price={detail?.price}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={onConfirmComplete}
      />
    </Screen>
  );
}

function HistoryBadgeRow({
  detail,
  onPressItem,
}: {
  detail: ProductDetail;
  onPressItem?: (key: HistoryScrollKey) => void;
}) {
  const items: { label: string; value?: number; key: HistoryScrollKey }[] = [
    { label: "압류이력", value: detail.seizureCount, key: "SEIZURE" },
    { label: "저당이력", value: detail.mortgageCount, key: "MORTGAGE" },
    { label: "소유자변경", value: detail.ownerChangeCount, key: "TRADING" },
    { label: "구조변경", value: detail.structureChangeCount, key: "TUNING" },
  ];
  return (
    <View className="mt-3 flex-row items-center justify-around bg-white py-4 border-y-[8px] border-gray100">
      {items.map((item) => {
        const text = formatCount(item.value);
        const isHighlight = (item.value ?? 0) > 0;
        return (
          <Pressable
            key={item.label}
            className="items-center"
            onPress={() => onPressItem?.(item.key)}
          >
            <View
              className={`h-[52px] w-[52px] items-center justify-center rounded-full ${
                isHighlight ? "bg-primary-1" : "bg-gray200"
              }`}
            >
              <Text
                className={`text-[15px] font-bold ${
                  isHighlight ? "text-primary" : "text-gray700"
                }`}
              >
                {text}
              </Text>
            </View>
            <Text className="mt-2 text-[12px] text-gray700">{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: DetailTab;
  onChange: (tab: DetailTab) => void;
}) {
  const items: { tab: DetailTab; label: string }[] = [
    { tab: "info", label: "차량 상세 정보" },
    { tab: "history", label: "차량 이력" },
    { tab: "calc", label: "할부 계산기" },
  ];
  return (
    <View className="mt-2 flex-row border-b border-gray600 bg-white">
      {items.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <Pressable
            key={item.tab}
            onPress={() => onChange(item.tab)}
            className="flex-1 items-center justify-center pb-3 pt-3"
          >
            <Text
              className={`text-[16px] ${
                isActive ? "font-bold text-gray900" : "font-medium text-gray700"
              }`}
            >
              {item.label}
            </Text>
            {isActive ? (
              <View className="absolute bottom-0 left-4 right-4 h-[2px] bg-gray900" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function InfoTab({ detail }: { detail: ProductDetail }) {
  const baseRows: { label: string; value: string }[] = [
    {
      label: "차량 번호",
      value: detail.truckNumber ?? detail.vehicleNumber ?? "-",
    },
    {
      label: "제조사/모델",
      value: [
        detail.manufacturerCategories?.name || enumDesc(detail.manufacturer),
        enumDesc(detail.model),
        enumDesc(detail.subModel),
      ]
        .filter(Boolean)
        .join("/"),
    },
    {
      label: "연식",
      value: formatYearMonthKorean(detail.firstRegistrationDate),
    },
    {
      label: "형식",
      value: detail.modelYear
        ? `${String(detail.modelYear).slice(-2)}년형`
        : "-",
    },
    { label: "차고지", value: enumDesc(detail.garage) ?? detail.region ?? "-" },
    { label: "마력수", value: formatPowerPs(detail.power) },
    { label: "변속기", value: enumDesc(detail.transmission) ?? "-" },
    { label: "톤수", value: formatTons(detail.tons ?? detail.weight) },
    { label: "적재함 종류", value: enumDesc(detail.loadedType) ?? "-" },
    { label: "주행거리", value: formatDistanceKm(detail.distance) },
    { label: "가변축", value: enumDesc(detail.axis) ?? "없음" },
    { label: "연료", value: enumDesc(detail.fuel) ?? "-" },
    { label: "차량 색상", value: enumDesc(detail.color) ?? "-" },
  ];

  return (
    <View className="bg-white px-4 pt-2">
      <View className="py-2">
        {baseRows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value || "-"} />
        ))}
      </View>

      <View className="my-3 h-[1px] bg-gray200" />

      <Text className="text-[16px] font-bold text-gray900">제원정보</Text>
      <Text className="mt-1 text-[13px] text-gray700">
        적재함의 내측 사이즈 정보 입니다.
      </Text>
      <View className="mt-2">
        {[
          {
            label: "길이",
            raw: detail.loadedInnerLength,
            value: formatLoadedLength(detail.loadedInnerLength),
          },
          {
            label: "너비",
            raw: detail.loadedInnerArea ?? detail.loadedInnerWidth,
            value: formatLoadedLength(
              detail.loadedInnerArea ?? detail.loadedInnerWidth,
            ),
          },
          {
            label: "높이",
            raw: detail.loadedInnerHeight,
            value: formatLoadedLength(detail.loadedInnerHeight),
          },
          {
            label: "파렛트",
            raw: detail.palletCount,
            value: formatPalletCount(detail.palletCount),
          },
        ]
          .filter((row) => hasLoadedSpecValue(row.raw))
          .map((row) => (
            <InfoRow key={row.label} label={row.label} value={row.value} />
          ))}
      </View>

      <View className="mt-5">
        <Text className="text-[16px] font-bold text-gray900">
          차량 추가 정보
        </Text>
        <View className="mt-2">
          {[
            {
              label: "검사 유효기간",
              value:
                detail.inspectionValidityStart && detail.inspectionValidityEnd
                  ? `${formatDateDot(detail.inspectionValidityStart)} ~ ${formatDateDot(detail.inspectionValidityEnd)}`
                  : "",
            },
            {
              label: "사고유무",
              value: detail.hasAccident ? "사고" : "무사고",
            },
            {
              label: "사고이력",
              value: detail.accidentContents ?? "",
            },
            {
              label: "운송 물품",
              value: detail.transportGoods ?? "",
            },
            {
              label: "운송 주요 구간",
              value:
                detail.transportStartLocate != null &&
                detail.transportEndLocate != null
                  ? `${enumDesc(detail.transportStartLocate)} ~ ${enumDesc(detail.transportEndLocate)}`
                  : "",
            },
            {
              label: "타이어 상태",
              value: enumDesc(detail.tireStatus) ?? "",
            },
          ]
            .filter((row) => hasDisplayValue(row.value))
            .map((row) => (
              <InfoRow key={row.label} label={row.label} value={row.value} />
            ))}
        </View>
      </View>

      <View className="mt-6 border-t-8 border-gray100 pt-6">
        <Text className="text-[16px] font-bold text-gray900">차량 옵션</Text>
        <View className="mt-4 gap-4">
          <OptionGroupCard
            label="일반 옵션"
            group={detail.normalOption ?? { options: detail.mainOptions }}
          />
          <OptionGroupCard
            label="추가 옵션"
            group={
              detail.additionalOption ?? { options: detail.additionalOptions }
            }
          />
          <OptionGroupCard
            label="브레이크 옵션"
            group={detail.brakeOption ?? { options: detail.brakeOptions }}
          />
        </View>
      </View>

      <View className="mt-6 border-t-8 border-gray100 pt-6">
        <Text className="text-[16px] font-bold text-gray900">
          차량 정비이력
        </Text>
        <Text className="mt-1 text-[13px] text-gray700">
          최근 1년 이내 주요 부품 수리내역 입니다.
        </Text>
        <Text className="mt-1 text-[13px] text-gray700">
          자세한 사항은 판매자에게 문의해보세요.
        </Text>
        <View className="mt-3 rounded-[10px] bg-gray100 p-4">
          {detail.maintenanceData?.length || detail.maintenanceEtc ? (
            <>
              {detail.maintenanceData && detail.maintenanceData.length > 0 ? (
                <View className="flex-row flex-wrap">
                  {detail.maintenanceData.map((item, index) => (
                    <Text
                      key={`${item}-${index}`}
                      className="mb-2 w-1/2 text-[14px] text-gray800"
                    >
                      ・{item}
                    </Text>
                  ))}
                </View>
              ) : null}
              {detail.maintenanceEtc ? (
                <View
                  className={
                    detail.maintenanceData?.length
                      ? "border-t border-gray300 pt-3"
                      : ""
                  }
                >
                  <Text className="text-[14px] text-gray800">
                    ・{detail.maintenanceEtc}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text className="text-[14px] text-gray600">
              차량 정비 이력 없음
            </Text>
          )}
        </View>
      </View>

      {detail.detailContent ? (
        <View className="mt-6 border-t-8 border-gray100 pt-6">
          <Text className="text-[16px] font-bold text-gray900">설명</Text>
          <View className="mt-3 rounded-[10px] bg-gray100 p-4">
            <Text className="text-[14px] leading-[22px] text-gray800">
              {detail.detailContent}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined | { code?: string; desc?: string };
}) {
  const text = toText(value, "-");
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-[14px] text-gray700">{label}</Text>
      <Text
        className="ml-3 flex-1 text-right text-[14px] font-semibold text-gray900"
        numberOfLines={2}
      >
        {text || "-"}
      </Text>
    </View>
  );
}

function OptionGroupCard({
  label,
  group,
}: {
  label: string;
  group?: { options?: string[]; etc?: string };
}) {
  const options = group?.options ?? [];
  const etc = group?.etc?.trim() ?? "";
  const isEmpty = options.length === 0 && !etc;

  return (
    <View className="rounded-[10px] bg-gray100 p-4">
      <Text className="text-[15px] font-bold text-gray900">{label}</Text>
      {isEmpty ? (
        <Text className="mt-2 text-[14px] text-gray600">없음</Text>
      ) : (
        <>
          {options.length > 0 ? (
            <View className="mt-2 flex-row flex-wrap">
              {options.map((item, index) => (
                <Text
                  key={`${item}-${index}`}
                  className="mb-2 w-1/2 text-[14px] text-gray800"
                >
                  ・{item}
                </Text>
              ))}
            </View>
          ) : null}
          {etc ? (
            <View
              className={
                options.length > 0 ? "border-t border-gray300 pt-3" : "mt-2"
              }
            >
              <Text className="text-[14px] text-gray800">・{etc}</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function HistoryTab({
  detail,
  scrollTargetKey,
  onResolveScroll,
}: {
  detail: ProductDetail;
  scrollTargetKey?: HistoryScrollKey | null;
  onResolveScroll?: (y: number) => void;
}) {
  return (
    <ProductHistorySections
      detail={detail}
      scrollTargetKey={scrollTargetKey}
      onResolveScroll={onResolveScroll}
    />
  );
}

function CalcTab({ detail }: { detail: ProductDetail }) {
  return (
    <View className="bg-white px-4 py-4">
      <Text className="mb-4 text-[18px] font-bold text-gray900">
        할부 계산기
      </Text>
      <LoanCalculator price={detail.price} />
    </View>
  );
}
