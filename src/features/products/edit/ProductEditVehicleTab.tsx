import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Text, View } from "react-native";

import { getHorsepower } from "@/src/api/public";
import { ADDRESS1 } from "@/src/constants/address";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";
import {
  mapHorsepowerToPickerOptions,
  parseHorsepowerApiResponse,
  ZERO_HORSEPOWER_OPTION,
} from "@/src/features/price-trend/horsepowerUtils";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";
import { PriceTrendRadioGroup, type RadioOption } from "@/src/features/price-trend/PriceTrendRadioGroup";
import type { ProductEditOpenPickerParams } from "@/src/features/products/edit/productEditPickerTypes";
import type { OptionItem } from "@/src/features/sell-car/registration/OptionPickerSheet";
import { SelectField } from "@/src/features/sell-car/registration/SelectField";
import { getArea2Options, getArea3Options, isOneTonRange, sanitizePowerInput, sanitizeTonsInput } from "@/src/features/products/edit/utils";
import {
  hasPowerValue,
  powerMatchesHorsepowerList,
  validatePower,
} from "@/src/features/products/edit/validation";
import type { ProductEnumData } from "@/src/features/sell-car/registration/types";
import {
  isLengthOnlyLoadedType,
  isUnderFourTons,
} from "@/src/features/sell-car/registration/productUtils";
import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";
import { getTonnageErrorMessage, validateDistance, validateLoadedInnerLength } from "@/src/features/sell-car/registration/validation";

type PickerKey =
  | "model"
  | "modelDetail"
  | "loaded"
  | "loadedDetail"
  | "fuel"
  | "color"
  | "garage"
  | "power"
  | "area1"
  | "area2"
  | "area3";

type PickerOption = {
  id?: number | string;
  code?: string;
  desc?: string;
  name?: string;
};

const PICKER_TITLES: Record<PickerKey, string> = {
  model: "모델",
  modelDetail: "세부 모델",
  loaded: "적재함 종류",
  loadedDetail: "세부 적재함 종류",
  fuel: "연료",
  color: "색상",
  garage: "차고지",
  power: "마력수",
  area1: "활동지",
  area2: "지역",
  area3: "지역",
};

function toOptionItems(options: PickerOption[]): OptionItem[] {
  return options.map((option) => ({
    code: String(option.code ?? option.id ?? ""),
    desc: String(option.desc ?? option.name ?? option.code ?? ""),
  }));
}

type Props = {
  form: RegistrationProduct;
  productEnum: ProductEnumData | null;
  onChange: React.Dispatch<React.SetStateAction<RegistrationProduct>>;
  onOpenPicker: (params: ProductEditOpenPickerParams) => void;
};

const mapTransmissionOptions = (productEnum: ProductEnumData | null): RadioOption[] =>
  (productEnum?.transmission ?? [])
    .filter((item) => item.code && item.code !== "BOTH")
    .map((item) => {
      let label = item.desc ?? "";
      if (item.code === "AUTO") label = "오토";
      else if (item.code === "STICK" || item.code === "MANUAL") label = "스틱";
      return { code: item.code!, label };
    });

const mapAxisOptions = (productEnum: ProductEnumData | null): RadioOption[] =>
  (productEnum?.axis ?? [])
    .filter((item) => item.code)
    .map((item) => ({
      code: item.code!,
      label: item.desc ?? item.code!,
    }));

const mapFuelOptions = (productEnum: ProductEnumData | null): PickerOption[] =>
  (productEnum?.fuel ?? []).map((item) => {
    let desc = item.desc ?? "";
    if (item.code === "DIESEL") desc = "디젤";
    if (item.code === "LPG") desc = "LPG";
    if (item.code === "ELECTRIC" || item.code === "ELECT") desc = "전기";
    if (item.code === "GASOLINE" || item.code === "GAS") desc = "가솔린";
    return { code: String(item.code), desc };
  });

