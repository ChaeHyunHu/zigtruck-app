import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { patchProducts } from "@/src/api/public";
import { Screen } from "@/src/components/common/Screen";
import { SALESTYPE } from "@/src/constants/products";
import {
  buildImagePatchPayload,
  buildImagesStateFromDetail,
  ProductPhotoEditor,
  validateRequiredPhotos,
  type ProductImagesState,
} from "@/src/features/products/ProductPhotoEditor";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import { ProductPhotoDeleteWarningModal } from "@/src/features/sell-car/registration/ProductPhotoDeleteWarningModal";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function PhotoUploadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scrollBottomPadding } = useScreenInsets();
  const { productFormData, setProductFormData } = useRegistrationProduct(id);
  const [saving, setSaving] = useState(false);
  const [warningOpen, setWarningOpen] = useState(true);

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const images = useMemo(
    () => buildImagesStateFromDetail(productFormData?.productsImage),
    [productFormData?.productsImage],
  );

  const canProceed = validateRequiredPhotos(images);

  const handleImagesChange = (next: ProductImagesState) => {
    setProductFormData((prev) =>
      prev
        ? {
            ...prev,
            productsImage: {
              ...(prev.productsImage ?? {}),
              ...next,
            },
          }
        : prev,
    );
  };

  const onNext = async () => {
    if (!canProceed) {
      Alert.alert("필수 사진", "필수 사진 3장을 모두 등록해주세요.");
      return;
    }
    if (!productFormData?.id) return;
    setSaving(true);
    try {
      await patchProducts({
        id: productFormData.id,
        ...buildImagePatchPayload(images),
      });
      router.replace({
        pathname: "/products/sales/price/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!productFormData) {
    return (
      <Screen variant="stack" className="flex-1 items-center justify-center bg-white">
        <Text className="text-[15px] text-gray700">불러오는 중...</Text>
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={title} />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <View className="flex-row items-start justify-between px-4 pt-8">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            차량 사진을{"\n"}등록해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("photo")}/9`} />
        </View>

        <ProductPhotoEditor
          images={images}
          truckNumber={productFormData.truckNumber}
          onChange={handleImagesChange}
        />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0">
        <DualFooterButtons
          onPressLeft={() =>
            router.replace({
              pathname: "/products/sales/detail-info/[id]",
              params: { id: String(id) },
            })
          }
          rightLabel="다음(판매가격)"
          rightDisabled={!canProceed}
          onPressRight={onNext}
          loading={saving}
        />
      </View>

      <ProductPhotoDeleteWarningModal
        visible={warningOpen}
        onConfirm={() => setWarningOpen(false)}
      />
    </Screen>
  );
}
