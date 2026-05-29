import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Screen } from '@/src/components/common/Screen';
import {
  DEALER_AGREEMENT_CLAUSES,
} from '@/src/features/auth/signup/constants';
import { RegistrationHeader } from '@/src/features/sell-car/registration/RegistrationHeader';
import { useScreenInsets } from '@/src/hooks/useScreenInsets';

export default function DealerAgreementScreen() {
  const { listPaddingBottom } = useScreenInsets();

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="딜러 약정서" />
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 24 }}>
        <Text className="mb-4 text-[16px] font-bold text-gray900">딜러 약정서</Text>
        <Text className="mb-6 text-[14px] leading-6 text-gray700">
          직트럭 딜러 회원은 아래 사항에 동의한 것으로 간주됩니다.
        </Text>
        <View className="gap-4">
          {DEALER_AGREEMENT_CLAUSES.map((clause, index) => (
            <View key={clause} className="flex-row">
              <Text className="mr-2 text-[14px] font-semibold text-gray800">{index + 1}.</Text>
              <Text className="flex-1 text-[14px] leading-6 text-gray700">{clause}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
