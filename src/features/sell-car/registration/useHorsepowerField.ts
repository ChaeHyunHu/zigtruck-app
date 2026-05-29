import { useCallback, useEffect, useRef, useState } from "react";

import { getHorsepower } from "@/src/api/public";
import {
  hasPowerValue,
  powerMatchesHorsepowerList,
  validatePower,
} from "@/src/features/products/edit/validation";
import {
  mapHorsepowerToPickerOptions,
  parseHorsepowerApiResponse,
} from "@/src/features/price-trend/horsepowerUtils";

import type { OptionItem } from "./OptionPickerSheet";

type HorsepowerFieldParams = {
  manufacturer?: string;
  modelName?: string;
  tons?: number | string;
  power?: number | string;
};

type ResolveResult = {
  isDirectInputMode: boolean;
  options: OptionItem[];
};

/** ProductEditVehicleTab / 웹 시세·판매 등록과 동일한 마력 API → 직접입력 분기 */
export function useHorsepowerField({
  manufacturer,
  modelName,
  tons,
  power,
}: HorsepowerFieldParams) {
  const [isDirectInputMode, setIsDirectInputMode] = useState(false);
  const [horsepowerReady, setHorsepowerReady] = useState(false);
  const [horsepowerOptions, setHorsepowerOptions] = useState<OptionItem[]>([]);
  const [powerError, setPowerError] = useState("");

  const cacheKeyRef = useRef("");
  const resolveRef = useRef<Promise<ResolveResult> | null>(null);

  const canSelectPower = Boolean(
    manufacturer && modelName && tons != null && tons !== "",
  );

  const getCacheKey = useCallback(
    () => `${manufacturer ?? ""}-${modelName ?? ""}-${tons ?? ""}`,
    [manufacturer, modelName, tons],
  );

  const resolveHorsepowerMode = useCallback(
    async (options?: {
      openPicker?: boolean;
      checkSavedValue?: boolean;
    }): Promise<ResolveResult> => {
      const openPicker = options?.openPicker ?? false;
      const checkSavedValue = options?.checkSavedValue ?? false;

      const run = async (): Promise<ResolveResult> => {
        try {
          if (!canSelectPower) {
            setHorsepowerOptions([]);
            setIsDirectInputMode(true);
            return { isDirectInputMode: true, options: [] };
          }

          const data = await getHorsepower({
            manufacturer: String(manufacturer),
            modelName: String(modelName),
            tons: String(tons),
            horsePower: String(power ?? ""),
          });

          const list = parseHorsepowerApiResponse(data);
          cacheKeyRef.current = getCacheKey();

          if (list === null || list.length === 0) {
            setHorsepowerOptions([]);
            setIsDirectInputMode(true);
            if (checkSavedValue && hasPowerValue(power)) {
              const { isValid, errorMessage } = validatePower(
                String(power),
                String(tons),
              );
              setPowerError(isValid ? "" : errorMessage);
            } else if (!hasPowerValue(power)) {
              setPowerError("");
            }
            return { isDirectInputMode: true, options: [] };
          }

          const pickerOpts = mapHorsepowerToPickerOptions(list);
          setHorsepowerOptions(pickerOpts);

          if (openPicker) {
            setIsDirectInputMode(false);
            setPowerError("");
            return { isDirectInputMode: false, options: pickerOpts };
          }

          if (powerMatchesHorsepowerList(power, list)) {
            setIsDirectInputMode(false);
            setPowerError("");
            return { isDirectInputMode: false, options: pickerOpts };
          }

          if (hasPowerValue(power)) {
            setIsDirectInputMode(true);
            const { isValid, errorMessage } = validatePower(
              String(power),
              String(tons),
            );
            setPowerError(isValid ? "" : errorMessage);
            return { isDirectInputMode: true, options: pickerOpts };
          }

          setIsDirectInputMode(false);
          setPowerError("");
          return { isDirectInputMode: false, options: pickerOpts };
        } catch {
          cacheKeyRef.current = getCacheKey();
          setHorsepowerOptions([]);
          setIsDirectInputMode(true);
          if (!hasPowerValue(power)) {
            setPowerError("");
          }
          return { isDirectInputMode: true, options: [] };
        } finally {
          setHorsepowerReady(true);
        }
      };

      if (!resolveRef.current) {
        resolveRef.current = run().finally(() => {
          resolveRef.current = null;
        });
      }
      return resolveRef.current;
    },
    [canSelectPower, getCacheKey, manufacturer, modelName, power, tons],
  );

  useEffect(() => {
    const cacheKey = getCacheKey();
    if (cacheKeyRef.current !== cacheKey) {
      cacheKeyRef.current = "";
      setHorsepowerOptions([]);
      setHorsepowerReady(false);
    }
    void resolveHorsepowerMode({ checkSavedValue: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manufacturer, modelName, tons]);

  const loadHorsepowerForPicker = useCallback(async (): Promise<boolean> => {
    if (isDirectInputMode) return false;

    const cacheKey = getCacheKey();
    if (
      horsepowerReady &&
      cacheKeyRef.current === cacheKey &&
      horsepowerOptions.length > 0
    ) {
      return true;
    }

    const result = await resolveHorsepowerMode({ openPicker: true });
    return !result.isDirectInputMode && result.options.length > 0;
  }, [
    getCacheKey,
    horsepowerOptions.length,
    horsepowerReady,
    isDirectInputMode,
    resolveHorsepowerMode,
  ]);

  const validateDirectPower = useCallback(
    (value: string) => {
      const { isValid, errorMessage } = validatePower(value, String(tons ?? ""));
      setPowerError(isValid ? "" : errorMessage);
    },
    [tons],
  );

  return {
    isDirectInputMode,
    horsepowerReady,
    horsepowerOptions,
    powerError,
    setPowerError,
    loadHorsepowerForPicker,
    validateDirectPower,
  };
}
