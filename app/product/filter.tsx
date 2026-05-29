import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { getProductCount, getProductFilterInfo } from "@/src/api/public";
import { KeyboardAwareScrollView } from "@/src/components/common/KeyboardAwareScrollView";
import { Screen } from "@/src/components/common/Screen";
import { SearchLoadingIndicator } from "@/src/components/common/SearchLoadingIndicator";
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
import type {
  FilterOptionItem,
  ProductSearchFilters,
} from "@/src/features/products/filterTypes";
import {
  buildProductListQuery,
  clampNumber,
  createDefaultFilters,
  filtersFromParams,
  filtersToParams,
  setPendingPurchaseFilterParams,
} from "@/src/features/products/filterUtils";
import { MultiSelectChipField } from "@/src/features/products/MultiSelectChipField";
import { parseFilterInfo } from "@/src/features/products/parseFilterInfo";

type SheetType = "manufacturer" | "loadedType" | null;

const parseCodeCsv = (value?: string): string[] =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const serializeCodeCsv = (codes: string[]): string | undefined =>
  codes.length > 0 ? codes.join(",") : undefined;

export default function ProductFilterScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [filters, setFilters] = useState<ProductSearchFilters>(() =>
    filtersFromParams(params),
  );
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [manufacturers, setManufacturers] = useState<FilterOptionItem[]>([]);
  const [loadedTypes, setLoadedTypes] = useState<FilterOptionItem[]>([]);
  const [axisOptions, setAxisOptions] = useState<FilterOptionItem[]>([]);
  const [transmissionOptions, setTransmissionOptions] = useState<
    FilterOptionItem[]
  >([]);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const countRequestRef = useRef(0);
  const appliedParamsKeyRef = useRef<string | null>(null);

  const incomingParamsKey = useMemo(
    () => JSON.stringify(filtersToParams(filtersFromParams(params))),
    [
      params.axis,
      params.distanceMax,
      params.distanceMin,
      params.keyword,
      params.loaded,
      params.loadedLengthMax,
      params.loadedLengthMin,
      params.manufacturerCategoriesId,
      params.onlyOneTon,
      params.salesType,
      params.sort,
      params.tonsMax,
      params.tonsMin,
      params.transmission,
      params.yearMax,
      params.yearMin,
    ],
  );

  useEffect(() => {
    if (incomingParamsKey === appliedParamsKeyRef.current) return;
    appliedParamsKeyRef.current = incomingParamsKey;
    setFilters(filtersFromParams(params));
  }, [incomingParamsKey]);

  const updateFilter = useCallback(
    <K extends keyof ProductSearchFilters>(
      key: K,
      value: ProductSearchFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    const loadFilterInfo = async () => {
      try {
        const response = await getProductFilterInfo(
          buildProductListQuery(filters, 1, 1),
        );
        if (!mounted) return;
        const parsed = parseFilterInfo(response?.data);
        setManufacturers(parsed.manufacturers);
        setLoadedTypes(parsed.loadedTypes);
        setAxisOptions(parsed.axis);
        setTransmissionOptions(parsed.transmission);
      } catch {
        if (!mounted) return;
      }
    };
    loadFilterInfo();
    return () => {
      mounted = false;
    };
  }, [filters]);

  useEffect(() => {
    const requestId = ++countRequestRef.current;
    const timer = setTimeout(async () => {
      setIsCountLoading(true);
      try {
        const query = buildProductListQuery(filters, 1, 1);
        delete query.page;
        delete query.size;
        const response = await getProductCount(query);
        if (requestId !== countRequestRef.current) return;
        const total = Number(response?.data ?? 0) || 0;
        setResultCount(total);
      } catch {
        if (requestId !== countRequestRef.current) return;
        setResultCount(null);
      } finally {
        if (requestId === countRequestRef.current) {
          setIsCountLoading(false);
        }
      }
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [filters]);

  useEffect(() => {
    return () => {
      setScrollEnabled(true);
    };
  }, []);

  const manufacturerCodes = useMemo(
    () => parseCodeCsv(filters.manufacturerCategoriesId),
    [filters.manufacturerCategoriesId],
  );

  const loadedCodes = useMemo(
    () => parseCodeCsv(filters.loaded),
    [filters.loaded],
  );

  const setManufacturerCodes = useCallback(
    (codes: string[]) => {
      updateFilter("manufacturerCategoriesId", serializeCodeCsv(codes));
    },
    [updateFilter],
  );

  const setLoadedCodes = useCallback(
    (codes: string[]) => {
      updateFilter("loaded", serializeCodeCsv(codes));
    },
    [updateFilter],
  );

  const onReset = () => {
    setFilters(createDefaultFilters());
    setActiveSheet(null);
  };

  const onApply = useCallback(() => {
    setPendingPurchaseFilterParams(filtersToParams(filters));
    router.back();
  }, [filters]);

  return (
    <Screen className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center border-b border-gray200 px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={8} className="mr-3">
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <View className="h-11 flex-1 flex-row items-center rounded-[10px] border border-gray300 bg-gray100 px-3">
          <TextInput
            value={filters.keyword ?? ""}
            onChangeText={(value) =>
              updateFilter("keyword", value || undefined)
            }
            placeholder="차량을 검색해보세요."
            placeholderTextColor="#bdbdbd"
            returnKeyType="search"
            className="flex-1 text-[14px] text-gray900"
          />
          {isCountLoading ? (
            <SearchLoadingIndicator size={18} />
          ) : (
            <Ionicons name="search" size={18} color="#737373" />
          )}
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        footerInset={72}
        restingBottomPadding={16}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled
      >
        <FilterRangeSection
          label="연식"
          min={FILTER_YEAR_MIN}
          max={FILTER_YEAR_MAX}
          valueMin={filters.yearMin}
          valueMax={filters.yearMax}
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(lowVal, highVal) =>
            setFilters((prev) => ({
              ...prev,
              yearMin: clampNumber(
                String(lowVal),
                FILTER_YEAR_MIN,
                FILTER_YEAR_MAX,
                FILTER_YEAR_MIN,
              ),
              yearMax: clampNumber(
                String(highVal),
                FILTER_YEAR_MIN,
                FILTER_YEAR_MAX,
                FILTER_YEAR_MAX,
              ),
            }))
          }
          onChangeMin={(value) =>
            updateFilter(
              "yearMin",
              clampNumber(
                value,
                FILTER_YEAR_MIN,
                FILTER_YEAR_MAX,
                FILTER_YEAR_MIN,
              ),
            )
          }
          onChangeMax={(value) =>
            updateFilter(
              "yearMax",
              clampNumber(
                value,
                FILTER_YEAR_MIN,
                FILTER_YEAR_MAX,
                FILTER_YEAR_MAX,
              ),
            )
          }
        />

        <FilterRangeSection
          label="톤수"
          min={FILTER_TONS_MIN}
          max={FILTER_TONS_MAX}
          valueMin={filters.tonsMin}
          valueMax={filters.tonsMax}
          unit="t"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(lowVal, highVal) =>
            setFilters((prev) => ({
              ...prev,
              tonsMin: clampNumber(
                String(lowVal),
                FILTER_TONS_MIN,
                FILTER_TONS_MAX,
                FILTER_TONS_MIN,
              ),
              tonsMax: clampNumber(
                String(highVal),
                FILTER_TONS_MIN,
                FILTER_TONS_MAX,
                FILTER_TONS_MAX,
              ),
            }))
          }
          onChangeMin={(value) =>
            updateFilter(
              "tonsMin",
              clampNumber(
                value,
                FILTER_TONS_MIN,
                FILTER_TONS_MAX,
                FILTER_TONS_MIN,
              ),
            )
          }
          onChangeMax={(value) =>
            updateFilter(
              "tonsMax",
              clampNumber(
                value,
                FILTER_TONS_MIN,
                FILTER_TONS_MAX,
                FILTER_TONS_MAX,
              ),
            )
          }
        />

        <View className="border-b border-gray200 px-4 py-5">
          <Text className="mb-3 text-[15px] font-bold text-gray900">
            제조사
          </Text>
          <MultiSelectChipField
            placeholder="제조사 선택"
            options={manufacturers}
            codes={manufacturerCodes}
            onRemove={(code) =>
              setManufacturerCodes(
                manufacturerCodes.filter((item) => item !== code),
              )
            }
            onOpen={() => setActiveSheet("manufacturer")}
          />
        </View>

        <View className="border-b border-gray200 px-4 py-5">
          <Text className="mb-3 text-[15px] font-bold text-gray900">
            적재함 종류
          </Text>
          <MultiSelectChipField
            placeholder="적재함 종류 선택"
            options={loadedTypes}
            codes={loadedCodes}
            onRemove={(code) =>
              setLoadedCodes(loadedCodes.filter((item) => item !== code))
            }
            onOpen={() => setActiveSheet("loadedType")}
          />
        </View>

        <FilterLengthSection
          valueMin={filters.loadedLengthMin}
          valueMax={filters.loadedLengthMax}
          onChangeMin={(value) => updateFilter("loadedLengthMin", value)}
          onChangeMax={(value) => updateFilter("loadedLengthMax", value)}
        />

        <FilterRadioSection
          label="가변축"
          options={axisOptions}
          selectedCode={filters.axis}
          onSelect={(code) => updateFilter("axis", code)}
        />

        <FilterRangeSection
          label="주행거리"
          min={FILTER_DISTANCE_MIN}
          max={FILTER_DISTANCE_MAX}
          valueMin={filters.distanceMin}
          valueMax={filters.distanceMax}
          unit="만km"
          onDragStart={() => setScrollEnabled(false)}
          onDragEnd={() => setScrollEnabled(true)}
          onRangeCommit={(lowVal, highVal) =>
            setFilters((prev) => ({
              ...prev,
              distanceMin: clampNumber(
                String(lowVal),
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MIN,
              ),
              distanceMax: clampNumber(
                String(highVal),
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MAX,
              ),
            }))
          }
          onChangeMin={(value) =>
            updateFilter(
              "distanceMin",
              clampNumber(
                value,
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MIN,
              ),
            )
          }
          onChangeMax={(value) =>
            updateFilter(
              "distanceMax",
              clampNumber(
                value,
                FILTER_DISTANCE_MIN,
                FILTER_DISTANCE_MAX,
                FILTER_DISTANCE_MAX,
              ),
            )
          }
        />

        <FilterRadioSection
          label="변속기"
          options={transmissionOptions}
          selectedCode={filters.transmission}
          onSelect={(code) => updateFilter("transmission", code)}
        />
      </KeyboardAwareScrollView>

      <View className="border-t border-gray200 bg-white px-4 py-3">
        <View className="flex-row gap-2">
          <Pressable
            onPress={onReset}
            className="h-[48px] flex-1 items-center justify-center rounded-[8px] border border-gray300 bg-white"
          >
            <Text className="text-[14px] font-semibold text-gray700">
              초기화
            </Text>
          </Pressable>
          <Pressable
            onPress={onApply}
            className="h-[48px] flex-[2] items-center justify-center rounded-[8px] bg-primary"
          >
            <View className="flex-row items-center" pointerEvents="none">
              {isCountLoading ? (
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              ) : null}
              <Text className="text-[14px] font-bold text-white">
                {resultCount !== null
                  ? `차량보기 ${resultCount.toLocaleString("ko-KR")}대`
                  : "차량보기"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <FilterOptionSheet
        visible={activeSheet === "manufacturer"}
        title="제조사"
        options={manufacturers}
        selectedCodes={manufacturerCodes}
        onClose={() => setActiveSheet(null)}
        onApply={(codes) => {
          setManufacturerCodes(codes);
          setActiveSheet(null);
        }}
      />

      <FilterOptionSheet
        visible={activeSheet === "loadedType"}
        title="적재함 종류"
        options={loadedTypes}
        selectedCodes={loadedCodes}
        onClose={() => setActiveSheet(null)}
        onApply={(codes) => {
          setLoadedCodes(codes);
          setActiveSheet(null);
        }}
      />
    </Screen>
  );
}
