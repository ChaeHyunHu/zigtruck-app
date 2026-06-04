import apiManager from "@/src/api/AxiosInstance";
import newApiManager from "@/src/api/NewAxiosInstance";
import { fetchRegistrationProduct } from "@/src/api/products/carRegister";
import { fetchMyProducts } from "@/src/api/products/getProducts";
import {
  patchProductComplete,
  patchProductsInfo,
} from "@/src/api/products/updateProducts";
import { patchProductPause, patchProductsStatus } from "@/src/api/public";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { MenuBottomSheet } from "@/src/components/common/MenuBottomSheet";
import { Screen } from "@/src/components/common/Screen";
import {
  APPROVAL_STATUS_APPROVAL,
  APPROVAL_STATUS_WAITING,
  PRODUCT_STATUS_COMPLETE,
  PRODUCT_STATUS_PAUSE,
  PRODUCT_STATUS_SALE,
  SALES_TYPE_THIRD_PARTY_DEALER,
} from "@/src/constants/products";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import { formatPrice } from "@/src/features/home/utils";
import { ProductEditOptionSheet } from "@/src/features/products/edit/ProductEditOptionSheet";
import { InlineProductPriceEditor } from "@/src/features/products/InlineProductPriceEditor";
import { PauseSaleModal } from "@/src/features/products/PauseSaleModal";
import {
  ProductPriceReduceNoticeModal,
  shouldShowPriceReduceNotice,
} from "@/src/features/products/ProductPriceReduceNoticeModal";
import {
  consumePurchaseListDirty,
  invalidateProductCaches,
} from "@/src/features/products/productRefresh";
import { isDealerMember } from "@/src/features/products/productInquiryUtils";
import {
  ApprovalStatusBadge,
  PRODUCT_STATUS_DESC,
  ProductStatusBadge,
} from "@/src/features/products/productStatusBadge";
import { SaleCompleteReviewModal } from "@/src/features/products/SaleCompleteReviewModal";
import { SalePriceTipBox } from "@/src/features/products/SalePriceTipBox";
import {
  REGISTRATION_STEPS,
  getPageName,
} from "@/src/features/sell-car/registration/productUtils";
import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useAppDialog } from "@/src/providers/AppDialogProvider";
import { useAppLoadingOverlay } from "@/src/providers/AppLoadingProvider";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  AppState,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

const BEFORE_SALE = "BEFORE_SALE";
const SALE = "SALE";
const PAUSE = "PAUSE";
const WAITING = "WAITING";
const ORIGIN_DATA_REGISTER = "ORIGIN_DATA_REGISTER";
/** 직트럭 즉시매각(매입견적) 상담 요청 진행중 상태 */
const BEFORE_CONSULTING = "BEFORE_CONSULTING";
const PRODUCT_TYPE_SPEED = "SPEED";
const SALES_TYPE_NORMAL = "NORMAL";
const SALES_TYPE_CONSIGNMENT = "CONSIGNMENT";
const SALES_TYPE_ASSURANCE = "ASSURANCE";

type ProductStatus = { code?: string; desc?: string };
type ProductType = { code?: string; desc?: string };
type ApprovalStatusItem = {
  status?: ProductStatus;
  reason?: string;
  modifiedDate?: string;
};
type ProductImage = { frontSideImageUrl?: string };
type ProductDetailResponse = {
  id: number;
  truckNumber?: string;
  price?: number | null;
  actualSalePrice?: number | null;
  status?: ProductStatus;
  type?: ProductType;
  salesType?: ProductType;
  statusOfSpeedProduct?: ProductType;
  approvalStatusList?: ApprovalStatusItem[];
  productsImage?: ProductImage;
  currentStep?: number;
  totalStep?: number;
  progressText?: string;
};

type ConfirmModalState = {
  open: boolean;
  title: string;
  content: string;
  rightLabel: string;
  onConfirm?: () => void;
};

const pickArray = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload.content,
    payload.data,
    payload.items,
    payload.list,
    payload.results,
    payload?.data?.content,
    payload?.data?.items,
    payload?.data?.list,
    payload?.result?.content,
    payload?.result?.items,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const resolveImageUri = (raw: any): string | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const representative = raw.find(
      (item) => item?.isRepresentative || item?.representative,
    );
    return resolveImageUri(representative ?? raw[0]);
  }
  if (typeof raw === "object") {
    return resolveImageUri(
      raw?.frontSideImageUrl ??
        raw?.url ??
        raw?.imageUrl ??
        raw?.fileUrl ??
        raw?.path ??
        raw?.thumbnailUrl ??
        raw?.representImageUrl ??
        raw?.representativeImageUrl,
    );
  }
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (value.startsWith("/")) return `${IMAGE_BASE_URL}${value}`;
  return `${IMAGE_BASE_URL}/${value}`;
};

