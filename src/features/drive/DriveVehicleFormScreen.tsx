import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";

import { getProductEnum } from "@/src/api/products/carRegister";
import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import { ScreenStickyFooter } from "@/src/components/common/ScreenStickyFooter";
import { appColors } from "@/src/constants/colors";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import {
  fetchDriveVehicleInfo,
  patchDriveVehicleInfo,
  postDriveVehicleInfo,
} from "@/src/features/drive/driveApi";
import { setDriveTutorial } from "@/src/features/drive/driveStorage";
import { validateDriveVehicleForm } from "@/src/features/drive/driveVehicleValidation";
import type { DriveEnumField, DriveVehicleInfo } from "@/src/features/drive/types";
import { formatNumberWithComma } from "@/src/features/home/utils";
import { OptionPickerSheet } from "@/src/features/sell-car/registration/OptionPickerSheet";
import { PriceTrendRadioGroup } from "@/src/features/price-trend/PriceTrendRadioGroup";
import { PriceTrendSelectField } from "@/src/features/price-trend/PriceTrendSelectField";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import type { ProductEnumData } from "@/src/features/sell-car/registration/types";
import { isUnderFourTons } from "@/src/features/sell-car/registration/productUtils";
import { sanitizeTonsInput } from "@/src/features/products/edit/utils";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";

function sanitizeFuelEfficiency(value: string): string {
  let next = value.replace(/[^\d.]/g, "");
  const dotIndex = next.indexOf(".");
  if (dotIndex >= 0) {
    const intPart = next.slice(0, dotIndex);
    const decPart = next.slice(dotIndex + 1).replace(/\./g, "").slice(0, 1);
    next =
      decPart.length > 0
        ? `${intPart}.${decPart}`
        : intPart + (next.endsWith(".") ? "." : "");
  }
  const n = Number(next);
  if (Number.isFinite(n) && n > 100) return "100";
  return next;
}

