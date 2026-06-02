import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { showAppAlert } from "@/src/providers/appDialog";

import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { ScreenStickyFooter } from "@/src/components/common/ScreenStickyFooter";
import { DRIVE_HISTORY_TYPE_TRANSPORT } from "@/src/features/drive/driveConstants";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import {
  removeDriveHistory,
  saveDriveHistory,
  updateDriveHistory,
} from "@/src/features/drive/driveApi";
import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import type { DriveHistoryItem, TransportInfoItem } from "@/src/features/drive/types";
import { PriceTrendRadioGroup } from "@/src/features/price-trend/PriceTrendRadioGroup";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { formatNumberWithComma } from "@/src/features/home/utils";

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

export function DriveLogFormScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    driveVehicleInfoId?: string;
    baseDay?: string;
    data?: string;
  }>();
  const editId = params.id ? Number(params.id) : null;
  const vehicleId = Number(params.driveVehicleInfoId);
  const initial: DriveHistoryItem | null = useMemo(() => {
    if (!params.data) return null;
    try {
      return JSON.parse(params.data) as DriveHistoryItem;
    } catch {
      return null;
    }
  }, [params.data]);

  const [formDate, setFormDate] = useState(
    initial?.transferStartDate?.slice(0, 10) ??
      params.baseDay ??
      formatYYYYMMDD(new Date()),
  );
  const [transferStart, setTransferStart] = useState(
    initial?.transferStartFullLocate ?? "",
  );
  const [transferEnd, setTransferEnd] = useState(initial?.transferEndFullLocate ?? "");
  const [transports, setTransports] = useState<TransportInfoItem[]>(
    initial?.transportInfos?.length
      ? initial.transportInfos.map((t) => ({ ...emptyTransport(), ...t }))
      : [emptyTransport()],
  );
  const [toll, setToll] = useState(
    initial?.toll != null ? formatNumberWithComma(initial.toll) : "",
  );
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const mapTransportPayload = (t: TransportInfoItem) => ({
    transportCompany: t.transportCompany,
    transportItem: t.transportItem,
    transportCost: t.isCancel ? t.transportCost : Number(t.transportCost),
    cancelCost: t.isCancel ? Number(t.cancelCost ?? t.transportCost) : t.cancelCost,
    isCancel: t.isCancel,
    isReceivedReceipt: t.isReceivedReceipt,
    isReceivedCost: t.isReceivedCost,
  });

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
          body.transferStartShortLocate = transferStart;
        }
        if (transferEnd !== initial.transferEndFullLocate) {
          body.transferEndFullLocate = transferEnd;
          body.transferEndShortLocate = transferEnd;
        }
        if (tollNum !== (initial.toll ?? null)) body.toll = tollNum ?? 0;
        if (memo !== (initial.memo ?? "")) body.memo = memo;
        body.transportInfoData = transports.map(mapTransportPayload);
        if (Object.keys(body).length === 0) {
          router.back();
          return;
        }
        await updateDriveHistory(editId, body);
        Alert.alert("완료", "운행일지가 수정되었습니다.", [
          { text: "확인", onPress: () => router.back() },
        ]);
      } else {
        await saveDriveHistory({
          transferStartDate: formDate,
          driveHistoryType: DRIVE_HISTORY_TYPE_TRANSPORT,
          driveVehicleInfoId: vehicleId,
          toll: tollNum,
          memo: memo || null,
          transferEndFullLocate: transferEnd,
          transferEndShortLocate: transferEnd,
          transferStartFullLocate: transferStart,
          transferStartShortLocate: transferStart,
          transferTransitLocateData: [],
          transportInfoData: transports.map(mapTransportPayload),
        });
        router.back();
      }
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
      router.back();
    } catch {
      Alert.alert("오류", "삭제에 실패했습니다.");
    } finally {
      setSubmitting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title={editId ? "일지 수정" : "일지 추가"} />
      <KeyboardAwareScrollView className="flex-1" footerInset={80}>
        <View className="gap-5 px-4 pb-28 pt-4">
          <LabeledTextInput
            label="날짜"
            required
            value={formDate}
            onChangeText={setFormDate}
          />
          <LabeledTextInput
            label="상차지"
            required
            value={transferStart}
            placeholder="상차지 입력"
            onChangeText={setTransferStart}
          />
          <LabeledTextInput
            label="하차지"
            required
            value={transferEnd}
            placeholder="하차지 입력"
            onChangeText={setTransferEnd}
          />

          {transports.map((transport, index) => (
            <View
              key={`transport-${index}`}
              className="rounded-lg border border-gray300 p-4"
            >
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[15px] font-semibold text-gray900">
                  운송 {index + 1}
                </Text>
                {transports.length > 1 ? (
                  <Pressable onPress={() => removeTransport(index)}>
                    <Text className="text-[14px] text-danger">삭제</Text>
                  </Pressable>
                ) : null}
              </View>

              <PriceTrendRadioGroup
                label="운행 구분"
                horizontal
                options={[
                  { code: "false", label: "일반" },
                  { code: "true", label: "회차" },
                ]}
                value={transport.isCancel ? "true" : "false"}
                onChange={(code) =>
                  updateTransport(index, { isCancel: code === "true" })
                }
              />

              <View className="mt-4 gap-4">
                <LabeledTextInput
                  label="운송사"
                  required
                  value={transport.transportCompany ?? ""}
                  onChangeText={(t) =>
                    updateTransport(index, { transportCompany: t })
                  }
                />
                <LabeledTextInput
                  label="운송 품목"
                  value={transport.transportItem ?? ""}
                  onChangeText={(t) => updateTransport(index, { transportItem: t })}
                />
                <LabeledTextInput
                  label={transport.isCancel ? "회차비" : "운송료"}
                  required
                  value={
                    transport.isCancel
                      ? transport.cancelCost != null
                        ? formatNumberWithComma(transport.cancelCost)
                        : ""
                      : transport.transportCost != null
                        ? formatNumberWithComma(transport.transportCost)
                        : ""
                  }
                  unit="원"
                  keyboardType="number-pad"
                  onChangeText={(t) => {
                    const num = Number(t.replace(/,/g, ""));
                    if (transport.isCancel) {
                      updateTransport(index, { cancelCost: num, transportCost: num });
                    } else {
                      updateTransport(index, { transportCost: num });
                    }
                  }}
                />
                <PriceTrendRadioGroup
                  label="영수증"
                  horizontal
                  options={[
                    { code: "true", label: "수령" },
                    { code: "false", label: "미수령" },
                  ]}
                  value={transport.isReceivedReceipt ? "true" : "false"}
                  onChange={(code) =>
                    updateTransport(index, { isReceivedReceipt: code === "true" })
                  }
                />
              </View>
            </View>
          ))}

          <Pressable
            onPress={addTransport}
            className="items-center rounded-lg border border-dashed border-gray300 py-3"
          >
            <Text className="text-[14px] font-semibold text-primary">+ 운송 추가</Text>
          </Pressable>

          <LabeledTextInput
            label="통행료"
            value={toll}
            unit="원"
            keyboardType="number-pad"
            onChangeText={(t) =>
              setToll(formatNumberWithComma(t.replace(/[^\d]/g, "").slice(0, 9)))
            }
          />
          <LabeledTextInput
            label="메모"
            value={memo}
            placeholder="메모 입력"
            onChangeText={setMemo}
          />
        </View>
      </KeyboardAwareScrollView>

      <ScreenStickyFooter className="border-t-0">
        <DualFooterButtons
          safeAreaBottom={false}
          leftLabel={editId ? "삭제" : undefined}
          onPressLeft={editId ? () => setDeleteOpen(true) : undefined}
          rightLabel="저장"
          loading={submitting}
          onPressRight={submit}
        />
      </ScreenStickyFooter>

      <ConfirmDialog
        visible={deleteOpen}
        title="일지 삭제"
        rightLabel="삭제"
        onLeft={() => setDeleteOpen(false)}
        onRight={onDelete}
      >
        <Text className="text-center text-[14px] text-gray700">삭제하시겠습니까?</Text>
      </ConfirmDialog>
    </Screen>
  );
}
