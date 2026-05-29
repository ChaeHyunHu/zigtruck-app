import * as ImagePicker from "expo-image-picker";
import { pickImageFromLibrary } from "@/src/utils/pickImageFromLibrary";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import { ScreenStickyFooter } from "@/src/components/common/ScreenStickyFooter";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import {
  removeFuelingHistory,
  saveFuelingHistory,
  updateFuelingHistory,
  uploadFuelingReceipt,
} from "@/src/features/drive/driveApi";
import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import type { FuelingHistoryItem } from "@/src/features/drive/types";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { formatNumberWithComma } from "@/src/features/home/utils";

function sanitizeInt(value: string, maxLen = 9) {
  return value.replace(/[^\d]/g, "").slice(0, maxLen);
}

function sanitizeFloat(value: string, maxLen = 6) {
  let next = value.replace(/[^\d.]/g, "");
  const dot = next.indexOf(".");
  if (dot >= 0) {
    const intPart = next.slice(0, dot);
    const dec = next.slice(dot + 1).replace(/\./g, "").slice(0, 2);
    next = dec ? `${intPart}.${dec}` : intPart + (next.endsWith(".") ? "." : "");
  }
  return next.slice(0, maxLen);
}

export function FuelFormScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    driveVehicleInfoId?: string;
    baseDay?: string;
    data?: string;
  }>();
  const editId = params.id ? Number(params.id) : null;
  const vehicleId = Number(params.driveVehicleInfoId);
  const initial: FuelingHistoryItem | null = useMemo(() => {
    if (!params.data) return null;
    try {
      return JSON.parse(params.data) as FuelingHistoryItem;
    } catch {
      return null;
    }
  }, [params.data]);

  const [refuelDay, setRefuelDay] = useState(
    initial?.refuelDay ?? params.baseDay ?? formatYYYYMMDD(new Date()),
  );
  const [unitPrice, setUnitPrice] = useState(
    initial?.unitPrice != null ? String(initial.unitPrice) : "",
  );
  const [amount, setAmount] = useState(
    initial?.amount != null ? String(initial.amount) : "",
  );
  const [price, setPrice] = useState(
    initial?.price != null ? formatNumberWithComma(initial.price) : "",
  );
  const [receiptImageUrl, setReceiptImageUrl] = useState(initial?.receiptImageUrl ?? "");
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const recalc = (field: "unitPrice" | "amount" | "price", raw: string) => {
    const up = field === "unitPrice" ? Number(raw) : Number(unitPrice);
    const amt = field === "amount" ? Number(raw) : Number(amount);
    const pr = field === "price" ? Number(raw.replace(/,/g, "")) : Number(price.replace(/,/g, ""));

    if (field === "unitPrice" || field === "amount") {
      if (up > 0 && amt > 0) {
        setPrice(formatNumberWithComma(Math.round(up * amt)));
      }
    } else if (up > 0 && pr > 0) {
      setAmount(String(Math.round((pr / up) * 10) / 10));
    } else if (amt > 0 && pr > 0) {
      setUnitPrice(String(Math.round(pr / amt)));
    }
  };

  const onChangeAmount = (t: string) => {
    const next = sanitizeFloat(t);
    setAmount(next);
    const n = Number(next);
    if (n >= 10000) {
      setAmountError("수량은 10000L미만으로 입력해주세요.");
    } else {
      setAmountError("");
    }
    recalc("amount", next);
  };

  const pickReceipt = async () => {
    const result = await pickImageFromLibrary({ quality: 0.8 });
    if (!result) {
      Alert.alert("권한 필요", "영수증 업로드를 위해 사진 접근 권한이 필요합니다.");
      return;
    }
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      setSubmitting(true);
      const res = await uploadFuelingReceipt({
        uri: asset.uri,
        name: asset.fileName ?? "receipt.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
      const data = res.data as Record<string, unknown>;
      if (data.receiptImageUrl) setReceiptImageUrl(String(data.receiptImageUrl));
      if (data.unitPrice != null) {
        const up = String(data.unitPrice);
        setUnitPrice(up);
        recalc("unitPrice", up);
      }
      if (data.amount != null) onChangeAmount(String(data.amount));
      if (data.price != null) {
        const pr = formatNumberWithComma(Number(data.price));
        setPrice(pr);
        recalc("price", pr);
      }
      if (data.refuelDay) setRefuelDay(String(data.refuelDay));
    } catch {
      Alert.alert("오류", "영수증 인식에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!refuelDay) {
      Alert.alert("입력 확인", "주유일자를 입력해주세요.");
      return;
    }
    const priceNum = Number(price.replace(/,/g, ""));
    if (!priceNum) {
      Alert.alert("입력 확인", "주유금액을 입력해주세요.");
      return;
    }
    if (amountError) return;

    const body = {
      driveVehicleInfoId: vehicleId,
      refuelDay,
      unitPrice: unitPrice ? Number(unitPrice) : null,
      amount: amount ? Number(amount) : null,
      price: priceNum,
      receiptImageUrl: receiptImageUrl || null,
    };

    try {
      setSubmitting(true);
      if (editId) {
        await updateFuelingHistory(editId, body);
        Alert.alert("완료", "주유비가 수정되었습니다.", [
          { text: "확인", onPress: () => router.back() },
        ]);
      } else {
        await saveFuelingHistory(body);
        router.replace({
          pathname: "/drive/fuel",
          params: {
            driveVehicleInfoId: String(vehicleId),
            baseDay: refuelDay,
          },
        });
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
      await removeFuelingHistory(editId);
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
      <RegistrationHeader title={editId ? "주유비 수정" : "주유비 추가"} />
      <KeyboardAwareScrollView className="flex-1" footerInset={80}>
        <View className="gap-5 px-4 pb-28 pt-4">
          <Pressable
            onPress={pickReceipt}
            className="items-center justify-center rounded-lg border border-dashed border-gray300 bg-gray100 py-8"
          >
            {receiptImageUrl ? (
              <Image
                source={{ uri: receiptImageUrl }}
                style={{ width: "100%", height: 160, borderRadius: 8 }}
                contentFit="contain"
              />
            ) : (
              <Text className="text-[14px] text-gray700">영수증 사진 업로드 (자동 입력)</Text>
            )}
          </Pressable>

          <LabeledTextInput
            label="주유일자"
            required
            value={refuelDay}
            placeholder="YYYY-MM-DD"
            onChangeText={setRefuelDay}
          />
          <LabeledTextInput
            label="단가"
            value={unitPrice}
            unit="원/L"
            keyboardType="decimal-pad"
            onChangeText={(t) => {
              const next = sanitizeInt(t, 5);
              setUnitPrice(next);
              recalc("unitPrice", next);
            }}
          />
          <LabeledTextInput
            label="수량"
            value={amount}
            unit="L"
            keyboardType="decimal-pad"
            error={Boolean(amountError)}
            errorMessage={amountError}
            onChangeText={onChangeAmount}
          />
          <LabeledTextInput
            label="주유 금액"
            required
            value={price}
            unit="원"
            keyboardType="number-pad"
            onChangeText={(t) => {
              const next = formatNumberWithComma(sanitizeInt(t.replace(/,/g, ""), 9));
              setPrice(next);
              recalc("price", next);
            }}
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
        title="주유비 삭제"
        rightLabel="삭제"
        onLeft={() => setDeleteOpen(false)}
        onRight={onDelete}
      >
        <Text className="text-center text-[14px] text-gray700">삭제하시겠습니까?</Text>
      </ConfirmDialog>
    </Screen>
  );
}
