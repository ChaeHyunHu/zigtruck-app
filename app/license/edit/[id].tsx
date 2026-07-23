import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  getLicenseDetail,
  getLicenseFilterInfo,
  updateLicense,
  type LicenseFilterInfo,
} from "@/src/api/license";
import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { MenuBottomSheet } from "@/src/components/common/MenuBottomSheet";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import { LicenseCircleRadioGroup } from "@/src/features/license/components/LicenseCircleRadioGroup";
import type { LicenseEnumField } from "@/src/features/license/types";
import {
  filterLicenseTypesByTons,
  getCurrentYear,
  getLicenseTypeDisplay,
} from "@/src/features/license/utils";
import {
  OptionPickerSheet,
  type PickerOption,
} from "@/src/features/price-trend/OptionPickerSheet";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";
import { PriceTrendSelectField } from "@/src/features/price-trend/PriceTrendSelectField";
import { resolveImageUri } from "@/src/features/products/utils";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { PriceInputField } from "@/src/features/sell-car/registration/PriceInputField";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { uploadProductImage } from "@/src/features/sell-car/registration/uploadProductImage";
import { showAppAlert } from "@/src/providers/appDialog";
import {
  launchImagePickerForSource,
  type ImageSource,
} from "@/src/utils/pickImageWithSource";

type FormSnapshot = {
  year: string;
  tons: string;
  price?: number;
  licenseSalesType: string;
  licenseType: LicenseEnumField;
  insuranceRate: string;
  fee: string;
  certificationImageUrl: string;
  licenseImageUrl: string;
};

type UploadTarget = "certificate" | "license";

function toEnumField(raw: unknown): LicenseEnumField {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    return { code: String(o.code ?? ""), desc: String(o.desc ?? "") };
  }
  if (typeof raw === "string") return { code: raw, desc: "" };
  return { code: "", desc: "" };
}

function deriveMaxTons(tons: string): number {
  const n = Number(tons);
  if (!Number.isFinite(n) || n <= 0) return 1.5;
  if (n < 1.5) return 1.5;
  if (n < 3.5) return 3.5;
  if (n < 5) return 5;
  if (n < 10) return 10;
  if (n < 15) return 15;
  if (n < 19) return 19;
  if (n < 25) return 25;
  return 27;
}

