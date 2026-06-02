import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { pickImageFromLibrary } from "@/src/utils/pickImageFromLibrary";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { showAppAlert } from "@/src/providers/appDialog";
import { DriveDateCalendarPicker } from "@/src/features/drive/components/DriveDateCalendarPicker";
import { DriveFormRow } from "@/src/features/drive/components/DriveFormRow";
import {
  saveFuelingHistory,
  uploadFuelingReceipt,
} from "@/src/features/drive/driveApi";
import { formatYYYYMMDD } from "@/src/features/drive/driveDateUtils";
import {
  useDriveFuelSheetHeight,
  useDriveSheetFooterPadding,
  useDriveTopReserved,
} from "@/src/features/drive/useDriveSheetHeight";
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

type Props = {
  visible: boolean;
  driveVehicleInfoId: number;
  defaultRefuelDay: string;
  onClose: () => void;
  /** 일지 폼에서 주유비 연동 시에만 사용 */
  onSaved?: (displayValue: string) => void;
  onRefetch?: () => void;
};

export function FuelFormBottomSheet({
  visible,
  driveVehicleInfoId,
  defaultRefuelDay,
  onClose,
  onSaved,
  onRefetch,
}: Props) {
  const [refuelDay, setRefuelDay] = useState(defaultRefuelDay);
  const [unitPrice, setUnitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const sheetHeight = useDriveFuelSheetHeight();
  const minTopInset = useDriveTopReserved();
  const footerPaddingBottom = useDriveSheetFooterPadding();

  useEffect(() => {
    if (visible) {
      setRefuelDay(defaultRefuelDay);
      setUnitPrice("");
      setAmount("");
      setPrice("");
      setReceiptImageUrl("");
      setAmountError("");
    }
  }, [visible, defaultRefuelDay]);

  const recalc = (field: "unitPrice" | "amount" | "price", raw: string) => {
    const up = field === "unitPrice" ? Number(raw) : Number(unitPrice);
    const amt = field === "amount" ? Number(raw) : Number(amount);
    const pr =
      field === "price" ? Number(raw.replace(/,/g, "")) : Number(price.replace(/,/g, ""));

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

  const applyReceiptData = async (uri: string, fileName?: string | null, mimeType?: string | null) => {
    try {
      setSubmitting(true);
      const res = await uploadFuelingReceipt({
        uri,
        name: fileName ?? "receipt.jpg",
        type: mimeType ?? "image/jpeg",
      });
      const data = res.data as Record<string, unknown>;
      if (data.receiptImageUrl) setReceiptImageUrl(String(data.receiptImageUrl));
      if (data.unitPrice != null) {
        const up = String(data.unitPrice);
        setUnitPrice(up);
        recalc("unitPrice", up);
      }
      if (data.amount != null) {
        const amt = String(data.amount);
        setAmount(amt);
        const n = Number(amt);
        if (n >= 10000) {
          setAmountError("수량은 10000L미만으로 입력해주세요.");
        } else {
          setAmountError("");
        }
        recalc("amount", amt);
      }
      if (data.price != null) {
        const pr = formatNumberWithComma(Number(data.price));
        setPrice(pr);
        recalc("price", pr);
      }
      if (data.refuelDay) setRefuelDay(String(data.refuelDay));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "영수증 인식에 실패했습니다.";
      showAppAlert({ title: "오류", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await pickImageFromLibrary({ quality: 0.8 });
      if (!result) {
        showAppAlert({ title: "권한 필요", message: "영수증 업로드를 위해 사진 접근 권한이 필요합니다." });
        return;
      }
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      await applyReceiptData(asset.uri, asset.fileName, asset.mimeType);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      showAppAlert({
        title: "오류",
        message:
          msg.includes("getServices") || msg.includes("NoSuchMethodError")
            ? "앱을 다시 빌드해 주세요.\n(npx expo run:android)"
            : "사진을 불러오지 못했습니다.",
      });
    }
  };

  const pickFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showAppAlert({ title: "권한 필요", message: "영수증 촬영을 위해 카메라 권한이 필요합니다." });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      await applyReceiptData(asset.uri, asset.fileName, asset.mimeType);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      showAppAlert({
        title: "오류",
        message:
          msg.includes("getServices") || msg.includes("NoSuchMethodError")
            ? "앱을 다시 빌드해 주세요.\n(npx expo run:android)"
            : "사진을 촬영하지 못했습니다.",
      });
    }
  };

  const pickReceipt = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["취소", "앨범에서 선택", "카메라로 촬영"],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) void pickFromLibrary();
          if (index === 2) void pickFromCamera();
        },
      );
      return;
    }
    Alert.alert("영수증", "영수증 이미지를 선택해주세요.", [
      { text: "취소", style: "cancel" },
      { text: "앨범", onPress: () => void pickFromLibrary() },
      { text: "카메라", onPress: () => void pickFromCamera() },
    ]);
  };

  const submit = async () => {
    if (!refuelDay) {
      showAppAlert({ title: "입력 확인", message: "주유일자를 입력해주세요." });
      return;
    }
    const priceNum = Number(price.replace(/,/g, ""));
    if (!priceNum) {
      showAppAlert({ title: "입력 확인", message: "주유금액을 입력해주세요." });
      return;
    }
    if (amountError) return;

    try {
      setSubmitting(true);
      await saveFuelingHistory({
        driveVehicleInfoId,
        refuelDay,
        unitPrice: unitPrice ? Number(unitPrice) : null,
        amount: amount ? Number(amount) : null,
        price: priceNum,
        receiptImageUrl: receiptImageUrl || null,
      });
      if (onSaved) {
        let display = `${formatNumberWithComma(priceNum)}원`;
        if (amount) display += `(${amount}L)`;
        onSaved(display);
      }
      onRefetch?.();
      onClose();
    } catch {
      showAppAlert({ title: "오류", message: "저장에 실패했습니다." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        sheetHeight={sheetHeight}
        minTopInset={minTopInset}
      >
        <View className="flex-1 bg-white">
          <BottomSheetHeader title="주유비 추가" onClose={onClose} />
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            <View className="px-4 pb-28 pt-2">
              <Text className="mb-2 text-[15px] text-gray700">영수증</Text>
              <Pressable
                onPress={pickReceipt}
                disabled={submitting}
                className="mb-2 items-center justify-center rounded-lg border border-gray400 bg-gray100 py-10"
              >
                {receiptImageUrl ? (
                  <Image
                    source={{ uri: receiptImageUrl }}
                    style={{ width: "100%", height: 160, borderRadius: 8 }}
                    contentFit="contain"
                  />
                ) : (
                  <>
                    <Ionicons name="document-outline" size={32} color="#9CA3AF" />
                    <Text className="mt-3 px-4 text-center text-[16px] font-semibold text-gray700">
                      여기를 클릭해 영수증 이미지를 올려주세요.
                    </Text>
                    <Text className="mt-2 px-6 text-center text-[14px] leading-5 text-gray700">
                      영수증 이미지를 업로드하면{"\n"}모든 항목이 자동 입력됩니다.
                    </Text>
                  </>
                )}
              </Pressable>

              <DriveFormRow
                label="주유일자"
                value={refuelDay}
                onPress={() => setCalendarOpen(true)}
              />
              <DriveFormRow
                label="단가"
                editable
                value={unitPrice}
                placeholder="단가 입력"
                unit="원"
                keyboardType="decimal-pad"
                onChangeText={(t) => {
                  const next = sanitizeInt(t, 5);
                  setUnitPrice(next);
                  recalc("unitPrice", next);
                }}
              />
              <DriveFormRow
                label="수량"
                editable
                value={amount}
                placeholder="수량 입력"
                unit="L"
                keyboardType="decimal-pad"
                onChangeText={(t) => {
                  const next = sanitizeFloat(t);
                  setAmount(next);
                  const n = Number(next);
                  if (n >= 10000) {
                    setAmountError("수량은 10000L미만으로 입력해주세요.");
                  } else {
                    setAmountError("");
                  }
                  recalc("amount", next);
                }}
              />
              {amountError ? (
                <Text className="px-4 pb-2 text-[13px] text-danger">{amountError}</Text>
              ) : null}
              <DriveFormRow
                label="주유금액"
                required
                editable
                value={price}
                placeholder="금액 입력"
                unit="원"
                keyboardType="number-pad"
                onChangeText={(t) => {
                  const next = formatNumberWithComma(
                    sanitizeInt(t.replace(/,/g, ""), 9),
                  );
                  setPrice(next);
                  recalc("price", next);
                }}
              />
            </View>
          </ScrollView>

          <View
            className="border-t border-gray200 bg-white px-4 pt-3"
            style={{ paddingBottom: footerPaddingBottom }}
          >
            <Pressable
              onPress={submit}
              disabled={submitting}
              className="items-center rounded-lg bg-primary py-4"
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
        selectedYmd={refuelDay || formatYYYYMMDD(new Date())}
        onClose={() => setCalendarOpen(false)}
        onSelect={setRefuelDay}
      />
    </>
  );
}
