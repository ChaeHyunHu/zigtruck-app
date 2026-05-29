import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

import {
  canShowChatInquiry,
  isDealerMember,
} from "./productInquiryUtils";
import type { ProductDetail } from "./types";

const MODAL_PHONE_ICON =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/modal-phone.png";
const MODAL_CHAT_ICON =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com/modal-chat.png";

type ProductInquiryModalProps = {
  visible: boolean;
  product: ProductDetail;
  memberTypeCode?: string | null;
  onClose: () => void;
  onPressPhone: () => void;
  onPressChat: () => void;
};

export function ProductInquiryModal({
  visible,
  product,
  memberTypeCode,
  onClose,
  onPressPhone,
  onPressChat,
}: ProductInquiryModalProps) {
  const showChat = canShowChatInquiry(product);
  const showSafeNumberNote = showChat;
  const chatDisabled = isDealerMember(memberTypeCode);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40 px-6" onPress={onClose}>
        <Pressable
          className="w-full max-w-[360px] rounded-2xl bg-white px-5 pb-6 pt-5"
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-5 flex-row items-start justify-between">
            <Text
              className="flex-1 pr-3 text-[18px] font-bold leading-[24px] text-gray900"
              numberOfLines={2}
            >
              {product.truckName}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={appColors.gray800} />
            </Pressable>
          </View>

          <InquiryActionButton
            label="전화문의"
            iconUri={MODAL_PHONE_ICON}
            onPress={onPressPhone}
          />

          {showChat ? (
            <InquiryActionButton
              label="채팅문의"
              iconUri={MODAL_CHAT_ICON}
              onPress={chatDisabled ? undefined : onPressChat}
              className="mt-3"
              disabled={chatDisabled}
            />
          ) : null}

          {showSafeNumberNote ? (
            <View className="mt-3 flex-row items-start">
              <Text className="mr-1 text-[13px] text-gray600">*</Text>
              <Text className="flex-1 text-[13px] leading-[18px] text-gray600">
                판매자의 개인정보 보호를 위해 050 안심번호로 연결됩니다.
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InquiryActionButton({
  label,
  iconUri,
  onPress,
  className = "",
  disabled = false,
}: {
  label: string;
  iconUri: string;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      className={`h-[52px] flex-row items-center rounded-lg border border-gray400 bg-white px-4 ${className}`}
      style={disabled ? { opacity: 0.45 } : undefined}
    >
      <Image source={{ uri: iconUri }} style={{ width: 28, height: 28 }} contentFit="contain" />
      <Text className="flex-1 text-center text-[18px] font-medium text-gray800">{label}</Text>
      <View className="w-7" />
    </Pressable>
  );
}
