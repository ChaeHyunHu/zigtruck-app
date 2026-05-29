import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import { DaumPostcodeWebView } from "@/src/features/drive/components/DaumPostcodeWebView";
import {
  fetchLocateSearchHistory,
  removeSearchHistoryItem,
  type SearchHistoryItem,
} from "@/src/features/drive/driveSearchHistory";
import {
  useDriveAddressSheetHeight,
  useDriveTopReserved,
} from "@/src/features/drive/useDriveSheetHeight";
import { extractCityCounty } from "@/src/features/drive/utils/extractCityCounty";

export type AddressLocateResult = {
  fullLocate: string;
  shortLocate: string;
};

type Step = "history" | "postcode";

type Props = {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  onClose: () => void;
  onSelect: (result: AddressLocateResult) => void;
};

export function DriveAddressSearchSheet({
  visible,
  title,
  searchPlaceholder,
  onClose,
  onSelect,
}: Props) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const [step, setStep] = useState<Step>("history");
  const sheetHeight = useDriveAddressSheetHeight();
  const minTopInset = useDriveTopReserved();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchLocateSearchHistory();
      setHistory(list);
      return list;
    } catch {
      setHistory([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      setHistoryReady(false);
      setStep("history");
      return;
    }
    setHistoryReady(false);
    void loadHistory().then((list) => {
      setStep(list.length > 0 ? "history" : "postcode");
      setHistoryReady(true);
    });
  }, [visible, loadHistory]);

  const handleHistorySelect = (item: SearchHistoryItem) => {
    onSelect({
      fullLocate: item.keyword,
      shortLocate: extractCityCounty(item.keyword),
    });
    onClose();
  };

  const handlePostcodeComplete = (result: AddressLocateResult) => {
    if (!result.fullLocate?.trim()) return;
    onSelect(result);
    onClose();
  };

  const handleDeleteHistory = async (id: number) => {
    try {
      await removeSearchHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      /* ignore */
    }
  };

  const handleHeaderClose = () => {
    if (step === "postcode" && history.length > 0) {
      setStep("history");
      return;
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleHeaderClose}
      sheetHeight={sheetHeight}
      minTopInset={minTopInset}
    >
      <View className="flex-1 bg-white">
        <BottomSheetHeader title={title} onClose={handleHeaderClose} />

        {!historyReady ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={appColors.primary} />
          </View>
        ) : step === "postcode" ? (
          <DaumPostcodeWebView onComplete={handlePostcodeComplete} />
        ) : (
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="px-4 pt-2">
              <Pressable
                onPress={() => setStep("postcode")}
                className="flex-row items-center rounded-xl bg-gray100 px-4 py-4"
              >
                <Text className="flex-1 text-[16px] text-gray600">
                  {searchPlaceholder}
                </Text>
                <Ionicons name="search" size={22} color={appColors.gray600} />
              </Pressable>
            </View>

            <View className="px-4 pt-8">
              <Text className="text-[14px] font-semibold text-gray900">최근 검색</Text>
              {loading ? (
                <ActivityIndicator className="mt-6" color={appColors.primary} />
              ) : history.length === 0 ? (
                <Text className="pt-6 text-[14px] text-gray600">
                  최근 검색 기록이 없습니다.
                </Text>
              ) : (
                <View className="mt-2">
                  {history.map((item, index) => (
                    <Pressable
                      key={item.id}
                      onPress={() => handleHistorySelect(item)}
                      className={`flex-row items-center py-4 ${
                        index < history.length - 1 ? "border-b border-gray300" : ""
                      }`}
                    >
                      <Text className="flex-1 text-[14px] text-gray800">
                        {item.keyword}
                      </Text>
                      <Pressable
                        hitSlop={8}
                        onPress={() => void handleDeleteHistory(item.id)}
                      >
                        <Ionicons name="close" size={18} color={appColors.gray600} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
}
