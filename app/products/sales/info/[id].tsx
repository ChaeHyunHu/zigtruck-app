import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import {
  PRODUCT_STATUS_BEFORE_SALE,
  PRODUCT_TYPE_DIRECT,
  SALESTYPE,
} from "@/src/constants/products";
import { BasicButton } from "@/src/components/common/BasicButton";
import { appColors } from "@/src/constants/colors";
import { usePatchProduct, useRegistrationProduct } from "@/src/features/sell-car/registration/hooks";
import {
  asYYYYMMDD,
  formatRegistrationYearMonth,
  formatShortYear,
} from "@/src/features/sell-car/registration/originFormat";
import {
  OriginHistoryCountView,
  OriginInfoTabContent,
  OriginInfoTabs,
} from "@/src/features/sell-car/registration/OriginInfoSections";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

type SalesTypeKey = keyof typeof SALESTYPE;

const buildInfoRows = (data?: RegistrationProduct | null) => {
  if (!data) return [];
  const colorText =
    typeof data.color === "object" && data.color && "desc" in data.color
      ? String((data.color as { desc?: string }).desc ?? "")
      : typeof data.color === "string"
        ? data.color
        : "";

  return [
    { label: "차량명", value: data.truckName },
    { label: "차종", value: data.carType },
    { label: "제조사", value: data.manufacturerCategories?.name },
    { label: "형식", value: data.year ? `${formatShortYear(data.year)}년형` : undefined },
    { label: "연식", value: formatRegistrationYearMonth(data.firstRegistrationDate) },
    { label: "색상", value: colorText },
    {
      label: "검사 유효기간",
      value:
        data.inspectionInvalidStartDate && data.inspectionInvalidEndDate
          ? `${asYYYYMMDD(data.inspectionInvalidStartDate)}~${asYYYYMMDD(data.inspectionInvalidEndDate)}`
          : undefined,
    },
    { label: "차대번호", value: data.identificationNumber },
    { label: "차량용도", value: data.carUse },
  ].filter((row) => row.value);
};

export default function ProductOriginInfoScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type?: string }>();
  const { productFormData } = useRegistrationProduct(id);
  const { salesType: ctxSalesType } = useProductRegistration();
  const { patch, saving } = usePatchProduct();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const salesType = (type ?? ctxSalesType ?? PRODUCT_TYPE_DIRECT) as SalesTypeKey;
  const data = productFormData;
  const infoRows = useMemo(() => buildInfoRows(data), [data]);

  const onConfirm = useCallback(async () => {
    if (!data?.id) return;
    try {
      await patch({
        id: data.id,
        type: salesType,
        status: PRODUCT_STATUS_BEFORE_SALE,
      });
      router.replace({
        pathname: "/products/sales/model/[id]",
        params: { id: String(data.id) },
      });
    } catch {
      Alert.alert("오류", "다음 단계로 이동하지 못했습니다.");
    }
  }, [data?.id, patch, salesType]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={SALESTYPE[salesType]} />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-4 pt-[60px]">
          <Text className="text-[24px] font-bold text-gray800">
            {data?.ownerName ?? "소유자"}님의 차량정보
          </Text>

          <View
            className="my-6 self-start rounded-lg border-2 border-black px-4 py-3"
            style={{ backgroundColor: "#F5D300" }}
          >
            <Text className="text-[30px] font-semibold text-gray900">{data?.truckNumber}</Text>
          </View>

          <View className="rounded-lg bg-gray100 p-4">
            <Text className="mb-4 text-[20px] font-semibold text-gray800">차량 기본 정보</Text>
            {infoRows.map((row) => (
              <View key={row.label} className="mb-3 flex-row">
                <Text className="w-[110px] text-[16px] text-gray700">{row.label}</Text>
                <Text className="flex-1 text-[16px] font-semibold text-gray800">{String(row.value)}</Text>
              </View>
            ))}
          </View>

          {data?.lastOwnerInfo?.date ? (
            <View className="mt-4">
              <Text className="mb-3 text-[18px] font-semibold text-gray800">
                소유자 정보 (현출물자 이력)
              </Text>
              <View className="rounded-lg bg-gray100 p-4">
                <Text className="mb-1 font-semibold text-gray800">{data.lastOwnerInfo.date}</Text>
                <Text className="text-[14px] text-gray800">{data.lastOwnerInfo.content}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {data ? (
          <>
            <OriginHistoryCountView data={data} onSelectTab={setActiveTab} />
            <View className="h-2 bg-gray100" />
            <OriginInfoTabs activeTab={activeTab} onChange={setActiveTab} />
            <OriginInfoTabContent activeTab={activeTab} data={data} />
          </>
        ) : null}
      </ScrollView>

      <View className="border-t border-gray300 bg-white px-4 pb-4 pt-3">
        <Text className="mb-3 text-center text-[13px] text-gray700">
          차량 시세를 확인하기 위한 정보를 입력해주세요.
        </Text>
        <BasicButton
          name="필수 정보 입력하기"
          bgColor={appColors.primary}
          borderColor={appColors.primary}
          textColor={appColors.white}
          fontSize={16}
          height={48}
          fontWeight="bold"
          borderRadius={8}
          onClick={() => setConfirmOpen(true)}
        />
      </View>

      {confirmOpen ? (
        <View className="absolute inset-0 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white p-5">
            <Text className="text-[18px] font-bold text-gray900">차량 정보 확인</Text>
            <Text className="mt-3 text-[15px] text-gray700">
              등록원부 정보를 바탕으로 판매 등록을 진행합니다.
            </Text>
            <View className="mt-5 flex-row gap-2">
              <Pressable
                className="h-11 flex-1 items-center justify-center rounded-lg border border-gray300"
                onPress={() => setConfirmOpen(false)}
              >
                <Text>취소</Text>
              </Pressable>
              <Pressable
                className="h-11 flex-1 items-center justify-center rounded-lg bg-primary"
                onPress={() => {
                  setConfirmOpen(false);
                  onConfirm();
                }}
                disabled={saving}
              >
                <Text className="font-bold text-white">{saving ? "처리 중..." : "확인"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