const normalizeProduct = (item: any): ProductDetailResponse | null => {
  const id = item?.id ?? item?.productId ?? item?.productsId;
  if (id === undefined || id === null) return null;

  const statusCode =
    item?.status?.code ??
    item?.status ??
    item?.productsStatus ??
    item?.salesStatus;
  const statusDesc = item?.status?.desc ?? item?.statusDesc;

  return {
    id: Number(id),
    truckNumber:
      item?.truckNumber ??
      item?.vehicleNumber ??
      item?.plateNumber ??
      item?.carNumber ??
      String(item?.productsNumber ?? item?.productNumber ?? "-"),
    price: item?.price ?? item?.salePrice ?? item?.sellingPrice ?? null,
    status: { code: statusCode, desc: statusDesc },
    type: item?.type,
    salesType: item?.salesType,
    statusOfSpeedProduct: item?.statusOfSpeedProduct,
    actualSalePrice: item?.actualSalePrice ?? null,
    approvalStatusList: Array.isArray(item?.approvalStatusList)
      ? item.approvalStatusList
      : [],
    productsImage: {
      frontSideImageUrl: resolveImageUri(
        item?.productsImage?.frontSideImageUrl ??
          item?.representImageUrl ??
          item?.representativeImageUrl ??
          item?.thumbnailImageUrl ??
          item?.imageUrl ??
          item?.images ??
          item?.productImages ??
          item?.productsImages,
      ),
    },
    currentStep: item?.currentStep,
    totalStep: item?.totalStep,
    progressText: item?.progressText,
  };
};

const formatYYYYMMDD = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * 판매유형 배지 텍스트 (zigtruck-front getProductType 로직과 동일)
 * - type이 SPEED(매입견적)면 statusOfSpeedProduct.desc(상담 요청/상담 완료 등)
 * - 그 외에는 salesType에 따라 직거래/위탁판매/직트럭 상품용
 */
const getSalesTypeLabel = (item: ProductDetailResponse): string => {
  if (item.type?.code === PRODUCT_TYPE_SPEED) {
    return item.statusOfSpeedProduct?.desc ?? "상담 요청";
  }
  switch (item.salesType?.code) {
    case SALES_TYPE_CONSIGNMENT:
      return "위탁판매";
    case SALES_TYPE_ASSURANCE:
      return "직트럭 상품용";
    case SALES_TYPE_THIRD_PARTY_DEALER:
      return "타사딜러";
    case SALES_TYPE_NORMAL:
      return "직거래";
    default:
      return item.salesType?.desc ?? "직거래";
  }
};

/** 실제 위탁판매(SPEED 상담요청 제외) 여부 — 더보기 메뉴 숨김 대상 */
const isConsignmentSale = (item: ProductDetailResponse): boolean =>
  item.type?.code !== PRODUCT_TYPE_SPEED &&
  item.salesType?.code === SALES_TYPE_CONSIGNMENT;

/** "직트럭에 즉시 매각" 링크 노출 여부: 활성 직거래 차량만 */
const canShowInstantSaleLink = (item: ProductDetailResponse): boolean =>
  item.status?.code !== PRODUCT_STATUS_COMPLETE &&
  item.type?.code !== PRODUCT_TYPE_SPEED &&
  !item.statusOfSpeedProduct &&
  item.salesType?.code !== SALES_TYPE_CONSIGNMENT &&
  item.salesType?.code !== SALES_TYPE_ASSURANCE;

type ManageSaleCardProps = {
  item: ProductDetailResponse;
  isFirst: boolean;
  isEditing: boolean;
  editingPriceValue: string;
  isSavingPrice: boolean;
  onPressDetail: (item: ProductDetailResponse) => void;
  onPressStatus: (id: number) => void;
  onChangeEditingPrice: (value: string) => void;
  onSavePrice: (id: number) => void;
  onCancelPrice: () => void;
  onOpenPriceEditor: (item: ProductDetailResponse) => void;
  onPressRejectReason: (item: ProductDetailResponse) => void;
  onPressInstantSale: (id: number) => void;
  onPressMenu: (id: number) => void;
  canEditPrice: boolean;
};

/**
 * 판매 차량 카드. React.memo로 분리해 메뉴/상태 시트 등 화면 상태 변경 시
 * 모든 카드가 리렌더되어 바텀시트가 늦게 뜨거나 끊기는 문제를 방지한다.
 */
