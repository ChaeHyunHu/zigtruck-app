import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";
import { resolveImageUri } from "@/src/features/products/utils";

import { ChatScenarioMessage } from "./ChatScenarioMessage";
import {
  CHAT_CALL_ATTEMPT,
  CHAT_CALL_COMPLETED,
  CHAT_IMAGE,
  CHAT_SCENARIO,
  CHAT_TEXT,
  CHAT_WARNING,
} from "./chatMessageTypes";
import {
  formatChatDateLabel,
  formatChatTimeLabel,
  isLastMessageInBlock,
  isSameChatDay,
} from "./dateUtils";
import type { ChatMessageItem, ChatRoomDetail } from "./types";
import {
  getChatMessageText,
  parseChatMessageContents,
  shouldShowOpponentProfile,
} from "./utils";

type ChatMessageListProps = {
  messages: ChatMessageItem[];
  room: ChatRoomDetail;
  memberId?: number;
  recipientProfileImageUrl?: string;
  onPressSuggestedQuestion?: (text: string) => void;
  onPressImage?: (images: string[], index: number) => void;
};

function DateSeparator({ label }: { label: string }) {
  return (
    <View className="my-1 items-center">
      <Text className="text-[12px] text-gray600">{label}</Text>
    </View>
  );
}

function ChatProfileAvatar({ profileImageUrl }: { profileImageUrl?: string }) {
  const uri = resolveImageUri(profileImageUrl);

  return (
    <View className="mr-2 h-7 w-7 overflow-hidden rounded-full bg-gray300">
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          contentPosition="center"
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <Ionicons name="person" size={20} color={appColors.gray500} />
        </View>
      )}
    </View>
  );
}

