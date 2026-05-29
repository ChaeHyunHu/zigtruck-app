import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { getProductFilterInfo, postInterestProductNotificationSettings, postProductInquiry } from "@/src/api/public";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import { appColors } from "@/src/constants/colors";
import { validateApplicantFields } from "@/src/features/additional-services/validation";
import { FilterOptionSheet } from "@/src/features/products/FilterOptionSheet";
import { MultiSelectChipField } from "@/src/features/products/MultiSelectChipField";
import {
  FILTER_DISTANCE_MAX,
  FILTER_DISTANCE_MIN,
  FILTER_TONS_MAX,
  FILTER_TONS_MIN,
  FILTER_YEAR_MAX,
  FILTER_YEAR_MIN,
} from "@/src/features/products/filterConstants";
import {
  FilterRadioSection,
  FilterRangeSection,
} from "@/src/features/products/FilterSections";
import { clampNumber, filtersFromParams } from "@/src/features/products/filterUtils";
import { parseFilterInfo } from "@/src/features/products/parseFilterInfo";
import type { FilterOptionItem } from "@/src/features/products/filterTypes";
import {
  buildInterestNotificationFromPurchaseInquiry,
  buildProductPurchasingInquiryRequest,
  canSubmitPurchaseInquiry,
  formStateFromFilters,
} from "@/src/features/products/purchase-inquiry/utils";
import type { ProductPurchaseInquiryFormState } from "@/src/features/products/purchase-inquiry/types";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { DualFooterButtons } from "@/src/features/sell-car/registration/DualFooterButtons";
import { useAuth } from "@/src/hooks/useAuth";

type PickerKey = "loaded" | "axis" | "transmission" | "manufacturer" | null;

/** 적재함 길이(내측 사이즈) 최대 허용값 (m) */
const MAX_LOADED_INNER_LENGTH = 10.5;

function FieldLabel({ title, required }: { title: string; required?: boolean }) {
  return (
    <Text className="mb-2 text-[15px] font-semibold text-gray800">
      {title}
      {required ? <Text className="font-normal text-red-500">(필수)</Text> : null}
    </Text>
  );
}

function SelectField({
  placeholder,
  value,
  onPress,
}: {
  placeholder: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-12 flex-row items-center justify-between rounded-lg border border-gray300 bg-white px-3"
    >
      <Text className={`flex-1 text-[15px] ${value ? "text-gray900" : "text-gray500"}`}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={18} color={appColors.gray600} />
    </Pressable>
  );
}

