import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { showAppAlert } from '@/src/providers/appDialog';

import { signUpMember } from '@/src/api/members';
import { BasicButton } from '@/src/components/common/BasicButton';
import { appColors } from '@/src/constants/colors';
import {
  NAME_VALIDATION_LENGTH_MESSAGE,
  NAME_VALIDATION_MESSAGE,
} from '@/src/features/additional-services/validation';
import type { SignUpMemberType } from '@/src/features/auth/signup/types';
import { useAuth } from '@/src/hooks/useAuth';
import {
  PASSWORD_NOT_MATCH_MESSAGE,
  PASSWORD_VALIDATION_MESSAGE,
  validateMemberName,
  validateMemberPassword,
} from '@/src/lib/memberValidation';

function ProfileField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  showPassword,
  onToggleShow,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder: string;
  secureTextEntry?: boolean;
  showPassword?: boolean;
  onToggleShow?: () => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  const hasValue = value.length > 0;
  return (
    <View>
      <Text className="mb-2 text-[14px] font-semibold text-gray800">
        {label}
        <Text className="font-normal text-gray600"> (필수)</Text>
      </Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={appColors.gray600}
          className={`h-[48px] rounded-[10px] border px-3 text-[16px] text-gray900 ${
            onToggleShow ? 'pr-12' : ''
          } ${error ? 'border-danger' : 'border-gray300'} ${
            hasValue && !error ? 'bg-blueUnread' : 'bg-white'
          }`}
        />
        {onToggleShow ? (
          <Pressable
            onPress={onToggleShow}
            className="absolute bottom-0 right-0 top-0 justify-center px-3">
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={appColors.gray600}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="mt-1 text-[13px] text-danger">{error}</Text> : null}
    </View>
  );
}

type SignUpProfileFormProps = {
  memberType: SignUpMemberType;
  phoneNumber: string;
  marketing: boolean;
  dealerTerms: boolean;
  onSuccess: () => void;
};

export function SignUpProfileForm({
  memberType,
  phoneNumber,
  marketing,
  dealerTerms,
  onSuccess,
}: SignUpProfileFormProps) {
  const { loginWithToken } = useAuth();
  const isDealer = memberType === 'DEALER';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dealerEmployeeNumber, setDealerEmployeeNumber] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [dealerLicenseError, setDealerLicenseError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateNameField = (value: string) => {
    if (!validateMemberName(value)) {
      setNameError(NAME_VALIDATION_MESSAGE);
      return false;
    }
    if (value.length > 20) {
      setNameError(NAME_VALIDATION_LENGTH_MESSAGE);
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePasswordField = (value: string) => {
    const result = validateMemberPassword(value);
    if (!result.isValid) {
      setPasswordError(result.errorMessage || PASSWORD_VALIDATION_MESSAGE);
      return false;
    }
    setPasswordError('');
    return true;
  };

  const canSubmit = useMemo(() => {
    const dealerOk = !isDealer || dealerEmployeeNumber.trim().length > 0;
    return (
      name.trim() &&
      password &&
      confirmPassword &&
      !nameError &&
      !passwordError &&
      !confirmError &&
      !dealerLicenseError &&
      dealerOk
    );
  }, [
    name,
    password,
    confirmPassword,
    nameError,
    passwordError,
    confirmError,
    dealerLicenseError,
    dealerEmployeeNumber,
    isDealer,
  ]);

  const handleSubmit = async () => {
    if (!validateNameField(name) || !validatePasswordField(password)) {
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(PASSWORD_NOT_MATCH_MESSAGE);
      return;
    }
    if (isDealer && !dealerEmployeeNumber.trim()) {
      setDealerLicenseError('매매사원증 번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await signUpMember({
        dealerTerms,
        marketing,
        phoneNumber,
        name: name.trim(),
        password,
        referralCode: '',
        ...(isDealer
          ? {
              dealerEmployeeNumber: dealerEmployeeNumber.trim(),
              type: 'DEALER' as const,
            }
          : {}),
      });

      const accessToken = response.authTokenInfo?.accessToken;
      if (!accessToken) {
        throw new Error('로그인 토큰을 받지 못했습니다.');
      }

      await loginWithToken(accessToken);
      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : '회원가입에 실패했습니다. 다시 시도해주세요.';
      showAppAlert({ title: '회원가입 실패', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1">
      <Text className="pt-2 text-[16px] font-semibold text-primary">마지막 단계 입니다!</Text>
      <Text className="mb-8 mt-2 text-[22px] font-bold text-gray800">정보를 입력해주세요</Text>

      <View className="gap-8">
        <ProfileField
          label="이름"
          value={name}
          onChangeText={(value) => {
            setName(value);
            validateNameField(value);
          }}
          error={nameError}
          placeholder="이름을 입력해주세요."
        />

        <ProfileField
          label="비밀번호"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            validatePasswordField(value);
            if (confirmPassword && confirmPassword !== value) {
              setConfirmError(PASSWORD_NOT_MATCH_MESSAGE);
            } else {
              setConfirmError('');
            }
          }}
          error={passwordError}
          placeholder="영문, 숫자, 특수문자 8~20자리"
          secureTextEntry={!showPassword}
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
        />

        <ProfileField
          label="비밀번호 확인"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            if (password && value !== password) {
              setConfirmError(PASSWORD_NOT_MATCH_MESSAGE);
            } else {
              setConfirmError('');
            }
          }}
          error={confirmError}
          placeholder="비밀번호를 한번 더 입력해주세요."
          secureTextEntry={!showConfirmPassword}
          showPassword={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
        />

        {isDealer ? (
          <ProfileField
            label="매매사원증 번호"
            value={dealerEmployeeNumber}
            onChangeText={(value) => {
              setDealerEmployeeNumber(value);
              setDealerLicenseError('');
            }}
            error={dealerLicenseError}
            placeholder="매매사원증 번호를 입력해주세요."
          />
        ) : null}
      </View>

      <View className="mt-auto pt-6">
        {isSubmitting ? (
          <View className="h-12 items-center justify-center">
            <ActivityIndicator color={appColors.primary} />
          </View>
        ) : (
          <BasicButton
            name="완료"
            bgColor={canSubmit ? appColors.primary : appColors.gray300}
            borderColor={canSubmit ? appColors.primary : appColors.gray300}
            textColor={canSubmit ? appColors.white : appColors.gray600}
            borderRadius={10}
            onClick={handleSubmit}
          />
        )}
      </View>
    </View>
  );
}
