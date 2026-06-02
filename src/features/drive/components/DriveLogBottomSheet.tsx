import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { showAppAlert } from "@/src/providers/appDialog";

import { DriveTutorialAnchor } from "@/src/features/drive/components/DriveTutorialAnchor";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { DriveAddressSearchSheet } from "@/src/features/drive/components/DriveAddressSearchSheet";
import { DriveDateCalendarPicker } from "@/src/features/drive/components/DriveDateCalendarPicker";
import { DriveFormRow } from "@/src/features/drive/components/DriveFormRow";
import { DriveTransportSearchSheet } from "@/src/features/drive/components/DriveTransportSearchSheet";
import { FuelFormBottomSheet } from "@/src/features/drive/components/FuelFormBottomSheet";
import { DRIVE_HISTORY_TYPE_TRANSPORT } from "@/src/features/drive/driveConstants";
import {
  removeDriveHistory,
  saveDriveHistory,
  updateDriveHistory,
} from "@/src/features/drive/driveApi";
import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import type { DriveHistoryItem, TransportInfoItem } from "@/src/features/drive/types";
import { PriceTrendRadioGroup } from "@/src/features/price-trend/PriceTrendRadioGroup";
import {
  useDriveLogSheetHeight,
  useDriveSheetFooterPadding,
  useDriveTopReserved,
} from "@/src/features/drive/useDriveSheetHeight";
import { formatNumberWithComma } from "@/src/features/home/utils";

type TransitItem = {
  transferTransitFullLocate: string;
  transferTransitShortLocate: string;
};

type AddressField =
  | "start"
  | "end"
  | { type: "transit"; index: number };

function emptyTransport(): TransportInfoItem {
  return {
    isCancel: false,
    transportCompany: "",
    transportItem: "",
    transportCost: null,
    cancelCost: null,
    isReceivedReceipt: false,
    isReceivedCost: false,
  };
}

function emptyTransit(): TransitItem {
  return { transferTransitFullLocate: "", transferTransitShortLocate: "" };
}

