import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchChatRoomList } from "@/src/api/chat/getChat";
import { BasicButton } from "@/src/components/common/BasicButton";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { formatPrice } from "@/src/features/home/utils";

import type { AdditionalServiceType } from "../constants";
import type { ChatRoomListItem } from "../types";

const GUIDE_BY_SERVICE: Record<
  AdditionalServiceType,
  { headerTitle: string; title: string; content: string }
> = {
  "one-stop-service": { headerTitle: "", title: "", content: "" },
  "purchase-accompanying-service": {
    headerTitle: "구매 동행 서비스",
    title: "구매를 원하는 차량을 선택해주세요.",
    content:
      "채팅 목록에서 차량 구매 대행 서비스를 이용하기 위한 차량을 선택해주세요.",
  },
  "transfer-agency-service": {
    headerTitle: "서류 이전 대행 서비스",
    title: "서류 이전 대행 서비스를 신청할 차량을 선택해주세요.",
    content:
      "채팅 목록에서 서류 이전 대행 서비스를 이용하기 위한 차량을 선택해주세요.",
  },
  "capital-counsel-service": {
    headerTitle: "화물차 대출 상담 서비스",
    title: "상담을 위해 차량을 선택해주세요.",
    content:
      "채팅 목록에서 상담받을 차량을 선택해주세요. 차량 선택 후 서비스 신청 시 상담이 더 정확하고 빠르게 진행됩니다.",
  },
};

function getMessageText(item: ChatRoomListItem) {
  if (!item.lastMessage) return "";
  try {
    const parsed = JSON.parse(item.lastMessage) as { text?: string; images?: unknown };
    if (parsed.text) return parsed.text;
    if (parsed.images) return "사진을 보냈습니다.";
  } catch {
    return item.lastMessage;
  }
  return "";
}

type SelectVehicleFromChatListProps = {
  serviceType: AdditionalServiceType;
  returnPath: string;
};

export function SelectVehicleFromChatList({
  serviceType,
  returnPath,
}: SelectVehicleFromChatListProps) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ chatRoomId?: string }>();
  const guide = GUIDE_BY_SERVICE[serviceType];

  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoomListItem[]>([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<number | null>(
    params.chatRoomId ? Number(params.chatRoomId) : null,
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchChatRoomList();
        if (mounted) {
          setChatRooms(Array.isArray(data) ? data : []);
        }
      } catch {
        if (mounted) setChatRooms([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSelectVehicle = useCallback(() => {
    const selected = chatRooms.find((item) => item.chatRoomId === selectedChatRoomId);
    if (!selected) return;
    router.replace({
      pathname: returnPath as "/purchase-accompanying-service",
      params: {
        productId: String(selected.productId ?? ""),
        truckName: selected.truckName ?? "",
        chatRoomId: String(selected.chatRoomId ?? ""),
        productPrice: selected.price != null ? String(selected.price) : "",
      },
    });
  }, [chatRooms, returnPath, selectedChatRoomId]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="h-[52px] flex-row items-center border-b border-gray300 px-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-2">
          <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
        </Pressable>
        <Text className="text-[16px] font-semibold text-gray900">{guide.headerTitle}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 88 + insets.bottom }}
      >
        <View className="mx-4 mt-4 rounded-[10px] bg-[#F1F5FF] px-4 py-[19px]">
          <Text className="text-[15px] font-bold text-gray900">{guide.title}</Text>
          <Text className="mt-4 text-[14px] leading-[18px] text-gray800">{guide.content}</Text>
        </View>

        <View className="px-4 py-6">
          {loading ? (
            <ActivityIndicator color={appColors.primary} />
          ) : chatRooms.length > 0 ? (
            <View className="gap-3">
              {chatRooms.map((item) => {
                const selected = item.chatRoomId === selectedChatRoomId;
                return (
                  <Pressable
                    key={String(item.chatRoomId)}
                    className={`rounded-xl border p-[14px] ${
                      selected ? "border-primary bg-[#F1F5FF]" : "border-gray300 bg-white"
                    }`}
                    onPress={() =>
                      setSelectedChatRoomId((prev) =>
                        prev === item.chatRoomId ? null : item.chatRoomId,
                      )
                    }
                  >
                    <View className="flex-row items-center">
                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={22}
                        color={selected ? appColors.primary : appColors.gray500}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-[14px] font-semibold text-gray900">
                          {item.truckName}
                        </Text>
                        <Text className="mt-1 text-[12px] text-gray700">
                          {item.memberName} [{item.truckNumber}]
                        </Text>
                        {serviceType === "transfer-agency-service" ? (
                          <Text
                            className="mt-1 text-[12px] text-gray600"
                            numberOfLines={2}
                          >
                            {getMessageText(item)}
                          </Text>
                        ) : (
                          <Text className="mt-1 text-[14px] font-semibold text-gray900">
                            {formatPrice(item.price)}
                          </Text>
                        )}
                      </View>
                      {item.productRepresentImageUrl ? (
                        <Image
                          source={{ uri: item.productRepresentImageUrl }}
                          style={{ width: 48, height: 48, borderRadius: 12 }}
                          contentFit="cover"
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View className="items-center py-16">
              <Text className="mb-[30px] text-center text-[18px] text-gray700">
                채팅 내역이 없습니다.
              </Text>
              <BasicButton
                name="구매할 차량 둘러보기"
                bgColor={appColors.primary}
                borderColor={appColors.primary}
                textColor={appColors.white}
                fontSize={16}
                height={48}
                borderRadius={12}
                onClick={() => router.push("/(tabs)/purchase")}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {chatRooms.length > 0 ? (
        <View
          className="flex-row gap-2 border-t border-gray200 bg-white px-3 py-2"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <View className="flex-1">
            <BasicButton
              name="건너뛰기"
              bgColor={appColors.white}
              borderColor={appColors.gray300}
              textColor={appColors.gray600}
              fontSize={16}
              height={48}
              fontWeight="bold"
              onClick={() => router.back()}
            />
          </View>
          <View className="flex-1" style={{ opacity: selectedChatRoomId ? 1 : 0.5 }}>
            <BasicButton
              name="차량 선택하기"
              bgColor={appColors.primary}
              borderColor={appColors.primary}
              textColor={appColors.white}
              fontSize={16}
              height={48}
              fontWeight="bold"
              onClick={onSelectVehicle}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