function MessageMeta({
  time,
  isRead,
  align = "left",
}: {
  time: string;
  isRead?: boolean;
  align?: "left" | "right";
}) {
  return (
    <View
      className={`min-w-[56px] shrink-0 flex-row items-center ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      {align === "right" ? (
        <Text className="text-[12px] text-gray600">{isRead ? "읽음 " : "안읽음 "}</Text>
      ) : null}
      <Text className="text-[12px] text-gray600">{time}</Text>
    </View>
  );
}

function WarningBanner({ message }: { message: string }) {
  return (
    <View className="my-3.5 flex-row rounded-[14px] bg-[#FFF9EA] p-3.5">
      <Ionicons name="alert-circle" size={24} color="#C77840" />
      <Text className="ml-1 flex-1 text-[13px] font-medium leading-[18px] text-[#C77840]">
        {message}
      </Text>
    </View>
  );
}

function ChatMessageRow({
  item,
  isMine,
  showProfile,
  isBuyer,
  isLastInBlock,
  recipientProfileImageUrl,
  room,
  memberId,
  onPressSuggestedQuestion,
  onPressImage,
}: {
  item: ChatMessageItem;
  isMine: boolean;
  showProfile: boolean;
  isBuyer: boolean;
  isLastInBlock: boolean;
  recipientProfileImageUrl?: string;
  room: ChatRoomDetail;
  memberId?: number;
  onPressSuggestedQuestion?: (text: string) => void;
  onPressImage?: (images: string[], index: number) => void;
}) {
  const parsed = parseChatMessageContents(item.contents);
  const typeCode = item.type?.code ?? CHAT_TEXT;
  const time = formatChatTimeLabel(item.createdDate);

  if (typeCode === CHAT_WARNING) {
    return <WarningBanner message={parsed.text ?? ""} />;
  }

  if (typeCode === CHAT_SCENARIO) {
    return (
      <ChatScenarioMessage
        parsed={parsed}
        room={room}
        memberId={memberId}
        isBuyer={isBuyer}
        timeLabel={time}
        onPressSuggestedQuestion={onPressSuggestedQuestion}
      />
    );
  }

  if (typeCode === CHAT_CALL_ATTEMPT || typeCode === CHAT_CALL_COMPLETED) {
    const label =
      typeCode === CHAT_CALL_ATTEMPT
        ? "전화 연결을 시도했습니다."
        : "전화 연결이 완료되었습니다.";
    return (
      <View className="my-2 items-center">
        <Text className="text-[12px] text-gray600">{label}</Text>
      </View>
    );
  }

  if (typeCode === CHAT_IMAGE && parsed.images?.length) {
    const images = parsed.images.filter(Boolean);
    const openViewer = () => onPressImage?.(images, 0);

    if (isMine) {
      return (
        <View className="my-1.5">
          <View className="ml-9 flex-row items-end justify-end gap-1.5">
            {isLastInBlock ? (
              <MessageMeta time={time} isRead={item.isRead} align="right" />
            ) : null}
            <Pressable onPress={openViewer} className="overflow-hidden rounded-[14px]">
              <Image
                source={{ uri: images[0] }}
                style={{ width: 133, height: 100 }}
                contentFit="cover"
              />
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View className="my-1.5 flex-row items-start">
        {showProfile ? (
          <ChatProfileAvatar profileImageUrl={recipientProfileImageUrl} />
        ) : (
          <View className="mr-2 w-7" />
        )}
        <View className="flex-1 flex-row items-end">
          <Pressable onPress={openViewer} className="mr-1.5 overflow-hidden rounded-[14px]">
            <Image
              source={{ uri: images[0] }}
              style={{ width: 133, height: 100 }}
              contentFit="cover"
            />
          </Pressable>
          {isLastInBlock ? <MessageMeta time={time} align="left" /> : null}
        </View>
      </View>
    );
  }

  const body = getChatMessageText(item.contents);
  if (!body) return null;

  if (isMine) {
    return (
      <View className="my-1.5">
        <View className="ml-9 flex-row items-end justify-end gap-1.5">
          {isLastInBlock && !item.isLoading ? (
            <MessageMeta time={time} isRead={item.isRead} align="right" />
          ) : null}
          {item.isLoading ? (
            <ActivityIndicator size="small" color={appColors.gray500} />
          ) : null}
          <View className="max-w-[78%] rounded-[14px] bg-primary p-3">
            <Text className="text-[15px] font-medium leading-5 text-white">{body}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="my-1.5 flex-row items-start">
      {showProfile ? (
        <ChatProfileAvatar profileImageUrl={recipientProfileImageUrl} />
      ) : (
        <View className="mr-2 w-7" />
      )}
      <View className="mx-0.5 max-w-[78%] flex-1 flex-row items-end">
        <View className="mr-1.5 rounded-[14px] bg-gray200 p-3">
          <Text className="text-[15px] font-medium leading-5 text-gray800">{body}</Text>
        </View>
        {isLastInBlock ? <MessageMeta time={time} align="left" /> : null}
      </View>
    </View>
  );
}

export function ChatMessageList({
  messages,
  room,
  memberId,
  recipientProfileImageUrl,
  onPressSuggestedQuestion,
  onPressImage,
}: ChatMessageListProps) {
  const isBuyer = Number(memberId) === Number(room.buyer?.id);
  const recipient = isBuyer ? room.seller : room.buyer;
  const profileImageUrl =
    resolveImageUri(recipientProfileImageUrl) ??
    resolveImageUri(recipient?.profileImageUrl) ??
    messages.reduce<string | undefined>((found, message) => {
      if (found) return found;
      if (Number(message.senderId) === Number(memberId)) return undefined;
      return resolveImageUri(message.sender?.profileImageUrl);
    }, undefined);

  return (
    <View className="bg-gray100 px-4 pb-2">
      {messages.map((item, index) => {
        const prev = index > 0 ? messages[index - 1] : undefined;
        const showDate = Boolean(
          item.createdDate &&
          (!prev?.createdDate ||
            !isSameChatDay(item.createdDate, prev.createdDate)),
        );
        const isMine = Number(item.senderId) === Number(memberId);
        const showProfile = shouldShowOpponentProfile(item, isMine);
        const isLastInBlock = isLastMessageInBlock(messages, index);

        return (
          <React.Fragment key={String(item.id ?? item.tempId ?? index)}>
            {showDate ? (
              <DateSeparator label={formatChatDateLabel(item.createdDate)} />
            ) : null}
            <ChatMessageRow
              item={item}
              isMine={isMine}
              showProfile={showProfile}
              isBuyer={isBuyer}
              isLastInBlock={isLastInBlock}
              recipientProfileImageUrl={profileImageUrl}
              room={room}
              memberId={memberId}
              onPressSuggestedQuestion={onPressSuggestedQuestion}
              onPressImage={onPressImage}
            />
          </React.Fragment>
        );
      })}
      {!messages.length ? (
        <View className="py-8">
          <Text className="text-center text-[14px] text-gray600">
            {recipient?.name ?? "상대방"}님과 대화를 시작해 보세요.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
