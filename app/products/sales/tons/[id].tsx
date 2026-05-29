import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import { SALESTYPE } from "@/src/constants/products";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { usePatchProduct, useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { getTonnageErrorMessage } from "@/src/features/sell-car/registration/validation";

export default function TonsFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productFormData, setProductFormData } = useRegistrationProduct(id);
  const { patch, saving } = usePatchProduct();
  const [error, setError] = useState("");

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const onNext = async () => {
    const msg = getTonnageErrorMessage(String(productFormData?.tons ?? ""));
    if (msg) {
      setError(msg);
      return;
    }
    if (!productFormData?.id) return;
    try {
      await patch({ id: productFormData.id, tons: Number(productFormData.tons) });
      router.replace({
        pathname: "/products/sales/loaded/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={title} />
      <KeyboardAwareScrollView className="flex-1 px-4 pt-6" footerInset={88}>
        <View className="flex-row items-start justify-between pt-6">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            톤수를{"\n"}입력해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("tons")}/9`} />
        </View>
        <View className="mt-10">
          <Text className="mb-2 text-[14px] font-medium text-gray700">톤수</Text>
          <TextInput
            className="h-[50px] rounded-lg border border-gray300 px-4 text-[18px]"
            keyboardType="decimal-pad"
            value={String(productFormData?.tons ?? "")}
            onChangeText={(value) => {
              setError("");
              setProductFormData((prev) => (prev ? { ...prev, tons: value } : prev));
            }}
            placeholder="예) 5"
          />
          {error ? <Text className="mt-2 text-[13px] text-red-500">{error}</Text> : null}
        </View>
      </KeyboardAwareScrollView>
      <DualFooterButtons
        onPressLeft={() =>
          router.replace({ pathname: "/products/sales/model/[id]", params: { id: String(id) } })
        }
        rightLabel="다음"
        onPressRight={onNext}
        loading={saving}
      />
    </Screen>
  );
}
