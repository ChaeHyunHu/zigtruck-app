import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { DriveLogBottomSheet } from "@/src/features/drive/components/DriveLogBottomSheet";
import { DriveMonthSummaryBar } from "@/src/features/drive/components/DriveMonthSummaryBar";
import {
  fetchOutstandingAmount,
  patchOutstandingReceived,
} from "@/src/features/drive/driveApi";
import {
  addMonths,
  formatYYYYMMDD,
  getDayOfMonthFromYMD,
  getDayOfWeekFromYMD,
  isSameMonth,
  monthFromBaseDay,
} from "@/src/features/drive/driveDateUtils";
import type {
  DriveHistoryItem,
  OutstandingAmountResponse,
  TransportInfoItem,
} from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

export function OutstandingAmountScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ baseDay?: string; driveVehicleInfoId?: string }>();
  const [month, setMonth] = useState(() => monthFromBaseDay(params.baseDay));
  const [search, setSearch] = useState("");
  const [data, setData] = useState<OutstandingAmountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
  const [logEdit, setLogEdit] = useState<DriveHistoryItem | null>(null);
  const [logBaseDay, setLogBaseDay] = useState(params.baseDay ?? "");

  const vehicleId = Number(params.driveVehicleInfoId) || 0;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOutstandingAmount({
        baseDate: formatYYYYMMDD(month).slice(0, 7),
        transportCompany: search,
      });
      setData(res);
    } catch {
      Alert.alert("오류", "미수금 내역을 불러오지 못했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, search]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const today = new Date();
  const groups = data?.driveHistoryWithTransportInfo ?? [];

  const toggleReceived = async (info: TransportInfoItem) => {
    if (!info.id) return;
    try {
      await patchOutstandingReceived([
        { transportInfoId: info.id, isReceived: !info.isReceivedCost },
      ]);
      void load();
    } catch {
      Alert.alert("오류", "수금 상태 변경에 실패했습니다.");
    }
  };

  const patchAll = async () => {
    const items =
      data?.driveHistoryWithTransportInfo?.flatMap((day) =>
        day.driveHistories.flatMap((h) =>
          (h.transportInfos ?? []).map((info) => ({
            transportInfoId: info.id!,
            isReceived: true,
          })),
        ),
      ) ?? [];
    if (items.length === 0) return;
    try {
      await patchOutstandingReceived(items);
      void load();
    } catch {
      Alert.alert("오류", "전체 수금 처리에 실패했습니다.");
    } finally {
      setBulkOpen(false);
    }
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="미수금" />
      <DriveMonthSummaryBar
        leftValue={
          <View>
            <Text className="text-[14px] text-gray700">
              매출 {formatNumberWithComma(data?.sales ?? 0)}원
            </Text>
            <Text className="mt-1 text-[15px] font-semibold text-gray900">
              미수금 {formatNumberWithComma(data?.outstandingAmount ?? 0)}원
            </Text>
          </View>
        }
        month={month}
        canGoNext={!isSameMonth(month, today)}
        onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
        onNextMonth={() => {
          if (!isSameMonth(month, today)) setMonth((m) => addMonths(m, 1));
        }}
      />

      <View className="mx-4 mb-2 flex-row items-center gap-2 rounded-lg border border-gray300 bg-white px-3">
        <Ionicons name="search" size={18} color={appColors.gray600} />
        <TextInput
          className="flex-1 py-3 text-[15px] text-gray900"
          placeholder="운송사 검색"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => void load()}
          returnKeyType="search"
        />
      </View>

      <Pressable
        onPress={() => setBulkOpen(true)}
        disabled={groups.length === 0}
        className={`mx-4 mb-3 rounded-lg py-3 ${groups.length === 0 ? "bg-gray200" : "bg-primary"}`}
      >
        <Text className="text-center text-[15px] font-bold text-white">전체 수금처리</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator className="mt-8" />
      ) : (
        <ScrollView
          className="flex-1 border-t-[8px] border-gray100 px-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {groups.length === 0 ? (
            <Text className="py-16 text-center text-[14px] text-gray600">
              미수금 내역이 없습니다.
            </Text>
          ) : (
            groups.map((day) => (
              <View key={day.baseDay} className="pt-5">
                <View className="flex-row items-center justify-between border-b border-gray300 pb-2">
                  <Text className="text-[14px] font-medium text-gray600">
                    {getDayOfMonthFromYMD(day.baseDay)}일 {getDayOfWeekFromYMD(day.baseDay)}
                  </Text>
                  <Text className="text-[14px] font-medium text-gray800">
                    {formatNumberWithComma(day.outstandingAmountOfDay ?? 0)}원
                  </Text>
                </View>
                {day.driveHistories.map((history) => (
                  <View key={history.id} className="border-b border-gray200 py-3">
                    <Pressable
                      onPress={() => {
                        setLogEdit(history);
                        setLogBaseDay(day.baseDay);
                        setLogSheetOpen(true);
                      }}
                      className="mb-2 flex-row items-center justify-between"
                    >
                      <Text className="text-[15px] font-semibold text-gray900">
                        {history.title ?? "운행"}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color={appColors.gray600} />
                    </Pressable>
                    {(history.transportInfos ?? []).map((info) => (
                      <View
                        key={info.id}
                        className="mb-2 rounded-lg border border-gray300 p-3"
                      >
                        <Text className="text-[14px] font-medium text-gray900">
                          {info.transportCompany}
                        </Text>
                        {info.transportItem ? (
                          <Text className="mt-1 text-[13px] text-gray700">
                            {info.transportItem}
                          </Text>
                        ) : null}
                        <View className="mt-2 flex-row items-center justify-between">
                          <Text className="text-[15px] font-semibold text-gray900">
                            {formatNumberWithComma(info.transportCost ?? info.cancelCost ?? 0)}
                            원
                          </Text>
                          <Pressable
                            onPress={() => toggleReceived(info)}
                            className={`rounded-lg px-3 py-1.5 ${
                              info.isReceivedCost ? "bg-gray200" : "bg-primary"
                            }`}
                          >
                            <Text
                              className={`text-[13px] font-semibold ${
                                info.isReceivedCost ? "text-gray800" : "text-white"
                              }`}
                            >
                              {info.isReceivedCost ? "수금완료" : "수금처리"}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {vehicleId > 0 ? (
        <DriveLogBottomSheet
          visible={logSheetOpen}
          driveVehicleInfoId={vehicleId}
          baseDay={logBaseDay}
          initial={logEdit}
          onClose={() => {
            setLogSheetOpen(false);
            setLogEdit(null);
          }}
          onSaved={() => void load()}
        />
      ) : null}

      <ConfirmDialog
        visible={bulkOpen}
        title="전체 수금처리"
        rightLabel="확인"
        onLeft={() => setBulkOpen(false)}
        onRight={patchAll}
      >
        <Text className="text-center text-[14px] text-gray700">
          {search ? `'${search}' ` : ""}
          {month.getMonth() + 1}월 전체 내역을 수금 처리하시겠어요?
        </Text>
      </ConfirmDialog>
    </Screen>
  );
}
