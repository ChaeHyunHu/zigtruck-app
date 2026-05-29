import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import {
  getProductFilterInfo,
  patchInterestProductNotificationSettings,
  postInterestProductNotificationSettings,
} from "@/src/api/public";
import { Screen } from "@/src/components/common/Screen";
import { IMAGE_BASE_URL } from "@/src/constants/url";
import type { InterestNotificationSettingItem } from "@/src/features/interest-notification-settings/types";
import {
  buildInterestNotificationRequest,
  formStateFromSetting,
  getDefaultInterestNotificationFormState,
} from "@/src/features/interest-notification-settings/utils";
import {
  FILTER_DISTANCE_MAX,
  FILTER_DISTANCE_MIN,
  FILTER_TONS_MAX,
  FILTER_TONS_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "@/src/features/products/filterConstants";
import { FilterOptionSheet } from "@/src/features/products/FilterOptionSheet";
import {
  FilterLengthSection,
  FilterRadioSection,
  FilterRangeSection,
} from "@/src/features/products/FilterSections";
import { clampNumber } from "@/src/features/products/filterUtils";
import { MultiSelectChipField } from "@/src/features/products/MultiSelectChipField";
import { parseFilterInfo } from "@/src/features/products/parseFilterInfo";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { useAppDialog } from "@/src/providers/AppDialogProvider";

const BANNER_IMAGE = `${IMAGE_BASE_URL}/notification_products_setting_image.png`;
const MAX_LOADED_INNER_LENGTH = 10.5;

type SheetKey = "loaded" | "manufacturer" | null;

type Props = {
  settingId?: number;
  initialSetting?: InterestNotificationSettingItem | null;
};

function FieldLabel({ title, required }: { title: string; required?: boolean }) {
  return (
    <Text className="mb-3 text-[15px] font-bold text-gray900">
      {title}
      {required ? <Text className="font-normal text-red-500">(필수)</Text> : null}
    </Text>
  );
}

export function InterestNotificationFormScreen({ settingId, initialSetting }: Props) {
  const router = useRouter();
  const { alert } = useAppDialog();
  const isEdit = settingId != null;
  const [form, setForm] = useState(() => formStateFromSetting(initialSetting));
  const [filterInfo, setFilterInfo] = useState(() => parseFilterInfo(null));
  const [loadingFilter, setLoadingFilter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetKey>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    void getProductFilterInfo({ isSale: true })
      .then((res) => setFilterInfo(parseFilterInfo(res.data)))
      .finally(() => setLoadingFilter(false));
  }, []);

  const loadedOptions = useMemo(
    () => filterInfo.loadedTypes.filter((item) => item.code !== "WIDEWINGBODY"),
    [filterInfo.loadedTypes],
  );

  const minLengthExceeded = Number(form.minLoadedInnerLength) > MAX_LOADED_INNER_LENGTH;
  const maxLengthExceeded = Number(form.maxLoadedInnerLength) > MAX_LOADED_INNER_LENGTH;
  const hasLengthError = minLengthExceeded || maxLengthExceeded;
  const hasPartialLength =
    Boolean(form.minLoadedInnerLength) !== Boolean(form.maxLoadedInnerLength);

  const canSubmit =
    form.loadedCodes.length > 0 && !hasPartialLength && !hasLengthError && !loadingFilter;

  const onSubmit = useCallback(async () => {
    if (!canSubmit) {
      alert({ title: "안내", message: "적재함 종류를 선택해 주세요." });
      return;
    }
    setSubmitting(true);
    try {
      const body = buildInterestNotificationRequest(form);
      if (isEdit && settingId != null) {
        await patchInterestProductNotificationSettings(settingId, body as never);
        alert({
          title: "완료",
          message: "관심차량을 수정했어요.",
          onConfirm: () => router.back(),
        });
      } else {
        await postInterestProductNotificationSettings(body as never);
        alert({
          title: "관심 차량 등록 완료",
          message: "관심 차량이 신규 입고되면\n알림을 보내드릴게요.",
          onConfirm: () => router.replace("/notifications/products"),
        });
      }
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "저장에 실패했습니다.";
      alert({ title: "오류", message });
    } finally {
      setSubmitting(false);
    }
  }, [alert, canSubmit, form, isEdit, router, settingId]);

  const resetForm = () => {
    setForm(getDefaultInterestNotificationFormState());
  };

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader
        title={isEdit ? "관심 차량 수정" : "관심 차량 등록"}
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled
      >
        {!isEdit ? (
          <View className="mx-4 mt-4 rounded-lg bg-primary-1 px-4 py-4">
            <Text className="mb-2 text-[18px] font-bold text-gray800">
              관심 차량을 등록해주세요.
            </Text>
            <Text className="mb-4 text-[14px] leading-5 text-gray800">
              찾고있는 차량이 없다면 관심 차량을 등록하고 알림을 받을 수 있어요.
            </Text>
            <Image
              source={{ uri: BANNER_IMAGE }}
              style={{ width: "100%", height: 200 }}
              contentFit="contain"
            />
          </View>
        ) : null}

        <View className="border-b border-gray200 px-4 py-5">
          <FieldLabel title="적재함 종류" required />
          <MultiSelectChipField
            placeholder="적재함 종류 선택"
            options={loadedOptions}
            codes={form.loadedCodes}
            onRemove={(code) =>
              setForm((prev) => ({
                ...prev,
                loadedCodes: prev.loadedCodes.filter((item) => item !== code),
              }))
            }
            onOpen={() => setActiveSheet("loaded")}
          />
        </View>

        <FilterLengthSection
          valueMin={form.minLoadedInnerLength}
          valueMax={form.maxLoadedInnerLength}
          onChangeMin={(value) =>
            setForm((prev) => ({ ...prev, minLoadedInnerLength: value }))
          }
          onChangeMax={(value) =>
            setForm((prev) => ({ ...prev, maxLoadedInnerLength: value }))
          }
        />
        {hasLengthError ? (
          <Text className="-mt-3 px-4 pb-3 text-[13px] text-red-500">
            10.5m 이하로 입력해주세요.
          </Text>
        ) : null}
        {hasPartialLength ? (
          <Text className="-mt-3 px-4 pb-3 text-[13px] text-red-500">
            최소·최대 길이를 모두 입력해주세요.
          </Text>
        ) : null}

        <FilterRangeSection
          label="연식"
          min={FILTER_YEAR_MIN}
          max={FILTER_YEAR_MAX}
          valueMin={form.minYear}
          valueMax={form.maxYear}
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(low, high) =>
            setForm((prev) => ({
              ...prev,
              minYear: clampNumber(
                String(low),
                FILTER_YEAR_MIN,
                FILTER_YEAR_MAX,
                FILTER_YEAR_MIN,
              ),
              maxYear: clampNumber(
                String(high),
                FILTER_YEAR_MIN,
                FILTER_YEAR_MAX,
                FILTER_YEAR_MAX,
              ),
            }))
          }
          onChangeMin={(value) =>
            setForm((prev) => ({
              ...prev,
              minYear: clampNumber(value, FILTER_YEAR_MIN, FILTER_YEAR_MAX, FILTER_YEAR_MIN),
            }))
          }
          onChangeMax={(value) =>
            setForm((prev) => ({
              ...prev,
              maxYear: clampNumber(value, FILTER_YEAR_MIN, FILTER_YEAR_MAX, FILTER_YEAR_MAX),
            }))
          }
        />

        <FilterRangeSection
          label="톤수"
          min={FILTER_TONS_MIN}
          max={FILTER_TONS_MAX}
          valueMin={form.minTons}
          valueMax={form.maxTons}
          unit="t"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(low, high) =>
            setForm((prev) => ({
              ...prev,
              minTons: clampNumber(
                String(low),
                FILTER_TONS_MIN,
                FILTER_TONS_MAX,
                FILTER_TONS_MIN,
              ),
              maxTons: clampNumber(
                String(high),
                FILTER_TONS_MIN,
                FILTER_TONS_MAX,
                FILTER_TONS_MAX,
              ),
            }))
          }
          onChangeMin={(value) =>
            setForm((prev) => ({
              ...prev,
              minTons: clampNumber(value, FILTER_TONS_MIN, FILTER_TONS_MAX, FILTER_TONS_MIN),
            }))
          }
          onChangeMax={(value) =>
            setForm((prev) => ({
              ...prev,
              maxTons: clampNumber(value, FILTER_TONS_MIN, FILTER_TONS_MAX, FILTER_TONS_MAX),
            }))
          }
        />

        <FilterRadioSection
          label="가변축"
          options={filterInfo.axis}
          selectedCode={form.axisCode || undefined}
          onSelect={(code) => setForm((prev) => ({ ...prev, axisCode: code ?? "" }))}
        />

        <View className="border-b border-gray200 px-4 py-5">
          <FieldLabel title="제조사" />
          <MultiSelectChipField
            placeholder="제조사 선택"
            options={filterInfo.manufacturers}
            codes={form.manufacturerIds}
            onRemove={(code) =>
              setForm((prev) => ({
                ...prev,
                manufacturerIds: prev.manufacturerIds.filter((item) => item !== code),
              }))
            }
            onOpen={() => setActiveSheet("manufacturer")}
          />
        </View>

        <FilterRangeSection
          label="주행거리"
          min={FILTER_DISTANCE_MIN}
          max={FILTER_DISTANCE_MAX}
          valueMin={form.minDistance}
          valueMax={form.maxDistance}
          unit="만km"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(low, high) =>
            setForm((prev) => ({
              ...prev,
              minDistance: clampNumber(
                String(low),
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MIN,
              ),
              maxDistance: clampNumber(
                String(high),
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MAX,
              ),
            }))
          }
          onChangeMin={(value) =>
            setForm((prev) => ({
              ...prev,
              minDistance: clampNumber(
                value,
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MIN,
              ),
            }))
          }
          onChangeMax={(value) =>
            setForm((prev) => ({
              ...prev,
              maxDistance: clampNumber(
                value,
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MAX,
              ),
            }))
          }
        />

        <FilterRadioSection
          label="변속기"
          options={filterInfo.transmission}
          selectedCode={form.transmissionCode || undefined}
          onSelect={(code) =>
            setForm((prev) => ({ ...prev, transmissionCode: code ?? "" }))
          }
        />
      </ScrollView>

      <DualFooterButtons
        leftLabel="초기화"
        rightLabel={isEdit ? "수정" : "등록"}
        onPressLeft={resetForm}
        onPressRight={() => void onSubmit()}
        rightDisabled={!canSubmit || submitting}
        loading={submitting}
        safeAreaBottom={false}
      />

      <FilterOptionSheet
        visible={activeSheet === "loaded"}
        title="적재함 종류"
        options={loadedOptions}
        selectedCodes={form.loadedCodes}
        showCount={false}
        onClose={() => setActiveSheet(null)}
        onApply={(codes) => {
          setForm((prev) => ({ ...prev, loadedCodes: codes }));
          setActiveSheet(null);
        }}
      />

      <FilterOptionSheet
        visible={activeSheet === "manufacturer"}
        title="제조사"
        options={filterInfo.manufacturers}
        selectedCodes={form.manufacturerIds}
        showCount={false}
        onClose={() => setActiveSheet(null)}
        onApply={(codes) => {
          setForm((prev) => ({ ...prev, manufacturerIds: codes }));
          setActiveSheet(null);
        }}
      />
    </Screen>
  );
}
