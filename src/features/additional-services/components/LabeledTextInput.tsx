import React, { useCallback, useRef } from "react";
import { Platform, Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

import { useKeyboardAwareScroll } from "@/src/components/common/KeyboardAwareScrollView";
import { appColors } from "@/src/constants/colors";

type LabeledTextInputProps = {
  label: string;
  /** true면 라벨 행 미표시 (범위 입력 등) */
  hideLabel?: boolean;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  unit?: string;
  error?: boolean;
  errorMessage?: string;
  keyboardType?: "default" | "number-pad" | "phone-pad" | "decimal-pad";
  readOnly?: boolean;
  onPress?: () => void;
  onBlur?: () => void;
  onFocus?: TextInputProps["onFocus"];
  suffix?: React.ReactNode;
};

const KEYBOARD_OPEN_DELAY_MS = Platform.OS === "ios" ? 350 : 400;

export function LabeledTextInput({
  label,
  hideLabel = false,
  value,
  onChangeText,
  placeholder,
  required,
  unit,
  error,
  errorMessage,
  keyboardType = "default",
  readOnly,
  onPress,
  onBlur,
  onFocus,
  suffix,
}: LabeledTextInputProps) {
  const inputBoxRef = useRef<View>(null);
  const keyboardAware = useKeyboardAwareScroll();
  const focusScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealInputIfNeeded = useCallback(() => {
    keyboardAware?.ensureInputVisible(inputBoxRef.current);
  }, [keyboardAware]);

  const handleFocus = useCallback<NonNullable<TextInputProps["onFocus"]>>(
    (event) => {
      if (focusScrollTimerRef.current) {
        clearTimeout(focusScrollTimerRef.current);
      }

      const node = inputBoxRef.current;

      if (keyboardAware?.isKeyboardVisible) {
        revealInputIfNeeded();
      } else {
        focusScrollTimerRef.current = setTimeout(() => {
          keyboardAware?.ensureInputVisible(node);
        }, KEYBOARD_OPEN_DELAY_MS);
      }

      onFocus?.(event);
    },
    [keyboardAware, onFocus, revealInputIfNeeded],
  );

  const handleBlur = useCallback(() => {
    if (focusScrollTimerRef.current) {
      clearTimeout(focusScrollTimerRef.current);
      focusScrollTimerRef.current = null;
    }
    onBlur?.();
  }, [onBlur]);

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
      if (keyboardAware?.isKeyboardVisible) {
        revealInputIfNeeded();
      }
    },
    [keyboardAware, onChangeText, revealInputIfNeeded],
  );

  const trailing =
    unit != null && unit !== "" ? (
      <Text className="ml-2 text-[16px] font-medium text-gray800">{unit}</Text>
    ) : (
      suffix
    );

  const content = (
    <View>
      {!hideLabel ? (
        <Text className="mb-2 text-[14px] font-semibold text-gray800">
          {label}
          {required ? (
            <Text className="font-normal text-danger"> (필수)</Text>
          ) : null}
        </Text>
      ) : null}
      <View
        ref={inputBoxRef}
        collapsable={false}
        className={`min-h-[48px] flex-row items-center rounded-lg border px-3 ${
          error ? "border-danger" : "border-gray300"
        } bg-white`}
      >
        <TextInput
          className="flex-1 py-3 text-[16px] text-gray900"
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={appColors.gray600}
          keyboardType={keyboardType}
          editable={!readOnly}
          pointerEvents={readOnly ? "none" : "auto"}
        />
        {trailing}
      </View>
      {error && errorMessage ? (
        <Text className="mt-1 text-[12px] text-danger">{errorMessage}</Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
