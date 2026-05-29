import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Screen } from "@/src/components/common/Screen";
import {
  fetchAuthedProductDetail,
  fetchProductDetail,
} from "@/src/api/products/getProducts";
import { getProductEnum } from "@/src/api/products/carRegister";
import { patchProducts } from "@/src/api/public";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { APPROVAL_STATUS_APPROVAL } from "@/src/constants/products";
import { CarPriceTrendInfoView } from "@/src/features/price-trend/CarPriceTrendInfoView";
import { buildPriceSearchParamsFromProductDetail } from "@/src/features/price-trend/utils";
import { SalePriceTipBox } from "@/src/features/products/SalePriceTipBox";
import {
  buildFullEditPatchPayload,
  productDetailToEditForm,
} from "@/src/features/products/edit/mappers";
import { ProductEditDetailTab } from "@/src/features/products/edit/ProductEditDetailTab";
import type { ProductEditOpenPickerParams } from "@/src/features/products/edit/productEditPickerTypes";
import { ProductEditVehicleTab } from "@/src/features/products/edit/ProductEditVehicleTab";
import { validateVehicleForm } from "@/src/features/products/edit/utils";
import type { ProductDetail } from "@/src/features/products/types";
import {
  buildImagesStateFromDetail,
  ProductPhotoEditor,
  validateRequiredPhotos,
  type ProductImagesState,
} from "@/src/features/products/ProductPhotoEditor";
import { invalidateProductCaches } from "@/src/features/products/productRefresh";
import { normalizeDetail } from "@/src/features/products/utils";
import { ProductEditOptionSheet } from "@/src/features/products/edit/ProductEditOptionSheet";
import { PriceInputField } from "@/src/features/sell-car/registration/PriceInputField";
import type { ProductEnumData, RegistrationProduct } from "@/src/features/sell-car/registration/types";
import { useAuth } from "@/src/hooks/useAuth";

const PHONE_REGEX = /01[016789]-?\d{3,4}-?\d{4}/;

type EditTab = "vehicle" | "detail" | "photo" | "price";

const TABS: { tab: EditTab; label: string }[] = [
  { tab: "vehicle", label: "차량정보" },
  { tab: "detail", label: "상세정보" },
  { tab: "photo", label: "사진수정" },
  { tab: "price", label: "판매가격" },
];

const isEditTab = (value: string | undefined): value is EditTab =>
  value === "vehicle" || value === "detail" || value === "photo" || value === "price";

