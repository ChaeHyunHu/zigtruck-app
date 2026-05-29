import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { ADDRESS1 } from "@/src/constants/address";
import { appColors } from "@/src/constants/colors";
import { SALESTYPE } from "@/src/constants/products";
import {
  getArea2Options,
  getArea3Options,
  sanitizePowerInput,
} from "@/src/features/products/edit/utils";
import {
  PriceTrendRadioGroup,
  type RadioOption,
} from "@/src/features/price-trend/PriceTrendRadioGroup";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import {
  usePatchProduct,
  useRegistrationProduct,
} from "@/src/features/sell-car/registration/hooks";
import {
  OptionItem,
  OptionPickerSheet,
} from "@/src/features/sell-car/registration/OptionPickerSheet";
import { getStepIndex } from "@/src/features/sell-car/registration/productUtils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { SelectField } from "@/src/features/sell-car/registration/SelectField";
import { StepBadge } from "@/src/features/sell-car/registration/StepBadge";
import { useHorsepowerField } from "@/src/features/sell-car/registration/useHorsepowerField";
import { validateDistance } from "@/src/features/sell-car/registration/validation";
import { useProductRegistration } from "@/src/providers/ProductRegistrationProvider";

type Picker =
  | "power"
  | "fuel"
  | "color"
  | "garage"
  | "area1"
  | "area2"
  | "area3"
  | null;

const FALLBACK_TRANSMISSION: RadioOption[] = [
  { code: "AUTO", label: "오토" },
  { code: "STICK", label: "스틱" },
];

function mapTransmissionOptions(
  productEnum: ReturnType<typeof useProductRegistration>["productEnum"],
): RadioOption[] {
  const list = (productEnum?.transmission ?? [])
    .filter((item) => item.code && item.code !== "BOTH")
    .map((item) => {
      let label = item.desc ?? "";
      if (item.code === "AUTO") label = "오토";
      else if (item.code === "STICK" || item.code === "MANUAL") label = "스틱";
      return { code: String(item.code), label };
    });

  return list.length > 0 ? list : FALLBACK_TRANSMISSION;
}

