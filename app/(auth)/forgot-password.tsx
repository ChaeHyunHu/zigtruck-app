import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { sendTemporaryPassword } from "@/src/api/members";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { IMAGE_BASE_URL } from "@/src/constants/url";

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isDisabled = useMemo(
    () => !phoneNumber.trim() || isSubmitting,
    [phoneNumber, isSubmitting],
  );

  const handleSubmit = useCallback(async () => {
    if (isDisabled) return;

    const normalized = phoneNumber.replace(/\D/g, "");
    if (normalized.length < 10) {
      setErrorMessage("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    Keyboard.dismiss();

    try {
      await sendTemporaryPassword(normalized);
      setShowSuccessModal(true);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const code = err?.code;
      if (
        code === "MEMBERS_PHONE_NUMBER_NOT_FOUND" ||
        code === "FAIL_SEND_PHONE_MESSAGE"
      ) {
        setErrorMessage(err?.message ?? "등록되지 않은 휴대폰 번호입니다.");
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "임시 비밀번호 발송에 실패했습니다.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isDisabled, phoneNumber]);

  return (
    <Screen className="flex-1 bg-gray100">
      <View className="h-14 flex-row items-center bg-white px-4">
        <Pressable className="py-1 pr-2" onPress={() => router.back()}>
          <Text className="text-[30px] leading-[30px] text-gray900">‹</Text>
        </Pressable>
        <Text className="text-[20px] font-bold text-gray900">비밀번호 찾기</Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">
          <View className="px-5 pt-[30px]">
            <Image
              source={{ uri: `${IMAGE_BASE_URL}/logo_gra.png` }}
              className="mb-3.5 h-[30px] w-[76px]"
              contentFit="contain"
            />
            <Text className="text-[36px] font-extrabold leading-[50px] text-gray900">
              화물차 거래의
            </Text>
            <Text className="text-[36px] font-extrabold leading-[50px] text-gray900">
              새로운 기준
            </Text>
          </View>

          <View className="flex-1" />

          <View className="px-4 pb-10">
            <ForgotPasswordPhoneInput
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text.replace(/\D/g, "").slice(0, 11));
                setErrorMessage("");
              }}
              onSubmitEditing={handleSubmit}
            />
            {errorMessage ? (
              <Text className="mb-3 mt-2 text-[13px] text-danger">{errorMessage}</Text>
            ) : (
              <View className="mb-3 h-5" />
            )}

            <Pressable
              className="h-12 items-center justify-center rounded-xl"
              style={{
                backgroundColor: isDisabled ? "#D9D9D9" : appColors.primary,
              }}
              onPress={handleSubmit}
              disabled={isDisabled}
            >
              {isSubmitting ? (
                <ActivityIndicator color={appColors.white} />
              ) : (
                <Text
                  className="text-[16px] font-semibold"
                  style={{ color: isDisabled ? "#9E9E9E" : appColors.white }}
                >
                  임시 비밀번호 발송
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <ConfirmDialog
        visible={showSuccessModal}
        title="임시 비밀번호 발송 완료"
        leftLabel="닫기"
        rightLabel="로그인하기"
        onLeft={() => setShowSuccessModal(false)}
        onRight={() => {
          setShowSuccessModal(false);
          router.replace("/(auth)/login");
        }}
      >
        <Text className="text-center text-[15px] leading-[22px] text-gray700">
          임시 비밀번호를 발송했습니다.{"\n"}
          1시간 이내로 임시 비밀번호로{"\n"}
          로그인 후 비밀번호를 변경해주세요.
        </Text>
      </ConfirmDialog>
    </Screen>
  );
}

function ForgotPasswordPhoneInput({
  value,
  onChangeText,
  onSubmitEditing,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      keyboardType="number-pad"
      returnKeyType="done"
      placeholder="휴대폰 번호를 입력하세요."
      placeholderTextColor={appColors.gray500}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        height: 52,
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 4,
        fontSize: 18,
        lineHeight: 22,
        color: appColors.gray900,
        borderBottomWidth: 1,
        borderBottomColor: isFocused ? appColors.primary : appColors.gray300,
        backgroundColor: "transparent",
        textAlignVertical: "center",
        ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
      }}
    />
  );
}
