import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { SALESTYPE } from "@/src/constants/products";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { usePatchProduct, useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import {
  OptionItem,
  OptionPickerSheet,
} from "@/src/features/sell-car/registration/OptionPickerSheet";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { SelectField } from "@/src/features/sell-car/registration/SelectField";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

type PickerKey = "manufacturerCategories" | "model" | "modelDetail";

export default function ModelFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productFormData, setProductFormData, loading } = useRegistrationProduct(id);
  const { productEnum } = useProductRegistration();
  const { patch, saving } = usePatchProduct();

  const [pickerKey, setPickerKey] = useState<PickerKey | null>(null);
  const [options, setOptions] = useState<OptionItem[]>([]);

  const isEtc = productFormData?.manufacturerCategories?.code === "ETC";
  const selectedModel = useMemo(() => {
    if (!productEnum?.manufacturerAndModel || !productFormData?.model?.id) return null;
    const models = productEnum.manufacturerAndModel
      .filter(
        (item) =>
          item.manufacturerCategories.id ===
          Number(productFormData.manufacturerCategories?.id),
      )
      .flatMap((item) => item.model);
    return models.find((m) => m.id === Number(productFormData.model?.id)) ?? null;
  }, [productEnum, productFormData]);

  const hasModelDetail = (selectedModel?.modelDetail?.length ?? 0) > 0;
  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const openPicker = (key: PickerKey) => {
    if (!productEnum?.manufacturerAndModel) return;
    setPickerKey(key);
    if (key === "model") {
      const models = productEnum.manufacturerAndModel
        .filter(
          (item) =>
            item.manufacturerCategories.id ===
            Number(productFormData?.manufacturerCategories?.id),
        )
        .flatMap((item) => item.model);
      setOptions(models.map((m) => ({ code: String(m.id), desc: m.name })));
    } else if (key === "manufacturerCategories" && isEtc) {
      setOptions(
        productEnum.manufacturerAndModel.map((item) => ({
          code: String(item.manufacturerCategories.id),
          desc: item.manufacturerCategories.name,
        })),
      );
    } else if (key === "modelDetail" && selectedModel?.modelDetail) {
      setOptions(
        selectedModel.modelDetail.map((d) => ({
          code: String(d.code),
          desc: String(d.desc),
        })),
      );
    }
  };

  const onSelect = (item: OptionItem) => {
    if (!productFormData || !pickerKey) return;
    if (pickerKey === "manufacturerCategories") {
      setProductFormData({
        ...productFormData,
        manufacturerCategories: { id: Number(item.code), name: item.desc },
        model: undefined,
        modelDetail: undefined,
      });
    } else if (pickerKey === "model") {
      setProductFormData({
        ...productFormData,
        model: { id: Number(item.code), name: item.desc },
        modelDetail: undefined,
      });
    } else if (pickerKey === "modelDetail") {
      setProductFormData({
        ...productFormData,
        modelDetail: { code: item.code, desc: item.desc },
      });
    }
    setPickerKey(null);
  };

  const onNext = async () => {
    if (!productFormData?.id || !productFormData.model?.id) return;
    try {
      await patch({
        id: productFormData.id,
        modelId: Number(productFormData.model.id),
        modelDetail: productFormData.modelDetail?.code,
      });
      router.replace({
        pathname: "/products/sales/tons/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  if (loading && !productFormData) {
    return (
      <Screen variant="stack" className="flex-1 items-center justify-center bg-white">
        <Text>불러오는 중...</Text>
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={title} />
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="flex-row items-start justify-between pt-6">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            제조사와 모델을{"\n"}선택해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("model")}/9`} />
        </View>

        <View className="mt-8 gap-8">
          {isEtc ? (
            <View className="rounded-[10px] bg-gray100 p-4">
              <Text className="text-[13px] font-medium text-red-500">
                * 기타(쌍용 외) 제조사에서 타 제조사로 변경 시 추후 수정이 불가능하니 유의해주세요.
              </Text>
            </View>
          ) : null}

          <SelectField
            label="제조사"
            value={productFormData?.manufacturerCategories?.name}
            onPress={() => openPicker("manufacturerCategories")}
            disabled={!isEtc}
          />
          <SelectField
            label="모델"
            value={productFormData?.model?.name}
            onPress={() => openPicker("model")}
          />
          {hasModelDetail ? (
            <SelectField
              label="세부 모델"
              value={productFormData?.modelDetail?.desc}
              onPress={() => openPicker("modelDetail")}
            />
          ) : null}
        </View>
      </ScrollView>

      <DualFooterButtons
        onPressLeft={() =>
          router.replace({
            pathname: "/products/sales/info/[id]",
            params: { id: String(id) },
          })
        }
        rightLabel="다음(상세정보)"
        onPressRight={onNext}
        rightDisabled={!productFormData?.model?.name || (hasModelDetail && !productFormData?.modelDetail?.code)}
        loading={saving}
      />

      <OptionPickerSheet
        visible={pickerKey !== null}
        title={pickerKey === "model" ? "모델" : pickerKey === "modelDetail" ? "세부 모델" : "제조사"}
        options={options}
        selectedCode={
          pickerKey === "model"
            ? String(productFormData?.model?.id ?? "")
            : pickerKey === "modelDetail"
              ? String(productFormData?.modelDetail?.code ?? "")
              : String(productFormData?.manufacturerCategories?.id ?? "")
        }
        onClose={() => setPickerKey(null)}
        onSelect={onSelect}
      />
    </Screen>
  );
}
