import React from "react";
import { Text, TextInput, View } from "react-native";

import { formatNumberWithComma } from "@/src/features/home/utils";
import { useLoanCalculator } from "@/src/hooks/useLoanCalculator";

type LoanCalculatorProps = {
  price?: number | null;
};

function LoanInputRow({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  suffix,
  maxLength,
  keyboardType = "number-pad",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  suffix: string;
  maxLength?: number;
  keyboardType?: "number-pad" | "decimal-pad";
}) {
  return (
    <View className="flex-row items-center border-b border-gray300 py-4">
      <Text className="min-w-[88px] text-[16px] font-medium text-gray800">{label}</Text>
      <TextInput
        className="flex-1 text-right text-[16px] text-gray900"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#bdbdbd"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
      <Text className="ml-2 min-w-[28px] text-right text-[16px] text-gray800">{suffix}</Text>
    </View>
  );
}

export function LoanCalculator({ price }: LoanCalculatorProps) {
  const { loanCalculatorState, handleInputChange, handleInputBlur } = useLoanCalculator(
    price ?? 0,
  );

  return (
    <View>
      <LoanInputRow
        label="대출 금액"
        value={
          loanCalculatorState.principal
            ? formatNumberWithComma(loanCalculatorState.principal)
            : ""
        }
        onChangeText={(text) => handleInputChange("principal", text)}
        onBlur={() => handleInputBlur("principal")}
        placeholder="예시) 50,000,000"
        suffix="원"
        maxLength={15}
      />
      <LoanInputRow
        label="할부 기간"
        value={loanCalculatorState.loanTerm}
        onChangeText={(text) => handleInputChange("loanTerm", text)}
        onBlur={() => handleInputBlur("loanTerm")}
        placeholder="예시) 60"
        suffix="개월"
        maxLength={2}
      />
      <LoanInputRow
        label="할부 금리"
        value={loanCalculatorState.interestRate}
        onChangeText={(text) => handleInputChange("interestRate", text)}
        onBlur={() => handleInputBlur("interestRate")}
        placeholder="예시) 7.6"
        suffix="%"
        maxLength={5}
        keyboardType="decimal-pad"
      />
      <View className="flex-row items-center justify-between py-5">
        <Text className="text-[16px] font-semibold text-gray800">월 할부금</Text>
        <Text className="text-[18px] font-bold text-gray900">
          {formatNumberWithComma(loanCalculatorState.monthlyPayment)}원
        </Text>
      </View>
    </View>
  );
}
