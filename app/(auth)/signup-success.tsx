import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { BasicButton } from '@/src/components/common/BasicButton';
import { Screen } from '@/src/components/common/Screen';
import { appColors } from '@/src/constants/colors';
import { IMAGE_BASE_URL } from '@/src/constants/url';
import { REPRESENTATIVE_NUMBER } from '@/src/features/additional-services/constants';
import { parseSignUpMemberType } from '@/src/features/auth/signup/types';
import { RegistrationHeader } from '@/src/features/sell-car/registration/RegistrationHeader';
import { useScreenInsets } from '@/src/hooks/useScreenInsets';

function formatTodayLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function SignUpSuccessScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const memberType = parseSignUpMemberType(type);
  const isDealer = memberType === 'DEALER';
  const { listPaddingBottom } = useScreenInsets();
  const [showDealerReviewModal, setShowDealerReviewModal] = useState(isDealer);
  const appliedDate = useMemo(() => formatTodayLabel(), []);

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

      <Modal
        visible={showDealerReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDealerReviewModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/45 px-8">
          <View className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white px-6 py-8">
            <Text className="text-center text-[18px] font-bold text-gray900">딜러 심사 중입니다</Text>
            <Text className="mt-6 text-center text-[28px] font-bold text-gray900">
              {REPRESENTATIVE_NUMBER}
            </Text>
            <Text className="mt-2 text-center text-[15px] text-gray600">{appliedDate}</Text>
            <Pressable
              onPress={() => setShowDealerReviewModal(false)}
              className="mt-8 items-center py-2">
              <Text className="text-[16px] font-semibold text-primary">확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
