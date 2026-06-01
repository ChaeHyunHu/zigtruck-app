import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { SALESTYPE } from "@/src/constants/products";
import { AxisRadioBoxList } from "@/src/features/sell-car/registration/AxisRadioBoxList";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { usePatchProduct, useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import { getStepIndex, isUnderFourTons } from "@/src/features/sell-car/registration/productUtils";
import { SellCarRegistrationHeader } from "@/src/features/sell-car/registration/SellCarRegistrationHeader";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

export default function AxisFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productFormData, setProductFormData } = useRegistrationProduct(id);
  const { productEnum } = useProductRegistration();
  const { patch, saving } = usePatchProduct();

  const underFour = isUnderFourTons(productFormData?.tons);
  const axisOptions = useMemo(() => productEnum?.axis ?? [], [productEnum?.axis]);

  useEffect(() => {
    if (!underFour) return;
    setProductFormData((prev) =>
      prev && prev.axis?.code !== "NONE"
        ? { ...prev, axis: { code: "NONE", desc: "없음" } }
        : prev,
    );
  }, [underFour, setProductFormData]);

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const onNext = async () => {
    if (!productFormData?.id || !productFormData.axis?.code) {
      Alert.alert("입력 필요", "가변축 정보를 선택해주세요.");
      return;
    }
    try {
      await patch({ id: productFormData.id, axis: productFormData.axis.code });
      router.replace({
        pathname: "/products/sales/additional-info/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <SellCarRegistrationHeader title={title} />
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="flex-row items-start justify-between pt-6">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            가변축을 선택해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("axis")}/9`} />
        </View>

        {underFour ? (
          <View className="mt-5 rounded-[10px] bg-gray100 px-4 py-[19px]">
            <Text className="text-[14px] font-medium leading-[17px] text-gray700">
              * 4톤 이하의 차량은 가변축이 없으므로 축 선택이 불가능합니다.
            </Text>
          </View>
        ) : null}

        <View className="mt-8">
          <AxisRadioBoxList
            options={axisOptions}
            value={productFormData?.axis?.code}
            disabled={underFour}
            onSelect={(item) =>
              setProductFormData((prev) =>
                prev ? { ...prev, axis: { code: item.code, desc: item.desc } } : prev,
              )
            }
          />
        </View>
      </ScrollView>
      <DualFooterButtons
        onPressLeft={() =>
          router.replace({ pathname: "/products/sales/loaded/[id]", params: { id: String(id) } })
        }
        rightLabel="추가 정보 입력하기"
        onPressRight={onNext}
        loading={saving}
      />
    </Screen>
  );
}
