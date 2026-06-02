import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { BasicButton } from '@/src/components/common/BasicButton';
import { Screen } from '@/src/components/common/Screen';
import { appColors } from '@/src/constants/colors';
import { IMAGE_BASE_URL } from '@/src/constants/url';
import { DealerReviewModal } from '@/src/features/auth/DealerReviewModal';
import { parseSignUpMemberType } from '@/src/features/auth/signup/types';
import { RegistrationHeader } from '@/src/features/sell-car/registration/RegistrationHeader';
import { useScreenInsets } from '@/src/hooks/useScreenInsets';

export default function SignUpSuccessScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const memberType = parseSignUpMemberType(type);
  const isDealer = memberType === 'DEALER';
  const { listPaddingBottom } = useScreenInsets();
  const [showDealerReviewModal, setShowDealerReviewModal] = useState(isDealer);

  useEffect(() => {
    if (isDealer) {
      setShowDealerReviewModal(true);
    }
  }, [isDealer]);

  const goHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="회원가입 완료" onBack={goHome} />

      <View className="flex-1 justify-between px-4" style={{ paddingBottom: listPaddingBottom + 16 }}>
        <View className="pt-8">
          <Image
            source={{ uri: `${IMAGE_BASE_URL}/logo.png` }}
            style={{ width: 80, height: 32, marginBottom: 16 }}
            contentFit="contain"
          />
          {isDealer ? (
            <>
              <Text className="text-[32px] font-bold leading-[42px] text-gray900">
                딜러 회원가입으로{'\n'}신청되었습니다!
              </Text>
              <View className="mt-6 gap-1">
                <Text className="text-[18px] leading-7 text-gray700">담당자가 확인 후 승인시</Text>
                <Text className="text-[18px] leading-7 text-gray700">로그인 하실수 있어요.</Text>
                <Text className="mt-4 text-[18px] leading-7 text-gray700">
                  승인까지 잠시만 기다려주세요
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-[32px] font-bold leading-[42px] text-gray900">
              회원가입이{'\n'}완료되었습니다!
            </Text>
          )}
        </View>

        <BasicButton
          name="홈으로"
          bgColor={appColors.primaryDark}
          borderColor={appColors.primaryDark}
          textColor={appColors.white}
          borderRadius={12}
          onClick={goHome}
        />
      </View>

      <DealerReviewModal
        visible={showDealerReviewModal}
        onConfirm={() => setShowDealerReviewModal(false)}
      />
    </Screen>
  );
}
