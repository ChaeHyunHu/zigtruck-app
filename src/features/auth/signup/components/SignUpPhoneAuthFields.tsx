import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { confirmPhoneAuthCode, requestPhoneAuthCode } from '@/src/api/members';
import { appColors } from '@/src/constants/colors';
import { PHONE_NUMBER_VALIDATION_MESSAGE } from '@/src/features/additional-services/validation';
import { validateDigitsOnly } from '@/src/lib/memberValidation';

const AUTH_TIMER_SECONDS = 180;

type SignUpPhoneAuthFieldsProps = {
  phoneNumber: string;
  authNumber: string;
  isVerified: boolean;
  onChangePhoneNumber: (value: string) => void;
  onChangeAuthNumber: (value: string) => void;
  onVerifiedChange: (verified: boolean) => void;
};

export function SignUpPhoneAuthFields({
  phoneNumber,
  authNumber,
  isVerified,
  onChangePhoneNumber,
  onChangeAuthNumber,
  onVerifiedChange,
}: SignUpPhoneAuthFieldsProps) {
  const [phoneError, setPhoneError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const validatePhone = useCallback((value: string) => {
    if (!validateDigitsOnly(value)) {
      setPhoneError(PHONE_NUMBER_VALIDATION_MESSAGE);
      return false;
    }
    setPhoneError('');
    return true;
  }, []);

  const canRequestCode =
    phoneNumber.length >= 10 && !phoneError && !isVerified && !isSending;
  const canConfirmCode = isCodeSent && authNumber.length > 0 && !isVerified && !isConfirming;

  const onRequestCode = async () => {
    if (!validatePhone(phoneNumber)) return;
    setIsSending(true);
    setAuthError('');
    try {
      await requestPhoneAuthCode(phoneNumber);
      setIsCodeSent(true);
      onVerifiedChange(false);
      setSecondsLeft(AUTH_TIMER_SECONDS);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : '인증번호 요청에 실패했습니다.';
      setPhoneError(message);
    } finally {
      setIsSending(false);
    }
  };

  const onConfirmCode = async () => {
    if (!validateDigitsOnly(authNumber)) {
      setAuthError(PHONE_NUMBER_VALIDATION_MESSAGE);
      return;
    }
    setIsConfirming(true);
    setAuthError('');
    try {
      await confirmPhoneAuthCode(phoneNumber, authNumber);
      onVerifiedChange(true);
      setIsCodeSent(false);
      setSecondsLeft(0);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : '인증번호가 올바르지 않습니다.';
      setAuthError(message);
    } finally {
      setIsConfirming(false);
    }
  };

  const timerLabel =
    secondsLeft > 0
      ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
      : '';

  return (
    <View className="gap-6">
      <View>
        <Text className="mb-2 text-[14px] font-semibold text-gray800">휴대폰 번호</Text>
        <View className="flex-row items-end gap-2">
          <TextInput
            value={phoneNumber}
            onChangeText={(value) => {
              const digits = value.replace(/\D/g, '');
              onChangePhoneNumber(digits);
              onVerifiedChange(false);
              setIsCodeSent(false);
              validatePhone(digits);
            }}
            keyboardType="number-pad"
            maxLength={11}
            placeholder="'-'를 제외 숫자만 입력"
            placeholderTextColor={appColors.gray600}
            editable={!isVerified}
            className="h-[48px] flex-1 rounded-[10px] border border-gray300 px-3 text-[16px] text-gray900"
          />
          <Pressable
            onPress={onRequestCode}
            disabled={!canRequestCode}
            className={`h-[48px] min-w-[88px] items-center justify-center rounded-[10px] ${
              canRequestCode ? 'bg-gray300' : 'bg-gray300'
            }`}
            style={{ opacity: canRequestCode ? 1 : 0.55 }}>
            {isSending ? (
              <ActivityIndicator color={appColors.gray700} />
            ) : (
              <Text className="text-[14px] font-semibold text-gray800">
                {isCodeSent ? '재전송' : '인증요청'}
              </Text>
            )}
          </Pressable>
        </View>
        {phoneError ? <Text className="mt-1 text-[13px] text-danger">{phoneError}</Text> : null}
      </View>

      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[14px] font-semibold text-gray800">인증번호</Text>
          {timerLabel ? (
            <Text className="text-[13px] font-semibold text-primary">{timerLabel}</Text>
          ) : null}
        </View>
        <View className="flex-row items-end gap-2">
          <TextInput
            value={authNumber}
            onChangeText={(value) => {
              onChangeAuthNumber(value.replace(/\D/g, ''));
              setAuthError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="인증번호 입력"
            placeholderTextColor={appColors.gray600}
            editable={isCodeSent && !isVerified}
            className="h-[48px] flex-1 rounded-[10px] border border-gray300 px-3 text-[16px] text-gray900"
          />
          <Pressable
            onPress={onConfirmCode}
            disabled={!canConfirmCode}
            className="h-[48px] min-w-[88px] items-center justify-center rounded-[10px] bg-gray300"
            style={{ opacity: canConfirmCode ? 1 : 0.55 }}>
            {isConfirming ? (
              <ActivityIndicator color={appColors.gray700} />
            ) : (
              <Text className="text-[14px] font-semibold text-gray800">
                {isVerified ? '인증완료' : '인증하기'}
              </Text>
            )}
          </Pressable>
        </View>
        {authError ? <Text className="mt-1 text-[13px] text-danger">{authError}</Text> : null}
      </View>
    </View>
  );
}
