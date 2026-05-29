import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { DriveTutorialAnchor } from "@/src/features/drive/components/DriveTutorialAnchor";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import { EXPENSE, EXPENSE_UNCLASSIFIED } from "@/src/features/drive/driveConstants";
import { getDriveDaySheetLayout } from "@/src/features/drive/driveDaySheetLayout";
import { formatMonthDayLabel } from "@/src/features/drive/driveDateUtils";
import { useDriveTopReserved } from "@/src/features/drive/useDriveSheetHeight";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";
import type {
  DriveHistoryItem,
  FuelingHistoryItem,
  OtherExpenseWithCategory,
  TransportInfoItem,
} from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";

type Props = {
  visible: boolean;
  selectedDate: Date;
  driveItems: DriveHistoryItem[];
  fuelItems: FuelingHistoryItem[];
  otherItems: OtherExpenseWithCategory[];
  onClose: () => void;
  onAddLog: () => void;
  onAddFuel: () => void;
  onAddOther: () => void;
  onPressDrive: (item: DriveHistoryItem, index: number) => void;
  onPressFuel: (item: FuelingHistoryItem, index: number) => void;
  onPressOther: () => void;
  onToggleReceived?: (info: TransportInfoItem) => void;
  highlightAddLog?: boolean;
  showBackdrop?: boolean;
  noModal?: boolean;
  tutorialOverlay?: React.ReactNode;
  listsSettled?: boolean;
};

function isExpenseCategory(code?: string) {
  return code === EXPENSE || code === EXPENSE_UNCLASSIFIED;
}

function shortenLocate(text: string, max = 11) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}...`;
}

function formatRouteSummary(item: DriveHistoryItem) {
  const start =
    item.transferStartShortLocate?.trim() ||
    item.transferStartFullLocate?.trim() ||
    "";
  const end =
    item.transferEndShortLocate?.trim() || item.transferEndFullLocate?.trim() || "";
  if (start && end) {
    return `${shortenLocate(start)} ... ${shortenLocate(end)}`;
  }
  if (start || end) return start || end;
  return item.title ?? item.driveHistoryType?.desc ?? "운행";
}

function formatDriveDistanceKm(distance?: number) {
  if (distance == null || distance <= 0) return null;
  const km = distance >= 1000 ? distance / 1000 : distance;
  const rounded = Math.round(km * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}km`;
}

function transportAmount(transport: TransportInfoItem) {
  if (transport.isCancel) {
    return transport.cancelCost ?? transport.transportCost ?? 0;
  }
  return transport.transportCost ?? 0;
}

