import { router } from "expo-router";
import React from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import apiManager from "@/src/api/AxiosInstance";
import {
  SCENARIO_FREQUENTLY_ASKED,
  SCENARIO_TEXT_API_BUTTON,
  SCENARIO_TEXT_NAVIGATE_BUTTON,
  SCENARIO_TEXT_URL_BUTTON,
} from "@/src/features/chat/chatMessageTypes";
import type { ChatRoomDetail, ChatScenarioButton } from "@/src/features/chat/types";
import { renderMultilineText } from "@/src/features/chat/utils";
import { navigateToContract } from "@/src/features/contract/navigation";

import { ChatFrequentlyAskedMessage } from "./ChatFrequentlyAskedMessage";
import type { ParsedChatContent } from "./utils";

type Props = {
  parsed: ParsedChatContent;
  room: ChatRoomDetail;
  memberId?: number;
  isBuyer: boolean;
  timeLabel: string;
  onPressSuggestedQuestion?: (text: string) => void;
};

function ScenarioTipBanner({
  text,
  buttonText,
  onPressButton,
}: {
  text: string;
  buttonText?: string;
  onPressButton?: () => void;
}) {
  return (
    <View className="my-3.5 rounded-[14px] bg-[#F1F5FF] p-3.5">
      <Text className="text-[13px] font-medium leading-4 text-primary">
        {renderMultilineText(text).map((line, index) => (
          <Text key={`${line}-${index}`}>
            {index > 0 ? "\n" : null}
            {line}
          </Text>
        ))}
      </Text>
      {buttonText ? (
        <Pressable onPress={onPressButton} className="mt-1.5">
          <Text className="text-[14px] font-semibold text-primary underline">
            {buttonText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function isContractPath(url?: string): boolean {
  if (!url) return false;
  const path = url.split("?")[0]?.replace(/^\//, "") ?? "";
  return path === "contract" || path.endsWith("/contract");
}

function mapNavigatePath(url: string): string | null {
  const path = url.split("?")[0]?.replace(/^\//, "") ?? "";
  if (path === "contract") return "/contract";
  if (path === "guide/sale" || path === "guide/perchase") return `/${path}`;
  if (path === "transfer-agency-service") return "/additional-services/transfer-agency";
  return null;
}

async function handleScenarioButtonPress(
  button: ChatScenarioButton,
  scenarioType: string | undefined,
  room: ChatRoomDetail,
  memberId?: number,
) {
  const type = scenarioType ?? SCENARIO_TEXT_NAVIGATE_BUTTON;

  if (type === SCENARIO_TEXT_URL_BUTTON) {
    if (button.url) {
      await Linking.openURL(button.url).catch(() =>
        Alert.alert("오류", "링크를 열 수 없습니다."),
      );
    }
    return;
  }

  if (type === SCENARIO_TEXT_API_BUTTON) {
    if (button.method === "POST" && button.url) {
      try {
        await apiManager.post(button.url, { chatRoomId: room.id });
        Alert.alert("안내", "신청이 완료되었어요.");
      } catch (error: unknown) {
        const message =
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof (error as { message: unknown }).message === "string"
            ? (error as { message: string }).message
            : "요청에 실패했습니다.";
        Alert.alert("안내", message);
      }
      return;
    }
    Alert.alert("안내", "해당 기능은 준비 중입니다.");
    return;
  }

  if (
    type === SCENARIO_TEXT_NAVIGATE_BUTTON ||
    isContractPath(button.url) ||
    button.text?.includes("계약서")
  ) {
    if (isContractPath(button.url) || button.text?.includes("계약서")) {
      navigateToContract(room, memberId);
      return;
    }

    const mapped = button.url ? mapNavigatePath(button.url) : null;
    if (mapped) {
      router.push(mapped as "/contract");
      return;
    }
  }

  if (button.text?.includes("가이드")) {
    Alert.alert("안내", "차량 확인 가이드는 곧 제공됩니다.");
    return;
  }

  Alert.alert("안내", "해당 기능은 준비 중입니다.");
}

export function ChatScenarioMessage({
  parsed,
  room,
  memberId,
  isBuyer,
  timeLabel,
  onPressSuggestedQuestion,
}: Props) {
  const isFrequentlyAsked = parsed.name === SCENARIO_FREQUENTLY_ASKED;
  const primaryButton = parsed.buttons?.[0];

  if (isFrequentlyAsked) {
    if (isBuyer && parsed.buttons?.length) {
      return (
        <ChatFrequentlyAskedMessage
          title={parsed.text ?? ""}
          buttons={parsed.buttons}
          timeLabel={timeLabel}
          onPressQuestion={(text) => onPressSuggestedQuestion?.(text)}
        />
      );
    }
    return null;
  }

  return (
    <ScenarioTipBanner
      text={parsed.text ?? ""}
      buttonText={primaryButton?.text}
      onPressButton={() => {
        if (!primaryButton) return;
        void handleScenarioButtonPress(
          primaryButton,
          parsed.type,
          room,
          memberId,
        );
      }}
    />
  );
}
