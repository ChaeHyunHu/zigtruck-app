import { Ionicons } from "@expo/vector-icons";
import type { ImagePickerAsset } from "expo-image-picker";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { showAppAlert } from "@/src/providers/appDialog";
import { createChatMessages } from "@/src/api/chat/createChat";
import {
  buildChatImageFormData,
  MAX_CHAT_IMAGES,
  pickChatImageAssets,
} from "@/src/features/chat/buildChatImageFormData";
import { CHAT_IMAGE } from "@/src/features/chat/chatMessageTypes";
import { deleteChatRooms } from "@/src/api/chat/deleteChat";
import { fetchChatRooms } from "@/src/api/chat/getChat";
import { appColors } from "@/src/constants/colors";
import { ChatMessageList } from "@/src/features/chat/ChatMessageList";
import { ChatRoomHeader } from "@/src/features/chat/ChatRoomHeader";
import { ChatRoomInputBar } from "@/src/features/chat/ChatRoomInputBar";
import { ProductImageViewer } from "@/src/features/products/ProductImageViewer";
import type {
  ChatMessageItem,
  ChatRoomDetail,
} from "@/src/features/chat/types";
import {
  addReadReceiptIds,
  clearRoomSession,
  ensureRoomSession,
  markOutgoingMessageSent,
  resolveOutgoingReadState,
} from "@/src/features/chat/outgoingReadReceipts";
import {
  connectChatRoomSocket,
  disconnectChatRoomSocket,
  reconnectStompClient,
  type ChatSocketPayload,
} from "@/src/features/chat/chatWebSocket";
import { takePendingChatRoom } from "@/src/features/chat/pendingChatRoom";
import {
  applyReadReceipts,
  enrichChatRecipientProfile,
  extractChatRoomIdFromMessageResponse,
  extractRecipientProfileFromMessages,
  getChatRecipient,
  mergeChatMessages,
  normalizeChatMessageItem,
  withConversationReadState,
  normalizeChatRoomDetail,
  socketPayloadToChatMessageItem,
} from "@/src/features/chat/utils";
import { resolveImageUri } from "@/src/features/products/utils";
import { useAuth } from "@/src/hooks/useAuth";
import { useChat } from "@/src/providers/ChatProvider";

const ROOM_POLL_MS = 6000;

function ChatRoomHeaderSkeleton() {
  return (
    <View className="bg-white">
      <View className="h-14 flex-row items-center px-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
          <Ionicons name="chevron-back" size={26} color={appColors.gray900} />
        </Pressable>
        <View className="h-5 flex-1 rounded bg-gray200" />
      </View>
      <View className="border-b border-gray300 px-4 pb-3">
        <View className="mt-1 h-[42px] flex-row">
          <View className="h-[42px] w-[42px] rounded-lg bg-gray200" />
          <View className="ml-2.5 flex-1 justify-center gap-2">
            <View
              className="h-3.5 rounded bg-gray200"
              style={{ width: "70%" }}
            />
            <View className="h-4 rounded bg-gray200" style={{ width: "35%" }} />
          </View>
        </View>
        <View className="mt-2.5 h-10 rounded-[10px] bg-gray200" />
      </View>
    </View>
  );
}

