import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { appColors } from "@/src/constants/colors";

const PAUSE_REASON_OPTIONS = [
  { code: "PRICE", desc: "계약 예정입니다." },
  { code: "NO_INQUIRY", desc: "구매 문의가 없어요." },
  { code: "KEEP_USING", desc: "차량을 계속 사용하기로 했어요." },
  { code: "OTHER_PLATFORM", desc: "다른 플랫폼에 판매하기로 했어요." },
  { code: "ETC", desc: "기타" },
] as const;

const ETC_CODE = "ETC";
const MAX_COMMENT_LENGTH = 200;

type PauseSaleModalProps = {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (pauseReason: string) => void;
};

export function PauseSaleModal({
  visible,
  loading = false,
  onClose,
  onConfirm,
}: PauseSaleModalProps) {
  const [selectedReasonCode, setSelectedReasonCode] = useState("");
  const [comment, setComment] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [commentError, setCommentError] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedReasonCode("");
      setComment("");
      setReasonError(false);
      setCommentError(false);
    }
  }, [visible]);

  const showCommentField = selectedReasonCode === ETC_CODE;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedReasonCode) {
      setReasonError(true);
      return;
    }
    if (selectedReasonCode === ETC_CODE && comment.trim() === "") {
      setCommentError(true);
      return;
    }

    const selectedOption = PAUSE_REASON_OPTIONS.find(
      (option) => option.code === selectedReasonCode,
    );
    const pauseReason =
      selectedReasonCode === ETC_CODE
        ? comment.trim()
        : (selectedOption?.desc ?? "");

    onConfirm(pauseReason);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/35 px-5">
        <View className="max-h-[85%] w-full overflow-hidden rounded-2xl bg-white">
          <ScrollView
            className="px-5 pt-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-center text-[18px] font-bold leading-[26px] text-gray900">
              판매 중지로 상태를{"\n"}변경할까요?
            </Text>
            <Text className="mt-3 text-center text-[14px] leading-[20px] text-danger">
              *판매 중지 처리 후 판매 중으로{"\n"}상태변경 가능합니다.
            </Text>

            <Text className="mt-6 text-[16px] font-medium text-gray900">
              판매 중지 사유 <Text className="text-danger">(필수)</Text>
            </Text>

            <View className="mt-3 gap-4">
              {PAUSE_REASON_OPTIONS.map((option) => {
                const selected = selectedReasonCode === option.code;
                return (
                  <Pressable
                    key={option.code}
                    className="flex-row items-center"
                    onPress={() => {
                      setSelectedReasonCode(option.code);
                      setReasonError(false);
                      if (option.code !== ETC_CODE) {
                        setCommentError(false);
                      }
                    }}
                  >
                    <Ionicons
                      name={selected ? "radio-button-on" : "radio-button-off"}
                      size={22}
                      color={selected ? appColors.primary : appColors.gray400}
                    />
                    <Text
                      className={`ml-2 flex-1 text-[16px] ${
                        selected ? "font-semibold text-gray900" : "text-gray800"
                      }`}
                    >
                      {option.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {showCommentField ? (
              <View className="mt-5">
                <Text className="text-[16px] font-medium text-gray900">
                  추가 의견 <Text className="text-danger">(필수)</Text>
                </Text>
                <View className="mt-2 rounded-xl border border-gray300 bg-gray100 px-3 py-2">
                  <TextInput
                    className="min-h-[88px] text-[16px] text-gray900"
                    style={{ textAlignVertical: "top" }}
                    placeholder="사유를 적어주세요."
                    placeholderTextColor={appColors.gray500}
                    multiline
                    maxLength={MAX_COMMENT_LENGTH}
                    value={comment}
                    onChangeText={(text) => {
                      setComment(text);
                      if (text.trim()) setCommentError(false);
                    }}
                  />
                </View>
                <Text className="mt-1 text-right text-[12px] text-gray700">
                  {comment.length} / {MAX_COMMENT_LENGTH}자
                </Text>
              </View>
            ) : null}

            {reasonError ? (
              <Text className="mt-4 text-[14px] text-danger">사유를 선택해주세요.</Text>
            ) : null}
            {commentError ? (
              <Text className="mt-4 text-[14px] text-danger">추가 의견을 입력해주세요.</Text>
            ) : null}
          </ScrollView>

          <View className="mt-4 flex-row border-t border-gray300">
            <Pressable
              onPress={handleClose}
              disabled={loading}
              className="flex-1 items-center justify-center border-r border-gray300 py-4"
            >
              <Text className="text-[16px] font-semibold text-primary">취소</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              className="flex-1 items-center justify-center py-4"
            >
              <Text className="text-[16px] font-semibold text-primary">
                {loading ? "처리 중..." : "확인"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
