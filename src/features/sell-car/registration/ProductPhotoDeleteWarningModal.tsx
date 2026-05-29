import { Image } from "expo-image";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

const deleteTargetImageExample = require("../../../../assets/images/delete_target_image_example.png");

type ProductPhotoDeleteWarningModalProps = {
  visible: boolean;
  onConfirm: () => void;
};

export function ProductPhotoDeleteWarningModal({
  visible,
  onConfirm,
}: ProductPhotoDeleteWarningModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onConfirm}
    >
      <View className="flex-1 items-center justify-center bg-black/45 px-6">
        <View className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white">
          <View className="px-5 pb-4 pt-5">
            <Text className="text-center text-[18px] font-bold text-gray900">
              삭제 대상 이미지
            </Text>
            <Text className="mt-3 text-center text-[14px] leading-[20px] text-gray700">
              텍스트 삽입 및 번호판을 블러 처리한 사진 업로드 시 무통보 삭제될 수
              있습니다.
            </Text>
            <View className="mt-4 overflow-hidden rounded-lg bg-gray200">
              <Image
                source={deleteTargetImageExample}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
            </View>
            <Text className="mt-2 text-center text-[13px] font-medium text-danger">
              [삭제 대상 이미지 예시]
            </Text>
          </View>
          <View className="border-t border-gray200">
            <Pressable
              className="h-[52px] items-center justify-center"
              onPress={onConfirm}
            >
              <Text className="text-[16px] font-bold text-primary">확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