export function ProductPurchaseInquiryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Record<string, string | string[] | undefined>>();
  const { profile, memberId, isAuthenticated } = useAuth();
  const submittingRef = useRef(false);

  const initialFilters = useMemo(() => filtersFromParams(params), [params]);

  const [form, setForm] = useState<ProductPurchaseInquiryFormState>(() =>
    formStateFromFilters(initialFilters, profile ?? undefined),
  );
  const [filterInfo, setFilterInfo] = useState(() => parseFilterInfo(null));
  const [loadingFilter, setLoadingFilter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [picker, setPicker] = useState<PickerKey>(null);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [manufacturerSheetOpen, setManufacturerSheetOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [registeringNotification, setRegisteringNotification] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: profile?.name ?? prev.name,
      requestPhoneNumber: profile?.phoneNumber ?? prev.requestPhoneNumber,
    }));
  }, [profile?.name, profile?.phoneNumber]);

  useEffect(() => {
    void getProductFilterInfo({ isSale: true })
      .then((res) => setFilterInfo(parseFilterInfo(res.data)))
      .finally(() => setLoadingFilter(false));
  }, []);

  const loadedOptions = useMemo(
    () => filterInfo.loadedTypes.filter((item) => item.code !== "WIDEWINGBODY"),
    [filterInfo.loadedTypes],
  );

  const loadedLabel =
    loadedOptions.find((item) => item.code === form.loadedCode)?.label ?? "";

  const pickerOptions: FilterOptionItem[] = useMemo(() => {
    if (picker === "loaded") return loadedOptions;
    if (picker === "axis") return filterInfo.axis;
    if (picker === "transmission") return filterInfo.transmission;
    if (picker === "manufacturer") return filterInfo.manufacturers;
    return [];
  }, [filterInfo, loadedOptions, picker]);

  const minLengthExceeded = Number(form.minLoadedInnerLength) > MAX_LOADED_INNER_LENGTH;
  const maxLengthExceeded = Number(form.maxLoadedInnerLength) > MAX_LOADED_INNER_LENGTH;
  const hasLengthError = minLengthExceeded || maxLengthExceeded;

  const canSubmit =
    canSubmitPurchaseInquiry(form) && !nameError && !phoneError && !hasLengthError;

  const resetForm = useCallback(() => {
    setForm(formStateFromFilters(undefined, profile ?? undefined));
    setNameError("");
    setPhoneError("");
  }, [profile]);

  const onSubmit = useCallback(async () => {
    const validation = validateApplicantFields(form.name, form.requestPhoneNumber);
    setNameError(validation.nameErrorMessage);
    setPhoneError(validation.phoneErrorMessage);
    if (validation.hasError) return;

    if (!canSubmitPurchaseInquiry(form)) {
      Alert.alert("안내", "필수 항목을 입력해 주세요.");
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const body = buildProductPurchasingInquiryRequest(form, memberId);
      await postProductInquiry(body);
      setCompleteModalOpen(true);
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "문의 등록에 실패했습니다.";
      Alert.alert("오류", message);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [form, isAuthenticated, memberId, router]);

  const onRegisterInterestNotification = useCallback(async () => {
    if (registeringNotification) return;
    setRegisteringNotification(true);
    try {
      const body = buildInterestNotificationFromPurchaseInquiry(form);
      await postInterestProductNotificationSettings(body as never);
      setCompleteModalOpen(false);
      router.replace("/(tabs)");
    } catch (error: unknown) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "관심차량 알림 등록에 실패했습니다.";
      Alert.alert("오류", message);
    } finally {
      setRegisteringNotification(false);
    }
  }, [form, registeringNotification, router]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title="차량 구매문의" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled
      >
        <View className="mx-4 mt-3 rounded-lg bg-[#F3F7FF] px-4 py-4">
          <Text className="text-[18px] font-bold text-gray800">차량 구매 문의를 남겨주세요.</Text>
          <Text className="mt-2 text-[14px] leading-5 text-gray700">
            빠른 상담을 위해 구매를 원하시는 차량의 정보를 입력해주세요.
          </Text>
        </View>

        <View className="mt-4 px-4">
          <FieldLabel title="신청자명" required />
          <TextInput
            value={form.name}
            onChangeText={(name) => {
              setForm((prev) => ({ ...prev, name }));
              const v = validateApplicantFields(name, form.requestPhoneNumber);
              setNameError(v.nameErrorMessage);
            }}
            placeholder="신청자명을 입력해주세요"
            className="h-12 rounded-lg border border-gray300 px-3 text-[15px] text-gray900"
          />
          {nameError ? <Text className="mt-1 text-[13px] text-red-500">{nameError}</Text> : null}

          <View className="mt-5">
            <FieldLabel title="휴대폰 번호" required />
            <TextInput
              value={form.requestPhoneNumber}
              onChangeText={(requestPhoneNumber) => {
                setForm((prev) => ({ ...prev, requestPhoneNumber }));
                const v = validateApplicantFields(form.name, requestPhoneNumber);
                setPhoneError(v.phoneErrorMessage);
              }}
              placeholder="휴대폰 번호를 입력해주세요"
              keyboardType="phone-pad"
              maxLength={11}
              className="h-12 rounded-lg border border-gray300 px-3 text-[15px] text-gray900"
            />
            {phoneError ? (
              <Text className="mt-1 text-[13px] text-red-500">{phoneError}</Text>
            ) : null}
          </View>
        </View>

        <View className="my-5 h-1 bg-gray100" />

        <View className="px-4">
          <FieldLabel title="적재함 종류" required />
          <SelectField
            placeholder="적재함 종류 선택"
            value={loadedLabel}
            onPress={() => setPicker("loaded")}
          />

          <View className="mt-5">
            <FieldLabel title="적재함 길이(내측 사이즈)" required />
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <TextInput
                  value={form.minLoadedInnerLength}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, minLoadedInnerLength: v }))
                  }
                  placeholder="최소"
                  keyboardType="decimal-pad"
                  className={`h-12 rounded-lg border px-3 text-[15px] ${
                    minLengthExceeded ? "border-danger" : "border-gray300"
                  }`}
                />
              </View>
              <Text className="text-gray600">m</Text>
              <Text className="text-gray500">~</Text>
              <View className="flex-1">
                <TextInput
                  value={form.maxLoadedInnerLength}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, maxLoadedInnerLength: v }))
                  }
                  placeholder="최대"
                  keyboardType="decimal-pad"
                  className={`h-12 rounded-lg border px-3 text-[15px] ${
                    maxLengthExceeded ? "border-danger" : "border-gray300"
                  }`}
                />
              </View>
              <Text className="text-gray600">m</Text>
            </View>
            {hasLengthError ? (
              <Text className="mt-1 text-[13px] text-red-500">
                10.5m 이하로 입력해주세요.
              </Text>
            ) : null}
          </View>

          <View className="mt-5">
            <FieldLabel title="제조사" />
            <MultiSelectChipField
              placeholder="제조사 선택"
              options={filterInfo.manufacturers}
              codes={form.manufacturerIds}
              onRemove={(code) =>
                setForm((prev) => ({
                  ...prev,
                  manufacturerIds: prev.manufacturerIds.filter((c) => c !== code),
                }))
              }
              onOpen={() => setManufacturerSheetOpen(true)}
            />
          </View>
        </View>

        <View className="mt-5">
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
                minTons: clampNumber(String(low), FILTER_TONS_MIN, FILTER_TONS_MAX, FILTER_TONS_MIN),
                maxTons: clampNumber(String(high), FILTER_TONS_MIN, FILTER_TONS_MAX, FILTER_TONS_MAX),
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
                minYear: clampNumber(String(low), FILTER_YEAR_MIN, FILTER_YEAR_MAX, FILTER_YEAR_MIN),
                maxYear: clampNumber(String(high), FILTER_YEAR_MIN, FILTER_YEAR_MAX, FILTER_YEAR_MAX),
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
            label="가변축"
            options={filterInfo.axis}
            selectedCode={form.axisCode || undefined}
            onSelect={(code) =>
              setForm((prev) => ({ ...prev, axisCode: code ?? "" }))
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
        </View>
      </ScrollView>

      <DualFooterButtons
        leftLabel="초기화"
        rightLabel="문의 남기기"
        onPressLeft={resetForm}
        onPressRight={() => void onSubmit()}
        rightDisabled={!canSubmit || submitting}
        loading={submitting}
        safeAreaBottom={false}
      />

      {picker ? (
        <View className="absolute inset-0 bg-black/40">
          <Pressable className="flex-1" onPress={() => setPicker(null)} />
          <View className="max-h-[50%] rounded-t-2xl bg-white px-4 pb-8 pt-4">
            <Text className="mb-3 text-center text-[16px] font-semibold text-gray900">
              {picker === "loaded"
                ? "적재함 종류"
                : picker === "axis"
                  ? "가변축"
                  : picker === "transmission"
                    ? "변속기"
                    : "제조사"}
            </Text>
            <ScrollView>
              {loadingFilter ? (
                <ActivityIndicator color={appColors.primary} />
              ) : (
                pickerOptions.map((option) => {
                  const selected =
                    picker === "loaded"
                      ? form.loadedCode === option.code
                      : picker === "axis"
                        ? form.axisCode === option.code
                        : picker === "transmission"
                          ? form.transmissionCode === option.code
                          : form.manufacturerIds.includes(option.code);
                  return (
                    <Pressable
                      key={option.code}
                      onPress={() => {
                        if (picker === "loaded") {
                          setForm((prev) => ({ ...prev, loadedCode: option.code }));
                          setPicker(null);
                        } else if (picker === "axis") {
                          setForm((prev) => ({ ...prev, axisCode: option.code }));
                          setPicker(null);
                        } else if (picker === "transmission") {
                          setForm((prev) => ({ ...prev, transmissionCode: option.code }));
                          setPicker(null);
                        } else {
                          setForm((prev) => {
                            const exists = prev.manufacturerIds.includes(option.code);
                            const manufacturerIds = exists
                              ? prev.manufacturerIds.filter((c) => c !== option.code)
                              : [...prev.manufacturerIds, option.code];
                            return { ...prev, manufacturerIds };
                          });
                        }
                      }}
                      className={`mb-2 rounded-lg border px-4 py-3 ${
                        selected ? "border-primary bg-blue-50" : "border-gray300"
                      }`}
                    >
                      <Text className="text-[15px] text-gray900">{option.label}</Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
            {picker === "manufacturer" ? (
              <Pressable
                onPress={() => setPicker(null)}
                className="mt-3 h-12 items-center justify-center rounded-lg bg-primary"
              >
                <Text className="text-[16px] font-semibold text-white">적용</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <FilterOptionSheet
        visible={manufacturerSheetOpen}
        title="제조사"
        options={filterInfo.manufacturers}
        selectedCodes={form.manufacturerIds}
        showCount={false}
        onClose={() => setManufacturerSheetOpen(false)}
        onApply={(codes) => {
          setForm((prev) => ({ ...prev, manufacturerIds: codes }));
          setManufacturerSheetOpen(false);
        }}
      />

      <ConfirmDialog
        visible={completeModalOpen}
        title="구매 문의 등록 완료"
        leftLabel="닫기"
        rightLabel={isAuthenticated ? "알림받기" : undefined}
        onLeft={() => {
          setCompleteModalOpen(false);
          router.back();
        }}
        onRight={
          isAuthenticated
            ? () => {
                void onRegisterInterestNotification();
              }
            : undefined
        }
      >
        <Text className="text-center text-[15px] leading-[22px] text-gray700">
          {isAuthenticated
            ? "알림 받기를 누르면 해당 차량이\n입고되었을 때 알림을 보내드려요."
            : "담당자가 확인 후 연락드리겠습니다."}
        </Text>
      </ConfirmDialog>
    </Screen>
  );
}
