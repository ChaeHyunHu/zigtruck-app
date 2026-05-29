import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import {
  createLicenseListing,
  getLicenseFilterInfo,
  postLicensePurchaseInquiry,
  type LicenseFilterInfo,
} from "@/src/api/license";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import {
  LicenseCircleRadioGroup,
  LicenseNoticeBox,
} from "@/src/features/license/components/LicenseCircleRadioGroup";
import { getLicenseTheme } from "@/src/features/license/licenseTheme";
import {
  BASE_TONNAGE,
  filterLicenseTypesByTons,
  getCurrentYear,
  getLicenseTypeDisplay,
} from "@/src/features/license/utils";
import { PriceInputField } from "@/src/features/sell-car/registration/PriceInputField";
import { PriceTrendSelectField } from "@/src/features/price-trend/PriceTrendSelectField";
import {
  OptionPickerSheet,
  type PickerOption,
} from "@/src/features/price-trend/OptionPickerSheet";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";

type Mode = "purchase" | "sales";

type Props = {
  mode: Mode;
  onSuccess?: () => void;
};

export function LicenseInquiryForm({ mode, onSuccess }: Props) {
  const theme = getLicenseTheme(mode);
  const { isAuthenticated, memberId } = useAuth();
  const [enumData, setEnumData] = useState<LicenseFilterInfo | null>(null);
  const [year, setYear] = useState("");
  const [tons, setTons] = useState("");
  const [price, setPrice] = useState<number | undefined>();
  const [licenseSalesType, setLicenseSalesType] = useState("TRADE");
  const [licenseType, setLicenseType] = useState({ code: "", desc: "" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<PickerOption[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const maxTons = useMemo(() => {
    const n = Number(tons);
    if (!Number.isFinite(n) || n <= 0) return BASE_TONNAGE;
    if (n < 1.5) return 1.5;
    if (n < 3.5) return 3.5;
    if (n < 5) return 5;
    if (n < 10) return 10;
    if (n < 15) return 15;
    if (n < 19) return 19;
    if (n < 25) return 25;
    return 27;
  }, [tons]);

  useEffect(() => {
    getLicenseFilterInfo()
      .then(setEnumData)
      .catch(() => undefined);
  }, []);

  const salesOptions = useMemo(
    () =>
      (enumData?.licenseSalesType ?? []).map((item) => ({
        code: item.code,
        label: item.desc,
      })),
    [enumData],
  );

  const openLicenseTypePicker = useCallback(() => {
    const n = Number(tons);
    if (!enumData || !Number.isFinite(n)) {
      Alert.alert("입력 필요", "톤수를 먼저 입력해주세요.");
      return;
    }
    setPickerOptions(
      filterLicenseTypesByTons(enumData.licenseType, n).map((item) => ({
        code: item.code,
        desc: item.desc,
      })),
    );
    setPickerOpen(true);
  }, [enumData, tons]);

  const isValid = useMemo(() => {
    if (!year || !tons || !licenseSalesType) return false;
    if (licenseSalesType === "TRADE" && !licenseType.code) return false;
    if (mode === "sales" && (!price || price <= 0)) return false;
    return true;
  }, [licenseSalesType, licenseType.code, mode, price, tons, year]);

  const reset = () => {
    setYear("");
    setTons("");
    setPrice(undefined);
    setLicenseSalesType("TRADE");
    setLicenseType({ code: "", desc: "" });
  };

  const submit = async () => {
    if (!isAuthenticated || !memberId) {
      promptLogin();
      return;
    }
    if (!isValid) {
      Alert.alert("입력 필요", "필수 항목을 모두 입력해주세요.");
      return;
    }
    try {
      setSubmitting(true);
      if (mode === "purchase") {
        await postLicensePurchaseInquiry({
          memberId: Number(memberId),
          year,
          tons,
          licenseSalesType,
          licenseType: licenseType.code || undefined,
          maxTons: String(maxTons),
        });
      } else {
        await createLicenseListing({
          memberId: Number(memberId),
          year,
          tons,
          licenseSalesType,
          licenseType: licenseType.code,
          price,
          maxTons: String(maxTons),
          certificationImageUrl: "",
          licenseImageUrl: "",
        });
      }
      setSuccessOpen(true);
    } catch {
      Alert.alert("오류", "등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="px-4 pb-28 pt-4"
        keyboardShouldPersistTaps="handled"
      >
        <LicenseNoticeBox mode={mode} />

        <View className="gap-7">
          <LabeledTextInput
            label="연식"
            required
            placeholder={`연식 입력 ex) ${getCurrentYear()}`}
            value={year}
            keyboardType="number-pad"
            onChangeText={(text) =>
              setYear(text.replace(/[^\d]/g, "").slice(0, 4))
            }
          />
          <LabeledTextInput
            label="톤수"
            required
            placeholder="톤수 입력 ex) 8.5"
            value={tons}
            unit="t"
            keyboardType="decimal-pad"
            onChangeText={(text) => setTons(sanitizeDecimalMax2(text))}
          />
          <LicenseCircleRadioGroup
            label="거래 방식"
            required
            variant={mode}
            options={salesOptions}
            value={licenseSalesType}
            onChange={setLicenseSalesType}
          />
          {licenseSalesType === "TRADE" ? (
            <PriceTrendSelectField
              label="번호판 종류"
              required
              placeholder="번호판 종류 선택"
              value={getLicenseTypeDisplay(licenseType, maxTons)}
              onPress={openLicenseTypePicker}
            />
          ) : null}
          {mode === "sales" ? (
            <View>
              <Text className="mb-2 text-[14px] font-semibold text-gray800">
                판매 가격<Text className="font-normal text-danger"> (필수)</Text>
              </Text>
              <PriceInputField
                value={price}
                placeholder="판매 금액 입력"
                onChangeValue={setPrice}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row gap-2 border-t border-gray300 bg-white px-4 py-3">
        <Pressable
          onPress={reset}
          className="h-12 flex-[0.35] items-center justify-center rounded-lg border border-gray300 bg-white"
        >
          <Text className="text-[16px] font-bold text-gray800">초기화</Text>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={!isValid || submitting}
          className="h-12 flex-1 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              isValid && !submitting ? theme.accent : "#DCDCDC",
          }}
        >
          <Text className="text-[16px] font-bold text-white">
            {submitting ? "등록 중..." : "등록"}
          </Text>
        </Pressable>
      </View>

      <OptionPickerSheet
        visible={pickerOpen}
        title="번호판 종류"
        options={pickerOptions}
        onClose={() => setPickerOpen(false)}
        onSelect={(option) => {
          setLicenseType({
            code: String(option.code ?? ""),
            desc: option.desc ?? "",
          });
        }}
      />

      <ConfirmDialog
        visible={successOpen}
        title={
          mode === "purchase"
            ? "번호판 구매 문의가 등록되었어요."
            : "번호판 판매 문의가 등록되었어요."
        }
        rightLabel="확인"
        onLeft={() => {
          setSuccessOpen(false);
          onSuccess?.();
        }}
        onRight={() => {
          setSuccessOpen(false);
          onSuccess?.();
        }}
      >
        <Text className="text-center text-[14px] text-gray700">
          담당자 확인 후 연락드리겠습니다.
        </Text>
      </ConfirmDialog>
    </>
  );
}
