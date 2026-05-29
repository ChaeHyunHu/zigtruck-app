import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import type { ContractInfo } from "@/src/features/contract/types";

export function ContractFieldLabel({
  title,
  required,
}: {
  title: string;
  required?: boolean;
}) {
  return (
    <Text className="mb-2 text-[16px] font-medium text-gray800">
      {title}
      {required ? <Text className="font-normal text-red-500">(필수)</Text> : null}
    </Text>
  );
}

export function ContractUnderlineInput({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  maxLength,
  error,
  readOnly,
  onPress,
  suffix,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "decimal-pad";
  maxLength?: number;
  error?: string;
  readOnly?: boolean;
  onPress?: () => void;
  suffix?: React.ReactNode;
}) {
  const content = (
    <View className="border-b border-gray300 pb-2">
      <ContractFieldLabel title={label} required={required} />
      <View className="min-h-[40px] flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={appColors.gray500}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!readOnly}
          className="flex-1 text-[18px] text-gray900"
        />
        {suffix}
      </View>
      {error ? <Text className="mt-1 text-[13px] text-red-500">{error}</Text> : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

export function ContractChevronSuffix() {
  return <Ionicons name="chevron-forward" size={18} color={appColors.gray600} />;
}

export function ContractSignatureBox({
  signatureUrl,
  onPress,
}: {
  signatureUrl?: string;
  onPress: () => void;
}) {
  return (
    <View>
      <ContractFieldLabel title="서명" required />
      <Text className="mb-3 text-[14px] text-gray600">
        * 계약 내용에 이상이 없음을 확인 후 서명합니다.
      </Text>
      <Pressable
        onPress={onPress}
        className="h-[85px] items-center justify-center overflow-hidden rounded-lg border border-gray300 bg-gray100 px-2"
      >
        {signatureUrl ? (
          <Image
            source={{ uri: signatureUrl }}
            style={{ width: "100%", height: 72 }}
            contentFit="contain"
          />
        ) : (
          <Text className="text-[16px] text-gray600">서명하기</Text>
        )}
      </Pressable>
    </View>
  );
}

export function ContractVehicleSummary({ contract }: { contract: ContractInfo }) {
  const rows = [
    ["차량번호", contract.carNumber],
    ["차종", contract.carType],
    ["차량용도", contract.carUse],
    ["연식", contract.year],
    ["원동기 형식", contract.motorType],
    ["차대번호", contract.identificationNumber],
  ] as const;

  return (
    <View className="rounded-lg bg-gray100 p-4">
      {rows.map(([label, value]) => (
        <View key={label} className="mb-3 flex-row">
          <Text className="w-[100px] text-[14px] text-gray600">{label}</Text>
          <Text className="flex-1 text-[14px] font-semibold text-gray800">{value || "-"}</Text>
        </View>
      ))}
    </View>
  );
}
