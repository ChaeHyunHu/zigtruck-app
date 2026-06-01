import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Keyboard, ScrollView, Text, View } from "react-native";

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

  const pickerOptions = useMemo<OptionItem[]>(() => {
    if (!pickerKey || !productEnum?.manufacturerAndModel) return [];

    if (pickerKey === "model") {
      return productEnum.manufacturerAndModel
        .filter(
          (item) =>
            item.manufacturerCategories.id ===
            Number(productFormData?.manufacturerCategories?.id),
        )
        .flatMap((item) => item.model)
        .map((m) => ({ code: String(m.id), desc: m.name }));
    }

    if (pickerKey === "manufacturerCategories") {
      return productEnum.manufacturerAndModel.map((item) => ({
        code: String(item.manufacturerCategories.id),
        desc: item.manufacturerCategories.name,
      }));
    }

    if (pickerKey === "modelDetail" && selectedModel?.modelDetail) {
      return selectedModel.modelDetail.map((d) => ({
        code: String(d.code),
        desc: String(d.desc),
      }));
    }

    return [];
  }, [
    pickerKey,
    productEnum,
    productFormData?.manufacturerCategories?.id,
    selectedModel,
  ]);

  const openPicker = useCallback(
    (key: PickerKey) => {
      if (!productEnum?.manufacturerAndModel) return;
      Keyboard.dismiss();

      if (key === "manufacturerCategories" && !isEtc) return;

      let nextOptions: OptionItem[] = [];
      if (key === "model") {
        nextOptions = productEnum.manufacturerAndModel
          .filter(
            (item) =>
              item.manufacturerCategories.id ===
              Number(productFormData?.manufacturerCategories?.id),
          )
          .flatMap((item) => item.model)
          .map((m) => ({ code: String(m.id), desc: m.name }));
      } else if (key === "manufacturerCategories") {
        nextOptions = productEnum.manufacturerAndModel.map((item) => ({
          code: String(item.manufacturerCategories.id),
          desc: item.manufacturerCategories.name,
        }));
      } else if (key === "modelDetail" && selectedModel?.modelDetail) {
        nextOptions = selectedModel.modelDetail.map((d) => ({
          code: String(d.code),
          desc: String(d.desc),
        }));
      }

      if (nextOptions.length === 0) {
        Alert.alert("안내", "선택 가능한 항목이 없습니다.");
        return;
      }

      setPickerKey(key);
    },
    [isEtc, productEnum, productFormData?.manufacturerCategories?.id, selectedModel],
  );

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
      <View className="flex-1">
        <RegistrationHeader title={title} />
        <ScrollView
          className="flex-1 px-4 pt-6"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 24 }}
        >
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
          rightDisabled={
            !productFormData?.model?.name ||
            (hasModelDetail && !productFormData?.modelDetail?.code)
          }
          loading={saving}
        />
      </View>

      {pickerKey !== null ? (
        <OptionPickerSheet
          visible
          title={
            pickerKey === "model"
              ? "모델"
              : pickerKey === "modelDetail"
                ? "세부 모델"
                : "제조사"
          }
          options={pickerOptions}
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
      ) : null}
    </Screen>
  );
}
