import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { getJobFilterInfo } from "@/src/api/public";
import { Screen } from "@/src/components/common/Screen";
import { JobSearchFilterRow } from "@/src/features/job/components/JobSearchFilterRow";
import {
  JOB_TONS_MAX,
  JOB_TONS_MIN,
} from "@/src/features/job/constants";
import { useJobSearch } from "@/src/features/job/JobSearchContext";
import type { JobEnumField, JobFilterInfo } from "@/src/features/job/types";
import { sanitizeDecimalMax2 } from "@/src/features/price-trend/inputUtils";
import {
  OptionPickerSheet,
  type PickerOption,
} from "@/src/features/price-trend/OptionPickerSheet";
import { FilterRangeSection } from "@/src/features/products/FilterSections";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

type FilterKey = "workingArea" | "workingDays" | "workingHours";

const FILTER_TITLES: Record<FilterKey, string> = {
  workingArea: "근무 지역",
  workingDays: "근무 요일",
  workingHours: "근무 시간",
};

export default function JobSearchScreen() {
  const { params, setParams, resetParams } = useJobSearch();
  const { listPaddingBottom } = useScreenInsets();
  const [filterInfo, setFilterInfo] = useState<JobFilterInfo | null>(null);
  const [pickerKey, setPickerKey] = useState<FilterKey | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const loadFilterInfo = useCallback(async () => {
    try {
      const res = await getJobFilterInfo();
      const payload = (res?.data ?? res) as { data?: JobFilterInfo } & JobFilterInfo;
      const info = (payload?.data ?? payload) as JobFilterInfo;
      setFilterInfo(info);
      return info;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void loadFilterInfo();
  }, [loadFilterInfo]);

  const openPicker = useCallback(
    async (key: FilterKey) => {
      // 옵션이 아직 준비되지 않았으면 먼저 불러온 뒤 시트를 연다.
      // (열린 뒤 옵션이 채워지며 높이가 바뀌면 시트가 두 번 올라오는 것처럼 보임)
      let info = filterInfo;
      if (!info || (info[key]?.length ?? 0) === 0) {
        info = await loadFilterInfo();
      }
      if (!info || (info[key]?.length ?? 0) === 0) return;
      setPickerKey(key);
    },
    [filterInfo, loadFilterInfo],
  );

  const pickerOptions: PickerOption[] = useMemo(() => {
    if (!pickerKey || !filterInfo) return [];
    const list = filterInfo[pickerKey] ?? [];
    return list.map((item) => ({ code: item.code, desc: item.desc }));
  }, [filterInfo, pickerKey]);

  const clampTons = (value: string, fallback: number) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(JOB_TONS_MAX, Math.max(JOB_TONS_MIN, n));
  };

  const clearEnum = (key: FilterKey) => {
    const empty: JobEnumField = { code: "", desc: "" };
    setParams((prev) => ({ ...prev, [key]: empty }));
  };

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="일자리 검색" />
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ paddingBottom: listPaddingBottom + 88 }}
      >
        <FilterRangeSection
          label="톤수"
          min={JOB_TONS_MIN}
          max={JOB_TONS_MAX}
          valueMin={String(params.minTons)}
          valueMax={String(params.maxTons)}
          unit="t"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(low, high) => {
            setParams((prev) => ({
              ...prev,
              minTons: low,
              maxTons: high,
            }));
          }}
          onChangeMin={(text) =>
            setParams((prev) => ({
              ...prev,
              minTons: clampTons(sanitizeDecimalMax2(text), JOB_TONS_MIN),
            }))
          }
          onChangeMax={(text) =>
            setParams((prev) => ({
              ...prev,
              maxTons: clampTons(sanitizeDecimalMax2(text), JOB_TONS_MAX),
            }))
          }
        />

        <JobSearchFilterRow
          label="근무 지역"
          selected={params.workingArea}
          onPress={() => void openPicker("workingArea")}
          onRemove={() => clearEnum("workingArea")}
        />
        <JobSearchFilterRow
          label="근무 요일"
          selected={params.workingDays}
          onPress={() => void openPicker("workingDays")}
          onRemove={() => clearEnum("workingDays")}
        />
        <JobSearchFilterRow
          label="근무 시간"
          selected={params.workingHours}
          onPress={() => void openPicker("workingHours")}
          onRemove={() => clearEnum("workingHours")}
        />
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
        visible={pickerKey !== null}
        title={pickerKey ? FILTER_TITLES[pickerKey] : ""}
        options={pickerOptions}
        onClose={() => setPickerKey(null)}
        onSelect={(option) => {
          if (!pickerKey) return;
          setParams((prev) => ({
            ...prev,
            [pickerKey]: {
              code: String(option.code ?? ""),
              desc: option.desc ?? "",
            },
          }));
        }}
      />
    </Screen>
  );
}