export default function ProductEditScreen() {
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const { isAuthenticated, memberId } = useAuth();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [editForm, setEditForm] = useState<RegistrationProduct | null>(null);
  const [activeTab, setActiveTab] = useState<EditTab>(
    isEditTab(tab) ? tab : "vehicle",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<ProductImagesState>({});
  const [priceInput, setPriceInput] = useState<number | undefined>();
  const [priceReduceModalOpen, setPriceReduceModalOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<ProductEditOpenPickerParams | null>(
    null,
  );
  const [productEnum, setProductEnum] = useState<ProductEnumData | null>(null);

  const handleOpenPicker = useCallback((params: ProductEditOpenPickerParams) => {
    if (params.options.length === 0) {
      Alert.alert(
        "안내",
        productEnum
          ? "선택할 항목이 없습니다."
          : "선택 목록을 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
      );
      return;
    }
    setActivePicker(params);
  }, [productEnum]);

  const handleEditFormChange = useCallback(
    (updater: React.SetStateAction<RegistrationProduct>) => {
      setEditForm((prev) => {
        if (!prev) return prev;
        return typeof updater === "function" ? updater(prev) : updater;
      });
    },
    [],
  );

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try {
      const raw = isAuthenticated
        ? await fetchAuthedProductDetail(id).catch(() => fetchProductDetail(id))
        : await fetchProductDetail(id);
      const normalized = normalizeDetail(raw, memberId);
      if (!normalized) {
        throw new Error("invalid product");
      }
      setDetail(normalized);
      setEditForm(productDetailToEditForm(normalized, raw));
      setImages(buildImagesStateFromDetail(normalized?.productsImage));
      setPriceInput(
        typeof normalized?.price === "number" ? normalized.price : undefined,
      );
    } catch {
      Alert.alert("오류", "상품 정보를 불러오지 못했습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, memberId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (isEditTab(tab)) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    getProductEnum()
      .then(setProductEnum)
      .catch(() => undefined);
  }, []);

  const validateBeforeSave = useCallback((): boolean => {
    if (!detail || !editForm) return false;

    const vehicleError = validateVehicleForm(editForm);
    if (vehicleError) {
      Alert.alert("입력 필요", vehicleError);
      return false;
    }

    const accident =
      editForm.accidentsHistory?.accident ?? editForm.accident ?? false;
    const accidentContents =
      editForm.accidentsHistory?.accidentContents ??
      editForm.accidentContents ??
      "";
    if (accident && !accidentContents.trim()) {
      Alert.alert("입력 필요", "사고 상세내용을 입력해주세요.");
      return false;
    }

    if (PHONE_REGEX.test(editForm.detailContent ?? "")) {
      Alert.alert(
        "입력 제한",
        "개인 정보 보호를 위해 전화번호 입력은 제한되어 있습니다.",
      );
      return false;
    }

    if (!validateRequiredPhotos(images)) {
      Alert.alert("필수 사진", "필수 사진 3장을 모두 등록해주세요.");
      return false;
    }

    const nextPrice = Number(priceInput ?? 0);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      Alert.alert("입력 오류", "판매 가격을 올바르게 입력해 주세요.");
      return false;
    }

    const isApproved =
      detail.approvalStatusList?.at(-1)?.status?.code ===
      APPROVAL_STATUS_APPROVAL;
    if (isApproved && detail.price && nextPrice > detail.price) {
      Alert.alert("가격 제한", "승인된 가격보다 높게는 수정이 불가능합니다.");
      return false;
    }

    return true;
  }, [detail, editForm, images, priceInput]);

  const executeSaveAll = useCallback(async () => {
    if (!detail || !editForm) return;
    const nextPrice = Number(priceInput ?? 0);

    try {
      setIsSaving(true);
      await patchProducts(buildFullEditPatchPayload(editForm, images, nextPrice));
      invalidateProductCaches(detail.id);
      setPriceReduceModalOpen(false);
      Alert.alert("완료", "수정사항이 저장되었어요.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }, [detail, editForm, images, priceInput]);

  const onSave = useCallback(async () => {
    if (!validateBeforeSave()) return;

    const originalPrice = Number(detail?.price ?? 0);
    const nextPrice = Number(priceInput ?? 0);

    if (
      Number.isFinite(originalPrice) &&
      originalPrice > 0 &&
      nextPrice <= originalPrice - 50
    ) {
      setPriceReduceModalOpen(true);
      return;
    }

    await executeSaveAll();
  }, [detail?.price, executeSaveAll, priceInput, validateBeforeSave]);

  const activeIndex = TABS.findIndex((tab) => tab.tab === activeTab);
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex === TABS.length - 1;
  const nextLabel = useMemo(() => {
    if (isLast) return "저장하기";
    const nextTab = TABS[activeIndex + 1];
    return `다음(${nextTab.label})`;
  }, [activeIndex, isLast]);

  const onPrev = useCallback(() => {
    if (isFirst) return;
    setActiveTab(TABS[activeIndex - 1].tab);
  }, [activeIndex, isFirst]);

  const onNext = useCallback(async () => {
    if (activeTab === "photo" && !validateRequiredPhotos(images)) {
      Alert.alert("필수 사진", "필수 사진 3장을 모두 등록해주세요.");
      return;
    }
    if (isLast) {
      onSave();
      return;
    }
    setActiveTab(TABS[activeIndex + 1].tab);
  }, [activeIndex, activeTab, images, isLast, onSave]);

  return (
    <Screen className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="h-14 flex-row items-center border-b border-gray300 px-4">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <Text className="ml-3 text-[18px] font-bold text-gray900">
          차량 정보 수정
        </Text>
      </View>

      <View className="flex-row border-b border-gray300 bg-white">
        {TABS.map((item) => {
          const isActive = item.tab === activeTab;
          return (
            <Pressable
              key={item.tab}
              onPress={() => setActiveTab(item.tab)}
              className="flex-1 items-center justify-center pb-3 pt-3"
            >
              <Text
                className={`text-[14px] ${
                  isActive
                    ? "font-bold text-gray900"
                    : "font-medium text-gray700"
                }`}
              >
                {item.label}
              </Text>
              {isActive ? (
                <View className="absolute bottom-0 left-3 right-3 h-[2px] bg-gray900" />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {isLoading || !detail || !editForm ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <View className="flex-1">
          <ScrollView
            className="flex-1 bg-white"
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled
            contentContainerStyle={{ paddingBottom: 24 }}
          >
          {activeTab === "vehicle" ? (
            <ProductEditVehicleTab
              form={editForm}
              productEnum={productEnum}
              onChange={handleEditFormChange}
              onOpenPicker={handleOpenPicker}
            />
          ) : null}
          {activeTab === "detail" ? (
            <ProductEditDetailTab
              form={editForm}
              productEnum={productEnum}
              onChange={handleEditFormChange}
              onOpenPicker={handleOpenPicker}
            />
          ) : null}
          {activeTab === "photo" ? (
            <ProductPhotoEditor
              images={images}
              truckNumber={detail.truckNumber ?? detail.vehicleNumber}
              onChange={setImages}
            />
          ) : null}
          {activeTab === "price" ? (
            <View className="px-4 pt-5">
              <Text className="mb-3 text-[15px] font-semibold text-gray900">
                판매 금액
              </Text>
              <PriceInputField
                value={priceInput}
                placeholder="판매 금액 입력"
                onChangeValue={setPriceInput}
                hideHint
              />

              <SalePriceTipBox className="mt-6" />

              <View className="mt-4">
                <CarPriceTrendInfoView
                  searchParams={buildPriceSearchParamsFromProductDetail(detail)}
                  apiType="public"
                />
              </View>
            </View>
          ) : null}
          </ScrollView>
        </View>
      )}

      <ConfirmDialog
        visible={priceReduceModalOpen}
        title="차량 판매 금액 수정 완료"
        leftLabel="닫기"
        rightLabel="확인"
        onLeft={() => setPriceReduceModalOpen(false)}
        onRight={() => {
          void executeSaveAll();
        }}
      >
        <Text className="text-center text-[15px] leading-[22px] text-gray800">
          50만원 이상 수정되어{"\n"}해당 차량이 상단에 노출돼요.
        </Text>
      </ConfirmDialog>

      <ProductEditOptionSheet
        visible={activePicker !== null}
        title={activePicker?.title ?? ""}
        options={activePicker?.options ?? []}
        selectedCode={activePicker?.selectedCode}
        onClose={() => setActivePicker(null)}
        onSelect={(item) => {
          activePicker?.onSelect(item);
        }}
      />

      <View className="flex-row border-t border-gray300 bg-white px-4 py-3">
        <Pressable
          onPress={onPrev}
          disabled={isFirst}
          className={`mr-2 flex-1 items-center justify-center rounded-md py-3 ${
            isFirst ? "bg-gray200" : "border border-gray300 bg-white"
          }`}
        >
          <Text
            className={`text-[14px] font-bold ${
              isFirst ? "text-gray500" : "text-gray800"
            }`}
          >
            이전
          </Text>
        </Pressable>
        <Pressable
          onPress={onNext}
          disabled={isSaving}
          className="flex-[2] items-center justify-center rounded-md bg-primary py-3"
        >
          <Text className="text-[14px] font-bold text-white">
            {isSaving ? "저장 중..." : nextLabel}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
