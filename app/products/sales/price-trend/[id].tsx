import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { SALESTYPE } from "@/src/constants/products";
import { REPRESENTATIVE_NUMBER } from "@/src/features/additional-services/constants";
import { CarPriceTrendInfoView } from "@/src/features/price-trend/CarPriceTrendInfoView";
import {
  defaultProductSearchParams,
  mapOriginDataToSearchParams,
} from "@/src/features/price-trend/utils";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import {
  formatRegistrationTruckTitle,
  getStepIndex,
} from "@/src/features/sell-car/registration/productUtils";
import { SellCarRegistrationHeader } from "@/src/features/sell-car/registration/SellCarRegistrationHeader";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

export default function PriceTrendScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { scrollBottomPadding } = useScreenInsets();
  const { productFormData } = useRegistrationProduct(id);

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const vehicleTitle = useMemo(
    () => formatRegistrationTruckTitle(productFormData),
    [productFormData],
  );

  const searchParams = useMemo(
    () =>
      productFormData
        ? mapOriginDataToSearchParams(productFormData)
        : defaultProductSearchParams(),
    [productFormData],
  );

  const callConsultation = () => {
    Linking.openURL("tel:15996249").catch(() =>
      Alert.alert("전화 문의", REPRESENTATIVE_NUMBER),
    );
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <SellCarRegistrationHeader title={title} />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <View className="flex-row items-start justify-between pt-2">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            차량 시세를{"\n"}확인해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("price-trend")}/9`} />
        </View>

        {vehicleTitle ? (
          <View className="mt-8 rounded-xl bg-[#F3F6FB] px-4 py-5">
            <Text className="text-[16px] font-bold leading-[22px] text-gray900">
              {vehicleTitle}
            </Text>
            <Text className="mt-2 text-[14px] leading-[20px] text-gray700">
              해당 차종의 평균 시세 정보를 불러왔어요.
            </Text>
          </View>
        ) : null}

        <CarPriceTrendInfoView searchParams={searchParams} apiType="public" />

        <Pressable
          onPress={callConsultation}
          className="mt-6 flex-row items-center rounded-xl border border-gray300 bg-white px-4 py-4"
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-1">
            <Ionicons name="call" size={22} color={appColors.primary} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[14px] text-gray700">내 차량 시세 상담받기</Text>
            <Text className="mt-0.5 text-[16px] font-bold text-gray900">
              전화문의 {REPRESENTATIVE_NUMBER}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={appColors.gray700} />
        </Pressable>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0">
        <DualFooterButtons
          onPressLeft={() =>
            router.replace({
              pathname: "/products/sales/additional-info/[id]",
              params: { id: String(id) },
            })
          }
          rightLabel="다음(상세정보)"
          onPressRight={() =>
            router.replace({
              pathname: "/products/sales/detail-info/[id]",
              params: { id: String(id) },
            })
          }
        />
      </View>
    </Screen>
  );
}