export default function LicenseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const licenseId = Number(id);

  const [enumData, setEnumData] = useState<LicenseFilterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [year, setYear] = useState("");
  const [tons, setTons] = useState("");
  const [price, setPrice] = useState<number | undefined>();
  const [licenseSalesType, setLicenseSalesType] = useState("TRADE");
  const [licenseType, setLicenseType] = useState<LicenseEnumField>({
    code: "",
    desc: "",
  });
  const [insuranceRate, setInsuranceRate] = useState("");
  const [fee, setFee] = useState("");
  const [certificationImageUrl, setCertificationImageUrl] = useState("");
  const [licenseImageUrl, setLicenseImageUrl] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<PickerOption[]>([]);
  const [sourceTarget, setSourceTarget] = useState<UploadTarget | null>(null);
  const [uploadingKey, setUploadingKey] = useState<UploadTarget | null>(null);

  const originalRef = useRef<FormSnapshot | null>(null);

  const maxTons = useMemo(() => deriveMaxTons(tons), [tons]);

  const salesOptions = useMemo(
    () =>
      (enumData?.licenseSalesType ?? []).map((item) => ({
        code: item.code,
        label: item.desc,
      })),
    [enumData],
  );

  useEffect(() => {
    getLicenseFilterInfo()
      .then(setEnumData)
      .catch(() => undefined);
  }, []);

  const applySnapshot = useCallback((snap: FormSnapshot) => {
    setYear(snap.year);
    setTons(snap.tons);
    setPrice(snap.price);
    setLicenseSalesType(snap.licenseSalesType);
    setLicenseType(snap.licenseType);
    setInsuranceRate(snap.insuranceRate);
    setFee(snap.fee);
    setCertificationImageUrl(snap.certificationImageUrl);
    setLicenseImageUrl(snap.licenseImageUrl);
  }, []);

  const isRental = licenseSalesType !== "TRADE";

  useEffect(() => {
    if (!Number.isFinite(licenseId)) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await getLicenseDetail(licenseId);
        const payload = res?.data as Record<string, unknown> | undefined;
        const raw = ((payload?.data as Record<string, unknown>) ??
          payload) as Record<string, unknown> | undefined;
        if (!active || !raw) return;

        const priceValue = Number(raw.price);
        const snapshot: FormSnapshot = {
          year: raw.year != null ? String(raw.year) : "",
          tons: raw.tons != null ? String(raw.tons) : "",
          price: Number.isFinite(priceValue) && priceValue > 0 ? priceValue : undefined,
          licenseSalesType: toEnumField(raw.licenseSalesType).code || "TRADE",
          licenseType: toEnumField(raw.licenseType),
          insuranceRate: raw.insuranceRate != null ? String(raw.insuranceRate) : "",
          fee: raw.fee != null ? String(raw.fee) : "",
          certificationImageUrl:
            typeof raw.certificationImageUrl === "string"
              ? raw.certificationImageUrl
              : "",
          licenseImageUrl:
            typeof raw.licenseImageUrl === "string" ? raw.licenseImageUrl : "",
        };
        originalRef.current = snapshot;
        applySnapshot(snapshot);
      } catch {
        // 상세 조회 실패 시 빈 폼 유지
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [applySnapshot, licenseId]);

  const openLicenseTypePicker = useCallback(() => {
    const n = Number(tons);
    if (!enumData || !Number.isFinite(n) || n <= 0) {
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

  const isValid = useMemo(() => {
    if (!year || !tons || !licenseSalesType) return false;
    if (isRental) {
      if (!insuranceRate || !fee) return false;
    } else if (!licenseType.code) {
      return false;
    }
    if (!price || price <= 0) return false;
    return true;
  }, [fee, insuranceRate, isRental, licenseSalesType, licenseType.code, price, tons, year]);

  const reset = useCallback(() => {
    if (originalRef.current) {
      applySnapshot(originalRef.current);
    }
  }, [applySnapshot]);

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

  const save = useCallback(async () => {
    if (!isValid) {
      showAppAlert({ title: "입력 필요", message: "필수 항목을 모두 입력해주세요." });
      return;
    }
    try {
      setSaving(true);
      await updateLicense({
        id: licenseId,
        year,
        tons,
        price,
        licenseSalesType,
        licenseType: isRental ? undefined : licenseType.code,
        insuranceRate: isRental ? insuranceRate : undefined,
        fee: isRental ? fee : undefined,
        maxTons: String(maxTons),
        certificationImageUrl,
        licenseImageUrl,
      });
      showAppAlert({
        title: "완료",
        message: "번호판 정보가 수정되었어요.",
        onConfirm: () => router.back(),
      });
    } catch {
      showAppAlert({
        title: "오류",
        message: "수정에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setSaving(false);
    }
  }, [
    certificationImageUrl,
    fee,
    insuranceRate,
    isRental,
    isValid,
    licenseId,
    licenseImageUrl,
    licenseSalesType,
    licenseType.code,
    maxTons,
    price,
    tons,
    year,
  ]);

  return (
    <Screen className="flex-1 bg-white" edges={["top"]}>
      <RegistrationHeader title="번호판 정보 수정" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          footerInset={72}
          stackedFooter
        >
          <View className="gap-7">
            <LabeledTextInput
              label="연식"
              required
              placeholder={`연식 입력 ex) ${getCurrentYear()}`}
              value={year}
              keyboardType="number-pad"
              onChangeText={(text) => setYear(text.replace(/[^\d]/g, "").slice(0, 4))}
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
              variant="sales"
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
            <View>
              <Text className="mb-2 text-[14px] font-semibold text-gray800">
                가격<Text className="font-normal text-danger"> (필수)</Text>
              </Text>
              <PriceInputField
                value={price}
                placeholder="가격 입력"
                onChangeValue={setPrice}
                hideHint
              />
            </View>

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
          </View>
        </KeyboardAwareScrollView>
      )}

      <DualFooterButtons
        leftLabel="초기화"
        rightLabel="저장"
        leftFlex={0.35}
        onPressLeft={reset}
        onPressRight={save}
        rightDisabled={!isValid}
        loading={saving}
      />

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
    </Screen>
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
