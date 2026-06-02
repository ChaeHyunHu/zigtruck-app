import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { showAppAlert } from "@/src/providers/appDialog";

import { Screen } from "@/src/components/common/Screen";
import { DriveDetailArrowRow } from "@/src/features/drive/components/DriveDetailArrowRow";
import { DriveFloatingAddButton } from "@/src/features/drive/components/DriveFloatingAddButton";
import { DriveMonthSummaryBar } from "@/src/features/drive/components/DriveMonthSummaryBar";
import { fetchFuelingHistory } from "@/src/features/drive/driveApi";
import {
  addMonths,
  formatYYYYMMDD,
  getDayOfMonthFromYMD,
  getDayOfWeekFromYMD,
  isSameMonth,
  monthFromBaseDay,
} from "@/src/features/drive/driveDateUtils";
import type { FuelingHistoryItem } from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

export function FuelListScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    driveVehicleInfoId?: string;
    baseDay?: string;
  }>();
  const vehicleId = params.driveVehicleInfoId ?? "";
  const [month, setMonth] = useState(() => monthFromBaseDay(params.baseDay));
  const [loading, setLoading] = useState(true);
  const [totalMonth, setTotalMonth] = useState(0);
  const [dayGroups, setDayGroups] = useState<
    Array<{
      baseDay: string;
      totalFuelingCostOfDay: number;
      fuelingHistoryList: FuelingHistoryItem[];
    }>
  >([]);

  const load = useCallback(async () => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchFuelingHistory({
        driveVehicleInfoId: vehicleId,
        fuelingYearAndMonth: formatYYYYMMDD(month).slice(0, 7),
      });
      setTotalMonth(data.totalFuelingCostOfMonth ?? 0);
      setDayGroups(data.fuelingHistoryByBaseDayList ?? []);
    } catch {
      showAppAlert({ title: "오류", message: "주유비 내역을 불러오지 못했습니다." });
      setDayGroups([]);
    } finally {
      setLoading(false);
    }
  }, [month, vehicleId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const today = new Date();
  const hasData = dayGroups.length > 0;

  const openForm = (item?: FuelingHistoryItem) => {
    if (item?.id) {
      router.push({
        pathname: "/drive/fuel/[id]",
        params: {
          id: String(item.id),
          driveVehicleInfoId: vehicleId,
          baseDay: params.baseDay ?? item.refuelDay ?? "",
          data: JSON.stringify(item),
        },
      });
    } else {
      router.push({
        pathname: "/drive/fuel/form",
        params: {
          driveVehicleInfoId: vehicleId,
          baseDay: params.baseDay ?? formatYYYYMMDD(new Date()),
        },
      });
    }
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="주유비" />
      <DriveMonthSummaryBar
        leftValue={`${formatNumberWithComma(totalMonth)}원`}
        month={month}
        canGoNext={!isSameMonth(month, today)}
        onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
        onNextMonth={() => {
          if (!isSameMonth(month, today)) setMonth((m) => addMonths(m, 1));
        }}
      />
      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <ScrollView
          className="flex-1 border-t-[8px] border-gray100"
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
        >
          {!hasData ? (
            <View className="min-h-[320px] items-center justify-center">
              <Text className="text-center text-[16px] text-gray700">
                등록된 주유비가 없습니다.
              </Text>
              <Pressable
                onPress={() => openForm()}
                className="mt-8 rounded-lg bg-primary px-6 py-3"
              >
                <Text className="text-[16px] font-bold text-white">주유비 추가하기</Text>
              </Pressable>
            </View>
          ) : (
            dayGroups.map((group) => (
              <View key={group.baseDay} className="pt-6">
                <View className="flex-row items-center justify-between border-b border-gray300 pb-2">
                  <Text className="text-[14px] font-medium text-gray600">
                    {getDayOfMonthFromYMD(group.baseDay)}일 {getDayOfWeekFromYMD(group.baseDay)}
                  </Text>
                  <Text className="text-[14px] font-medium text-gray800">
                    {formatNumberWithComma(group.totalFuelingCostOfDay)}원
                  </Text>
                </View>
                {group.fuelingHistoryList.map((item) => (
                  <DriveDetailArrowRow
                    key={item.id}
                    onPress={() => openForm(item)}
                    rows={[
                      ...(item.amount
                        ? [{ label: "수량", value: `${item.amount}L` }]
                        : []),
                      { label: "주유 금액", value: `${formatNumberWithComma(item.price)}원` },
                      ...(item.subsidyForFuel
                        ? [
                            {
                              label: "예상 유가보조금",
                              value: `${formatNumberWithComma(item.subsidyForFuel)}원`,
                            },
                          ]
                        : []),
                    ]}
                  />
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
      {hasData ? <DriveFloatingAddButton label="주유비 추가" onPress={() => openForm()} /> : null}
    </Screen>
  );
}
