import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { BasicButton } from '@/src/components/common/BasicButton';
import { Screen } from '@/src/components/common/Screen';
import { appColors } from '@/src/constants/colors';
import { SignUpPhoneAuthFields } from '@/src/features/auth/signup/components/SignUpPhoneAuthFields';
import { SignUpProfileForm } from '@/src/features/auth/signup/components/SignUpProfileForm';
import {
  SignUpTermsSection,
  isSignUpStepOneComplete,
} from '@/src/features/auth/signup/components/SignUpTermsSection';
import type { SignUpAgreementState, SignUpMemberType } from '@/src/features/auth/signup/types';
import { RegistrationHeader } from '@/src/features/sell-car/registration/RegistrationHeader';
import { useScreenInsets } from '@/src/hooks/useScreenInsets';

const INITIAL_AGREEMENTS: SignUpAgreementState = {
  terms: false,
  personalInfo: false,
  marketing: false,
  dealerTerms: false,
};

type SignUpScreenProps = {
  memberType: SignUpMemberType;
};

export function SignUpScreen({ memberType }: SignUpScreenProps) {
  const { listPaddingBottom } = useScreenInsets();
  const isDealer = memberType === 'DEALER';
  const [step, setStep] = useState<1 | 2>(1);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [agreements, setAgreements] = useState<SignUpAgreementState>(INITIAL_AGREEMENTS);

  const canGoNext = useMemo(
    () => isSignUpStepOneComplete(agreements, isPhoneVerified, isDealer),
    [agreements, isPhoneVerified, isDealer],
  );

  const goToSuccess = () => {
    router.replace({
      pathname: '/(auth)/signup-success',
      params: { type: memberType },
    });
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader
        title="전화번호로 회원가입"
        onBack={
          step === 2
            ? () => setStep(1)
            : undefined
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 1 ? (
          <>
            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: listPaddingBottom + 88,
              }}>
              <Text className="pt-6 text-[22px] font-bold text-gray800">
                휴대폰 번호를 인증해주세요
              </Text>

              <View className="mt-8">
                <SignUpPhoneAuthFields
                  phoneNumber={phoneNumber}
                  authNumber={authNumber}
                  isVerified={isPhoneVerified}
                  onChangePhoneNumber={setPhoneNumber}
                  onChangeAuthNumber={setAuthNumber}
                  onVerifiedChange={setIsPhoneVerified}
                />
              </View>

              <SignUpTermsSection
                memberType={memberType}
                agreements={agreements}
                onChange={setAgreements}
              />
            </ScrollView>

            <View
              className="border-t border-gray300 bg-white px-4 pt-3"
              style={{ paddingBottom: listPaddingBottom + 12 }}>
              <BasicButton
                name="다음"
                bgColor={canGoNext ? appColors.primary : appColors.gray300}
                borderColor={canGoNext ? appColors.primary : appColors.gray300}
                textColor={canGoNext ? appColors.white : appColors.gray600}
                borderRadius={10}
                onClick={() => {
                  if (canGoNext) setStep(2);
                }}
              />
            </View>
          </>
        ) : (
          <ScrollView
            className="flex-1 px-4"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: listPaddingBottom + 24,
            }}>
            <SignUpProfileForm
              memberType={memberType}
              phoneNumber={phoneNumber}
              marketing={agreements.marketing}
              dealerTerms={agreements.dealerTerms}
              onSuccess={goToSuccess}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
