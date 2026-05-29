import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { postProductInquiryCall } from "@/src/api/public";
import {
  ContractChatBanners,
  getContractButtonLabel,
} from "@/src/features/chat/ContractChatBanners";
import { navigateToContract } from "@/src/features/contract/navigation";
import { formatPrice } from "@/src/features/home/utils";
import { appColors } from "@/src/constants/colors";

import type { ChatRoomDetail } from "./types";

type ChatRoomHeaderProps = {
  room: ChatRoomDetail;
  memberId?: number;
  onPressDelete: () => void;
};

function truncateName(name?: string, max = 5) {
  if (!name) return "";
  return name.length > max ? `${name.slice(0, max)}...` : name;
}

export function ChatRoomHeader({ room, memberId, onPressDelete }: ChatRoomHeaderProps) {
  const isBuyer = Number(memberId) === Number(room.buyer?.id);
  const recipient = isBuyer ? room.seller : room.buyer;
  const isDeleted = Boolean(room.isDeletedProduct);

  const onPressProduct = () => {
    if (isDeleted || !room.productId) return;
    router.push(`/product/${room.productId}`);
  };

  const onPressContract = () => {
    if (!room.id) {
      Alert.alert(
        "안내",
        `${truncateName(recipient?.name, 3) || "상대방"}님에게 메시지를 보낸 후, 계약서를 작성할 수 있어요.`,
      );
      return;
    }
    navigateToContract(room, memberId);
  };

  const onPressPhone = () => {
    if (!room.id) return;
    if (room.productId) {
      postProductInquiryCall(room.productId).catch(() => undefined);
    }
    const phone = room.safetyNumbers?.safetyNumber;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() =>
        Alert.alert("오류", "전화 연결을 할 수 없습니다."),
      );
      return;
    }
    Alert.alert(
      "안내",
      `${truncateName(recipient?.name, 3) || "상대방"}님에게 메시지를 보낸 후, 전화를 하실 수 있어요.`,
    );
  };

  const contractButtonLabel = getContractButtonLabel(room, memberId);

  return (
    <View className="bg-white">
      <View className="h-14 flex-row items-center justify-between px-4">
        <View className="flex-1 flex-row items-center">
          <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
            <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
          </Pressable>
          <Text className="flex-1 text-[18px] font-semibold text-gray800" numberOfLines={1}>
            <Text className="font-semibold">{truncateName(recipient?.name, 8)}</Text>
            {room.truckNumber ? (
              <Text className="text-[15px] font-normal text-gray700"> [{room.truckNumber}]</Text>
            ) : null}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={onPressPhone} hitSlop={8}>
            <Ionicons name="call-outline" size={24} color={appColors.gray800} />
          </Pressable>
          <Pressable onPress={onPressDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={24} color={appColors.gray800} />
          </Pressable>
        </View>
      </View>

      <View className="border-b border-gray300 bg-white pb-2">
        <Pressable
          onPress={onPressProduct}
          disabled={isDeleted}
          className="flex-row px-4 pt-1"
        >
          <View className="h-[42px] w-[42px] overflow-hidden rounded-lg bg-gray200">
            {room.productRepresentImageUrl ? (
              <Image
                source={{ uri: room.productRepresentImageUrl }}
                style={{ width: 42, height: 42 }}
                contentFit="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Ionicons name="car-outline" size={22} color={appColors.gray500} />
              </View>
            )}
          </View>
          <View className="ml-2.5 flex-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Text className="text-[14px] font-bold text-gray800">
                {isDeleted ? "삭제됨" : (room.productStatus?.desc ?? "판매중")}
              </Text>
              <Text className="flex-1 text-[14px] font-medium text-gray800" numberOfLines={1}>
                {room.truckName}
              </Text>
            </View>
            <Text className="mt-1.5 text-[16px] font-semibold text-gray900">
              {formatPrice(
                room.price === undefined || room.price === null || room.price === ""
                  ? null
                  : Number(room.price),
              )}
            </Text>
          </View>
        </Pressable>

        <ContractChatBanners room={room} memberId={memberId} />

        {!isDeleted ? (
          <Pressable
            onPress={onPressContract}
            className="mx-4 mt-2.5 flex-row items-center justify-center gap-1.5 rounded-[10px] border border-gray400 py-2"
          >
            <Ionicons name="create-outline" size={18} color={appColors.gray700} />
            <Text className="text-[14px] font-semibold text-gray800">{contractButtonLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