export default function AdditionalInfoFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { productFormData, setProductFormData, loading } =
    useRegistrationProduct(id);
  const { productEnum } = useProductRegistration();
  const { patch, saving } = usePatchProduct();
  const [picker, setPicker] = useState<Picker>(null);
  const [distanceError, setDistanceError] = useState("");

  const title =
    SALESTYPE[(productFormData?.type?.code as keyof typeof SALESTYPE) ?? "DIRECT"];

  const tonsValue = Number(productFormData?.tons ?? 0);
  const isOneTon = tonsValue === 1;

  const area1 = (productFormData?.area1 as string | undefined) ?? "";
  const area2 = (productFormData?.area2 as string | undefined) ?? "";
  const area3 = (productFormData?.area3 as string | undefined) ?? "";

  const {
    isDirectInputMode,
    horsepowerReady,
    horsepowerOptions,
    powerError,
    setPowerError,
    loadHorsepowerForPicker,
    validateDirectPower,
  } = useHorsepowerField({
    manufacturer: productFormData?.manufacturerCategories?.name,
    modelName: productFormData?.model?.name,
    tons: productFormData?.tons,
    power: productFormData?.power,
  });

  const area2List = useMemo(() => getArea2Options(area1), [area1]);
  const area3List = useMemo(() => getArea3Options(area1), [area1]);

  const transmissionOptions = useMemo(
    () => mapTransmissionOptions(productEnum),
    [productEnum],
  );

  const fuelOptions = useMemo<OptionItem[]>(
    () =>
      (productEnum?.fuel ?? []).map((item) => ({
        code: String(item.code),
        desc: String(item.desc),
      })),
    [productEnum?.fuel],
  );

  const colorOptions = useMemo<OptionItem[]>(
    () =>
      (productEnum?.color ?? []).map((item) => ({
        code: String(item.code),
        desc: String(item.desc),
      })),
    [productEnum?.color],
  );

  const garageOptions = useMemo<OptionItem[]>(
    () =>
      (productEnum?.garage ?? []).map((item) => ({
        code: String(item.code),
        desc: String(item.desc),
      })),
    [productEnum?.garage],
  );

  const area1Options = useMemo<OptionItem[]>(
    () => ADDRESS1.map((item) => ({ code: item.desc, desc: item.desc })),
    [],
  );

  const area2Options = useMemo<OptionItem[]>(
    () =>
      area2List
        .filter((item) => item.desc !== area3)
        .map((item) => ({ code: item.desc, desc: item.desc })),
    [area2List, area3],
  );

  const area3Options = useMemo<OptionItem[]>(
    () =>
      area3List
        .filter((item) => item.desc !== area2)
        .map((item) => ({ code: item.desc, desc: item.desc })),
    [area3List, area2],
  );

  const goToPreviousStep = useCallback(() => {
    if (!id) {
      router.back();
      return;
    }
    router.replace({
      pathname: "/products/sales/axis/[id]",
      params: { id: String(id) },
    });
  }, [id]);

  const openPicker = useCallback(
    (key: Exclude<Picker, null>, options: OptionItem[]) => {
      if (options.length === 0) {
        Alert.alert(
          "안내",
          "선택 목록을 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }
      setPicker(key);
    },
    [],
  );

  const onPressPowerSelect = useCallback(async () => {
    const shouldOpen = await loadHorsepowerForPicker();
    if (shouldOpen) {
      setPicker("power");
    }
  }, [loadHorsepowerForPicker]);

  const pickerOptions = useMemo<OptionItem[]>(() => {
    switch (picker) {
      case "power":
        return horsepowerOptions;
      case "fuel":
        return fuelOptions;
      case "color":
        return colorOptions;
      case "garage":
        return garageOptions;
      case "area1":
        return area1Options;
      case "area2":
        return area2Options;
      case "area3":
        return area3Options;
      default:
        return [];
    }
  }, [
    picker,
    horsepowerOptions,
    fuelOptions,
    colorOptions,
    garageOptions,
    area1Options,
    area2Options,
    area3Options,
  ]);

  const pickerTitle = useMemo(() => {
    switch (picker) {
      case "power":
        return "마력 (ps)";
      case "fuel":
        return "연료";
      case "color":
        return "색상";
      case "garage":
        return "차고지";
      case "area1":
        return "활동지";
      case "area2":
      case "area3":
        return "지역";
      default:
        return "";
    }
  }, [picker]);

  const pickerSelectedCode = useMemo(() => {
    if (!picker || !productFormData) return undefined;
    if (picker === "power") return String(productFormData.power ?? "");
    if (picker === "fuel") return productFormData.fuel?.code;
    if (picker === "color") return productFormData.color?.code;
    if (picker === "garage") return productFormData.garage?.code;
    if (picker === "area1") return area1 || undefined;
    if (picker === "area2") return area2 || undefined;
    if (picker === "area3") return area3 || undefined;
    return undefined;
  }, [picker, productFormData, area1, area2, area3]);

  const onNext = async () => {
    const distMsg = validateDistance(String(productFormData?.distance ?? ""));
    if (distMsg) {
      setDistanceError(distMsg);
      return;
    }
    if (powerError) {
      Alert.alert("입력 필요", powerError);
      return;
    }
    if (
      !productFormData?.transmission?.code ||
      !productFormData?.fuel?.code ||
      !productFormData?.power ||
      !productFormData?.id
    ) {
      Alert.alert("입력 필요", "변속기, 주행거리, 연료, 마력을 입력해주세요.");
      return;
    }
    if (isOneTon && !area1) {
      Alert.alert("입력 필요", "활동지를 선택해주세요.");
      return;
    }
    try {
      await patch({
        id: productFormData.id,
        transmission: productFormData.transmission.code,
        distance: Number(String(productFormData.distance).replace(/,/g, "")),
        fuel: productFormData.fuel.code,
        power: Number(productFormData.power),
        color: productFormData.color?.code,
        garage: productFormData.garage?.code,
        ...(isOneTon
          ? { area1, area2, area3 }
          : { area1: "", area2: "", area3: "" }),
      });
      router.replace({
        pathname: "/products/sales/price-trend/[id]",
        params: { id: String(productFormData.id) },
      });
    } catch {
      Alert.alert("오류", "저장에 실패했습니다.");
    }
  };

  const handleSelectPicker = (item: OptionItem) => {
    if (!picker) return;
    if (picker === "power") {
      setProductFormData((prev) =>
        prev ? { ...prev, power: Number(item.code) } : prev,
      );
      setPowerError("");
    } else if (picker === "area1") {
      setProductFormData((prev) =>
        prev ? { ...prev, area1: item.desc, area2: "", area3: "" } : prev,
      );
    } else if (picker === "area2") {
      setProductFormData((prev) =>
        prev ? { ...prev, area2: item.desc } : prev,
      );
    } else if (picker === "area3") {
      setProductFormData((prev) =>
        prev ? { ...prev, area3: item.desc } : prev,
      );
    } else {
      setProductFormData((prev) =>
        prev
          ? {
              ...prev,
              [picker]: { code: item.code, desc: item.desc },
            }
          : prev,
      );
    }
    setPicker(null);
  };

  if (loading || !productFormData) {
    return (
      <Screen variant="stack" className="flex-1 items-center justify-center bg-white">
        <Text className="text-[15px] text-gray700">불러오는 중...</Text>
      </Screen>
    );
  }

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <View className="flex-1">
        <RegistrationHeader title={title} onBack={goToPreviousStep} />
        <ScrollView
          className="flex-1 px-4 pt-6"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 24 }}
        >
        <View className="flex-row items-start justify-between pt-2">
          <Text className="flex-1 text-[24px] font-bold leading-[30px] text-gray800">
            차량의 추가 정보를{"\n"}입력해주세요.
          </Text>
          <StepBadge text={`${getStepIndex("additional-info")}/9`} />
        </View>

        <View className="mt-8 gap-6">
          <PriceTrendRadioGroup
            label="변속기"
            required
            options={transmissionOptions}
            value={productFormData.transmission?.code ?? ""}
            onChange={(code) => {
              const found = transmissionOptions.find((item) => item.code === code);
              setProductFormData((prev) =>
                prev
                  ? {
                      ...prev,
                      transmission: {
                        code,
                        desc: found?.label ?? "",
                      },
                    }
                  : prev,
              );
            }}
          />

          <View>
            <Text className="mb-2 text-[14px] font-medium text-gray700">
              주행거리 (km) <Text className="text-red-500">(필수)</Text>
            </Text>
            <TextInput
              className="h-[50px] rounded-lg border border-gray300 px-4 text-[18px] text-gray900"
              keyboardType="number-pad"
              value={String(productFormData.distance ?? "")}
              onChangeText={(value) => {
                setDistanceError("");
                setProductFormData((prev) =>
                  prev ? { ...prev, distance: value } : prev,
                );
              }}
            />
            {distanceError ? (
              <Text className="mt-2 text-[13px] text-red-500">{distanceError}</Text>
            ) : null}
          </View>

          {isDirectInputMode ? (
            <View>
              <Text className="mb-2 text-[14px] font-medium text-gray700">
                마력 (ps) <Text className="text-red-500">(필수)</Text>
              </Text>
              <TextInput
                className="h-[50px] rounded-lg border border-gray300 px-4 text-[18px] text-gray900"
                keyboardType="number-pad"
                placeholder={
                  horsepowerReady ? "마력수 입력" : "마력 정보를 불러오는 중..."
                }
                editable={horsepowerReady}
                placeholderTextColor={appColors.gray500}
                value={String(productFormData.power ?? "")}
                onChangeText={(value) => {
                  const next = sanitizePowerInput(value);
                  setPowerError("");
                  setProductFormData((prev) =>
                    prev ? { ...prev, power: next } : prev,
                  );
                }}
                onBlur={() => {
                  if (productFormData.power != null && productFormData.power !== "") {
                    validateDirectPower(String(productFormData.power));
                  }
                }}
              />
              {powerError ? (
                <Text className="mt-2 text-[13px] text-red-500">{powerError}</Text>
              ) : null}
            </View>
          ) : (
            <SelectField
              label="마력 (ps)"
              value={
                productFormData.power ? String(productFormData.power) : undefined
              }
              placeholder={
                horsepowerReady ? "마력수 선택" : "마력 정보를 불러오는 중..."
              }
              disabled={!horsepowerReady}
              onPress={onPressPowerSelect}
            />
          )}

          <SelectField
            label="연료"
            value={productFormData.fuel?.desc}
            placeholder="연료 선택"
            onPress={() => openPicker("fuel", fuelOptions)}
          />
          <SelectField
            label="색상"
            value={productFormData.color?.desc}
            placeholder="색상 선택"
            onPress={() => openPicker("color", colorOptions)}
          />
          <SelectField
            label="차고지"
            value={productFormData.garage?.desc}
            placeholder="차고지 선택"
            onPress={() => openPicker("garage", garageOptions)}
          />

          {isOneTon ? (
            <>
              <SelectField
                label="활동지"
                value={area1 || undefined}
                placeholder="활동지 선택"
                onPress={() => openPicker("area1", area1Options)}
              />
              {area2List.length > 0 ? (
                <SelectField
                  label="지역"
                  value={area2 || undefined}
                  placeholder="지역 선택"
                  onPress={() => openPicker("area2", area2Options)}
                />
              ) : null}
              {area3List.length > 0 ? (
                <SelectField
                  label="지역"
                  value={area3 || undefined}
                  placeholder="지역 선택"
                  onPress={() => openPicker("area3", area3Options)}
                />
              ) : null}
            </>
          ) : null}
        </View>
        </ScrollView>

        <DualFooterButtons
          onPressLeft={goToPreviousStep}
          rightLabel="다음"
          onPressRight={onNext}
          loading={saving}
        />
      </View>

      {picker !== null ? (
        <OptionPickerSheet
          visible
          title={pickerTitle}
          options={pickerOptions}
          selectedCode={pickerSelectedCode}
          onClose={() => setPicker(null)}
          onSelect={handleSelectPicker}
        />
      ) : null}
    </Screen>
  );
}