export default function ChatRoomScreen() {
  const { id, profileImageUrl: profileImageUrlParam } = useLocalSearchParams<{
    id: string;
    profileImageUrl?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { memberId } = useAuth();
  const { setActiveChatRoomId, subscribeRoomMessages, refreshList } = useChat();
  const isDraftRoom = id === "draft";
  const roomId = isDraftRoom ? undefined : Number(id);
  const scrollRef = useRef<ScrollView>(null);
  const isMountedRef = useRef(true);
  const loadSeqRef = useRef(0);
  const roomSocketRef = useRef<ReturnType<typeof connectChatRoomSocket> | null>(null);

  const [room, setRoom] = useState<ChatRoomDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadRoom = useCallback(async () => {
    if (!id) return;
    const seq = ++loadSeqRef.current;
    setIsFetching(true);

    try {
      if (isDraftRoom) {
        const pending = takePendingChatRoom();
        if (!pending) {
          Alert.alert("오류", "채팅방 정보를 불러오지 못했습니다.", [
            { text: "확인", onPress: () => router.back() },
          ]);
          return;
        }

        const pendingRoomId = pending.id;
        const normalizedMessages = (pending.chatMessages ?? []).map((msg) =>
          normalizeChatMessageItem(msg, {
            memberId: Number(memberId),
            roomId: pendingRoomId,
          }),
        );
        if (!isMountedRef.current || seq !== loadSeqRef.current) return;
        setRoom(pending);
        setMessages(
          pendingRoomId != null
            ? withConversationReadState(
                normalizedMessages,
                Number(memberId),
                pendingRoomId,
              )
            : normalizedMessages,
        );
        return;
      }

      if (roomId != null && Number.isFinite(roomId)) {
        ensureRoomSession(roomId);
      }

      let data = normalizeChatRoomDetail(await fetchChatRooms(id));
      if (!isMountedRef.current || seq !== loadSeqRef.current) return;

      const normalizedMessages = (data.chatMessages ?? []).map((msg) =>
        normalizeChatMessageItem(msg, {
          memberId: Number(memberId),
          roomId: Number(data.id ?? roomId),
        }),
      );
      const recipient = getChatRecipient(data, memberId);
      const profileFallback =
        resolveImageUri(profileImageUrlParam) ??
        extractRecipientProfileFromMessages(normalizedMessages, recipient?.id);

      if (!recipient?.profileImageUrl && profileFallback) {
        data = enrichChatRecipientProfile(data, memberId, profileFallback);
      }

      if (!isMountedRef.current || seq !== loadSeqRef.current) return;
      setRoom(data);
      const activeRoomId = Number(data.id ?? roomId);
      setMessages(
        withConversationReadState(
          normalizedMessages,
          Number(memberId),
          activeRoomId,
        ),
      );
    } catch {
      if (!isMountedRef.current || seq !== loadSeqRef.current) return;
      Alert.alert("오류", "채팅방을 불러오지 못했습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } finally {
      if (isMountedRef.current && seq === loadSeqRef.current) {
        setIsFetching(false);
      }
    }
  }, [id, isDraftRoom, memberId, profileImageUrlParam, roomId]);

  useEffect(() => {
    stickToBottomRef.current = true;
    void loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    stickToBottomRef.current = true;
  }, [id]);

  useEffect(() => {
    if (roomId == null || !Number.isFinite(roomId)) return;
    ensureRoomSession(roomId);
    return () => clearRoomSession(roomId);
  }, [roomId]);

  useEffect(() => {
    if (roomId == null || !Number.isFinite(roomId)) return;
    setActiveChatRoomId(roomId);
    return () => setActiveChatRoomId(null);
  }, [roomId, setActiveChatRoomId]);

  const scrollToBottom = useCallback((animated = false) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const handleMessagesContentSizeChange = useCallback(() => {
    if (!stickToBottomRef.current || messages.length === 0) return;
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  const onPressChatImage = useCallback((images: string[], index: number) => {
    const resolved = images.map((uri) => resolveImageUri(uri)).filter(Boolean) as string[];
    if (!resolved.length) return;
    setImageViewerImages(resolved);
    setImageViewerIndex(Math.min(index, resolved.length - 1));
    setImageViewerOpen(true);
  }, []);

  const appendIncomingMessage = useCallback(
    (data: ChatSocketPayload["data"]) => {
      if (!data) return;
      const incoming = normalizeChatMessageItem(
        socketPayloadToChatMessageItem(data),
        {
          memberId: memberId != null ? Number(memberId) : undefined,
          roomId,
        },
      );
      if (
        memberId != null &&
        Number(incoming.senderId) === Number(memberId) &&
        Number.isFinite(incoming.id) &&
        incoming.id > 0
      ) {
        // 본인이 보낸 메시지가 broadcast 로 다시 들어오는 경우 self-echo 식별을 위해 마크
        markOutgoingMessageSent(incoming.id);
      }
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === incoming.id && msg.tempId == null)) {
          return prev;
        }
        const next = [...prev, incoming];
        if (memberId == null || roomId == null) return next;
        return withConversationReadState(next, Number(memberId), roomId);
      });
      scrollToBottom(true);
    },
    [memberId, roomId, scrollToBottom],
  );

  const appendIncomingMessageRef = useRef(appendIncomingMessage);
  appendIncomingMessageRef.current = appendIncomingMessage;

  const pollRoomMessages = useCallback(async () => {
    if (roomId == null || !Number.isFinite(roomId) || !isMountedRef.current) return;
    try {
      const data = normalizeChatRoomDetail(await fetchChatRooms(String(roomId)));
      const incoming = (data.chatMessages ?? []).map((msg) =>
        normalizeChatMessageItem(msg, {
          memberId: Number(memberId),
          roomId,
        }),
      );
      setMessages((prev) => mergeChatMessages(prev, incoming, memberId, roomId));
    } catch {
      // ignore polling errors
    }
  }, [memberId, roomId]);

  useFocusEffect(
    useCallback(() => {
      if (roomId == null || !Number.isFinite(roomId) || isFetching) return;
      void pollRoomMessages();
      void refreshList({ silent: true });
    }, [roomId, isFetching, pollRoomMessages, refreshList]),
  );

  useEffect(() => {
    if (roomId == null || !Number.isFinite(roomId) || memberId == null) return;

    const unsubscribe = subscribeRoomMessages(roomId, (message) => {
      appendIncomingMessageRef.current(message);
    });

    const roomSocket = connectChatRoomSocket({
      chatRoomId: roomId,
      memberId: Number(memberId),
      onEvent: (payload) => {
        if (payload.changeType === "READ_CHAT_MESSAGES" && Array.isArray(payload.data)) {
          const readIds = payload.data
            .map((item) => Number((item as { id?: number }).id))
            .filter((messageId) => Number.isFinite(messageId) && messageId > 0);
          addReadReceiptIds(roomId, readIds);
          setMessages((prev) =>
            withConversationReadState(
              applyReadReceipts(prev, readIds, memberId, roomId),
              memberId,
              roomId,
            ),
          );
        }
        if (payload.changeType === "NEW_CHAT_MESSAGES" && payload.data) {
          appendIncomingMessageRef.current(payload.data);
        }
      },
    });
    roomSocketRef.current = roomSocket;
    const appStateSub = AppState.addEventListener("change", (state) => {
      const socket = roomSocketRef.current;
      if (!socket) return;

      if (state !== "active") {
        if (socket.active || socket.connected) {
          void socket.deactivate();
        }
        return;
      }

      void reconnectStompClient(socket);
    });

    return () => {
      appStateSub.remove();
      unsubscribe();
      disconnectChatRoomSocket(roomSocket);
      roomSocketRef.current = null;
    };
  }, [memberId, roomId, subscribeRoomMessages]);

  useEffect(() => {
    if (roomId == null || !Number.isFinite(roomId) || isFetching) return;

    const timer = setInterval(() => {
      if (AppState.currentState === "active") {
        void pollRoomMessages();
        const socket = roomSocketRef.current;
        if (socket && !socket.connected) {
          void reconnectStompClient(socket);
        }
      }
    }, ROOM_POLL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [roomId, isFetching, pollRoomMessages]);

  useEffect(() => {
    if (!isFetching && messages.length > 0) {
      stickToBottomRef.current = true;
      scrollToBottom(false);
      const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 50);
      return () => clearTimeout(timer);
    }
  }, [isFetching, messages.length, id, scrollToBottom]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
      scrollToBottom(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToBottom]);

  const inputBottomInset = keyboardVisible
    ? Platform.OS === "android"
      ? 0
      : 8
    : Math.max(insets.bottom, 10);

  const sendTextMessage = useCallback(
    async (rawText: string, options?: { restoreInputOnFail?: string }) => {
      const text = rawText.trim();
      if (!text || !room || isSending) return;
      if (!room.id && !room.productId) return;

      stickToBottomRef.current = true;
      const tempId = Date.now();
      const optimistic: ChatMessageItem = {
        id: tempId,
        tempId,
        senderId: Number(memberId),
        contents: text,
        createdDate: new Date().toISOString(),
        type: { code: "TEXT" },
        isLoading: true,
        isRead: false,
      };

      setMessages((prev) => [...prev, optimistic]);
      setIsSending(true);

      try {
        const formData = new FormData();
        if (room.id) {
          formData.append("chatRoomId", String(room.id));
        } else if (room.productId) {
          formData.append("productId", String(room.productId));
        }
        formData.append("type", "TEXT");
        formData.append("contents", text);

        const created = normalizeChatMessageItem(
          (await createChatMessages(formData)) as ChatMessageItem,
          {
            senderId: Number(memberId),
            memberId: Number(memberId),
            roomId: room.id ?? roomId,
          },
        );
        const createdRoomId = extractChatRoomIdFromMessageResponse(created);

        if (createdRoomId && !room.id) {
          ensureRoomSession(createdRoomId);
          setRoom((prev) => (prev ? { ...prev, id: createdRoomId } : prev));
          void refreshList();
          router.replace(`/chat/room/${createdRoomId}`);
        }

        const activeRoomId = createdRoomId ?? room.id ?? roomId;
        markOutgoingMessageSent(created.id);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...created,
                  senderId: Number(memberId),
                  isRead:
                    activeRoomId != null
                      ? resolveOutgoingReadState(
                          created,
                          Number(memberId),
                          activeRoomId,
                        )
                      : false,
                  isLoading: false,
                }
              : msg,
          ),
        );
        scrollToBottom(true);
      } catch {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        if (options?.restoreInputOnFail !== undefined) {
          setInput(options.restoreInputOnFail);
        }
        Alert.alert("오류", "메시지 전송에 실패했습니다.");
      } finally {
        setIsSending(false);
      }
    },
    [isSending, memberId, refreshList, room, roomId, scrollToBottom],
  );

  const sendImageMessages = useCallback(
    async (assets: ImagePickerAsset[]) => {
      if (!assets.length || !room || isSending) return;
      if (!room.id && !room.productId) return;

      stickToBottomRef.current = true;
      const tempId = Date.now();
      const imageUris = assets.map((a) => a.uri);
      const optimistic: ChatMessageItem = {
        id: tempId,
        tempId,
        senderId: Number(memberId),
        contents: JSON.stringify({ images: imageUris }),
        createdDate: new Date().toISOString(),
        type: { code: CHAT_IMAGE },
        isLoading: true,
        isRead: false,
      };

      setMessages((prev) => [...prev, optimistic]);
      setIsSending(true);

      try {
        const formData = buildChatImageFormData({
          chatRoomId: room.id,
          productId: room.productId,
          assets,
        });

        const created = normalizeChatMessageItem(
          (await createChatMessages(formData)) as ChatMessageItem,
          {
            senderId: Number(memberId),
            memberId: Number(memberId),
            roomId: room.id ?? roomId,
          },
        );
        const createdRoomId = extractChatRoomIdFromMessageResponse(created);

        if (createdRoomId && !room.id) {
          ensureRoomSession(createdRoomId);
          setRoom((prev) => (prev ? { ...prev, id: createdRoomId } : prev));
          void refreshList();
          router.replace(`/chat/room/${createdRoomId}`);
        }

        const activeRoomId = createdRoomId ?? room.id ?? roomId;
        markOutgoingMessageSent(created.id);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId
              ? {
                  ...created,
                  senderId: Number(memberId),
                  isRead:
                    activeRoomId != null
                      ? resolveOutgoingReadState(
                          created,
                          Number(memberId),
                          activeRoomId,
                        )
                      : false,
                  isLoading: false,
                }
              : msg,
          ),
        );
        scrollToBottom(true);
      } catch {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        Alert.alert("오류", "사진 전송에 실패했습니다.");
      } finally {
        setIsSending(false);
      }
    },
    [isSending, memberId, refreshList, room, roomId, scrollToBottom],
  );

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendTextMessage(text, { restoreInputOnFail: text });
  }, [input, sendTextMessage]);

  const onPressSuggestedQuestion = useCallback(
    (text: string) => {
      void sendTextMessage(text);
    },
    [sendTextMessage],
  );

  const onPressDelete = useCallback(() => {
    if (!room?.id) {
      router.back();
      return;
    }
    Alert.alert("채팅방 나가기", "채팅방을 나가시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "나가기",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteChatRooms(String(room.id));
              router.replace("/(tabs)/chat");
            } catch {
              Alert.alert("오류", "채팅방 나가기에 실패했습니다.");
            }
          })();
        },
      },
    ]);
  }, [room?.id]);

  const onPressPlus = useCallback(() => {
    void (async () => {
      if (!room || isSending) return;

      const result = await pickChatImageAssets();
      if (!result || result.canceled || !result.assets?.length) {
        if (result === null) {
          showAppAlert({
            title: "안내",
            message: "사진 접근 권한이 필요합니다. 설정에서 허용해 주세요.",
          });
        }
        return;
      }

      let assets = result.assets;
      if (assets.length > MAX_CHAT_IMAGES) {
        showAppAlert({
          title: "안내",
          message: `사진은 최대 ${MAX_CHAT_IMAGES}장까지 전송할 수 있어요. 처음 ${MAX_CHAT_IMAGES}장만 전송합니다.`,
        });
        assets = assets.slice(0, MAX_CHAT_IMAGES);
      }

      await sendImageMessages(assets);
    })();
  }, [isSending, room, sendImageMessages]);

  const chatBody = (
    <>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
          paddingBottom: 8,
        }}
        onContentSizeChange={handleMessagesContentSizeChange}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
        {room ? (
          <ChatMessageList
            messages={messages}
            room={room}
            memberId={memberId}
            recipientProfileImageUrl={
              getChatRecipient(room, memberId)?.profileImageUrl ??
              resolveImageUri(profileImageUrlParam)
            }
            onPressSuggestedQuestion={onPressSuggestedQuestion}
            onPressImage={onPressChatImage}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator color={appColors.primary} />
          </View>
        )}
      </ScrollView>

      <ChatRoomInputBar
        value={input}
        onChangeText={setInput}
        onSend={onSend}
        onPressPlus={onPressPlus}
        isSending={isSending}
        bottomInset={inputBottomInset}
        disabled={!room}
      />
    </>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray100" style={{ paddingTop: insets.top }}>
        {room ? (
          <ChatRoomHeader
            room={room}
            memberId={memberId}
            onPressDelete={onPressDelete}
          />
        ) : (
          <ChatRoomHeaderSkeleton />
        )}

        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView
            className="flex-1"
            behavior="padding"
            keyboardVerticalOffset={0}
          >
            {chatBody}
          </KeyboardAvoidingView>
        ) : (
          <View className="flex-1">{chatBody}</View>
        )}
      </View>

      <ProductImageViewer
        visible={imageViewerOpen}
        images={imageViewerImages}
        initialIndex={imageViewerIndex}
        onClose={() => setImageViewerOpen(false)}
      />
    </>
  );
}
