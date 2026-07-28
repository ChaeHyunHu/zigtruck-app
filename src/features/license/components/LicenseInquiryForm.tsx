import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import {
  createLicenseListing,
  getLicenseFilterInfo,
  postLicensePurchaseInquiry,
  type LicenseFilterInfo,
} from "@/src/api/license";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { MenuBottomSheet } from "@/src/components/common/MenuBottomSheet";
import { appColors } from "@/src/constants/colors";
import { showAppAlert } from "@/src/providers/appDialog";
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
import { formatNumberWithComma } from "@/src/features/home/utils";
import { PriceTrendSelectField } from "@/src/features/price-trend/PriceTrendSelectField";
import {
  OptionPickerSheet,
  type PickerOption,
} from "@/src/features/price-trend/OptionPickerSheet";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";
import { resolveImageUri } from "@/src/features/products/utils";
import { uploadProductImage } from "@/src/features/sell-car/registration/uploadProductImage";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";
import {
  launchImagePickerForSource,
  type ImageSource,
} from "@/src/utils/pickImageWithSource";

type Mode = "purchase" | "sales";

type UploadTarget = "certificate" | "license";

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
  const [insuranceRate, setInsuranceRate] = useState("");
  const [fee, setFee] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<PickerOption[]>([]);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [certificationImageUrl, setCertificationImageUrl] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");
  const [sourceTarget, setSourceTarget] = useState<UploadTarget | null>(null);
  const [uploadingKey, setUploadingKey] = useState<UploadTarget | null>(null);

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
      showAppAlert({ title: "입력 필요", message: "톤수를 먼저 입력해주세요." });
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

  const isRental = licenseSalesType !== "TRADE";

  const isValid = useMemo(() => {
    if (!year || !tons || !licenseSalesType) return false;
    if (isRental) {
      if (!insuranceRate || !fee) return false;
    } else if (!licenseType.code) {
      return false;
    }
    if (mode === "sales" && (!price || price <= 0)) return false;
    return true;
  }, [
    fee,
    insuranceRate,
    isRental,
    licenseSalesType,
    licenseType.code,
    mode,
    price,
    tons,
    year,
  ]);

  const reset = () => {
    setYear("");
    setTons("");
    setPrice(undefined);
    setLicenseSalesType("TRADE");
    setLicenseType({ code: "", desc: "" });
    setInsuranceRate("");
    setFee("");
    setCertificationImageUrl("");
    setLicenseImageUrl("");
  };

  const handlePickSource = useCallback(
    async (source: ImageSource) => {
      const target = sourceTarget;
      setSourceTarget(null);
      if (!target) return;

      const result = await launchImagePickerForSource(source, { quality: 0.8 });
      if (!result || result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      try {
        setUploadingKey(target);
        const url = await uploadProductImage({
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        });
        if (target === "certificate") setCertificationImageUrl(url);
        else setLicenseImageUrl(url);
      } catch {
        showAppAlert({ title: "오류", message: "이미지 업로드에 실패했습니다." });
      } finally {
        setUploadingKey(null);
      }
    },
    [sourceTarget],
  );

  const submit = async () => {
    if (!isAuthenticated || !memberId) {
      promptLogin();
      return;
    }
    if (!isValid) {
      showAppAlert({ title: "입력 필요", message: "필수 항목을 모두 입력해주세요." });
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
          licenseType: isRental ? undefined : licenseType.code || undefined,
          insuranceRate: isRental ? insuranceRate : undefined,
          fee: isRental ? fee : undefined,
          maxTons: String(maxTons),
        });
      } else {
        await createLicenseListing({
          memberId: Number(memberId),
          year,
          tons,
          licenseSalesType,
          licenseType: isRental ? undefined : licenseType.code,
          insuranceRate: isRental ? insuranceRate : undefined,
          fee: isRental ? fee : undefined,
          price,
          maxTons: String(maxTons),
          certificationImageUrl,
          licenseImageUrl,
        });
      }
      setSuccessOpen(true);
    } catch {
      showAppAlert({ title: "오류", message: "등록에 실패했습니다. 잠시 후 다시 시도해주세요." });
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
          {isRental ? (
            <>
              <LabeledTextInput
                label="보험요율"
                required
                placeholder="보험요율 입력"
                value={insuranceRate}
                unit="%"
                keyboardType="decimal-pad"
                onChangeText={(text) => setInsuranceRate(sanitizeDecimalMax2(text))}
              />
              <LabeledTextInput
                label="지입료"
                required
                placeholder="지입료 입력"
                value={fee}
                unit="만원"
                keyboardType="number-pad"
                onChangeText={(text) => setFee(text.replace(/[^\d]/g, ""))}
              />
            </>
          ) : (
            <PriceTrendSelectField
              label="번호판 종류"
              required
              placeholder="번호판 종류 선택"
              value={getLicenseTypeDisplay(licenseType, maxTons)}
              onPress={openLicenseTypePicker}
            />
          )}
          {mode === "sales" ? (
            <>
              <LabeledTextInput
                label="판매 가격"
                required
                placeholder="판매 금액 입력"
                value={price ? formatNumberWithComma(price) : ""}
                unit="만원"
                keyboardType="number-pad"
                onChangeText={(text) => {
                  const digits = text.replace(/[^\d]/g, "");
                  setPrice(digits ? Number(digits) : undefined);
                }}
              />

              <View className="flex-row gap-3">
                <UploadBox
                  label="차량등록증 업로드"
                  uri={resolveImageUri(certificationImageUrl)}
                  loading={uploadingKey === "certificate"}
                  onPress={() => setSourceTarget("certificate")}
                  onRemove={() => setCertificationImageUrl("")}
                />
                <UploadBox
                  label="번호판 허가증 업로드"
                  uri={resolveImageUri(licenseImageUrl)}
                  loading={uploadingKey === "license"}
                  onPress={() => setSourceTarget("license")}
                  onRemove={() => setLicenseImageUrl("")}
                />
              </View>
            </>
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

      <MenuBottomSheet
        visible={sourceTarget !== null}
        onClose={() => setSourceTarget(null)}
        title="사진 첨부"
        items={[
          { label: "카메라로 촬영", onPress: () => handlePickSource("camera") },
          { label: "갤러리에서 선택", onPress: () => handlePickSource("library") },
        ]}
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

function UploadBox({
  label,
  uri,
  loading,
  onPress,
  onRemove,
}: {
  label: string;
  uri?: string;
  loading?: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-2 text-[14px] font-semibold text-gray800">{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={loading}
        className="h-[120px] items-center justify-center overflow-hidden rounded-[10px] border border-gray300 bg-gray100"
      >
        {loading ? (
          <ActivityIndicator color={appColors.primary} />
        ) : uri ? (
          <>
            <Image
              source={{ uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              hitSlop={8}
              className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-white/95"
            >
              <Ionicons name="close" size={18} color="#111" />
            </Pressable>
          </>
        ) : (
          <Ionicons name="arrow-up" size={30} color={appColors.gray500} />
        )}
      </Pressable>
    </View>
  );
}
