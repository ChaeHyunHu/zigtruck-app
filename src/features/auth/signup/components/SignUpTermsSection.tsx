import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { appColors } from '@/src/constants/colors';
import {
  DEALER_AGREEMENT_CLAUSES,
  SIGN_UP_AGREEMENT_ITEMS,
} from '@/src/features/auth/signup/constants';
import {
  SignUpCheckboxRow,
  SignUpCircleCheckbox,
} from '@/src/features/auth/signup/components/SignUpCircleCheckbox';
import type { SignUpAgreementState, SignUpMemberType } from '@/src/features/auth/signup/types';

type SignUpTermsSectionProps = {
  memberType: SignUpMemberType;
  agreements: SignUpAgreementState;
  onChange: (next: SignUpAgreementState) => void;
};

function TermViewLink({
  onPress,
  label = '보기',
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} className="min-w-[36px] items-end pt-2">
      <Text className="text-[12px] font-semibold text-gray600">{label}</Text>
    </Pressable>
  );
}

export function SignUpTermsSection({
  memberType,
  agreements,
  onChange,
}: SignUpTermsSectionProps) {
  const isDealer = memberType === 'DEALER';
  const audience = isDealer ? 'DEALER' : 'NORMAL';

  const allGeneralChecked = SIGN_UP_AGREEMENT_ITEMS.every((item) => agreements[item.id]);
  const setField = <K extends keyof SignUpAgreementState>(
    key: K,
    value: SignUpAgreementState[K],
  ) => {
    onChange({ ...agreements, [key]: value });
  };

  const handleCheckAll = (checked: boolean) => {
    // '전체 동의하기'는 일반 약관(이용/개인정보/마케팅)만 토글하고
    // 딜러 약정서 동의는 포함하지 않는다.
    onChange({
      terms: checked,
      personalInfo: checked,
      marketing: checked,
      dealerTerms: agreements.dealerTerms,
    });
  };

  const openTerm = (termType: string) => {
    router.push({
      pathname: '/terms/[type]',
      params: { type: termType, audience },
    });
  };

  return (
    <View className="mt-10">
      <Pressable
        onPress={() => handleCheckAll(!allGeneralChecked)}
        className="flex-row items-center pb-2">
        <SignUpCircleCheckbox
          checked={allGeneralChecked}
          onPress={() => handleCheckAll(!allGeneralChecked)}
        />
        <Text className="flex-1 text-[14px] font-medium text-gray800">
          서비스 이용 약관 전체 동의하기
        </Text>
      </Pressable>

      <View className="mb-2 h-px bg-gray300" />

      {SIGN_UP_AGREEMENT_ITEMS.map((item, index) => (
        <SignUpCheckboxRow
          key={item.id}
          checked={agreements[item.id]}
          onToggle={() => setField(item.id, !agreements[item.id])}
          rightElement={
            <TermViewLink onPress={() => openTerm(item.termType)} />
          }>
          <Text className="text-[14px] font-medium text-gray800">
            {item.title}
            <Text className="font-normal text-gray600">
              {item.isRequired ? '(필수)' : '(선택)'}
            </Text>
          </Text>
        </SignUpCheckboxRow>
      ))}

      {isDealer ? (
        <>
          <View className="my-2 h-px bg-gray300" />
          <SignUpCheckboxRow
            checked={agreements.dealerTerms}
            onToggle={() => setField('dealerTerms', !agreements.dealerTerms)}
            rightElement={
              <TermViewLink onPress={() => router.push('/terms/dealer-agreement')} />
            }>
            <Text className="text-[14px] font-medium text-gray800">
              딜러 약정서 동의
              <Text className="font-normal text-gray600">(필수)</Text>
            </Text>
          </SignUpCheckboxRow>

          <View className="mt-2 gap-3 pl-8">
            {DEALER_AGREEMENT_CLAUSES.map((clause, index) => (
              <View key={clause} className="flex-row">
                <Text className="mr-2 text-[13px] leading-5 text-gray700">{index + 1}.</Text>
                <Text className="flex-1 text-[13px] leading-5 text-gray700">{clause}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

export function isSignUpStepOneComplete(
  agreements: SignUpAgreementState,
  isPhoneVerified: boolean,
  isDealer: boolean,
): boolean {
  const requiredGeneral = SIGN_UP_AGREEMENT_ITEMS.filter((item) => item.isRequired).every(
    (item) => agreements[item.id],
  );
  const dealerOk = !isDealer || agreements.dealerTerms;
  return isPhoneVerified && requiredGeneral && dealerOk;
}