const ManageSaleCard = React.memo(function ManageSaleCard({
  item,
  isFirst,
  isEditing,
  editingPriceValue,
  isSavingPrice,
  onPressDetail,
  onPressStatus,
  onChangeEditingPrice,
  onSavePrice,
  onCancelPrice,
  onOpenPriceEditor,
  onPressRejectReason,
  onPressInstantSale,
  onPressMenu,
  canEditPrice,
}: ManageSaleCardProps) {
  const lastApproval = item.approvalStatusList?.at(-1);
  const isWaiting = lastApproval?.status?.code === WAITING;
  const isApproved = lastApproval?.status?.code === APPROVAL_STATUS_APPROVAL;
  const isReject = lastApproval?.status?.code === "REJECT";
  const isDealerSale = item.salesType?.code === SALES_TYPE_THIRD_PARTY_DEALER;
  const canOpenStatusSheet =
    (item.status?.code === SALE || item.status?.code === PAUSE) && !isWaiting;

  return (
    <View className={`${isFirst ? "" : "border-t border-gray300"} py-4`}>
      <View className="flex-row">
        <Pressable
          className="mr-3 h-[100px] w-[100px] overflow-hidden rounded-[8px] bg-gray200"
          onPress={() => onPressDetail(item)}
        >
          <Image
            source={{
              uri:
                item.productsImage?.frontSideImageUrl ||
                `${IMAGE_BASE_URL}/car_none.png`,
            }}
            className="h-full w-full"
            contentFit="cover"
          />
        </Pressable>

        <View className="flex-1">
          <View className="flex-row items-center gap-3">
            {isDealerSale ? (
              isWaiting ? (
                <ApprovalStatusBadge label="승인 대기중" />
              ) : (
                <>
                  <ProductStatusBadge
                    statusCode={item.status?.code}
                    statusDesc={item.status?.desc}
                    canChangeStatus={canOpenStatusSheet}
                    onPress={() => onPressStatus(item.id)}
                  />
                  {isApproved ? (
                    <ApprovalStatusBadge label="승인 완료" />
                  ) : null}
                </>
              )
            ) : (
              <>
                <ProductStatusBadge
                  statusCode={item.status?.code}
                  statusDesc={item.status?.desc}
                  canChangeStatus={canOpenStatusSheet}
                  onPress={() => onPressStatus(item.id)}
                />
                <Text className="rounded-md bg-gray100 px-2 py-1 text-[14px] font-bold text-[#1f8f5f]">
                  {getSalesTypeLabel(item)}
                </Text>
              </>
            )}
          </View>

          <Pressable onPress={() => onPressDetail(item)}>
            <Text className="mt-2 text-[16px] font-bold text-gray900">
              {item.truckNumber ?? "-"}
            </Text>

            {isEditing && !isWaiting && canEditPrice ? (
              <InlineProductPriceEditor
                value={editingPriceValue}
                onChangeValue={onChangeEditingPrice}
                onSave={() => onSavePrice(item.id)}
                onCancel={onCancelPrice}
                isSaving={isSavingPrice}
              />
            ) : (
              <View className="mt-1 flex-row flex-wrap items-center gap-2">
                <Text className="text-[20px] font-extrabold text-gray900">
                  {formatPrice(item.price)}
                </Text>
                {canEditPrice && item.status?.code === SALE && !isWaiting ? (
                  <Pressable
                    className="h-[36px] items-center justify-center rounded-[8px] border border-primary-3 bg-primary-1 px-3"
                    onPress={() => onOpenPriceEditor(item)}
                  >
                    <Text className="text-[15px] font-bold text-primary-10">
                      가격 수정
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}

            {isReject && lastApproval?.reason ? (
              <Pressable onPress={() => onPressRejectReason(item)}>
                <Text className="mt-2 text-[14px] font-medium text-gray700 underline">
                  반려 사유 확인
                </Text>
              </Pressable>
            ) : canShowInstantSaleLink(item) ? (
              <Pressable onPress={() => onPressInstantSale(item.id)}>
                <Text className="mt-2 text-[14px] font-semibold text-gray700 underline">
                  직트럭에 즉시 매각
                </Text>
              </Pressable>
            ) : null}
          </Pressable>
        </View>

        {!isEditing && !isConsignmentSale(item) ? (
          <Pressable
            className="-mr-1 self-start p-2"
            hitSlop={12}
            onPress={() => onPressMenu(item.id)}
          >
            <Ionicons name="ellipsis-vertical" size={18} color="#333" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

export default function ManageScreen() {
  const { fabListPaddingBottom } = useScreenInsets();
  const { alert } = useAppDialog();
  const { isAuthenticated, isInitializing, token, memberId, profile } = useAuth();
  const isDealer = isDealerMember(profile?.memberTypeCode);
  const isFocused = useIsFocused();

  const [myProducts, setMyProducts] = useState<ProductDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useAppLoadingOverlay(isAuthenticated && isLoading);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNone, setIsNone] = useState(false);
  const [listFetchFailed, setListFetchFailed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const myProductsRef = useRef<ProductDetailResponse[]>([]);
  const focusVisitRef = useRef(0);

  useEffect(() => {
    myProductsRef.current = myProducts;
  }, [myProducts]);

  const [editingPriceProductId, setEditingPriceProductId] = useState<
    number | null
  >(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [priceReduceModalOpen, setPriceReduceModalOpen] = useState(false);
  const pendingPriceSaveIdRef = useRef<number | null>(null);
  const pauseTargetProductIdRef = useRef<number | null>(null);
  const completeTargetProductIdRef = useRef<number | null>(null);
  const [completeTargetPrice, setCompleteTargetPrice] = useState<number | null>(
    null,
  );
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSavingPrice, setIsSavingPrice] = useState(false);

  const [menuProductId, setMenuProductId] = useState<number | null>(null);
  const [statusSheetProductId, setStatusSheetProductId] = useState<
    number | null
  >(null);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [instantSaleProductId, setInstantSaleProductId] = useState<
    number | null
  >(null);

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    title: "",
    content: "",
    rightLabel: "확인",
  });
  const [alertModal, setAlertModal] = useState<{
    open: boolean;
    reason: string;
    modifiedDate: string;
  }>({
    open: false,
    reason: "",
    modifiedDate: "",
  });
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingProducts = useMemo(
    () => myProducts.filter((item) => item.status?.code === BEFORE_SALE),
    [myProducts],
  );
  const saleProducts = useMemo(
    () => myProducts.filter((item) => item.status?.code !== BEFORE_SALE),
    [myProducts],
  );
  const isShowDivider = pendingProducts.length > 0 && saleProducts.length > 0;

  const statusSheetProduct = useMemo(
    () => myProducts.find((item) => item.id === statusSheetProductId) ?? null,
    [myProducts, statusSheetProductId],
  );

  const statusMenuItems = useMemo(() => {
    const code = statusSheetProduct?.status?.code;
    if (code === SALE) {
      return [
        { code: PRODUCT_STATUS_COMPLETE, label: "판매완료" },
        { code: PRODUCT_STATUS_PAUSE, label: "판매중지" },
      ];
    }
    if (code === PAUSE) {
      return [{ code: PRODUCT_STATUS_SALE, label: "판매중" }];
    }
    return [];
  }, [statusSheetProduct?.status?.code]);

  const menuProduct = useMemo(
    () => myProducts.find((item) => item.id === menuProductId) ?? null,
    [myProducts, menuProductId],
  );

  const lastMenuItemsRef = useRef<{ label: string; onPress: () => void }[]>([]);

  const productMenuItems = useMemo(() => {
    // 닫히는 중(menuProduct=null)에는 직전 항목을 유지해 "수정하기" 깜빡임 방지
    if (!menuProduct) return lastMenuItemsRef.current;
    const items = [
      {
        label: "번호판 관리",
        onPress: () => {
          router.push("/license/my");
        },
      },
    ];

    if (menuProduct?.status?.code !== PRODUCT_STATUS_COMPLETE) {
      items.unshift({
        label: "수정하기",
        onPress: () => {
          if (menuProductId == null) return;
          router.push({
            pathname: "/product/edit/[id]",
            params: { id: String(menuProductId) },
          });
        },
      });
    }

    return items;
  }, [menuProduct, menuProductId]);

  useEffect(() => {
    if (menuProduct) lastMenuItemsRef.current = productMenuItems;
  }, [menuProduct, productMenuItems]);

  const loadMyProducts = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        setListFetchFailed(false);
      }

      try {
        const response = await fetchMyProducts();
        const next = pickArray(response)
          .map(normalizeProduct)
          .filter((item): item is ProductDetailResponse => Boolean(item));
        // 목록 응답엔 등록 진행 단계(currentStep/totalStep)가 없을 수 있어,
        // 직전에 클라이언트에서 보강한 값을 유지한다. (새로고침 시 "0/0 → 4/9" 깜빡임 방지)
        const prevById = new Map(
          myProductsRef.current.map((item) => [item.id, item]),
        );
        const merged = next.map((item) => {
          if (item.currentStep != null && item.totalStep != null) return item;
          const prev = prevById.get(item.id);
          if (prev?.currentStep != null && prev?.totalStep != null) {
            return {
              ...item,
              currentStep: prev.currentStep,
              totalStep: prev.totalStep,
            };
          }
          return item;
        });
        setMyProducts(merged);
        setIsNone(next.length === 0);
        setListFetchFailed(false);
      } catch {
        setIsNone(false);
        if (myProductsRef.current.length === 0) {
          setListFetchFailed(true);
        }
        if (!refresh || myProductsRef.current.length === 0) {
          alert({
            title: "오류",
            message: "내차관리 목록을 불러오지 못했습니다.",
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [alert],
  );

  useFocusEffect(
    useCallback(() => {
      if (isInitializing || !isAuthenticated) return;
      consumePurchaseListDirty();
      focusVisitRef.current += 1;
      const isFirstFocus = focusVisitRef.current === 1;
      void loadMyProducts(!isFirstFocus);
      // token/memberId는 의존성에서 제외: API 호출 중 토큰 자동 갱신으로
      // 콜백이 재생성되어 포커스 effect가 다시 실행되며 중복 리패치+깜빡임 발생
    }, [isAuthenticated, isInitializing, loadMyProducts]),
  );

  useEffect(() => {
    if (isInitializing || !isAuthenticated) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isFocused) {
        void loadMyProducts(true);
      }
    });
    return () => sub.remove();
  }, [
    isAuthenticated,
    isInitializing,
    isFocused,
    loadMyProducts,
    token,
    memberId,
  ]);

  // 등록 진행 중인 (BEFORE_SALE) 차량의 currentStep/totalStep 이 목록 응답에서 누락되는 경우가 있어
  // 별도로 detail 을 받아서 클라이언트에서 직접 계산한다 ("5/9 완료" 처럼 표시되도록).
  const calcStepFromDetail = useCallback(
    (
      detail: RegistrationProduct,
    ): { currentStep: number; totalStep: number } => {
      const nextStep = getPageName(detail);
      const idx = REGISTRATION_STEPS.indexOf(nextStep);
      const completed = idx >= 0 ? idx : 0;
      return { currentStep: completed, totalStep: REGISTRATION_STEPS.length };
    },
    [],
  );

  useEffect(() => {
    if (isInitializing || !isAuthenticated) return;
    const pendingIds = pendingProducts
      .filter((item) => item.currentStep == null || item.totalStep == null)
      .map((item) => item.id);
    if (pendingIds.length === 0) return;

    let cancelled = false;
    void (async () => {
      const results = await Promise.allSettled(
        pendingIds.map((id) => fetchRegistrationProduct(id)),
      );
      if (cancelled) return;
      const stepById = new Map<
        number,
        { currentStep: number; totalStep: number }
      >();
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          stepById.set(pendingIds[index], calcStepFromDetail(result.value));
        }
      });
      if (stepById.size === 0) return;
      setMyProducts((prev) =>
        prev.map((item) => {
          const step = stepById.get(item.id);
          if (!step) return item;
          return {
            ...item,
            currentStep: step.currentStep,
            totalStep: step.totalStep,
          };
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isInitializing, pendingProducts, calcStepFromDetail]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const onScroll = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 500);
  }, []);

  const resumeRegistration = useCallback(
    async (productId: number) => {
      try {
        const data = await fetchRegistrationProduct(productId);
        const step = getPageName(data);
        if (data.status?.code === ORIGIN_DATA_REGISTER) {
          router.push({
            pathname: "/products/sales/info/[id]",
            params: { id: String(productId), from: "manage" },
          });
          return;
        }
        router.push({
          pathname:
            `/products/sales/${step}/[id]` as "/products/sales/model/[id]",
          params: { id: String(productId), from: "manage" },
        });
      } catch {
        alert({ title: "오류", message: "등록 정보를 불러오지 못했습니다." });
      }
    },
    [alert],
  );

  const fetchDetail = useCallback(
    (product: ProductDetailResponse) => {
      if (
        product.status?.code === ORIGIN_DATA_REGISTER ||
        product.status?.code === BEFORE_SALE
      ) {
        resumeRegistration(product.id);
        return;
      }
      router.push({
        pathname: "/product/[id]",
        params: { id: String(product.id), mine: "true" },
      });
    },
    [resumeRegistration],
  );

  const onClickDelete = useCallback(
    (item: ProductDetailResponse) => {
      setConfirmModal({
        open: true,
        title: "차량을 정말 삭제하시겠어요?",
        content: item.truckNumber ?? "",
        rightLabel: "삭제하기",
        onConfirm: async () => {
          try {
            await apiManager.delete(`/api/v1/products/${item.id}`);
            setMyProducts((prev) =>
              prev.filter((product) => product.id !== item.id),
            );
            setConfirmModal({
              open: false,
              title: "",
              content: "",
              rightLabel: "확인",
            });
            alert({ title: "완료", message: "차량이 삭제되었어요." });
          } catch {
            alert({ title: "오류", message: "차량 삭제에 실패했습니다." });
          }
        },
      });
    },
    [alert],
  );

  const openPriceEditor = useCallback((item: ProductDetailResponse) => {
    if (item.status?.code !== SALE) return;
    setEditingPriceProductId(item.id);
    setEditingPriceValue(item.price ? String(item.price) : "");
  }, []);

  const onChangeStatus = useCallback(
    async (productId: number, nextStatus: string) => {
      try {
        setIsChangingStatus(true);
        const response = await patchProductsStatus({
          productId,
          status: nextStatus,
        });
        const responseData = response.data as ProductDetailResponse;
        setMyProducts((prev) =>
          prev.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  status: responseData?.status ?? {
                    code: nextStatus,
                    desc: PRODUCT_STATUS_DESC[nextStatus],
                  },
                }
              : item,
          ),
        );
        setStatusSheetProductId(null);
        setShowPauseModal(false);
        invalidateProductCaches(productId);
        const message =
          nextStatus === PRODUCT_STATUS_SALE
            ? "판매중으로 변경되었어요."
            : nextStatus === PRODUCT_STATUS_PAUSE
              ? "판매중지로 변경되었어요."
              : nextStatus === PRODUCT_STATUS_COMPLETE
                ? "판매완료로 변경되었어요."
                : "상태가 변경되었어요.";
        alert({ title: "완료", message });
      } catch {
        alert({ title: "오류", message: "상태 변경에 실패했습니다." });
      } finally {
        setIsChangingStatus(false);
      }
    },
    [alert],
  );

  const onConfirmPause = useCallback(
    async (pauseReason: string) => {
      const productId = pauseTargetProductIdRef.current;
      if (!productId) return;
      try {
        setIsChangingStatus(true);
        const response = await patchProductPause({
          productId,
          pauseReason,
        });
        const responseData = response.data as ProductDetailResponse;
        setMyProducts((prev) =>
          prev.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  status: responseData?.status ?? {
                    code: PRODUCT_STATUS_PAUSE,
                    desc: PRODUCT_STATUS_DESC[PRODUCT_STATUS_PAUSE],
                  },
                }
              : item,
          ),
        );
        setShowPauseModal(false);
        setStatusSheetProductId(null);
        pauseTargetProductIdRef.current = null;
        invalidateProductCaches(productId);
        alert({ title: "완료", message: "판매중지로 변경되었어요." });
      } catch {
        alert({ title: "오류", message: "상태 변경에 실패했습니다." });
      } finally {
        setIsChangingStatus(false);
      }
    },
    [alert],
  );

  const onConfirmInstantSale = useCallback(async () => {
    const productId = instantSaleProductId;
    setInstantSaleProductId(null);
    if (!productId) return;
    try {
      const response = await patchProductsInfo({ productId, type: "SPEED" });
      const responseData = response.data as ProductDetailResponse;
      setMyProducts((prev) =>
        prev.map((item) =>
          item.id === productId
            ? {
                ...item,
                type: responseData?.type ?? { code: "SPEED", desc: "매입견적" },
                statusOfSpeedProduct: responseData?.statusOfSpeedProduct ?? {
                  code: BEFORE_CONSULTING,
                  desc: "상담 요청",
                },
              }
            : item,
        ),
      );
      invalidateProductCaches(productId);
      alert({
        title: "요청 완료",
        message:
          "직트럭 매입견적 상담 요청이 접수되었어요. 담당자가 곧 연락드릴 예정입니다.",
      });
    } catch {
      alert({
        title: "오류",
        message: "요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
  }, [alert, instantSaleProductId]);

  const onConfirmComplete = useCallback(
    async (actualSalePrice: number, completeReason: string) => {
      const productId = completeTargetProductIdRef.current;
      if (!productId) return;
      try {
        setIsChangingStatus(true);
        const response = await patchProductComplete({
          id: productId,
          actualSalePrice,
          completeReason,
        });
        const responseData = response.data as ProductDetailResponse;
        setMyProducts((prev) =>
          prev.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  status: responseData?.status ?? {
                    code: PRODUCT_STATUS_COMPLETE,
                    desc: PRODUCT_STATUS_DESC[PRODUCT_STATUS_COMPLETE],
                  },
                  actualSalePrice:
                    responseData?.actualSalePrice ?? actualSalePrice,
                }
              : item,
          ),
        );
        setShowCompleteModal(false);
        setStatusSheetProductId(null);
        completeTargetProductIdRef.current = null;
        invalidateProductCaches(productId);
        alert({ title: "완료", message: "판매완료로 변경되었어요." });
      } catch {
        alert({ title: "오류", message: "상태 변경에 실패했습니다." });
      } finally {
        setIsChangingStatus(false);
      }
    },
    [alert],
  );

  const onPressStatusMenu = useCallback(
    (nextStatus: string) => {
      const productId = statusSheetProductId;
      if (!productId) return;
      if (nextStatus === PRODUCT_STATUS_COMPLETE) {
        const target = myProductsRef.current.find(
          (item) => item.id === productId,
        );
        completeTargetProductIdRef.current = productId;
        setCompleteTargetPrice(target?.price ?? null);
        setStatusSheetProductId(null);
        setTimeout(() => setShowCompleteModal(true), 320);
        return;
      }
      if (nextStatus === PRODUCT_STATUS_PAUSE) {
        pauseTargetProductIdRef.current = productId;
        setShowPauseModal(true);
        return;
      }
      void onChangeStatus(productId, nextStatus);
    },
    [onChangeStatus, statusSheetProductId],
  );

  const cancelPriceEditor = useCallback(() => {
    setEditingPriceProductId(null);
    setEditingPriceValue("");
    setIsSavingPrice(false);
  }, []);

  const onPressRejectReason = useCallback((item: ProductDetailResponse) => {
    setAlertModal({
      open: true,
      reason: item.approvalStatusList?.at(-1)?.reason ?? "",
      modifiedDate: formatYYYYMMDD(item.approvalStatusList?.at(-1)?.modifiedDate),
    });
  }, []);

  const executeSavePrice = useCallback(
    async (productId: number, options?: { silent?: boolean }) => {
      if (isSavingPrice) return;

      const nextPrice = Number((editingPriceValue || "").replace(/[^\d]/g, ""));
      if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
        alert({
          title: "입력 오류",
          message: "판매 가격을 올바르게 입력해 주세요.",
        });
        return;
      }

      const product = myProducts.find((item) => item.id === productId);
      const approvedPrice = product?.price ?? 0;
      const isApproved =
        product?.approvalStatusList?.at(-1)?.status?.code === "APPROVAL";
      if (isApproved && nextPrice > approvedPrice) {
        alert({
          title: "가격 제한",
          message: "가격은 그 이상으로 수정이 불가능합니다.",
        });
        return;
      }

      try {
        setIsSavingPrice(true);
        await newApiManager.patch(`/api/v1/products/${productId}`, {
          price: nextPrice,
        });
        setMyProducts((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, price: nextPrice } : item,
          ),
        );
        invalidateProductCaches(productId);
        cancelPriceEditor();
        if (!options?.silent) {
          alert({ title: "완료", message: "판매 가격이 변경되었어요." });
        }
      } catch {
        alert({ title: "오류", message: "판매 가격 변경에 실패했습니다." });
        setIsSavingPrice(false);
      }
    },
    [alert, cancelPriceEditor, editingPriceValue, isSavingPrice, myProducts],
  );

  const requestSavePrice = useCallback(
    (productId: number) => {
      const nextPrice = Number((editingPriceValue || "").replace(/[^\d]/g, ""));
      if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
        alert({
          title: "입력 오류",
          message: "판매 가격을 올바르게 입력해 주세요.",
        });
        return;
      }

      const product = myProducts.find((item) => item.id === productId);
      const originalPrice = Number(product?.price ?? 0);
      if (shouldShowPriceReduceNotice(originalPrice, nextPrice)) {
        pendingPriceSaveIdRef.current = productId;
        setPriceReduceModalOpen(true);
        return;
      }

      void executeSavePrice(productId);
    },
    [alert, editingPriceValue, executeSavePrice, myProducts],
  );

  const onConfirmPriceReduceNotice = useCallback(() => {
    const productId = pendingPriceSaveIdRef.current;
    setPriceReduceModalOpen(false);
    pendingPriceSaveIdRef.current = null;
    if (productId != null) {
      void executeSavePrice(productId, { silent: true });
    }
  }, [executeSavePrice]);

  if (isInitializing) {
    return (
      <Screen className="flex-1 bg-white">
        <View className="flex-1" />
      </Screen>
    );
  }

  if (!isAuthenticated) {
    return (
      <Screen variant="tab" className="flex-1 bg-white">
        <View className="h-14 justify-center border-b border-gray300 px-4">
          <Text className="text-[20px] font-bold text-gray900">내차관리</Text>
        </View>
        <LoginRequiredView message="내차관리는 로그인 후 이용할 수 있습니다." />
      </Screen>
    );
  }

  return (
    <Screen variant="tab" className="flex-1 bg-white">
      <View className="h-14 justify-center border-b border-gray300 px-4">
        <Text className="text-[20px] font-bold text-gray900">내차관리</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 bg-white" />
      ) : listFetchFailed && myProducts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cloud-offline-outline" size={64} color="#DCDCDC" />
          <Text className="mt-5 text-center text-[16px] text-gray700">
            목록을 불러오지 못했어요.{"\n"}네트워크 또는 로그인 상태를 확인한 뒤
            다시 시도해 주세요.
          </Text>
          <Pressable
            onPress={() => {
              setListFetchFailed(false);
              void loadMyProducts(false);
            }}
            className="mt-6 rounded-[10px] bg-primary px-8 py-3"
          >
            <Text className="text-[15px] font-bold text-white">
              다시 불러오기
            </Text>
          </Pressable>
        </View>
      ) : isNone ? (
        <View className="flex-1 items-center justify-center px-4">
          <Ionicons name="car-sport-outline" size={80} color="#DCDCDC" />
          <Text className="mt-5 text-[16px] text-gray700">
            차량 내역이 없습니다.
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            className="flex-1 bg-[#fff] "
            contentContainerStyle={{ paddingBottom: fabListPaddingBottom }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadMyProducts(true)}
              />
            }
          >
            {pendingProducts.map((item) => (
              <View key={item.id} className="px-4 pt-4">
                <View className="flex-row items-center rounded-[12px] bg-[#f2f2f2] p-3">
                  <View className="mr-3 h-[70px] w-[70px] overflow-hidden rounded-lg bg-[#e3e3e3]">
                    {item.productsImage?.frontSideImageUrl ? (
                      <Image
                        source={{ uri: item.productsImage.frontSideImageUrl }}
                        className="h-full w-full"
                        contentFit="cover"
                      />
                    ) : (
                      <View className="h-full items-center justify-center">
                        <Ionicons
                          name="car-sport-outline"
                          size={26}
                          color="#bdbdbd"
                        />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-[16px] font-bold text-gray900">
                      {item.truckNumber ?? "-"}
                    </Text>
                    <Text className="mt-1 text-[14px] text-gray700">
                      {item.progressText ??
                        `${item.currentStep ?? 0}/${item.totalStep ?? 9} 완료`}
                    </Text>
                  </View>
                  <View className="items-end gap-2">
                    <Pressable onPress={() => onClickDelete(item)}>
                      <Ionicons name="close" size={24} color="#666" />
                    </Pressable>
                    <Pressable
                      className="rounded-[10px] bg-primary px-4 py-2"
                      onPress={() => resumeRegistration(item.id)}
                    >
                      <Text className="text-[14px] font-bold text-white">
                        이어서 등록
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {isShowDivider ? <View className="mt-4 h-2 bg-gray200" /> : null}

            {/* 판매 팁 */}
            {!isDealer ? (
              <View className="mt-4 px-4">
                <SalePriceTipBox />
              </View>
            ) : null}

            {/* 판매 중인 차량 */}
            <View className="mt-3 bg-white px-4">
              {saleProducts.map((item, index) => (
                <ManageSaleCard
                  key={item.id}
                  item={item}
                  isFirst={index === 0}
                  isEditing={editingPriceProductId === item.id}
                  editingPriceValue={
                    editingPriceProductId === item.id ? editingPriceValue : ""
                  }
                  isSavingPrice={
                    editingPriceProductId === item.id ? isSavingPrice : false
                  }
                  onPressDetail={fetchDetail}
                  onPressStatus={setStatusSheetProductId}
                  onChangeEditingPrice={setEditingPriceValue}
                  onSavePrice={requestSavePrice}
                  onCancelPrice={cancelPriceEditor}
                  onOpenPriceEditor={openPriceEditor}
                  onPressRejectReason={onPressRejectReason}
                  onPressInstantSale={setInstantSaleProductId}
                  onPressMenu={setMenuProductId}
                  canEditPrice={!isDealer}
                />
              ))}
            </View>
          </ScrollView>

          <View className="absolute bottom-4 right-4">
            <Pressable onPress={() => router.push("/sell-car")}>
              {isScrolling ? (
                <LinearGradient
                  colors={["#535AFF", "#397AFF", "#10ACFF"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  className="h-[52px] w-[52px] items-center justify-center rounded-full"
                >
                  <Ionicons name="car-sport-outline" size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={["#535AFF", "#397AFF", "#10ACFF"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  className="h-[52px] min-w-[190px] flex-row items-center justify-center rounded-full px-5"
                >
                  <Ionicons name="car-sport-outline" size={20} color="#fff" />
                  <Text className="ml-2 text-[18px] font-bold text-white">
                    차량 판매하러 가기
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </View>
      )}

      <ProductPriceReduceNoticeModal
        visible={priceReduceModalOpen}
        onConfirm={onConfirmPriceReduceNotice}
      />

      <MenuBottomSheet
        visible={menuProductId !== null}
        onClose={() => setMenuProductId(null)}
        items={productMenuItems}
      />

      <ConfirmDialog
        visible={instantSaleProductId !== null}
        title="직트럭에 즉시 매각 요청할까요?"
        leftLabel="취소"
        rightLabel="요청하기"
        onLeft={() => setInstantSaleProductId(null)}
        onRight={() => {
          void onConfirmInstantSale();
        }}
      >
        <View className="gap-1.5">
          <Text className="text-center text-[15px] leading-[22px] text-gray800">
            · 담당자가{" "}
            <Text className="font-semibold text-primary">직접 상담</Text>을
            도와드려요.
          </Text>
          <Text className="text-center text-[15px] leading-[22px] text-gray800">
            · 직거래 차량은{" "}
            <Text className="font-semibold text-primary">
              내차구매 목록에서 숨김
            </Text>{" "}
            처리됩니다.
          </Text>
        </View>
      </ConfirmDialog>

      {statusSheetProductId !== null && !showPauseModal ? (
        <ProductEditOptionSheet
          visible
          title="상태 변경"
          options={statusMenuItems.map((item) => ({
            code: item.code,
            desc: item.label,
          }))}
          selectedCode={statusSheetProduct?.status?.code}
          onClose={() => setStatusSheetProductId(null)}
          onSelect={(item) => onPressStatusMenu(item.code)}
        />
      ) : null}

      <PauseSaleModal
        visible={showPauseModal}
        loading={isChangingStatus}
        onClose={() => {
          setShowPauseModal(false);
          pauseTargetProductIdRef.current = null;
        }}
        onConfirm={onConfirmPause}
      />

      <SaleCompleteReviewModal
        visible={showCompleteModal}
        loading={isChangingStatus}
        price={completeTargetPrice}
        onClose={() => {
          setShowCompleteModal(false);
          completeTargetProductIdRef.current = null;
        }}
        onConfirm={onConfirmComplete}
      />

      <Modal
        visible={confirmModal.open}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setConfirmModal({
            open: false,
            title: "",
            content: "",
            rightLabel: "확인",
          })
        }
      >
        <View className="flex-1 items-center justify-center bg-black/35 p-5">
          <View className="w-full rounded-xl bg-white p-4">
            <Text className="text-[17px] font-bold text-gray900">
              {confirmModal.title}
            </Text>
            {confirmModal.content ? (
              <Text className="mt-2 text-[14px] text-gray700">
                {confirmModal.content}
              </Text>
            ) : null}
            <View className="mt-4 flex-row justify-end gap-2">
              <Pressable
                className="rounded-md bg-gray200 px-4 py-2"
                onPress={() =>
                  setConfirmModal({
                    open: false,
                    title: "",
                    content: "",
                    rightLabel: "확인",
                  })
                }
              >
                <Text className="font-semibold text-gray800">취소</Text>
              </Pressable>
              <Pressable
                className="rounded-md bg-primary px-4 py-2"
                onPress={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  else
                    setConfirmModal({
                      open: false,
                      title: "",
                      content: "",
                      rightLabel: "확인",
                    });
                }}
              >
                <Text className="font-bold text-white">
                  {confirmModal.rightLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={alertModal.open}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setAlertModal({ open: false, reason: "", modifiedDate: "" })
        }
      >
        <View className="flex-1 items-center justify-center bg-black/35 p-5">
          <View className="w-full rounded-xl bg-white p-4">
            <Text className="text-[17px] font-bold text-gray900">
              반려 사유
            </Text>
            <Text className="mt-2 text-[14px] text-gray700">
              {alertModal.reason}
            </Text>
            <Text className="mt-1 text-[12px] text-gray600">
              {alertModal.modifiedDate}
            </Text>
            <View className="mt-4 items-end">
              <Pressable
                className="rounded-md bg-primary px-4 py-2"
                onPress={() =>
                  setAlertModal({ open: false, reason: "", modifiedDate: "" })
                }
              >
                <Text className="font-bold text-white">확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