function parseAmount(value: string): number {
  const n = Number(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function mapAxisOptions(productEnum: ProductEnumData | null) {
  return (productEnum?.axis ?? [])
    .filter((item) => item.code)
    .map((item) => ({
      code: item.code!,
      label: item.desc ?? item.code!,
    }));
}

function mapLoadedOptions(productEnum: ProductEnumData | null) {
  return (productEnum?.loaded ?? [])
    .filter((item) => item.code && item.code !== "WIDEWINGBODY")
    .map((item) => ({
      code: item.code!,
      desc: item.desc ?? item.code!,
    }));
}

function buildPostBody(params: {
  tons: string;
  axis: DriveEnumField;
  loaded: DriveEnumField;
  loadedInnerLength: string;
  fuelEfficiency: string;
  fee: string;
  insuranceFee: string;
  capitalFee: string;
}) {
  const tonsNum = Number(params.tons);
  return {
    tons: String(params.tons),
    axis: isUnderFourTons(tonsNum) ? "NONE" : params.axis.code,
    loaded: params.loaded.code,
    loadedInnerLength: String(params.loadedInnerLength),
    fuelEfficiency: String(params.fuelEfficiency),
    fee: parseAmount(params.fee),
    insuranceFee: parseAmount(params.insuranceFee),
    capitalFee: parseAmount(params.capitalFee),
  };
}

function buildPatchBody(
  prev: DriveVehicleInfo,
  form: {
    tons: string;
    axis: DriveEnumField;
    loaded: DriveEnumField;
    loadedInnerLength: string;
    fuelEfficiency: string;
    fee: string;
    insuranceFee: string;
    capitalFee: string;
  },
): Record<string, unknown> {
  const next = buildPostBody(form);
  const changed: Record<string, unknown> = {};

  if (String(prev.tons ?? "") !== next.tons) changed.tons = next.tons;
  if (String(prev.loadedInnerLength ?? "") !== next.loadedInnerLength) {
    changed.loadedInnerLength = next.loadedInnerLength;
  }
  if (String(prev.fuelEfficiency ?? "") !== next.fuelEfficiency) {
    changed.fuelEfficiency = next.fuelEfficiency;
  }
  if (prev.fee !== next.fee) changed.fee = next.fee;
  if (prev.insuranceFee !== next.insuranceFee) {
    changed.insuranceFee = next.insuranceFee;
  }
  if (prev.capitalFee !== next.capitalFee) changed.capitalFee = next.capitalFee;

  const prevAxis = prev.axis?.code ?? "";
  if (prevAxis !== next.axis) changed.axis = next.axis;
  const prevLoaded = prev.loaded?.code ?? "";
  if (prevLoaded !== next.loaded) changed.loaded = next.loaded;

  return changed;
}

export function DriveVehicleFormScreen() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productEnum, setProductEnum] = useState<ProductEnumData | null>(null);
  const [prevData, setPrevData] = useState<DriveVehicleInfo | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);

  const [tons, setTons] = useState("");
  const [axis, setAxis] = useState<DriveEnumField>({ code: "", desc: "" });
  const [loaded, setLoaded] = useState<DriveEnumField>({ code: "", desc: "" });
  const [loadedInnerLength, setLoadedInnerLength] = useState("");
  const [fuelEfficiency, setFuelEfficiency] = useState("");
  const [fee, setFee] = useState("");
  const [insuranceFee, setInsuranceFee] = useState("");
  const [capitalFee, setCapitalFee] = useState("");
  const [loadedPickerOpen, setLoadedPickerOpen] = useState(false);

  const axisDisabled = isUnderFourTons(tons);
  const axisOptions = useMemo(() => mapAxisOptions(productEnum), [productEnum]);
  const loadedOptions = useMemo(() => mapLoadedOptions(productEnum), [productEnum]);
  const isEdit = vehicleId != null;

  useEffect(() => {
    getProductEnum()
      .then(setProductEnum)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchDriveVehicleInfo()
      .then((data) => {
        if (!data?.id) return;
        setVehicleId(data.id);
        setPrevData(data);
        setTons(data.tons != null ? String(data.tons) : "");
        setAxis(data.axis ?? { code: "", desc: "" });
        setLoaded(data.loaded ?? { code: "", desc: "" });
        setLoadedInnerLength(
          data.loadedInnerLength != null ? String(data.loadedInnerLength) : "",
        );
        setFuelEfficiency(
          data.fuelEfficiency != null ? String(data.fuelEfficiency) : "",
        );
        setFee(data.fee ? formatNumberWithComma(data.fee) : "");
        setInsuranceFee(
          data.insuranceFee ? formatNumberWithComma(data.insuranceFee) : "",
        );
        setCapitalFee(
          data.capitalFee ? formatNumberWithComma(data.capitalFee) : "",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !tons || !axisDisabled) return;
    setAxis({ code: "NONE", desc: "없음" });
  }, [axisDisabled, loading, tons]);

  useEffect(() => {
    if (!productEnum || loading) return;
    if (axis.code) {
      const found = axisOptions.find((o) => o.code === axis.code);
      if (found) setAxis({ code: axis.code, desc: found.label });
    }
    if (loaded.code) {
      const found = loadedOptions.find((o) => o.code === loaded.code);
      if (found) setLoaded({ code: loaded.code, desc: found.desc });
    }
  }, [productEnum, loading, axis.code, loaded.code, axisOptions, loadedOptions]);

  const handleTonsBlur = () => {
    if (isUnderFourTons(tons)) {
      setAxis({ code: "NONE", desc: "없음" });
    }
  };

  const submit = async () => {
    const validationError = validateDriveVehicleForm({
      tons,
      axisCode: axis.code,
      loadedCode: loaded.code,
      loadedInnerLength,
      fuelEfficiency,
      axisDisabled,
    });
    if (validationError) {
      Alert.alert("입력 확인", validationError);
      return;
    }

    const form = {
      tons,
      axis,
      loaded,
      loadedInnerLength,
      fuelEfficiency,
      fee,
      insuranceFee,
      capitalFee,
    };

    try {
      setSubmitting(true);
      if (vehicleId && prevData) {
        const requestData = buildPatchBody(prevData, form);
        if (Object.keys(requestData).length === 0) {
          router.back();
          return;
        }
        await patchDriveVehicleInfo({ id: vehicleId, requestData });
        Alert.alert("완료", "차량 정보가 수정되었습니다.", [
          { text: "확인", onPress: () => router.back() },
        ]);
      } else {
        await postDriveVehicleInfo(buildPostBody(form));
        await setDriveTutorial(true);
        router.replace("/drive");
      }
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader
        title={isEdit ? "차량정보 설정" : "운행일지 차량등록"}
      />
      {loading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <KeyboardAwareScrollView className="flex-1" footerInset={80}>
          <View className="px-4 pb-28 pt-4">
            <View className="mb-6 rounded-lg bg-[#F8FAFF] p-4">
              <Text className="mb-2 text-[17px] font-bold text-gray900">
                차량의 기본 정보를 입력해주세요.
              </Text>
              <Text className="text-[14px] leading-5 text-gray800">
                직트럭 운행 일지 이용 시 필요한 차량 정보를 입력해주세요.
              </Text>
            </View>

            <Text className="mb-4 text-[18px] font-semibold text-gray900">
              차량정보
            </Text>
            <View className="gap-5">
              <LabeledTextInput
                label="톤수"
                required
                placeholder="톤수 입력"
                value={tons}
                unit="t"
                keyboardType="decimal-pad"
                onChangeText={(t) => setTons(sanitizeTonsInput(t))}
                onBlur={handleTonsBlur}
              />

              <View>
                <PriceTrendRadioGroup
                  label="가변축"
                  required
                  options={axisOptions}
                  value={axis.code}
                  onChange={(code) => {
                    const found = axisOptions.find((o) => o.code === code);
                    setAxis({
                      code,
                      desc: found?.label ?? code,
                    });
                  }}
                  disabled={axisDisabled}
                  horizontal
                />
                {axisDisabled ? (
                  <Text className="mt-2 text-[12px] leading-[18px] text-gray600">
                    * 4톤 이하의 차량은 가변축이 없으므로 축 선택이 불가능합니다.
                  </Text>
                ) : null}
              </View>

              <PriceTrendSelectField
                label="적재함 종류"
                required
                placeholder="적재함 종류 선택"
                value={loaded.desc}
                onPress={() => setLoadedPickerOpen(true)}
              />

              <LabeledTextInput
                label="적재함 길이"
                required
                placeholder="적재함 길이 입력"
                value={loadedInnerLength}
                unit="m"
                keyboardType="decimal-pad"
                onChangeText={(t) => setLoadedInnerLength(sanitizeDecimalMax2(t))}
              />

              <LabeledTextInput
                label="연비"
                required
                placeholder="연비 입력"
                value={fuelEfficiency}
                unit="km/L"
                keyboardType="decimal-pad"
                onChangeText={(t) => setFuelEfficiency(sanitizeFuelEfficiency(t))}
              />
            </View>

            <View className="mt-8 border-t-[8px] border-gray100 pt-6">
              <Text className="mb-4 text-[18px] font-semibold text-gray900">
                고정 비용
              </Text>
              <View className="gap-5">
                <LabeledTextInput
                  label="월 지입료"
                  placeholder="지입료 입력"
                  value={fee}
                  unit="원"
                  keyboardType="number-pad"
                  onChangeText={(t) =>
                    setFee(formatNumberWithComma(t.replace(/[^\d]/g, "")))
                  }
                />
                <View>
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-[14px] font-semibold text-gray800">
                      연간 보험료
                    </Text>
                    <Pressable
                      hitSlop={8}
                      className="ml-1"
                      onPress={() =>
                        Alert.alert(
                          "연간 보험료",
                          "연간 보험료를 입력하면 월간으로 환산 후 반영됩니다.",
                        )
                      }
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={appColors.gray600}
                      />
                    </Pressable>
                  </View>
                  <LabeledTextInput
                    hideLabel
                    label="연간 보험료"
                    placeholder="보험료 입력"
                    value={insuranceFee}
                    unit="원"
                    keyboardType="number-pad"
                    onChangeText={(t) =>
                      setInsuranceFee(
                        formatNumberWithComma(t.replace(/[^\d]/g, "")),
                      )
                    }
                  />
                </View>
                <LabeledTextInput
                  label="월 캐피탈 납입료"
                  placeholder="캐피탈 납입료 입력"
                  value={capitalFee}
                  unit="원"
                  keyboardType="number-pad"
                  onChangeText={(t) =>
                    setCapitalFee(
                      formatNumberWithComma(t.replace(/[^\d]/g, "")),
                    )
                  }
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      )}

      <OptionPickerSheet
        visible={loadedPickerOpen}
        title="적재함 종류"
        options={loadedOptions}
        selectedCode={loaded.code}
        onClose={() => setLoadedPickerOpen(false)}
        onSelect={(item) => setLoaded({ code: item.code, desc: item.desc })}
      />

      <ScreenStickyFooter className="px-4 pt-3">
        <Pressable
          onPress={submit}
          disabled={submitting || loading}
          className="h-12 items-center justify-center rounded-lg bg-primary"
        >
          <Text className="text-[16px] font-bold text-white">
            {submitting ? "저장 중..." : "차량 정보 저장"}
          </Text>
        </Pressable>
      </ScreenStickyFooter>
    </Screen>
  );
}
