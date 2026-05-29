import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getLicenseFilterInfo } from "@/src/api/license";
import {
  BottomSheet,
  BottomSheetHeader,
} from "@/src/components/common/BottomSheet";
import { appColors } from "@/src/constants/colors";
import { LicenseSearchTypeRow } from "@/src/features/license/components/LicenseSearchTypeRow";
import {
  BASE_TONNAGE,
  filterLicenseTypesByTons,
  getLicenseTypeDisplay,
} from "@/src/features/license/utils";
import {
  OptionItem,
  OptionPickerSheet,
} from "@/src/features/sell-car/registration/OptionPickerSheet";

import type { RegistrationProduct } from "./types";

type SalesLicenseInfoSheetProps = {
  visible: boolean;
  tons?: number | string;
  initialLicense?: RegistrationProduct["license"];
  onClose: () => void;
  onSave: (license: NonNullable<RegistrationProduct["license"]>) => void;
};

export function SalesLicenseInfoSheet({
  visible,
  tons,
  initialLicense,
  onClose,
  onSave,
}: SalesLicenseInfoSheetProps) {
  const insets = useSafeAreaInsets();
  const [licenseType, setLicenseType] = useState<{ code: string; desc: string }>(
    {
      code: initialLicense?.licenseType?.code ?? "",
      desc: initialLicense?.licenseType?.desc ?? "",
    },
  );
  const [price, setPrice] = useState(
    initialLicense?.price != null ? String(initialLicense.price) : "",
  );
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [typeOptions, setTypeOptions] = useState<OptionItem[]>([]);

  const tonsNumber = Number(tons);
  const maxTons = Number.isFinite(tonsNumber)
    ? Math.max(BASE_TONNAGE, tonsNumber)
    : BASE_TONNAGE;

  useEffect(() => {
    if (!visible) return;
    setLicenseType({
      code: initialLicense?.licenseType?.code ?? "",
      desc: initialLicense?.licenseType?.desc ?? "",
    });
    setPrice(initialLicense?.price != null ? String(initialLicense.price) : "");
  }, [visible, initialLicense]);

  useEffect(() => {
    if (!visible) return;
    void getLicenseFilterInfo()
      .then((data) => {
        if (!Number.isFinite(tonsNumber)) {
          setTypeOptions(
            (data.licenseType ?? []).map((item) => ({
              code: item.code,
              desc: item.desc,
            })),
          );
          return;
        }
        setTypeOptions(
          filterLicenseTypesByTons(data.licenseType ?? [], tonsNumber).map(
            (item) => ({
              code: item.code,
              desc: item.desc,
            }),
          ),
        );
      })
      .catch(() => setTypeOptions([]));
  }, [visible, tonsNumber]);

  const canSave = useMemo(
    () => Boolean(licenseType.code && price.replace(/[^\d]/g, "")),
    [licenseType.code, price],
  );

  const sheetHeight = useMemo(() => {
    const bottomPad = Math.max(insets.bottom, 16);
    const headerHeight = 57;
    const rowHeight = 57;
    const saveAreaHeight = 24 + 52;
    return headerHeight + rowHeight + rowHeight + saveAreaHeight + bottomPad;
  }, [insets.bottom]);

  const handleSave = () => {
    const normalizedPrice = price.replace(/[^\d]/g, "");
    if (!licenseType.code || !normalizedPrice) {
      Alert.alert("입력 필요", "번호판 종류와 금액을 입력해주세요.");
      return;
    }
    onSave({
      licenseType,
      price: normalizedPrice,
    });
    onClose();
  };

  return (
    <>
      <BottomSheet
        visible={visible}
        onClose={onClose}
        contentLayout="hug"
        sheetHeight={sheetHeight}
      >
        <View className="bg-white">
          <BottomSheetHeader title="번호판 정보" onClose={onClose} bordered />
          <LicenseSearchTypeRow
            label="번호판 종류"
            value={
              getLicenseTypeDisplay(licenseType, maxTons) || "번호판 종류 선택"
            }
            onPress={() => setTypePickerOpen(true)}
          />
          <View className="flex-row items-center border-b border-gray300 px-4 py-4">
            <Text className="w-[100px] text-[16px] font-semibold text-gray800">
              번호판 금액
            </Text>
            <TextInput
              className="mr-2 flex-1 text-right text-[16px] font-medium text-gray900"
              placeholder="번호판 금액 입력"
              placeholderTextColor={appColors.gray500}
              keyboardType="number-pad"
              value={price}
              onChangeText={(value) => setPrice(value.replace(/[^\d]/g, ""))}
            />
            <Text className="text-[16px] text-gray800">만원</Text>
          </View>
          <View
            className="px-4 pt-6"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <Pressable
              disabled={!canSave}
              onPress={handleSave}
              className="h-[52px] items-center justify-center rounded-lg"
              style={{
                backgroundColor: canSave ? appColors.primary : appColors.gray400,
              }}
            >
              <Text className="text-[16px] font-bold text-white">저장</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      <OptionPickerSheet
        visible={typePickerOpen}
        title="번호판 종류"
        options={typeOptions}
        selectedCode={licenseType.code || undefined}
        onClose={() => setTypePickerOpen(false)}
        onSelect={(item) => {
          setLicenseType({ code: item.code, desc: item.desc });
          setTypePickerOpen(false);
        }}
      />
    </>
  );
}
