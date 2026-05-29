import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import {
  fetchTransportSearchHistory,
  removeSearchHistoryItem,
  type SearchHistoryItem,
  type TransportSearchKind,
} from "@/src/features/drive/driveSearchHistory";
import {
  useDriveTopReserved,
  useDriveTransportSearchSheetHeight,
} from "@/src/features/drive/useDriveSheetHeight";

type Props = {
  visible: boolean;
  kind: TransportSearchKind;
  title: string;
  placeholder: string;
  initialValue?: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

export function DriveTransportSearchSheet({
  visible,
  kind,
  title,
  placeholder,
  initialValue = "",
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const sheetHeight = useDriveTransportSearchSheetHeight();
  const minTopInset = useDriveTopReserved();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await fetchTransportSearchHistory(kind));
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      void loadHistory();
    }
  }, [visible, initialValue, loadHistory]);

  const confirm = () => {
    onConfirm(value.trim());
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      minTopInset={minTopInset}
    >
      <View className="flex-1 bg-white">
        <BottomSheetHeader title={title} onClose={onClose} />
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-4 pt-2">
            <View className="flex-row items-center rounded-xl bg-gray100 px-4 py-3">
              <TextInput
                className="flex-1 text-[16px] text-gray900"
                value={value}
                onChangeText={setValue}
                placeholder={`${placeholder} 입력`}
                placeholderTextColor={appColors.gray600}
                maxLength={25}
                returnKeyType="done"
                onSubmitEditing={confirm}
              />
              <Pressable onPress={confirm} hitSlop={8}>
                <Ionicons name="checkmark-circle" size={24} color={appColors.primary} />
              </Pressable>
            </View>
          </View>

          <View className="px-4 pt-6">
            <Text className="text-[14px] font-semibold text-gray900">최근 검색</Text>
            {loading ? (
              <ActivityIndicator className="mt-4" color={appColors.primary} />
            ) : history.length === 0 ? (
              <Text className="pt-4 text-[14px] text-gray600">최근 검색 기록이 없습니다.</Text>
            ) : (
              history.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setValue(item.keyword);
                    onConfirm(item.keyword);
                    onClose();
                  }}
                  className={`flex-row items-center py-4 ${
                    index < history.length - 1 ? "border-b border-gray300" : ""
                  }`}
                >
                  <Text className="flex-1 text-[14px] text-gray800">{item.keyword}</Text>
                  <Pressable
                    hitSlop={8}
                    onPress={() => void removeSearchHistoryItem(item.id).then(loadHistory)}
                  >
                    <Ionicons name="close" size={18} color={appColors.gray600} />
                  </Pressable>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );
}
