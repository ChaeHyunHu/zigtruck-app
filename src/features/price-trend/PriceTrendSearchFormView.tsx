import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Keyboard, Pressable, Text, View } from "react-native";

import { getProductEnum } from "@/src/api/products/carRegister";
import { getHorsepower } from "@/src/api/public";
import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import { ProductEditOptionSheet } from "@/src/features/products/edit/ProductEditOptionSheet";
import type { ProductEnumData } from "@/src/features/sell-car/registration/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

import {
  mapHorsepowerToPickerOptions,
  parseHorsepowerApiResponse,
  ZERO_HORSEPOWER_OPTION,
} from "./horsepowerUtils";
import { isUnderFourTons, sanitizeDecimalMax2, validateDistance, validateLoadedInnerHeight, validateLoadedInnerLength, validateLoadedInnerWidth } from "./inputUtils";
import type { PickerOption } from "./OptionPickerSheet";
import { PriceTrendRadioGroup, type RadioOption } from "./PriceTrendRadioGroup";
import { PriceTrendSelectField } from "./PriceTrendSelectField";
import type { PriceTrendOriginData, ProductSearchParams } from "./types";
import {
  defaultProductSearchParams,
  getCurrentYear,
  mapOriginDataToSearchParams,
} from "./utils";

const YEAR_MIN = 2000;
const YEAR_MAX = 2026;

function isYearInvalid(digits: string): boolean {
  if (!digits) return false;
  if (digits.length < 4) return true;
  const year = Number(digits);
  return year < YEAR_MIN || year > YEAR_MAX;
}

type PriceTrendSearchFormViewProps = {
  ownerName?: string;
  originData?: PriceTrendOriginData;
};

type PickerKey =
  | "manufacturerCategories"
  | "model"
  | "loaded"
  | "fuel"
  | "power";

const mapTransmissionOptions = (
  productEnum: ProductEnumData | null,
): RadioOption[] => {
  return (productEnum?.transmission ?? [])
    .filter((item) => item.code && item.code !== "BOTH")
    .map((item) => {
      let label = item.desc ?? "";
      if (item.code === "AUTO") label = "오토";
      else if (item.code === "STICK" || item.code === "MANUAL") label = "스틱";
      return { code: item.code!, label };
    });
};

const mapAxisOptions = (productEnum: ProductEnumData | null): RadioOption[] => {
  return (productEnum?.axis ?? [])
    .filter((item) => item.code)
    .map((item) => ({
      code: item.code!,
      label: item.desc ?? item.code!,
    }));
};