type Props = {
  visible: boolean;
  driveVehicleInfoId: number;
  baseDay: string;
  initial?: DriveHistoryItem | null;
  tutorialOverlay?: React.ReactNode;
  noModal?: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function DriveLogBottomSheet({
  visible,
  driveVehicleInfoId,
  baseDay,
  initial,
  tutorialOverlay,
  noModal = false,
  onClose,
  onSaved,
}: Props) {
  const editId = initial?.id ?? null;
  const sheetHeight = useDriveLogSheetHeight();
  const minTopInset = useDriveTopReserved();
  const footerPaddingBottom = useDriveSheetFooterPadding();

  const [formDate, setFormDate] = useState(baseDay);
  const [transferStart, setTransferStart] = useState("");
  const [transferStartShort, setTransferStartShort] = useState("");
  const [transferEnd, setTransferEnd] = useState("");
  const [transferEndShort, setTransferEndShort] = useState("");
  const [transits, setTransits] = useState<TransitItem[]>([emptyTransit()]);
  const [transports, setTransports] = useState<TransportInfoItem[]>([emptyTransport()]);
  const [toll, setToll] = useState("");
  const [memo, setMemo] = useState("");
  const [fuelingDisplay, setFuelingDisplay] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [addressField, setAddressField] = useState<AddressField | null>(null);
  const [fuelSheetOpen, setFuelSheetOpen] = useState(false);
  const [transportSearch, setTransportSearch] = useState<{
    index: number;
    kind: "company" | "item";
  } | null>(null);

  /** 입력 완료된 경유지 다음 빈 칸까지만 노출 (최대 3) */
  const visibleTransitCount = useMemo(() => {
    const firstEmpty = transits.findIndex((t) => !t.transferTransitFullLocate?.trim());
    if (firstEmpty === -1) return transits.length;
    return firstEmpty + 1;
  }, [transits]);

  useEffect(() => {
    if (!visible) return;
    setFormDate(
      initial?.transferStartDate?.slice(0, 10) ?? baseDay ?? formatYYYYMMDD(new Date()),
    );
    setTransferStart(initial?.transferStartFullLocate ?? "");
    setTransferStartShort(initial?.transferStartShortLocate ?? "");
    setTransferEnd(initial?.transferEndFullLocate ?? "");
    setTransferEndShort(initial?.transferEndShortLocate ?? "");
    const filledTransits = (initial?.transferTransitLocate ?? [])
      .filter((t) => t.transferTransitFullLocate?.trim())
      .map((t) => ({
        transferTransitFullLocate: t.transferTransitFullLocate ?? "",
        transferTransitShortLocate: t.transferTransitShortLocate ?? "",
      }));
    if (filledTransits.length > 0) {
      setTransits(
        filledTransits.length < 3
          ? [...filledTransits, emptyTransit()]
          : filledTransits,
      );
    } else {
      setTransits([emptyTransit()]);
    }
    setTransports(
      initial?.transportInfos?.length
        ? initial.transportInfos.map((t) => ({ ...emptyTransport(), ...t }))
        : [emptyTransport()],
    );
    setToll(initial?.toll != null ? formatNumberWithComma(initial.toll) : "");
    setMemo(initial?.memo ?? "");
    setFuelingDisplay("");
    setAddressField(null);
    setFuelSheetOpen(false);
    setTransportSearch(null);
  }, [visible, initial, baseDay]);

  const updateTransport = (index: number, patch: Partial<TransportInfoItem>) => {
    setTransports((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const addTransport = () => {
    if (transports.length >= 20) {
      showAppAlert({
        title: "안내",
        message: "운송사 및 운송료는 최대 20개까지 입력 가능합니다.",
      });
      return;
    }
    setTransports((prev) => [...prev, emptyTransport()]);
  };

  const removeTransport = (index: number) => {
    if (transports.length <= 1) return;
    setTransports((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTransit = (index: number, full: string, short: string) => {
    setTransits((prev) => {
      const next = prev.map((item, i) =>
        i === index
          ? { transferTransitFullLocate: full, transferTransitShortLocate: short }
          : item,
      );
      const last = next[next.length - 1];
      if (last?.transferTransitFullLocate && next.length < 3) {
        return [...next, emptyTransit()];
      }
      return next;
    });
  };

  const clearTransit = (index: number) => {
    if (index === 0) {
      setTransits((prev) =>
        prev.map((item, i) => (i === 0 ? emptyTransit() : item)),
      );
      return;
    }
    setTransits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddressSelect = (result: {
    fullLocate: string;
    shortLocate: string;
  }) => {
    const field = addressField;
    if (!field || !result.fullLocate?.trim()) return;

    if (field === "start") {
      setTransferStart(result.fullLocate);
      setTransferStartShort(result.shortLocate);
    } else if (field === "end") {
      setTransferEnd(result.fullLocate);
      setTransferEndShort(result.shortLocate);
    } else {
      updateTransit(field.index, result.fullLocate, result.shortLocate);
    }
    setAddressField(null);
  };

  const closeAddressSearch = () => {
    setAddressField(null);
  };

  const validate = () => {
    if (!transferStart.trim()) {
      Alert.alert("입력 확인", "상차지를 입력해주세요.");
      return false;
    }
    if (!transferEnd.trim()) {
      Alert.alert("입력 확인", "하차지를 입력해주세요.");
      return false;
    }
    for (const t of transports) {
      if (!t.transportCompany?.trim()) {
        Alert.alert("입력 확인", "운송사를 입력해주세요.");
        return false;
      }
      if (!t.isCancel && !t.transportCost) {
        Alert.alert("입력 확인", "운송료를 입력해주세요.");
        return false;
      }
    }
    return true;
  };

  const mapTransportPayload = (t: TransportInfoItem) => {
    const cancelCost =
      t.cancelCost != null && t.cancelCost !== 0
        ? Number(t.cancelCost)
        : t.transportCost != null && t.transportCost !== 0
          ? Number(t.transportCost)
          : null;
    return {
      transportCompany: t.transportCompany,
      transportItem: t.transportItem || "",
      transportCost: t.isCancel
        ? cancelCost
        : Number(t.transportCost),
      cancelCost: t.isCancel ? cancelCost : t.cancelCost,
      isCancel: t.isCancel,
      isReceivedReceipt: t.isReceivedReceipt,
      isReceivedCost: t.isReceivedCost,
    };
  };

  const transitPayload = transits
    .filter((t) => t.transferTransitFullLocate.trim())
    .map((t) => ({
      transferTransitFullLocate: t.transferTransitFullLocate,
      transferTransitShortLocate: t.transferTransitShortLocate || t.transferTransitFullLocate,
    }));

  const submit = async () => {
    if (!validate()) return;
    const tollNum = toll ? Number(toll.replace(/,/g, "")) : null;

    try {
      setSubmitting(true);
      if (editId && initial) {
        const body: Record<string, unknown> = {};
        if (formDate !== initial.transferStartDate?.slice(0, 10)) {
          body.transferStartDate = formDate;
        }
        if (transferStart !== initial.transferStartFullLocate) {
          body.transferStartFullLocate = transferStart;
          body.transferStartShortLocate = transferStartShort || transferStart;
        }
        if (transferEnd !== initial.transferEndFullLocate) {
          body.transferEndFullLocate = transferEnd;
          body.transferEndShortLocate = transferEndShort || transferEnd;
        }
        if (tollNum !== (initial.toll ?? null)) body.toll = tollNum ?? 0;
        if (memo !== (initial.memo ?? "")) body.memo = memo;
        body.transportInfoData = transports.map(mapTransportPayload);
        body.transferTransitLocateData = transitPayload;
        if (Object.keys(body).length === 0) {
          onClose();
          return;
        }
        await updateDriveHistory(editId, body);
        Alert.alert("완료", "운행일지가 수정되었습니다.");
      } else {
        await saveDriveHistory({
          transferStartDate: formDate,
          driveHistoryType: DRIVE_HISTORY_TYPE_TRANSPORT,
          driveVehicleInfoId,
          toll: tollNum,
          memo: memo || null,
          transferEndFullLocate: transferEnd,
          transferEndShortLocate: transferEndShort || transferEnd,
          transferStartFullLocate: transferStart,
          transferStartShortLocate: transferStartShort || transferStart,
          transferTransitLocateData: transitPayload,
          transportInfoData: transports.map(mapTransportPayload),
        });
      }
      onSaved();
      onClose();
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!editId) return;
    try {
      setSubmitting(true);
      await removeDriveHistory(editId);
      onSaved();
      onClose();
    } catch {
      Alert.alert("오류", "삭제에 실패했습니다.");
    } finally {
      setSubmitting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        sheetHeight={sheetHeight}
        minTopInset={minTopInset}
        noModal={noModal}
        tutorialOverlay={tutorialOverlay}
      >
        <View className="flex-1 bg-white">
          <BottomSheetHeader
            title={editId ? "일지 수정" : "일지 추가"}
            onClose={onClose}
          />
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            <DriveFormRow
              label="날짜"
              value={formDate}
              onPress={() => setCalendarOpen(true)}
            />
            <DriveFormRow
              label="상차지"
              required
              value={transferStart}
              placeholder="상차지 검색"
              onPress={() => setAddressField("start")}
            />

            {transits.slice(0, visibleTransitCount).map((transit, index) => (
              <DriveFormRow
                key={`transit-${index}`}
                label={
                  visibleTransitCount > 1 ? `경유지${index + 1}` : "경유지"
                }
                value={transit.transferTransitFullLocate}
                placeholder="경유지 검색"
                onPress={() => setAddressField({ type: "transit", index })}
                rightElement={
                  transit.transferTransitFullLocate ? (
                    <Pressable onPress={() => clearTransit(index)} hitSlop={8}>
                      <Ionicons name="close" size={20} color="#9CA3AF" />
                    </Pressable>
                  ) : undefined
                }
              />
            ))}

            <DriveFormRow
              label="하차지"
              required
              value={transferEnd}
              placeholder="하차지 검색"
              onPress={() => setAddressField("end")}
            />

            <View className="mx-4 mt-4 overflow-hidden rounded-lg border border-gray300">
              {transports.map((transport, index) => (
                <View
                  key={`transport-${index}`}
                  className={index > 0 ? "border-t border-gray300" : ""}
                >
                  <View className="flex-row items-center justify-between px-4 py-3">
                    <Text className="text-[15px] font-semibold text-gray900">
                      운송 {index + 1}
                    </Text>
                    {transports.length > 1 ? (
                      <Pressable onPress={() => removeTransport(index)}>
                        <Text className="text-[14px] text-danger">삭제</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <View className="px-4 pb-4">
                    {index === 0 ? (
                      <DriveTutorialAnchor step={2}>
                        <PriceTrendRadioGroup
                          label="분류"
                          horizontal
                          options={[
                            { code: "false", label: "일반" },
                            { code: "true", label: "회차" },
                          ]}
                          value={transport.isCancel ? "true" : "false"}
                          onChange={(code) => {
                            const isCancel = code === "true";
                            updateTransport(index, {
                              isCancel,
                              ...(isCancel
                                ? {
                                    transportItem: "",
                                    isReceivedReceipt: false,
                                  }
                                : {}),
                            });
                          }}
                        />
                      </DriveTutorialAnchor>
                    ) : (
                      <PriceTrendRadioGroup
                        label="분류"
                        horizontal
                        options={[
                          { code: "false", label: "일반" },
                          { code: "true", label: "회차" },
                        ]}
                        value={transport.isCancel ? "true" : "false"}
                        onChange={(code) => {
                          const isCancel = code === "true";
                          updateTransport(index, {
                            isCancel,
                            ...(isCancel
                              ? {
                                  transportItem: "",
                                  isReceivedReceipt: false,
                                }
                              : {}),
                          });
                        }}
                      />
                    )}
                  </View>

                  <DriveFormRow
                    label="운송사"
                    required
                    value={transport.transportCompany ?? ""}
                    placeholder="운송사 검색"
                    onPress={() =>
                      setTransportSearch({ index, kind: "company" })
                    }
                  />
                  {!transport.isCancel ? (
                    <>
                      <DriveFormRow
                        label="운송품목"
                        value={transport.transportItem ?? ""}
                        placeholder="운송품목 검색"
                        onPress={() =>
                          setTransportSearch({ index, kind: "item" })
                        }
                      />
                    </>
                  ) : null}
                  <DriveFormRow
                    label={transport.isCancel ? "회차비" : "운송료"}
                    required={!transport.isCancel}
                    editable
                    value={
                      transport.isCancel
                        ? transport.cancelCost != null
                          ? formatNumberWithComma(transport.cancelCost)
                          : ""
                        : transport.transportCost != null
                          ? formatNumberWithComma(transport.transportCost)
                          : ""
                    }
                    placeholder="금액 입력"
                    unit="원"
                    keyboardType="number-pad"
                    onChangeText={(t) => {
                      const cleaned = t.replace(/[^\d]/g, "").slice(0, 9);
                      const num = cleaned ? Number(cleaned) : null;
                      if (transport.isCancel) {
                        updateTransport(index, {
                          cancelCost: num,
                          transportCost: num,
                        });
                      } else {
                        updateTransport(index, {
                          transportCost: num ?? 0,
                        });
                      }
                    }}
                  />

                  {!transport.isCancel ? (
                    <View className="px-4 py-4">
                      <PriceTrendRadioGroup
                        label="인수증"
                        horizontal
                        options={[
                          { code: "true", label: "수령" },
                          { code: "false", label: "미수령" },
                        ]}
                        value={transport.isReceivedReceipt ? "true" : "false"}
                        onChange={(code) =>
                          updateTransport(index, {
                            isReceivedReceipt: code === "true",
                          })
                        }
                      />
                    </View>
                  ) : null}
                </View>
              ))}

              <Pressable
                onPress={addTransport}
                className="flex-row items-center justify-center border-t border-dashed border-gray300 py-3"
              >
                <Ionicons name="add" size={18} color="#2563EB" />
                <Text className="ml-1 text-[14px] font-semibold text-primary">
                  운송사 및 운송료 추가
                </Text>
              </Pressable>
            </View>

            <View className="border-t-8 border-gray100">
              <DriveFormRow
                label="주유비"
                value={fuelingDisplay}
                placeholder="주유비 추가"
                onPress={() => setFuelSheetOpen(true)}
              />
              <DriveFormRow
                label="통행료"
                editable
                value={toll}
                placeholder="통행료 입력"
                unit="원"
                keyboardType="number-pad"
                onChangeText={(t) =>
                  setToll(
                    formatNumberWithComma(t.replace(/[^\d]/g, "").slice(0, 9)),
                  )
                }
              />
              <DriveFormRow
                label="메모"
                editable
                value={memo}
                placeholder="메모 입력"
                onChangeText={setMemo}
              />
            </View>
          </ScrollView>

          <View
            className="flex-row gap-2 border-t border-gray200 bg-white px-4 pt-3"
            style={{ paddingBottom: footerPaddingBottom }}
          >
            {editId ? (
              <Pressable
                onPress={() => setDeleteOpen(true)}
                className="min-w-[72px] items-center justify-center rounded-lg border border-gray300 py-4"
              >
                <Text className="text-[16px] font-bold text-gray600">삭제</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={submit}
              disabled={submitting}
              className="flex-1 items-center rounded-lg bg-primary py-4"
            >
              <Text className="text-[16px] font-bold text-white">
                {submitting ? "저장 중..." : "저장"}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      <DriveDateCalendarPicker
        visible={calendarOpen}
        selectedYmd={formDate}
        onClose={() => setCalendarOpen(false)}
        onSelect={setFormDate}
      />

      {addressField ? (
        <DriveAddressSearchSheet
          visible
          title={
            addressField === "start"
              ? "상차지 주소 검색"
              : addressField === "end"
                ? "하차지 주소 검색"
                : "경유지 주소 검색"
          }
          searchPlaceholder={
            addressField === "start"
              ? "상차지 검색"
              : addressField === "end"
                ? "하차지 검색"
                : "경유지 검색"
          }
          onClose={closeAddressSearch}
          onSelect={handleAddressSelect}
        />
      ) : null}

      {transportSearch ? (
        <DriveTransportSearchSheet
          visible
          kind={transportSearch.kind}
          title={transportSearch.kind === "company" ? "운송사" : "운송 품목"}
          placeholder={transportSearch.kind === "company" ? "운송사" : "운송품목"}
          initialValue={
            transportSearch.kind === "company"
              ? transports[transportSearch.index]?.transportCompany ?? ""
              : transports[transportSearch.index]?.transportItem ?? ""
          }
          onClose={() => setTransportSearch(null)}
          onConfirm={(value) => {
            if (transportSearch.kind === "company") {
              updateTransport(transportSearch.index, { transportCompany: value });
            } else {
              updateTransport(transportSearch.index, { transportItem: value });
            }
          }}
        />
      ) : null}

      <FuelFormBottomSheet
        visible={fuelSheetOpen}
        driveVehicleInfoId={driveVehicleInfoId}
        defaultRefuelDay={formDate}
        onClose={() => setFuelSheetOpen(false)}
        onSaved={setFuelingDisplay}
        onRefetch={onSaved}
      />

      <ConfirmDialog
        visible={deleteOpen}
        title="일지 삭제"
        rightLabel="삭제"
        onLeft={() => setDeleteOpen(false)}
        onRight={onDelete}
      >
        <Text className="text-center text-[14px] text-gray700">삭제하시겠습니까?</Text>
      </ConfirmDialog>
    </>
  );
}
