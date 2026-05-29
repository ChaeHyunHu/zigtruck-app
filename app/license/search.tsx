import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { getLicenseFilterInfo, type LicenseFilterInfo } from "@/src/api/license";
import { Screen } from "@/src/components/common/Screen";
import { LicenseCircleRadioGroup } from "@/src/features/license/components/LicenseCircleRadioGroup";
import { LicenseSearchRangeSection } from "@/src/features/license/components/LicenseSearchRangeSection";
import { LicenseSearchTypeRow } from "@/src/features/license/components/LicenseSearchTypeRow";
import { useLicenseSearch } from "@/src/features/license/LicenseSearchContext";
import { getCurrentYear } from "@/src/features/license/utils";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";
import {
  OptionPickerSheet,
  type PickerOption,
} from "@/src/features/price-trend/OptionPickerSheet";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

const YEAR_MIN = 2000;
const TONS_MIN = 1;
const TONS_MAX = 27;

export default function LicenseSearchScreen() {
  const { params, setParams, resetParams } = useLicenseSearch();
  const { listPaddingBottom } = useScreenInsets();
  const [enumData, setEnumData] = useState<LicenseFilterInfo | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerOptions, setPickerOptions] = useState<PickerOption[]>([]);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const yearMax = getCurrentYear() + 1;

  useEffect(() => {
    getLicenseFilterInfo().then(setEnumData).catch(() => undefined);
  }, []);

  const salesTypeOptions = useMemo(
    () =>
      (enumData?.licenseSalesType ?? []).map((item) => ({
        code: item.code,
        label: item.desc,
      })),
    [enumData],
  );

  const licenseTypeLabel = params.licenseType.desc?.trim() || "전체";

  const openLicenseTypePicker = () => {
    setPickerOptions(
      [{ code: "", desc: "전체" }, ...(enumData?.licenseType ?? [])].map(
        (item) => ({ code: item.code, desc: item.desc }),
      ),
    );
    setPickerOpen(true);
  };

  const clampYear = (value: string, fallback: number) => {
    const n = Number(value.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) return String(fallback);
    return String(Math.min(yearMax, Math.max(YEAR_MIN, n)));
  };

  const clampTons = (value: string, fallback: number) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(fallback);
    return String(Math.min(TONS_MAX, Math.max(TONS_MIN, n)));
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="번호판 검색" />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 80 }}
      >
        <LicenseSearchRangeSection
          label="연식"
          min={YEAR_MIN}
          max={yearMax}
          valueMin={params.minYear}
          valueMax={params.maxYear}
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(low, high) => {
            setParams((prev) => ({
              ...prev,
              minYear: String(low),
              maxYear: String(high),
            }));
          }}
          onChangeMin={(text) =>
            setParams((prev) => ({
              ...prev,
              minYear: clampYear(text, YEAR_MIN),
            }))
          }
          onChangeMax={(text) =>
            setParams((prev) => ({
              ...prev,
              maxYear: clampYear(text, yearMax),
            }))
          }
        />

        <LicenseSearchRangeSection
          label="톤수"
          min={TONS_MIN}
          max={TONS_MAX}
          valueMin={params.minTons}
          valueMax={params.maxTons}
          unit="t"
          keyboardType="decimal-pad"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(low, high) => {
            setParams((prev) => ({
              ...prev,
              minTons: String(low),
              maxTons: String(high),
            }));
          }}
          onChangeMin={(text) =>
            setParams((prev) => ({
              ...prev,
              minTons: clampTons(sanitizeDecimalMax2(text), TONS_MIN),
            }))
          }
          onChangeMax={(text) =>
            setParams((prev) => ({
              ...prev,
              maxTons: clampTons(sanitizeDecimalMax2(text), TONS_MAX),
            }))
          }
        />

        <View className="border-b border-t border-gray300 px-4 py-7">
          <LicenseCircleRadioGroup
            label="거래 방식"
            variant="purchase"
            options={salesTypeOptions}
            value={params.licenseSalesType || ""}
            onChange={(code) =>
              setParams((prev) => ({
                ...prev,
                licenseSalesType: code,
                ...(code === "RENTAL"
                  ? { licenseType: { code: "", desc: "" } }
                  : {}),
              }))
            }
          />
        </View>

        {params.licenseSalesType !== "RENTAL" ? (
          <LicenseSearchTypeRow
            label="번호판 종류"
            value={licenseTypeLabel}
            onPress={openLicenseTypePicker}
          />
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0">
        <DualFooterButtons
          leftLabel="초기화"
          rightLabel="검색"
          leftFlex={0.35}
          onPressLeft={resetParams}
          onPressRight={() => router.back()}
        />
      </View>

      <OptionPickerSheet
        visible={pickerOpen}
        title="번호판 종류"
        options={pickerOptions}
        onClose={() => setPickerOpen(false)}
        onSelect={(option) => {
          setParams((prev) => ({
            ...prev,
            licenseType: {
              code: String(option.code ?? ""),
              desc: option.desc ?? "전체",
            },
          }));
        }}
      />
    </Screen>
  );
}