export function PriceTrendSearchFormView({
  ownerName,
  originData,
}: PriceTrendSearchFormViewProps) {
  const [productEnum, setProductEnum] = useState<ProductEnumData | null>(null);
  const [params, setParams] = useState<ProductSearchParams>(() =>
    originData
      ? mapOriginDataToSearchParams(originData)
      : defaultProductSearchParams(),
  );
  const [pickerKey, setPickerKey] = useState<PickerKey | null>(null);
  const [powerOptions, setPowerOptions] = useState<PickerOption[]>([]);

  const [yearError, setYearError] = useState(false);
  const [tonsError, setTonsError] = useState(false);
  const [lengthError, setLengthError] = useState(false);
  const [lengthErrorMessage, setLengthErrorMessage] = useState("");
  const [widthError, setWidthError] = useState(false);
  const [widthErrorMessage, setWidthErrorMessage] = useState("");
  const [heightError, setHeightError] = useState(false);
  const [heightErrorMessage, setHeightErrorMessage] = useState("");
  const [distanceError, setDistanceError] = useState(false);
  const [distanceErrorMessage, setDistanceErrorMessage] = useState("");
  const [powerError, setPowerError] = useState(false);

  const hasValidatedPower = useRef(false);
  const lastValidatedPowerKey = useRef("");

  const lockedFromOrigin = Boolean(originData?.id);
  const hasManufacturer = Boolean(params.manufacturerCategories.name);
  const canSelectModel = hasManufacturer && !lockedFromOrigin;
  const canSelectPower =
    hasManufacturer && Boolean(params.model.name) && Boolean(params.tons);
  const axisDisabled = isUnderFourTons(params.tons);

  const transmissionRadioOptions = useMemo(
    () => mapTransmissionOptions(productEnum),
    [productEnum],
  );
  const axisRadioOptions = useMemo(
    () => mapAxisOptions(productEnum),
    [productEnum],
  );

  useEffect(() => {
    getProductEnum()
      .then(setProductEnum)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (originData) {
      const next = mapOriginDataToSearchParams(originData);
      setParams(next);
      const lengthValidation = validateLoadedInnerLength(next.loadedInnerLength);
      setLengthError(lengthValidation.error);
      setLengthErrorMessage(lengthValidation.message);
      const widthValidation = validateLoadedInnerWidth(next.loadedInnerArea);
      setWidthError(widthValidation.error);
      setWidthErrorMessage(widthValidation.message);
      const heightValidation = validateLoadedInnerHeight(next.loadedInnerHeight);
      setHeightError(heightValidation.error);
      setHeightErrorMessage(heightValidation.message);
      const distanceValidation = validateDistance(next.distance);
      setDistanceError(distanceValidation.error);
      setDistanceErrorMessage(distanceValidation.message);
    }
  }, [originData]);

  useEffect(() => {
    if (axisDisabled) {
      setParams((prev) => ({
        ...prev,
        axis: { code: "NONE", desc: "없음" },
      }));
    }
  }, [axisDisabled]);

  const pickerTitle = useMemo(() => {
    const map: Record<PickerKey, string> = {
      manufacturerCategories: "제조사",
      model: "모델",
      loaded: "적재함 종류",
      fuel: "연료",
      power: "마력수",
    };
    return pickerKey ? map[pickerKey] : "";
  }, [pickerKey]);

  const pickerOptions = useMemo((): PickerOption[] => {
    if (!pickerKey || !productEnum) return [];
    if (pickerKey === "power") return powerOptions;
    if (pickerKey === "manufacturerCategories") {
      return (productEnum.manufacturerAndModel ?? []).map((item) => ({
        id: item.manufacturerCategories.id,
        code: item.manufacturerCategories.code,
        name: item.manufacturerCategories.name,
        desc: item.manufacturerCategories.name,
      }));
    }
    if (pickerKey === "model") {
      const found = productEnum.manufacturerAndModel?.find(
        (item) =>
          item.manufacturerCategories.id === params.manufacturerCategories.id,
      );
      return (found?.model ?? []).map((item) => ({
        id: item.id,
        code: String(item.id),
        name: item.name,
        desc: item.name,
      }));
    }
    if (pickerKey === "loaded") {
      return (productEnum.loaded ?? [])
        .filter((item) => item.code !== "WIDEWINGBODY")
        .map((item) => ({ code: item.code, desc: item.desc }));
    }
    if (pickerKey === "fuel") {
      return (productEnum.fuel ?? []).map((item) => {
        let desc = item.desc ?? "";
        if (item.code === "DIESEL") desc = "디젤";
        if (item.code === "LPG") desc = "LPG";
        if (item.code === "ELECTRIC" || item.code === "ELECT") desc = "전기";
        if (item.code === "GASOLINE" || item.code === "GAS") desc = "가솔린";
        return { code: item.code, desc };
      });
    }
    return [];
  }, [params.manufacturerCategories.id, pickerKey, powerOptions, productEnum]);

  const applyZeroHorsepower = useCallback((fromBlur: boolean) => {
    setPowerOptions([ZERO_HORSEPOWER_OPTION]);
    if (fromBlur) {
      setParams((prev) => ({ ...prev, power: "0" }));
      setPowerError(false);
    }
  }, []);

  const loadHorsepowerOptions = useCallback(
    async (fromBlur = false) => {
      if (!canSelectPower) return;

      try {
        const data = await getHorsepower({
          manufacturer: params.manufacturerCategories.name,
          modelName: params.model.name,
          tons: params.tons,
          horsePower: params.power || "",
        });

        const list = parseHorsepowerApiResponse(data);

        if (list === null || list.length === 0) {
          applyZeroHorsepower(fromBlur);
          return;
        }

        const options = mapHorsepowerToPickerOptions(list);
        setPowerOptions(options);

        if (options.length === 1) {
          setParams((prev) => ({ ...prev, power: String(options[0].code) }));
          setPowerError(false);
          return;
        }

        if (fromBlur) {
          if (
            params.power &&
            options.some((item) => item.code === params.power)
          ) {
            setPowerError(false);
          } else {
            setParams((prev) => ({ ...prev, power: "" }));
          }
        }
      } catch {
        applyZeroHorsepower(fromBlur);
      }
    },
    [
      applyZeroHorsepower,
      canSelectPower,
      params.manufacturerCategories.name,
      params.model.name,
      params.power,
      params.tons,
    ],
  );

  const validatePowerOnTonsBlur = useCallback(async () => {
    if (!canSelectPower) return;

    const validationKey = `${params.manufacturerCategories.name}-${params.model.name}-${params.tons}`;
    if (
      hasValidatedPower.current &&
      lastValidatedPowerKey.current === validationKey
    ) {
      return;
    }
    if (
      lastValidatedPowerKey.current &&
      lastValidatedPowerKey.current !== validationKey
    ) {
      hasValidatedPower.current = false;
    }

    hasValidatedPower.current = true;
    lastValidatedPowerKey.current = validationKey;
    await loadHorsepowerOptions(true);
  }, [
    canSelectPower,
    loadHorsepowerOptions,
    params.manufacturerCategories.name,
    params.model.name,
    params.tons,
  ]);

  const onSelectPicker = useCallback(
    (option: PickerOption) => {
      if (!pickerKey) return;
      if (pickerKey === "manufacturerCategories") {
        setParams((prev) => ({
          ...prev,
          manufacturerCategories: {
            id: Number(option.id),
            name: option.name ?? option.desc ?? "",
            code: option.code,
          },
          model: { id: 0, name: "" },
          power: "",
        }));
        setPowerOptions([]);
        hasValidatedPower.current = false;
        lastValidatedPowerKey.current = "";
      } else if (pickerKey === "model") {
        setParams((prev) => ({
          ...prev,
          model: {
            id: Number(option.id),
            name: option.name ?? option.desc ?? "",
          },
          power: "",
        }));
        setPowerOptions([]);
        hasValidatedPower.current = false;
        lastValidatedPowerKey.current = "";
      } else if (pickerKey === "loaded") {
        setParams((prev) => ({
          ...prev,
          loaded: { code: option.code ?? "", desc: option.desc ?? "" },
        }));
      } else if (pickerKey === "fuel") {
        setParams((prev) => ({ ...prev, fuel: option.desc ?? "" }));
      } else if (pickerKey === "power") {
        setParams((prev) => ({ ...prev, power: option.code ?? "" }));
        setPowerError(false);
      }
    },
    [pickerKey],
  );

  const transmissionCode = useMemo(() => {
    const match = transmissionRadioOptions.find(
      (o) => o.label === params.transmission,
    );
    return match?.code ?? "";
  }, [params.transmission, transmissionRadioOptions]);

  const onChangeTransmission = useCallback(
    (code: string) => {
      const item = transmissionRadioOptions.find((o) => o.code === code);
      setParams((prev) => ({ ...prev, transmission: item?.label ?? "" }));
    },
    [transmissionRadioOptions],
  );

  const openPicker = useCallback((key: PickerKey) => {
    Keyboard.dismiss();
    setPickerKey(key);
  }, []);

  const onChangeAxis = useCallback(
    (code: string) => {
      const item = axisRadioOptions.find((o) => o.code === code);
      setParams((prev) => ({
        ...prev,
        axis: { code, desc: item?.label ?? "" },
      }));
    },
    [axisRadioOptions],
  );

  const isSearchDisabled = useMemo(() => {
    return (
      yearError ||
      tonsError ||
      lengthError ||
      distanceError ||
      powerError ||
      params.year.length !== 4 ||
      !params.manufacturerCategories.name ||
      !params.model.name ||
      !params.tons ||
      !params.power ||
      !params.loaded.code ||
      !params.loadedInnerLength ||
      !params.transmission ||
      !params.distance ||
      !params.fuel ||
      !params.axis.code
    );
  }, [distanceError, lengthError, params, powerError, tonsError, yearError]);

  const onReset = useCallback(() => {
    setParams(
      originData
        ? mapOriginDataToSearchParams(originData)
        : defaultProductSearchParams(),
    );
    setYearError(false);
    setTonsError(false);
    setLengthError(false);
    setLengthErrorMessage("");
    setWidthError(false);
    setWidthErrorMessage("");
    setHeightError(false);
    setHeightErrorMessage("");
    setDistanceError(false);
    setDistanceErrorMessage("");
    setPowerError(false);
    setPowerOptions([]);
    hasValidatedPower.current = false;
    lastValidatedPowerKey.current = "";
  }, [originData]);

  const onSearch = useCallback(() => {
    router.push({
      pathname: "/price-trend/result",
      params: {
        searchParams: JSON.stringify(params),
        originData: originData ? JSON.stringify(originData) : "",
        ownerName: ownerName ?? "",
      },
    });
  }, [originData, ownerName, params]);

  const pickerOptionItems = useMemo(
    () =>
      pickerOptions.map((option) => ({
        code: String(option.id ?? option.code ?? option.name ?? ""),
        desc:
          option.desc ??
          option.name ??
          String(option.code ?? option.id ?? ""),
      })),
    [pickerOptions],
  );

  const selectedPickerCode = useMemo(() => {
    if (!pickerKey) return "";
    switch (pickerKey) {
      case "manufacturerCategories":
        return params.manufacturerCategories.id
          ? String(params.manufacturerCategories.id)
          : "";
      case "model":
        return params.model.id ? String(params.model.id) : "";
      case "loaded":
        return params.loaded.code;
      case "fuel": {
        const match = pickerOptions.find(
          (item) => (item.desc ?? item.name) === params.fuel,
        );
        return match ? String(match.code ?? match.id ?? "") : "";
      }
      case "power":
        return params.power;
      default:
        return "";
    }
  }, [pickerKey, params, pickerOptions]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="시세검색" />
      <View className="flex-1 px-4 pt-2">
        <KeyboardAwareScrollView
          className="flex-1"
          stackedFooter
          footerInset={64}
          restingBottomPadding={12}
          extraKeyboardSpace={45}
        >
        {originData?.truckNumber ? (
          <View className="mt-2 self-start rounded-lg border-2 border-gray900 bg-[#F5D300] px-4 py-3">
            <Text className="text-[28px] font-semibold text-gray900">
              {originData.truckNumber}
            </Text>
          </View>
        ) : null}

        <View className="mt-4 rounded-lg bg-[#F1F5FF] px-4 py-[19px]">
          <Text className="text-[18px] font-bold text-gray800">
            필터로 시세 검색
          </Text>
          <Text className="mt-1 text-[14px] text-gray800">
            정확한 시세 검색을 위해 정보를 입력해주세요.
          </Text>
        </View>
        <Text className="mt-3 text-[13px] text-danger">
          (필수) 항목은 필수 항목입니다.
        </Text>

        <View className="mt-[30px] gap-[30px]">
          <LabeledTextInput
            label="연식"
            required
            placeholder={`연식 입력 ex) ${getCurrentYear()}`}
            value={params.year}
            onChangeText={(value) => {
              const digits = value.replace(/[^\d]/g, "").slice(0, 4);
              setParams((prev) => ({ ...prev, year: digits }));
              setYearError(isYearInvalid(digits));
            }}
            error={yearError}
            errorMessage="2000 이상 2026 이하로 입력해주세요."
            keyboardType="number-pad"
          />

          <PriceTrendSelectField
            label="제조사"
            required
            placeholder="제조사 선택"
            value={params.manufacturerCategories.name}
            disabled={lockedFromOrigin}
            onPress={
              lockedFromOrigin
                ? undefined
                : () => openPicker("manufacturerCategories")
            }
          />

          <PriceTrendSelectField
            label="모델"
            required
            placeholder={
              hasManufacturer ? "모델 선택" : "제조사를 먼저 선택해주세요"
            }
            value={params.model.name}
            disabled={!canSelectModel}
            onPress={canSelectModel ? () => openPicker("model") : undefined}
          />

          <LabeledTextInput
            label="톤수"
            required
            placeholder="톤수 입력 ex) 8.5"
            value={params.tons}
            onChangeText={(value) => {
              const next = sanitizeDecimalMax2(value);
              setParams((prev) => ({ ...prev, tons: next, power: "" }));
              setTonsError(!next);
              setPowerOptions([]);
              hasValidatedPower.current = false;
              lastValidatedPowerKey.current = "";
            }}
            onBlur={validatePowerOnTonsBlur}
            error={tonsError}
            errorMessage="톤수를 입력해주세요."
            keyboardType="decimal-pad"
          />

          <PriceTrendSelectField
            label="마력수"
            required
            placeholder={
              canSelectPower ? "마력수 선택" : "제조사·모델·톤수 입력 후 선택"
            }
            value={params.power ? `${params.power}` : ""}
            disabled={!canSelectPower}
            onPress={
              canSelectPower
                ? async () => {
                    Keyboard.dismiss();
                    await loadHorsepowerOptions(false);
                    setPickerKey("power");
                  }
                : undefined
            }
          />
          {powerError ? (
            <Text className="-mt-6 text-[12px] text-danger">
              마력수를 선택해주세요.
            </Text>
          ) : null}

          <PriceTrendSelectField
            label="적재함 종류"
            required
            placeholder="적재함 종류 선택"
            value={params.loaded.desc}
            onPress={() => openPicker("loaded")}
          />

          <LabeledTextInput
            label="길이"
            required
            placeholder="길이 입력 ex) 10.2"
            value={params.loadedInnerLength}
            unit="m"
            keyboardType="decimal-pad"
            onChangeText={(value) => {
              const next = sanitizeDecimalMax2(value);
              setParams((prev) => ({ ...prev, loadedInnerLength: next }));
              const validation = validateLoadedInnerLength(next);
              setLengthError(validation.error);
              setLengthErrorMessage(validation.message);
            }}
            error={lengthError}
            errorMessage={lengthErrorMessage}
          />

          <LabeledTextInput
            label="너비"
            placeholder="너비 입력 ex) 2.4"
            value={params.loadedInnerArea}
            unit="m"
            keyboardType="decimal-pad"
            onChangeText={(value) => {
              const next = sanitizeDecimalMax2(value);
              setParams((prev) => ({
                ...prev,
                loadedInnerArea: next,
              }));
              const validation = validateLoadedInnerWidth(next);
              setWidthError(validation.error);
              setWidthErrorMessage(validation.message);
            }}
            error={widthError}
            errorMessage={widthErrorMessage}
          />

          <LabeledTextInput
            label="높이"
            placeholder="높이 입력 ex) 2.5"
            value={params.loadedInnerHeight}
            unit="m"
            keyboardType="decimal-pad"
            onChangeText={(value) => {
              const next = sanitizeDecimalMax2(value);
              setParams((prev) => ({
                ...prev,
                loadedInnerHeight: next,
              }));
              const validation = validateLoadedInnerHeight(next);
              setHeightError(validation.error);
              setHeightErrorMessage(validation.message);
            }}
            error={heightError}
            errorMessage={heightErrorMessage}
          />

          <PriceTrendRadioGroup
            label="변속기"
            required
            options={transmissionRadioOptions}
            value={transmissionCode}
            onChange={onChangeTransmission}
            horizontal
          />

          <LabeledTextInput
            label="주행거리"
            required
            placeholder="주행거리 입력 ex) 20000"
            value={params.distance}
            unit="km"
            keyboardType="number-pad"
            onChangeText={(value) => {
              const next = value.replace(/[^\d]/g, "");
              setParams((prev) => ({ ...prev, distance: next }));
              const validation = validateDistance(next);
              setDistanceError(validation.error);
              setDistanceErrorMessage(validation.message);
            }}
            error={distanceError}
            errorMessage={distanceErrorMessage}
          />

          <PriceTrendSelectField
            label="연료"
            required
            placeholder="연료 선택"
            value={params.fuel}
            onPress={() => openPicker("fuel")}
          />

          <PriceTrendRadioGroup
            label="가변축"
            required
            options={axisRadioOptions}
            value={params.axis.code}
            onChange={onChangeAxis}
            disabled={axisDisabled}
            horizontal
          />
          {axisDisabled ? (
            <Text className="-mt-4 text-[12px] text-gray600">
              4톤 미만 차량은 가변축이 없습니다.
            </Text>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <View className="border-t border-gray300 bg-white px-0 pt-3">
        <View className="flex-row gap-2">
          <Pressable
            onPress={onReset}
            className="h-12 flex-1 items-center justify-center rounded-lg border border-gray300 bg-white"
          >
            <Text className="text-[14px] font-semibold text-gray700">
              초기화
            </Text>
          </Pressable>
          <Pressable
            onPress={onSearch}
            disabled={isSearchDisabled}
            className="h-12 flex-[2] items-center justify-center rounded-lg"
            style={{
              backgroundColor: isSearchDisabled
                ? appColors.gray300
                : appColors.primary,
            }}
          >
            <Text className="text-[14px] font-bold text-white">검색</Text>
          </Pressable>
        </View>
      </View>
      </View>

      <ProductEditOptionSheet
        visible={pickerKey !== null}
        title={pickerTitle}
        options={pickerOptionItems}
        selectedCode={selectedPickerCode}
        onClose={() => setPickerKey(null)}
        onSelect={(item) => {
          const original = pickerOptions.find(
            (option) =>
              String(option.id ?? option.code ?? option.name ?? "") ===
              item.code,
          );
          if (original) onSelectPicker(original);
        }}
      />
    </Screen>
  );
}
