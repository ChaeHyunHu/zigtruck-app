import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { ChatListRow } from "@/src/features/chat/ChatListRow";
import { useAuth } from "@/src/hooks/useAuth";
import { useChat } from "@/src/providers/ChatProvider";
import { navigateToLogin } from "@/src/lib/authNavigation";

export default function ChatScreen() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, refreshList, getUnreadCount, clearUnread } = useChat();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void refreshList();
      }
    }, [isAuthenticated, refreshList]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refreshList({ silent: true }).finally(() => setRefreshing(false));
  }, [refreshList]);

  return (
    <Screen variant="tab" className="flex-1 bg-white">
      <View className="h-14 justify-center border-b border-gray300 px-4">
        <Text className="text-[20px] font-bold text-gray900">채팅</Text>
      </View>

      {!isAuthenticated ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-[15px] text-gray700">
            로그인 후 채팅 목록을 확인할 수 있어요.
          </Text>
          <Pressable
            onPress={navigateToLogin}
            className="mt-4 rounded-lg bg-primary px-6 py-3"
          >
            <Text className="text-[15px] font-bold text-white">로그인하기</Text>
          </Pressable>
        </View>
      ) : isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.chatRoomId)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={
            items.length === 0 ? { flexGrow: 1, justifyContent: "center" } : { paddingBottom: 24 }
          }
          ListEmptyComponent={
            <View className="items-center px-6">
              <Ionicons name="chatbubbles-outline" size={48} color="#bdbdbd" />
              <Text className="mt-3 text-[15px] text-gray700">채팅 내역이 없습니다.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const unreadCount = getUnreadCount(item.chatRoomId);
            return (
              <ChatListRow
                item={item}
                unreadCount={unreadCount}
                onPress={() => {
                  clearUnread(item.chatRoomId);
                  router.push({
                    pathname: "/chat/room/[id]",
                    params: {
                      id: String(item.chatRoomId),
                      ...(item.profileImageUrl
                        ? { profileImageUrl: item.profileImageUrl }
                        : {}),
                    },
                  });
                }}
              />
            );
          }}
        />
      )}
    </Screen>
  );
}