function DriveTransportCard({
  transport,
  onToggleReceived,
}: {
  transport: TransportInfoItem;
  onToggleReceived?: (info: TransportInfoItem) => void;
}) {
  const amount = transportAmount(transport);
  const company = transport.transportCompany?.trim() || "운송사";
  const itemLabel = transport.isCancel
    ? "회차"
    : transport.transportItem?.trim() || "화물";

  return (
    <View className="mb-2 rounded-lg border border-gray200 bg-white px-3 py-3">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-1">
          <Text className="text-[15px] font-medium text-gray900">{company}</Text>
          <Text className="text-[15px] text-gray500">|</Text>
          {transport.isCancel ? (
            <View className="rounded px-1.5 py-0.5 bg-[#E8F5EC]">
              <Text className="text-[12px] font-semibold text-[#2E7D32]">{itemLabel}</Text>
            </View>
          ) : (
            <Text className="text-[15px] font-medium text-gray900" numberOfLines={1}>
              {itemLabel}
            </Text>
          )}
        </View>
        <Text className="text-[15px] font-semibold text-gray900">
          {formatNumberWithComma(amount)}원
        </Text>
      </View>

      {!transport.isCancel ? (
        <View className="mt-2.5 flex-row items-center justify-between gap-2">
          <View className="rounded bg-gray100 px-2 py-1">
            <Text className="text-[12px] text-gray700">
              인수증 {transport.isReceivedReceipt ? "수령" : "미수령"}
            </Text>
          </View>
          {onToggleReceived && transport.id ? (
            <Pressable
              onPress={() => onToggleReceived(transport)}
              className={`rounded-lg border px-3 py-1.5 ${
                transport.isReceivedCost
                  ? "border-gray300 bg-gray100"
                  : "border-gray300 bg-white"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  transport.isReceivedCost ? "text-gray700" : "text-gray800"
                }`}
              >
                {transport.isReceivedCost ? "수금완료" : "수금처리"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function DriveHistoryBlock({
  item,
  index,
  onPressDrive,
  onToggleReceived,
}: {
  item: DriveHistoryItem;
  index: number;
  onPressDrive: (item: DriveHistoryItem, index: number) => void;
  onToggleReceived?: (info: TransportInfoItem) => void;
}) {
  const transports = item.transportInfos?.length ? item.transportInfos : [];
  const distanceLabel = formatDriveDistanceKm(item.distance);

  return (
    <View className="mb-5">
      <Pressable
        onPress={() => onPressDrive(item, index)}
        className="mb-2 flex-row items-center"
      >
        <Text className="min-w-0 flex-1 text-[15px] font-medium text-gray900" numberOfLines={1}>
          {formatRouteSummary(item)}
        </Text>
        {distanceLabel ? (
          <View className="ml-2 rounded bg-gray100 px-2 py-0.5">
            <Text className="text-[12px] font-medium text-gray800">{distanceLabel}</Text>
          </View>
        ) : null}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={appColors.gray600}
          style={{ marginLeft: 4 }}
        />
      </Pressable>

      {transports.length > 0 ? (
        transports.map((transport, transportIndex) => (
          <DriveTransportCard
            key={transport.id ?? `${item.id}-${transportIndex}`}
            transport={transport}
            onToggleReceived={onToggleReceived}
          />
        ))
      ) : (
        <Pressable
          onPress={() => onPressDrive(item, index)}
          className="mb-2 rounded-lg border border-gray200 bg-white px-3 py-3"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-medium text-gray900">
              {item.title ?? item.driveHistoryType?.desc ?? "운행"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={appColors.gray600} />
          </View>
        </Pressable>
      )}

      {item.toll != null && item.toll > 0 ? (
        <View className="mt-1 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-gray100 px-2.5 py-1">
            <Text className="text-[12px] text-gray800">
              통행료 {formatNumberWithComma(item.toll)}원
            </Text>
          </View>
          {item.fuelCost != null && item.fuelCost > 0 ? (
            <View className="rounded-full bg-gray100 px-2.5 py-1">
              <Text className="text-[12px] text-gray800">
                예상 주유비 {formatNumberWithComma(item.fuelCost)}원
              </Text>
            </View>
          ) : null}
        </View>
      ) : item.fuelCost != null && item.fuelCost > 0 ? (
        <View className="mt-1 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-gray100 px-2.5 py-1">
            <Text className="text-[12px] text-gray800">
              예상 주유비 {formatNumberWithComma(item.fuelCost)}원
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function DriveDaySheet({
  visible,
  selectedDate,
  driveItems,
  fuelItems,
  otherItems,
  onClose,
  onAddLog,
  onAddFuel,
  onAddOther,
  onPressDrive,
  onPressFuel,
  onPressOther,
  onToggleReceived,
  highlightAddLog = false,
  showBackdrop = true,
  noModal = false,
  tutorialOverlay,
  listsSettled = true,
}: Props) {
  const insets = useAppSafeAreaInsets();
  const topReserved = useDriveTopReserved();
  const bottomPad = Math.max(insets.bottom, 12);

  const { sheetHeight, contentLayout } = useMemo(
    () =>
      getDriveDaySheetLayout({
        topReserved,
        bottomPad,
        listsSettled,
        driveItems,
        fuelItems,
        otherItems,
      }),
    [
      bottomPad,
      driveItems,
      fuelItems,
      listsSettled,
      otherItems,
      topReserved,
    ],
  );

  const isEmpty =
    listsSettled &&
    (driveItems?.length ?? 0) === 0 &&
    (fuelItems?.length ?? 0) === 0 &&
    (otherItems?.length ?? 0) === 0;

  const hasDrive = driveItems.length > 0;
  const hasFuel = fuelItems.length > 0;
  const hasOther = otherItems.length > 0;

  const sheetBody = (
    <>
        <BottomSheetHeader
          title={`${formatMonthDayLabel(selectedDate)} 내역`}
          onClose={onClose}
        />

        <View className="flex-row gap-2 border-b border-gray200 px-4 py-3">
          <DriveTutorialAnchor step={1} className="flex-1">
            <Pressable
              onPress={onAddLog}
              className={`flex-1 items-center rounded-lg py-2 ${
                highlightAddLog
                  ? "border-2 border-primary bg-[#E7EFFF]"
                  : "bg-[#E7EFFF]"
              }`}
            >
              <Text className="text-[14px] font-semibold text-primary">+ 일지</Text>
            </Pressable>
          </DriveTutorialAnchor>
          <Pressable
            onPress={onAddFuel}
            className="flex-1 items-center rounded-lg bg-gray100 py-2"
          >
            <Text className="text-[14px] font-medium text-gray800">+ 주유비</Text>
          </Pressable>
          <DriveTutorialAnchor step={3} className="flex-1">
            <Pressable
              onPress={onAddOther}
              className="flex-1 items-center rounded-lg bg-gray100 py-2"
            >
              <Text className="text-[14px] font-medium text-gray800">+ 기타내역</Text>
            </Pressable>
          </DriveTutorialAnchor>
        </View>

        <ScrollView
          className={contentLayout === "fill" ? "flex-1" : undefined}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 16,
          }}
          showsVerticalScrollIndicator={contentLayout === "fill"}
          bounces={contentLayout === "fill"}
        >
          {listsSettled && isEmpty ? (
            <Text className="py-4 text-center text-[14px] text-gray600">
              등록된 운행일지가 없습니다.
            </Text>
          ) : null}

          {hasDrive ? (
            <View className="pb-2">
              {driveItems.map((item, index) => (
                <DriveHistoryBlock
                  key={item.id}
                  item={item}
                  index={index}
                  onPressDrive={onPressDrive}
                  onToggleReceived={onToggleReceived}
                />
              ))}
            </View>
          ) : null}

          {hasFuel ? (
            <View
              className={
                hasDrive ? "border-t-[8px] border-gray100 pt-4" : "pt-1"
              }
            >
              <Text className="mb-3 text-[17px] font-bold text-gray900">주유비</Text>
              {fuelItems.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => onPressFuel(item, index)}
                  className="mb-2 flex-row items-center rounded-lg border border-gray200 bg-white px-3 py-3"
                >
                  <View className="min-w-0 flex-1 gap-1">
                    <Text className="text-[14px] leading-5 text-gray900">
                      주유 금액(수량) {formatNumberWithComma(item.price ?? 0)}
                      {item.amount != null ? `(${item.amount}L)` : ""}
                    </Text>
                    {item.subsidyForFuel != null && item.subsidyForFuel > 0 ? (
                      <Text className="text-[13px] leading-[18px] text-gray700">
                        예상 유가보조금 {formatNumberWithComma(item.subsidyForFuel)}원
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={appColors.gray600} />
                </Pressable>
              ))}
            </View>
          ) : null}

          {hasOther ? (
            <View
              className={
                hasDrive || hasFuel ? "border-t-[8px] border-gray100 pt-4" : "pt-1"
              }
            >
              <Pressable onPress={onPressOther} className="mb-3 flex-row items-center">
                <Text className="flex-1 text-[17px] font-bold text-gray900">기타내역</Text>
                <Ionicons name="chevron-forward" size={18} color={appColors.gray600} />
              </Pressable>
              {otherItems.map((item) => {
                const typeCode = item.otherExpensesCategory?.type?.code;
                const isExpense = isExpenseCategory(typeCode);
                const categoryName = item.otherExpensesCategory?.name ?? "기타";
                const detail = item.contents?.trim();
                return (
                  <View
                    key={item.id}
                    className="mb-2 flex-row items-center justify-between rounded-lg border border-gray200 bg-white px-3 py-3"
                  >
                    <Text className="min-w-0 flex-1 pr-3 text-[14px] text-gray800" numberOfLines={2}>
                      {categoryName}
                      {detail ? ` | ${detail}` : ""}
                    </Text>
                    <Text className="text-[15px] font-bold text-gray900">
                      {isExpense ? "-" : "+"}
                      {formatNumberWithComma(item.price ?? 0)}원
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </ScrollView>
    </>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      contentLayout={contentLayout}
      showBackdrop={showBackdrop}
      noModal={noModal}
      tutorialOverlay={tutorialOverlay}
    >
      {contentLayout === "fill" ? (
        <View className="flex-1 bg-white">{sheetBody}</View>
      ) : (
        <View className="bg-white">{sheetBody}</View>
      )}
    </BottomSheet>
  );
}
