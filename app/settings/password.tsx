import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { checkCurrentPassword, patchMember } from '@/src/api/members';
import { Screen } from '@/src/components/common/Screen';
import { appColors } from '@/src/constants/colors';
import { RegistrationHeader } from '@/src/features/sell-car/registration/RegistrationHeader';
import { useScreenInsets } from '@/src/hooks/useScreenInsets';
import {
  PASSWORD_NOT_MATCH_MESSAGE,
  PASSWORD_VALIDATION_MESSAGE,
  validateMemberPassword,
} from '@/src/lib/memberValidation';

function PasswordField({
  label,
  value,
  onChangeText,
  error,
  showPassword,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  showPassword: boolean;
  onToggleShow: () => void;
}) {
  return (
    <View>
      <Text className="mb-2 text-[14px] font-semibold text-gray800">{label}</Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholder={label}
          placeholderTextColor={appColors.gray600}
          className={`h-[48px] rounded-[10px] border px-3 pr-12 text-[16px] text-gray900 ${
            error ? 'border-danger' : 'border-gray300'
          }`}
        />
        <Pressable onPress={onToggleShow} className="absolute bottom-0 right-0 top-0 justify-center px-3">
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={appColors.gray600}
          />
        </Pressable>
      </View>
      {error ? <Text className="mt-1 text-[13px] text-danger">{error}</Text> : null}
    </View>
  );
}

export default function PasswordChangeScreen() {
  const { listPaddingBottom, bottom } = useScreenInsets();
  const [step, setStep] = useState<'check' | 'change'>('check');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCheck = useMemo(
    () => currentPassword.length > 0 && !currentError,
    [currentPassword, currentError],
  );

  const canChange = useMemo(
    () =>
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      !newError &&
      !confirmError,
    [newPassword, confirmPassword, newError, confirmError],
  );

  const onCheckPassword = async () => {
    setIsSubmitting(true);
    setCurrentError('');
    try {
      await checkCurrentPassword(currentPassword);
      setStep('change');
    } catch (error: any) {
      setCurrentError(error?.message ?? PASSWORD_NOT_MATCH_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangeNewPassword = (value: string) => {
    setNewPassword(value);
    if (!value) {
      setNewError('');
      return;
    }
    const result = validateMemberPassword(value);
    setNewError(result.isValid ? '' : result.errorMessage);
    if (confirmPassword) {
      setConfirmError(
        confirmPassword === value ? '' : PASSWORD_NOT_MATCH_MESSAGE,
      );
    }
  };

  const onChangeConfirmPassword = (value: string) => {
    setConfirmPassword(value);
    setConfirmError(value === newPassword ? '' : PASSWORD_NOT_MATCH_MESSAGE);
  };

  const onSubmitChange = async () => {
    const validation = validateMemberPassword(newPassword);
    if (!validation.isValid) {
      setNewError(validation.errorMessage || PASSWORD_VALIDATION_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError(PASSWORD_NOT_MATCH_MESSAGE);
      return;
    }
    setIsSubmitting(true);
    try {
      await patchMember({ newPassword });
      Alert.alert('변경 완료', '비밀번호를 변경했어요.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      setNewError(error?.message ?? PASSWORD_NOT_MATCH_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="비밀번호 변경" />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 80 }}>
        {step === 'check' ? (
          <PasswordField
            label="현재 비밀번호"
            value={currentPassword}
            onChangeText={(value) => {
              setCurrentPassword(value);
              setCurrentError('');
            }}
            error={currentError}
            showPassword={showCurrent}
            onToggleShow={() => setShowCurrent((prev) => !prev)}
          />
        ) : (
          <View className="gap-6">
            <PasswordField
              label="새 비밀번호"
              value={newPassword}
              onChangeText={onChangeNewPassword}
              error={newError}
              showPassword={showNew}
              onToggleShow={() => setShowNew((prev) => !prev)}
            />
            <PasswordField
              label="새 비밀번호 확인"
              value={confirmPassword}
              onChangeText={onChangeConfirmPassword}
              error={confirmError}
              showPassword={showConfirm}
              onToggleShow={() => setShowConfirm((prev) => !prev)}
            />
          </View>
        )}
      </ScrollView>
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray300 bg-white px-4 pt-3"
        style={{ paddingBottom: Math.max(bottom, 12) }}>
        <Pressable
          onPress={step === 'check' ? onCheckPassword : onSubmitChange}
          disabled={
            isSubmitting || (step === 'check' ? !canCheck : !canChange)
          }
          className={`h-[52px] items-center justify-center rounded-[10px] ${
            isSubmitting || (step === 'check' ? !canCheck : !canChange)
              ? 'bg-gray300'
              : 'bg-primary'
          }`}>
          <Text className="text-[16px] font-bold text-white">변경하기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
