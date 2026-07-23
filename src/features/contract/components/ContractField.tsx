import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useRef } from "react";
import { Keyboard, Platform, Pressable, Text, TextInput, View } from "react-native";

import { useKeyboardAwareScroll } from "@/src/components/common/KeyboardAwareScrollView";
import { appColors } from "@/src/constants/colors";
import type { ContractInfo } from "@/src/features/contract/types";

const KEYBOARD_OPEN_DELAY_MS = Platform.OS === "ios" ? 350 : 400;

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
  keyboardType?:
    | "default"
    | "numeric"
    | "phone-pad"
    | "decimal-pad"
    | "numbers-and-punctuation";
  maxLength?: number;
  error?: string;
  readOnly?: boolean;
  onPress?: () => void;
  suffix?: React.ReactNode;
}) {
  const inputBoxRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardAware = useKeyboardAwareScroll();
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 시트를 여는 필드(onPress)나 읽기 전용이 아닌 경우에만 라인 탭으로 포커스
  const isEditable = !readOnly && !onPress;

  const handleFocus = useCallback(() => {
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    const node = inputBoxRef.current;
    if (keyboardAware?.isKeyboardVisible) {
      keyboardAware.ensureInputVisible(node);
    } else {
      focusTimerRef.current = setTimeout(() => {
        keyboardAware?.ensureInputVisible(node);
      }, KEYBOARD_OPEN_DELAY_MS);
    }
  }, [keyboardAware]);

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
      if (keyboardAware?.isKeyboardVisible) {
        keyboardAware.ensureInputVisible(inputBoxRef.current);
      }
    },
    [keyboardAware, onChangeText],
  );

  const box = (
    <View className="border-b border-gray300 pb-2">
      <ContractFieldLabel title={label} required={required} />
      <View className="min-h-[40px] flex-row items-center">
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={appColors.gray500}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!readOnly}
          pointerEvents={readOnly ? "none" : "auto"}
          className="flex-1 text-[18px] text-gray900"
        />
        {suffix}
      </View>
    </View>
  );

  const content = (
    <View ref={inputBoxRef} collapsable={false}>
      {isEditable ? (
        // 라벨/빈 영역 등 라인 어디를 눌러도 입력에 포커스되도록 감싼다.
        <Pressable onPress={() => inputRef.current?.focus()}>{box}</Pressable>
      ) : (
        box
      )}
      {error ? (
        <Text className="mt-1.5 text-[13px] text-red-500">{error}</Text>
      ) : null}
    </View>
  );

  if (onPress) {
    // 날짜/주소 등 시트를 여는 필드: 눌렀을 때 키보드를 먼저 내린다.
    return (
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          onPress();
        }}
      >
        {content}
      </Pressable>
    );
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
