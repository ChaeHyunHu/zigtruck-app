import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheet, BottomSheetHeader } from "@/src/components/common/BottomSheet";

import { appColors } from "@/src/constants/colors";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { useLoanCalculator } from "@/src/hooks/useLoanCalculator";

import { LOAN_TERM_OPTIONS, PUBLIC_IMAGES } from "../constants";

const benefits = [
  { icon: "card-outline" as const, text: "차량대금 전액 대출이 가능해요" },
  { icon: "checkmark-circle" as const, text: "신용점수에 영향이 가지 않아요" },
  { icon: "headset-outline" as const, text: "개인 맞춤으로 대출 상담이 가능해요" },
  { icon: "document-text-outline" as const, text: "무방문, 간편하게 서류 접수하세요" },
];

type CapitalGuideViewProps = {
  price?: number;
  /** 상품 상세 바텀시트 등 팝업 레이아웃 */
  isPopup?: boolean;
};

const TERM_OPTION_HEIGHT = 52;
const TERM_SHEET_HEADER_HEIGHT = 56;

export function CapitalGuideView({ price = 5000, isPopup = false }: CapitalGuideViewProps) {
  const insets = useSafeAreaInsets();
  const { loanCalculatorState, handleInputChange, handleInputBlur } = useLoanCalculator(price);
  const [termPickerOpen, setTermPickerOpen] = useState(false);
  const termSheetHeight =
    TERM_SHEET_HEADER_HEIGHT +
    LOAN_TERM_OPTIONS.length * TERM_OPTION_HEIGHT +
    Math.max(insets.bottom, 16);

  return (
    <View className={isPopup ? "" : "border-b-8 border-gray200"}>
      <View className="items-center px-4 pt-10">
        <Text className="text-center text-[24px] font-bold text-gray900">
          중고화물차{"\n"}저금리 대출
        </Text>

        <Image
          source={{ uri: PUBLIC_IMAGES.capitalCounsel1 }}
          style={{ width: 178, height: 96, marginTop: 24, marginBottom: 16 }}
          contentFit="contain"
        />

        <View className="mb-6 w-full max-w-[228px] gap-3.5">
          {benefits.map((item) => (
            <View key={item.text} className="flex-row items-center gap-2">
              <Ionicons name={item.icon} size={18} color={appColors.primary} />
              <Text className="flex-1 text-[14px] text-gray800">{item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mx-4 mb-[30px] rounded-xl bg-gray200 p-6">
        <View className="mb-3 flex-row items-center">
          <Ionicons name="trending-down-outline" size={16} color={appColors.primary} />
          <Text className="ml-1 text-[12px] font-semibold text-primary">
            최저 금리 6.1% 기준
          </Text>
        </View>

        <View className="flex-row flex-wrap items-center">
          <TextInput
            className="min-w-[80px] border-b border-gray400 px-1 py-1 text-[18px] font-semibold text-gray900"
            value={
              loanCalculatorState.principal
                ? formatNumberWithComma(loanCalculatorState.principal)
                : ""
            }
            onChangeText={(text) => handleInputChange("principal", text)}
            onBlur={() => handleInputBlur("principal")}
            keyboardType="number-pad"
            maxLength={15}
          />
          <Text className="mx-1 text-[18px] text-gray900">원 차량에</Text>
        </View>

        <View className="mt-2 flex-row flex-wrap items-center">
          <Text className="text-[18px] text-gray900">할부 기간</Text>
          <Pressable
            className="mx-2 min-w-[90px] flex-row items-center border-b border-gray400 px-1 py-1"
            onPress={() => setTermPickerOpen(true)}
          >
            <Text className="text-[18px] font-semibold text-gray900">
              {loanCalculatorState.loanTerm}
            </Text>
            <Text className="ml-1 text-[18px] text-gray900">개월</Text>
            <Ionicons name="chevron-down" size={18} color={appColors.gray800} />
          </Pressable>
          <Text className="text-[18px] text-gray900">동안</Text>
        </View>

        <View className="mt-2 flex-row flex-wrap items-center">
          <TextInput
            className="min-w-[56px] border-b border-gray400 px-1 py-1 text-[18px] font-semibold text-gray900"
            value={loanCalculatorState.interestRate}
            onChangeText={(text) => handleInputChange("interestRate", text)}
            onBlur={() => handleInputBlur("interestRate")}
            keyboardType="decimal-pad"
            maxLength={5}
          />
          <Text className="mx-1 text-[18px] text-gray900">% 금리 적용 시</Text>
        </View>

        <View className="mt-4 border-t border-gray300 pt-4">
          <Text className="text-[16px] font-semibold text-primary">예상 금액</Text>
          <Text className="mt-2 text-[30px] font-semibold leading-9 text-gray900">
            월 {formatNumberWithComma(loanCalculatorState.monthlyPayment)}원
          </Text>
        </View>
      </View>

      <View className={`gap-5 px-4 ${isPopup ? "mb-14" : "mb-[30px]"}`}>
        <Text className="text-center text-[12px] font-semibold text-gray800">
          실제 금리는 개인 신용도에 따라 달라질 수 있습니다.
        </Text>
        <Text className="text-center text-[10px] leading-[14px] text-gray600">
          본 상담 과정에서 대출 한도 및 적합한 상품을 확인하기 위해 최소한의 개인정보(주민등록번호
          포함)를 요청드릴 수 있습니다. 고객님의 개인정보는 대출 상담 목적으로만 사용되며, 관련
          법규에 따라 안전하게 보호됩니다.
        </Text>
      </View>

      <BottomSheet
        visible={termPickerOpen}
        onClose={() => setTermPickerOpen(false)}
        sheetHeight={termSheetHeight}
      >
        <View className="flex-1 bg-white">
          <BottomSheetHeader
            title="할부 기간"
            onClose={() => setTermPickerOpen(false)}
            bordered={false}
          />
          {LOAN_TERM_OPTIONS.map((option) => (
            <Pressable
              key={option}
              className="h-[52px] justify-center border-b border-gray200 px-4"
              onPress={() => {
                handleInputChange("loanTerm", option);
                setTermPickerOpen(false);
              }}
            >
              <Text className="text-[16px] text-gray900">{option}개월</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
