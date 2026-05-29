import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { patchMember } from '@/src/api/members';
import { PhoneAuthForm } from '@/src/components/settings/PhoneAuthForm';
import { Screen } from '@/src/components/common/Screen';
import { RegistrationHeader } from '@/src/features/sell-car/registration/RegistrationHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { useScreenInsets } from '@/src/hooks/useScreenInsets';

export default function PhoneNumberChangeScreen() {
  const { profile, refreshProfile } = useAuth();
  const { listPaddingBottom, bottom } = useScreenInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!isVerified) {
      Alert.alert('인증 필요', '휴대폰 번호 인증을 완료해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      await patchMember({
        phoneNumber,
        authNumber,
        name: profile?.name,
        marketing: true,
      });
      await refreshProfile();
      Alert.alert('변경 완료', '휴대폰 번호를 변경했어요.', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('변경 실패', error?.message ?? '휴대폰 번호 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="휴대폰 번호 변경" />
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 80 }}>
        <PhoneAuthForm
          currentPhoneNumber={profile?.phoneNumber}
          phoneNumber={phoneNumber}
          authNumber={authNumber}
          isVerified={isVerified}
          onChangePhoneNumber={setPhoneNumber}
          onChangeAuthNumber={setAuthNumber}
          onVerifiedChange={setIsVerified}
        />
      </ScrollView>
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-gray300 bg-white px-4 pt-3"
        style={{ paddingBottom: Math.max(bottom, 12) }}>
        <Pressable
          onPress={onSubmit}
          disabled={!isVerified || isSubmitting}
          className={`h-[52px] items-center justify-center rounded-[10px] ${
            !isVerified || isSubmitting ? 'bg-gray300' : 'bg-primary'
          }`}>
          <Text className="text-[16px] font-bold text-white">변경하기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