export function ProductEditVehicleTab({
  form,
  productEnum,
  onChange,
  onOpenPicker,
}: Props) {
  const [powerOptions, setPowerOptions] = useState<PickerOption[]>([]);
  const [isDirectInputMode, setIsDirectInputMode] = useState(false);
  const [horsepowerReady, setHorsepowerReady] = useState(false);

  const [tonsError, setTonsError] = useState("");
  const [lengthError, setLengthError] = useState("");
  const [distanceError, setDistanceError] = useState("");
  const [powerError, setPowerError] = useState("");
  const [modelDetailError, setModelDetailError] = useState("");

  const hasValidatedPower = useRef(false);
  const lastValidatedPowerKey = useRef("");
  const horsepowerResolveRef = useRef<Promise<void> | null>(null);
  const horsepowerListCacheKeyRef = useRef("");

  const oneTon = isOneTonRange(form.tons);
  const axisDisabled = isUnderFourTons(form.tons);
  const showOnlyLength = isLengthOnlyLoadedType(form);
  const canSelectModel = Boolean(form.manufacturerCategories?.name);
  const canSelectPower =
    canSelectModel && Boolean(form.model?.name) && Boolean(form.tons);

  const transmissionOptions = useMemo(
    () => mapTransmissionOptions(productEnum),
    [productEnum],
  );
  const axisOptions = useMemo(() => mapAxisOptions(productEnum), [productEnum]);

  const selectedModel = useMemo(() => {
    if (!productEnum || !form.manufacturerCategories?.id || !form.model?.id) {
      return null;
    }
    const found = productEnum.manufacturerAndModel?.find(
      (item) =>
        item.manufacturerCategories.id === Number(form.manufacturerCategories?.id),
    );
    const models = found?.model ?? [];
    return models.find((m) => m.id === Number(form.model?.id)) ?? null;
  }, [form.manufacturerCategories?.id, form.model?.id, productEnum]);

  const modelDetailList = selectedModel?.modelDetail ?? [];
  const hasModelDetail = modelDetailList.length > 0;

  const loadedOptions = useMemo((): PickerOption[] => {
    if (!productEnum) return [];
    const list = oneTon
      ? productEnum.oneTonsLoaded ?? []
      : (productEnum.loaded ?? []).filter((item) => item.code !== "WIDEWINGBODY");
    return list.map((item) => ({ code: String(item.code), desc: String(item.desc) }));
  }, [oneTon, productEnum]);

  const loadedDetailOptions = useMemo((): PickerOption[] => {
    if (!oneTon || !form.loaded?.code || !productEnum?.oneTonsLoaded) return [];
    const found = productEnum.oneTonsLoaded.find(
      (item) => item.code === form.loaded?.code,
    );
    return (found?.loadedDetail ?? []).map((item) => ({
      code: String(item.code),
      desc: String(item.desc),
    }));
  }, [form.loaded?.code, oneTon, productEnum]);

  const area2List = getArea2Options(form.area1 ?? "");
  const area3List = getArea3Options(form.area1 ?? "");

  useEffect(() => {
    if (hasModelDetail && !form.modelDetail?.code) {
      setModelDetailError("세부 모델은 필수값입니다.");
    } else {
      setModelDetailError("");
    }
  }, [form.modelDetail?.code, hasModelDetail]);

  useEffect(() => {
    if (!axisDisabled) return;
    onChange((prev) => {
      if (prev.axis?.code === "NONE") return prev;
      return { ...prev, axis: { code: "NONE", desc: "없음" } };
    });
    // onChange는 부모 인라인 함수일 수 있어 deps에서 제외 (값이 같으면 prev 반환으로 루프 방지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axisDisabled]);

  const getPickerOptions = useCallback(
    (key: PickerKey): PickerOption[] => {
      if (key === "power") return powerOptions;
      if (key === "model") {
        const found = productEnum?.manufacturerAndModel?.find(
          (item) =>
            item.manufacturerCategories.id ===
            Number(form.manufacturerCategories?.id),
        );
        return (found?.model ?? []).map((item) => ({
          id: item.id,
          code: String(item.id),
          name: item.name,
          desc: item.name,
        }));
      }
      if (key === "modelDetail") {
        return modelDetailList.map((item) => ({
          code: String(item.code),
          desc: String(item.desc),
        }));
      }
      if (key === "loaded") return loadedOptions;
      if (key === "loadedDetail") return loadedDetailOptions;
      if (key === "fuel") return mapFuelOptions(productEnum);
      if (key === "color") {
        return (productEnum?.color ?? []).map((item) => ({
          code: String(item.code),
          desc: String(item.desc),
        }));
      }
      if (key === "garage") {
        return (productEnum?.garage ?? []).map((item) => ({
          code: String(item.code),
          desc: String(item.desc),
        }));
      }
      if (key === "area1") {
        return ADDRESS1.map((item) => ({ code: item.desc, desc: item.desc }));
      }
      if (key === "area2") {
        const filtered = form.area3
          ? area2List.filter((item) => item.desc !== form.area3)
          : area2List;
        return filtered.map((item) => ({ code: item.desc, desc: item.desc }));
      }
      if (key === "area3") {
        const filtered = form.area2
          ? area3List.filter((item) => item.desc !== form.area2)
          : area3List;
        return filtered.map((item) => ({ code: item.desc, desc: item.desc }));
      }
      return [];
    },
    [
      area2List,
      area3List,
      form.area2,
      form.area3,
      form.manufacturerCategories?.id,
      loadedDetailOptions,
      loadedOptions,
      modelDetailList,
      powerOptions,
      productEnum,
    ],
  );

  const getPickerSelectedCode = useCallback(
    (key: PickerKey): string | undefined => {
      if (key === "power") return form.power ? String(form.power) : undefined;
      if (key === "model") return form.model?.id ? String(form.model.id) : undefined;
      if (key === "modelDetail") return form.modelDetail?.code;
      if (key === "loaded") return form.loaded?.code;
      if (key === "loadedDetail") return form.loadedDetail?.code;
      if (key === "fuel") return form.fuel?.code;
      if (key === "color") return form.color?.code;
      if (key === "garage") return form.garage?.code;
      if (key === "area1") return form.area1 || undefined;
      if (key === "area2") return form.area2 || undefined;
      if (key === "area3") return form.area3 || undefined;
      return undefined;
    },
    [form],
  );

  const handlePickerSelect = useCallback(
    (key: PickerKey, item: OptionItem) => {
      const option: PickerOption = {
        code: item.code,
        desc: item.desc,
      };

      if (key === "model") {
        onChange((prev) => ({
          ...prev,
          model: {
            id: Number(option.code),
            name: option.desc ?? "",
          },
          modelDetail: undefined,
          power: "",
        }));
        hasValidatedPower.current = false;
        lastValidatedPowerKey.current = "";
        horsepowerListCacheKeyRef.current = "";
        setPowerOptions([]);
        setHorsepowerReady(false);
      } else if (key === "modelDetail") {
        onChange((prev) => ({
          ...prev,
          modelDetail: { code: option.code ?? "", desc: option.desc ?? "" },
        }));
      } else if (key === "loaded") {
        onChange((prev) => ({
          ...prev,
          loaded: { code: option.code ?? "", desc: option.desc ?? "" },
          loadedDetail: undefined,
        }));
      } else if (key === "loadedDetail") {
        onChange((prev) => ({
          ...prev,
          loadedDetail: { code: option.code ?? "", desc: option.desc ?? "" },
        }));
      } else if (key === "fuel") {
        onChange((prev) => ({
          ...prev,
          fuel: { code: option.code ?? "", desc: option.desc ?? "" },
        }));
      } else if (key === "color") {
        onChange((prev) => ({
          ...prev,
          color: { code: option.code ?? "", desc: option.desc ?? "" },
        }));
      } else if (key === "garage") {
        onChange((prev) => ({
          ...prev,
          garage: { code: option.code ?? "", desc: option.desc ?? "" },
        }));
      } else if (key === "power") {
        const selected = option.code ?? "";
        onChange((prev) => ({ ...prev, power: selected }));
        if (selected === "0") {
          setPowerError("");
        } else {
          const { isValid, errorMessage } = validatePower(
            selected,
            String(form.tons),
          );
          setPowerError(isValid ? "" : errorMessage);
        }
      } else if (key === "area1") {
        onChange((prev) => ({
          ...prev,
          area1: option.desc ?? "",
          area2: "",
          area3: "",
        }));
      } else if (key === "area2") {
        onChange((prev) => ({
          ...prev,
          area2: option.desc ?? "",
          ...(prev.area3 === option.desc ? { area3: "" } : {}),
        }));
      } else if (key === "area3") {
        onChange((prev) => ({
          ...prev,
          area3: option.desc ?? "",
          ...(prev.area2 === option.desc ? { area2: "" } : {}),
        }));
      }
    },
    [form.tons, onChange],
  );

  const showPicker = useCallback(
    (key: PickerKey, optionsOverride?: PickerOption[]) => {
      const options = optionsOverride ?? getPickerOptions(key);
      onOpenPicker({
        title: PICKER_TITLES[key],
        options: toOptionItems(options),
        selectedCode: getPickerSelectedCode(key),
        onSelect: (item) => handlePickerSelect(key, item),
      });
    },
    [getPickerOptions, getPickerSelectedCode, handlePickerSelect, onOpenPicker],
  );

  const getHorsepowerCacheKey = useCallback(
    () =>
      `${form.manufacturerCategories?.name ?? ""}-${form.model?.name ?? ""}-${form.tons ?? ""}`,
    [form.manufacturerCategories?.name, form.model?.name, form.tons],
  );

  const resolveHorsepowerMode = useCallback(
    async (options?: { openPicker?: boolean; checkSavedValue?: boolean }) => {
      if (!canSelectPower) return;

      const cacheKey = getHorsepowerCacheKey();
      const checkSavedValue = options?.checkSavedValue ?? false;
      const shouldOpenPicker = options?.openPicker ?? false;

      const run = async () => {
        try {
          const data = await getHorsepower({
            manufacturer: form.manufacturerCategories?.name ?? "",
            modelName: form.model?.name ?? "",
            tons: String(form.tons),
            horsePower: String(form.power ?? ""),
          });

          const list = parseHorsepowerApiResponse(data);
          horsepowerListCacheKeyRef.current = cacheKey;

          if (list === null || list.length === 0) {
            setPowerOptions([ZERO_HORSEPOWER_OPTION]);
            setIsDirectInputMode(true);
            if (!hasPowerValue(form.power)) {
              setPowerError("마력을 입력해주세요.");
            } else if (checkSavedValue) {
              const { isValid, errorMessage } = validatePower(
                String(form.power),
                String(form.tons),
              );
              setPowerError(isValid ? "" : errorMessage);
            }
            return;
          }

          const pickerOpts = mapHorsepowerToPickerOptions(list);
          setPowerOptions(pickerOpts);

          if (shouldOpenPicker) {
            setIsDirectInputMode(false);
            onOpenPicker({
              title: PICKER_TITLES.power,
              options: toOptionItems(pickerOpts),
              selectedCode: form.power ? String(form.power) : undefined,
              onSelect: (item) => handlePickerSelect("power", item),
            });
            return;
          }

          const savedPower = form.power;
          if (powerMatchesHorsepowerList(savedPower, list)) {
            setIsDirectInputMode(false);
            setPowerError("");
          } else if (hasPowerValue(savedPower)) {
            setIsDirectInputMode(true);
            const { isValid, errorMessage } = validatePower(
              String(savedPower),
              String(form.tons),
            );
            setPowerError(isValid ? "" : errorMessage);
          } else {
            setIsDirectInputMode(false);
            setPowerError("마력을 선택해주세요.");
          }
        } catch {
          horsepowerListCacheKeyRef.current = cacheKey;
          setIsDirectInputMode(true);
          setPowerOptions([]);
          if (!hasPowerValue(form.power)) {
            setPowerError("마력을 입력해주세요.");
          }
        } finally {
          setHorsepowerReady(true);
        }
      };

      if (!horsepowerResolveRef.current) {
        horsepowerResolveRef.current = run().finally(() => {
          horsepowerResolveRef.current = null;
        });
      }
      await horsepowerResolveRef.current;
    },
    [
      canSelectPower,
      form.manufacturerCategories?.name,
      form.model?.name,
      form.power,
      form.tons,
      getHorsepowerCacheKey,
      handlePickerSelect,
      onOpenPicker,
    ],
  );

  const validatePowerWithApi = useCallback(async () => {
    const validationKey = getHorsepowerCacheKey();
    if (!validationKey || validationKey === "--") return;
    if (
      hasValidatedPower.current &&
      lastValidatedPowerKey.current === validationKey
    ) {
      return;
    }
    hasValidatedPower.current = true;
    lastValidatedPowerKey.current = validationKey;
    await resolveHorsepowerMode({ checkSavedValue: true });
  }, [getHorsepowerCacheKey, resolveHorsepowerMode]);

  useEffect(() => {
    const cacheKey = getHorsepowerCacheKey();
    if (horsepowerListCacheKeyRef.current !== cacheKey) {
      horsepowerListCacheKeyRef.current = "";
      setPowerOptions([]);
      setHorsepowerReady(false);
    }
    validatePowerWithApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.manufacturerCategories?.name, form.model?.name, form.tons]);

  const loadHorsepowerForPicker = useCallback(async () => {
    if (!canSelectPower || isDirectInputMode) return;

    const cacheKey = getHorsepowerCacheKey();
    if (
      horsepowerListCacheKeyRef.current === cacheKey &&
      powerOptions.length > 0
    ) {
      showPicker("power");
      return;
    }

    await resolveHorsepowerMode({ openPicker: true });
  }, [
    canSelectPower,
    getHorsepowerCacheKey,
    isDirectInputMode,
    powerOptions.length,
    resolveHorsepowerMode,
    showPicker,
  ]);

  const onTonsBlur = useCallback(() => {
    hasValidatedPower.current = false;
    lastValidatedPowerKey.current = "";
    horsepowerListCacheKeyRef.current = "";
    setPowerOptions([]);
    setHorsepowerReady(false);
    validatePowerWithApi();
  }, [validatePowerWithApi]);

  const onChangeTons = useCallback(
    (value: string) => {
      const next = sanitizeTonsInput(value);
      const isTonsOne = isOneTonRange(next);
      onChange((prev) => ({
        ...prev,
        tons: next,
        power: "",
        ...(!isTonsOne
          ? { area1: "", area2: "", area3: "", loadedDetail: undefined }
          : {}),
      }));
      setTonsError(getTonnageErrorMessage(next));
      hasValidatedPower.current = false;
      lastValidatedPowerKey.current = "";
    },
    [onChange],
  );

  return (
    <View className="px-4 pt-4">
      <Text className="mb-4 text-[13px] text-danger">(필수) 항목은 필수 항목입니다.</Text>

      <View className="gap-[30px]">
        <SelectField
          label="제조사"
          placeholder="제조사"
          value={form.manufacturerCategories?.name}
          disabled
          onPress={() => {}}
        />

        <SelectField
          label="모델"
          placeholder={
            canSelectModel ? "모델 선택" : "제조사 정보를 확인해주세요"
          }
          value={form.model?.name}
          disabled={!canSelectModel}
          onPress={() => showPicker("model")}
        />

        {hasModelDetail ? (
          <View>
            <SelectField
              label="세부 모델"
              placeholder="세부 모델 선택"
              value={form.modelDetail?.desc}
              onPress={() => showPicker("modelDetail")}
            />
            {modelDetailError ? (
              <Text className="mt-1 text-[12px] text-danger">{modelDetailError}</Text>
            ) : null}
          </View>
        ) : null}

        <LabeledTextInput
          label="톤수"
          required
          placeholder="톤수 입력 ex) 8.5"
          value={String(form.tons ?? "")}
          unit="t"
          keyboardType="decimal-pad"
          onChangeText={onChangeTons}
          onBlur={onTonsBlur}
          error={Boolean(tonsError)}
          errorMessage={tonsError}
        />

        <SelectField
          label="적재함 종류"
          placeholder="적재함 종류 선택"
          value={form.loaded?.desc}
          onPress={() => showPicker("loaded")}
        />

        {oneTon && loadedDetailOptions.length > 0 ? (
          <SelectField
            label="세부 적재함 종류"
            placeholder="세부 적재함 종류 선택"
            value={form.loadedDetail?.desc}
            onPress={() => showPicker("loadedDetail")}
          />
        ) : null}

        <LabeledTextInput
          label="길이"
          required
          placeholder="길이 입력 ex) 10.2"
          value={String(form.loadedInnerLength ?? "")}
          unit="m"
          keyboardType="decimal-pad"
          onChangeText={(value) => {
            const next = sanitizeDecimalMax2(value);
            onChange((prev) => ({ ...prev, loadedInnerLength: next }));
            setLengthError(
              validateLoadedInnerLength(form.tons, next) || "",
            );
          }}
          error={Boolean(lengthError)}
          errorMessage={lengthError}
        />

        {!showOnlyLength ? (
          <>
            <LabeledTextInput
              label="너비"
              placeholder="너비 입력 ex) 2.4"
              value={String(form.loadedInnerArea ?? "")}
              unit="m"
              keyboardType="decimal-pad"
              onChangeText={(value) =>
                onChange((prev) => ({
                  ...prev,
                  loadedInnerArea: sanitizeDecimalMax2(value),
                }))
              }
            />
            <LabeledTextInput
              label="높이"
              placeholder="높이 입력 ex) 2.5"
              value={String(form.loadedInnerHeight ?? "")}
              unit="m"
              keyboardType="decimal-pad"
              onChangeText={(value) =>
                onChange((prev) => ({
                  ...prev,
                  loadedInnerHeight: sanitizeDecimalMax2(value),
                }))
              }
            />
          </>
        ) : null}

        <PriceTrendRadioGroup
          label="가변축"
          required
          options={axisOptions}
          value={form.axis?.code ?? "NONE"}
          onChange={(code) => {
            const item = axisOptions.find((o) => o.code === code);
            onChange((prev) => ({
              ...prev,
              axis: { code, desc: item?.label ?? "" },
            }));
          }}
          disabled={axisDisabled}
          horizontal
        />
        {axisDisabled ? (
          <Text className="-mt-4 text-[12px] text-gray600">
            4톤 미만 차량은 가변축이 없습니다.
          </Text>
        ) : null}

        <PriceTrendRadioGroup
          label="변속기"
          required
          options={transmissionOptions}
          value={form.transmission?.code ?? ""}
          onChange={(code) => {
            const item = transmissionOptions.find((o) => o.code === code);
            onChange((prev) => ({
              ...prev,
              transmission: { code, desc: item?.label ?? "" },
            }));
          }}
          horizontal
        />

        <LabeledTextInput
          label="주행거리"
          required
          placeholder="주행거리 입력 ex) 20000"
          value={formatDistanceInput(form.distance)}
          unit="km"
          keyboardType="number-pad"
          onChangeText={(value) => {
            const next = value.replace(/[^\d]/g, "");
            onChange((prev) => ({ ...prev, distance: next }));
            setDistanceError(validateDistance(next) || "");
          }}
          error={Boolean(distanceError)}
          errorMessage={distanceError}
        />

        <SelectField
          label="연료"
          placeholder="연료 선택"
          value={form.fuel?.desc}
          onPress={() => showPicker("fuel")}
        />

        {isDirectInputMode ? (
          <LabeledTextInput
            label="마력수"
            required
            placeholder="마력수 입력"
            value={String(form.power ?? "")}
            unit="PS"
            keyboardType="number-pad"
            onChangeText={(value) => {
              const next = sanitizePowerInput(value);
              onChange((prev) => ({ ...prev, power: next }));
              const { isValid, errorMessage } = validatePower(next, String(form.tons));
              setPowerError(isValid ? "" : errorMessage);
            }}
            error={Boolean(powerError)}
            errorMessage={powerError}
          />
        ) : (
          <View>
            <SelectField
              label="마력수"
              placeholder={
                canSelectPower
                  ? "마력수 선택"
                  : "제조사·모델·톤수 입력 후 선택"
              }
              value={form.power ? `${form.power}` : undefined}
              disabled={!canSelectPower || !horsepowerReady}
              onPress={loadHorsepowerForPicker}
            />
            {powerError ? (
              <Text className="mt-1 text-[12px] text-danger">{powerError}</Text>
            ) : null}
          </View>
        )}

        <SelectField
          label="색상"
          placeholder="색상 선택"
          value={form.color?.desc}
          onPress={() => showPicker("color")}
        />

        <SelectField
          label="차고지"
          placeholder="차고지 선택"
          value={form.garage?.desc}
          onPress={() => showPicker("garage")}
        />

        {oneTon ? (
          <>
            <SelectField
              label="활동지"
              placeholder="활동지 선택"
              value={form.area1}
              onPress={() => showPicker("area1")}
            />
            {area2List.length > 1 ? (
              <>
                <SelectField
                  label="지역"
                  placeholder="지역 선택"
                  value={form.area2}
                  onPress={() => showPicker("area2")}
                />
                <SelectField
                  label="지역"
                  placeholder="지역 선택"
                  value={form.area3}
                  onPress={() => showPicker("area3")}
                />
              </>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

function formatDistanceInput(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const n = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return String(value);
  return String(n);
}
