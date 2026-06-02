import React, { useMemo } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { REPRESENTATIVE_NUMBER } from '@/src/features/additional-services/constants';

function formatTodayLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type Props = {
  visible: boolean;
  date?: string;
  onConfirm: () => void;
};

export function DealerReviewModal({ visible, date, onConfirm }: Props) {
  const appliedDate = useMemo(() => date ?? formatTodayLabel(), [date]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <View className="flex-1 items-center justify-center bg-black/45 px-8">
        <View className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white">
          <View className="px-6 pb-7 pt-8">
            <Text className="text-center text-[18px] font-bold text-gray900">
              딜러 심사 중입니다
            </Text>
            <Text className="mt-6 text-center text-[26px] font-bold text-gray900">
              {REPRESENTATIVE_NUMBER}
            </Text>
            <Text className="mt-2 text-center text-[15px] text-gray600">{appliedDate}</Text>
          </View>
          <Pressable
            onPress={onConfirm}
            className="items-center border-t border-gray200 py-3.5">
            <Text className="text-[16px] font-semibold text-primary">확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
