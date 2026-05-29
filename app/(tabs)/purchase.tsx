import { Screen } from "@/src/components/common/Screen";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";

import { getProductList } from "@/src/api/public";
import { AppSwitch } from "@/src/components/common/AppSwitch";
import { SearchLoadingIndicator } from "@/src/components/common/SearchLoadingIndicator";
import { appColors } from "@/src/constants/colors";
import { QUICK_SORT_OPTIONS, SORT_OPTIONS } from "@/src/constants/products";
import type { ProductSearchFilters } from "@/src/features/products/filterTypes";
import {
  buildProductListQuery,
  createDefaultFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  isClientOnlyProductSort,
  takePendingPurchaseFilterParams,
} from "@/src/features/products/filterUtils";
import { consumePurchaseListDirty } from "@/src/features/products/productRefresh";
import { PurchaseProductCard } from "@/src/features/products/PurchaseProductCard";
import { SalesTypeDropdown } from "@/src/features/products/SalesTypeDropdown";
import { SortBottomSheet } from "@/src/features/products/SortBottomSheet";
import type { ProductListItem } from "@/src/features/products/types";
import {
  normalizeListItem,
  pickArray,
  toText,
} from "@/src/features/products/utils";

type Filters = ProductSearchFilters;

const PAGE_SIZE = 20;
const PREFETCH_BUFFER_PAGES = 2;

type PurchaseListCache = {
  products: ProductListItem[];
  currentPage: number;
  totalPages: number;
  scrollOffset: number;
  filtersKey?: string;
};

let purchaseListCache: PurchaseListCache | null = null;

export default function PurchaseScreen() {
  const { fabListPaddingBottom } = useScreenInsets();
  const params = useLocalSearchParams<Record<string, string>>();
  const paramsKey = useMemo(
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
  const [products, setProducts] = useState<ProductListItem[]>(() => {
    const cache = purchaseListCache;
    const mountKey = JSON.stringify(filtersToParams(filtersFromParams(params)));
    if (cache?.filtersKey === mountKey) {
      return cache.products;
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    const mountKey = JSON.stringify(filtersToParams(filtersFromParams(params)));
    return !purchaseListCache || purchaseListCache.filtersKey !== mountKey;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => purchaseListCache?.currentPage ?? 1,
  );
  const [totalPages, setTotalPages] = useState(
    () => purchaseListCache?.totalPages ?? 1,
  );
  const isLoadingMoreRef = useRef(false);
  const hasInitializedRef = useRef(
    (() => {
      const mountKey = JSON.stringify(
        filtersToParams(filtersFromParams(params)),
      );
      return Boolean(
        purchaseListCache && purchaseListCache.filtersKey === mountKey,
      );
    })(),
  );
  const hasDataRef = useRef(
    (() => {
      const mountKey = JSON.stringify(
        filtersToParams(filtersFromParams(params)),
      );
      return purchaseListCache?.filtersKey === mountKey
        ? (purchaseListCache?.products.length ?? 0) > 0
        : false;
    })(),
  );
  const listRef = useRef<FlatList<ProductListItem>>(null);
  const scrollOffsetRef = useRef(purchaseListCache?.scrollOffset ?? 0);
  const fetchGenerationRef = useRef(0);
  const keywordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState(
    () => filtersFromParams(params).keyword ?? "",
  );

  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(params),
  );
  const filtersKeyRef = useRef(paramsKey);
  const appliedParamsKeyRef = useRef(paramsKey);
  const prevFiltersRef = useRef<Filters>(filtersFromParams(params));

  const fetchPage = useCallback(
    async (page: number, filtersOverride?: Filters) => {
      const activeFilters = filtersOverride ?? filters;
      const response = await getProductList(
        buildProductListQuery(activeFilters, page, PAGE_SIZE),
      );
      const payload = response?.data ?? {};
      const raw = pickArray(payload);
      const items = raw
        .map(normalizeListItem)
        .filter((item): item is ProductListItem => Boolean(item));
      const tp = Number(payload?.totalPage ?? payload?.totalPages ?? 0) || 0;
      return { items, totalPages: tp };
    },
    [filters],
  );

  const loadFirstPage = useCallback(
    async (refresh = false, filtersOverride?: Filters) => {
      const generation = ++fetchGenerationRef.current;
      const keepList = hasDataRef.current && !refresh;
      if (refresh) setIsRefreshing(true);
      else if (keepList) setIsSearching(true);
      else setIsLoading(true);
      try {
        const { items, totalPages: tp } = await fetchPage(1, filtersOverride);
        if (generation !== fetchGenerationRef.current) return;
        setProducts(items);
        setCurrentPage(1);
        setTotalPages(tp || 1);
        hasDataRef.current = items.length > 0;
      } catch {
        if (generation !== fetchGenerationRef.current) return;
        Alert.alert("목록 불러오기 실패", "내차구매 목록을 불러오지 못했어요.");
      } finally {
        if (generation !== fetchGenerationRef.current) return;
        setIsLoading(false);
        setIsRefreshing(false);
        setIsSearching(false);
      }
    },
    [fetchPage],
  );

  const loadFirstPageRef = useRef(loadFirstPage);
  loadFirstPageRef.current = loadFirstPage;

  useEffect(() => {
    if (paramsKey === appliedParamsKeyRef.current) return;

    const urlFilters = filtersFromParams(params);
    if (!hasActiveFilters(urlFilters)) return;

    appliedParamsKeyRef.current = paramsKey;
    filtersKeyRef.current = paramsKey;
    const nextFilters = urlFilters;
    setFilters(nextFilters);
    setKeywordDraft(nextFilters.keyword ?? "");
    hasDataRef.current = false;
    scrollOffsetRef.current = 0;
    setProducts([]);
    setCurrentPage(1);
    setTotalPages(1);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    if (hasInitializedRef.current) {
      loadFirstPage(false, nextFilters);
    }
  }, [params, paramsKey, loadFirstPage]);

  useFocusEffect(
    useCallback(() => {
      const pending = takePendingPurchaseFilterParams();
      if (pending) {
        const nextFilters = filtersFromParams(pending);
        const nextKey = JSON.stringify(pending);
        appliedParamsKeyRef.current = nextKey;
        filtersKeyRef.current = nextKey;
        prevFiltersRef.current = nextFilters;
        setFilters(nextFilters);
        setKeywordDraft(nextFilters.keyword ?? "");
        hasDataRef.current = false;
        scrollOffsetRef.current = 0;
        purchaseListCache = null;
        setProducts([]);
        setCurrentPage(1);
        setTotalPages(1);
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
        if (hasInitializedRef.current) {
          loadFirstPageRef.current(false, nextFilters);
        }
        return;
      }

      const urlFilters = filtersFromParams(params);
      if (hasActiveFilters(urlFilters)) {
        const nextKey = JSON.stringify(filtersToParams(urlFilters));
        if (nextKey !== appliedParamsKeyRef.current) {
          appliedParamsKeyRef.current = nextKey;
          filtersKeyRef.current = nextKey;
          prevFiltersRef.current = urlFilters;
          setFilters(urlFilters);
          setKeywordDraft(urlFilters.keyword ?? "");
          hasDataRef.current = false;
          scrollOffsetRef.current = 0;
          setProducts([]);
          setCurrentPage(1);
          setTotalPages(1);
          if (hasInitializedRef.current) {
            loadFirstPageRef.current(false, urlFilters);
          }
        }
      }

      if (consumePurchaseListDirty() && hasInitializedRef.current) {
        purchaseListCache = null;
        hasDataRef.current = false;
        loadFirstPageRef.current(true, prevFiltersRef.current);
      }
    }, [paramsKey]),
  );

  const loadMore = useCallback(
    async (options?: { silent?: boolean }) => {
      if (isLoadingMoreRef.current) return;
      if (currentPage >= totalPages) return;
      isLoadingMoreRef.current = true;
      if (!options?.silent) setIsLoadingMore(true);
      try {
        const next = currentPage + 1;
        const { items, totalPages: tp } = await fetchPage(next);
        setProducts((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const merged = prev.slice();
          for (const item of items) {
            if (!seen.has(item.id)) merged.push(item);
          }
          return merged;
        });
        setCurrentPage(next);
        if (tp) setTotalPages(tp);
      } catch {
        // 다음 시도에서 자연 복구
      } finally {
        if (!options?.silent) setIsLoadingMore(false);
        isLoadingMoreRef.current = false;
      }
    },
    [currentPage, fetchPage, totalPages],
  );

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    loadFirstPage(false);
  }, [loadFirstPage]);

  useEffect(() => {
    if (isLoading) return;
    if (isLoadingMoreRef.current) return;
    if (currentPage >= totalPages) return;
    if (currentPage >= PREFETCH_BUFFER_PAGES) return;
    loadMore({ silent: true });
  }, [currentPage, isLoading, loadMore, totalPages]);

  const onListScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  useEffect(() => {
    if (!hasInitializedRef.current) return;
    const nextKey = JSON.stringify(filtersToParams(filters));
    if (nextKey === filtersKeyRef.current) return;

    const prev = prevFiltersRef.current;
    const keywordOnly =
      JSON.stringify({ ...filtersToParams(prev), keyword: "" }) ===
        JSON.stringify({ ...filtersToParams(filters), keyword: "" }) &&
      (prev.keyword ?? "") !== (filters.keyword ?? "");

    filtersKeyRef.current = nextKey;
    prevFiltersRef.current = filters;

    if (!keywordOnly) {
      hasDataRef.current = false;
      scrollOffsetRef.current = 0;
      setProducts([]);
      setCurrentPage(1);
      setTotalPages(1);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }

    loadFirstPage(false, filters);
  }, [filters, loadFirstPage]);

  useEffect(() => {
    purchaseListCache = {
      products,
      currentPage,
      totalPages,
      scrollOffset: scrollOffsetRef.current,
      filtersKey: filtersKeyRef.current,
    };
  }, [products, currentPage, totalPages]);

  useEffect(() => {
    if (!hasDataRef.current || scrollOffsetRef.current <= 0) return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: scrollOffsetRef.current,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    return () => {
      if (keywordTimerRef.current) clearTimeout(keywordTimerRef.current);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const sortValue = filters.sort ?? "createdAt,DESC";
    if (!isClientOnlyProductSort(sortValue)) return products;

    const sorted = products.slice();
    if (sortValue.startsWith("price")) {
      sorted.sort((a, b) => {
        const ap = Number(a.price ?? 0);
        const bp = Number(b.price ?? 0);
        return sortValue.endsWith("ASC") ? ap - bp : bp - ap;
      });
    } else if (sortValue === "firstRegistrationDate,ASC") {
      sorted.sort((a, b) => {
        const ad = toText(a.firstRegistrationDate);
        const bd = toText(b.firstRegistrationDate);
        return ad.localeCompare(bd);
      });
    }
    return sorted;
  }, [filters.sort, products]);

  const sortLabel = useMemo(() => {
    const quick =
      QUICK_SORT_OPTIONS.find((option) => option.value === filters.sort)
        ?.label ?? null;
    if (quick) return quick;
    return (
      SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ??
      "기본 정렬순"
    );
  }, [filters.sort]);

  const isKeywordPending =
    keywordDraft.trim() !== (filters.keyword ?? "").trim();
  const showSearchLoading = isSearching || isKeywordPending;

  const onChangeKeyword = useCallback((value: string) => {
    setKeywordDraft(value);
    if (keywordTimerRef.current) clearTimeout(keywordTimerRef.current);
    keywordTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        keyword: value.trim() || undefined,
      }));
    }, 400);
  }, []);

  const onPressFilter = useCallback(() => {
    router.push({
      pathname: "/product/filter",
      params: filtersToParams(filters),
    });
  }, [filters]);

  const onPressSort = useCallback(() => {
    setIsSortSheetOpen(true);
  }, []);

  const onSelectSort = useCallback((sort: string) => {
    setFilters((prev) => ({ ...prev, sort }));
  }, []);

  const toggleOneTon = useCallback((value: boolean) => {
    setFilters((prev) => ({ ...prev, onlyOneTon: value }));
  }, []);

  const onSelectSalesType = useCallback((salesType?: string) => {
    setFilters((prev) => ({ ...prev, salesType }));
  }, []);

  const onClearFilters = useCallback(() => {
    const defaults = createDefaultFilters();
    const nextKey = JSON.stringify(filtersToParams(defaults));
    appliedParamsKeyRef.current = nextKey;
    filtersKeyRef.current = nextKey;
    prevFiltersRef.current = defaults;
    setFilters(defaults);
    setKeywordDraft("");
    hasDataRef.current = false;
    scrollOffsetRef.current = 0;
    purchaseListCache = null;
    setProducts([]);
    setCurrentPage(1);
    setTotalPages(1);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    loadFirstPage(false, defaults);
  }, [loadFirstPage]);

  const showClearFilters = useMemo(() => hasActiveFilters(filters), [filters]);

  const handlePressItem = useCallback((id: number) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: String(id) },
    });
  }, []);

  const renderItem: ListRenderItem<ProductListItem> = useCallback(
    ({ item }) => <PurchaseProductCard item={item} onPress={handlePressItem} />,
    [handlePressItem],
  );

  const keyExtractor = useCallback(
    (item: ProductListItem) => String(item.id),
    [],
  );

  const ListFooter = useMemo(() => {
    const hasMore = currentPage < totalPages;
    return (
      <View className="h-14 items-center justify-center">
        {isLoadingMore ? <ActivityIndicator /> : null}
        {!isLoadingMore && products.length > 0 && !hasMore ? (
          <Text className="text-[12px] text-gray700">
            모든 매물을 확인했어요
          </Text>
        ) : null}
      </View>
    );
  }, [currentPage, isLoadingMore, products.length, totalPages]);

  const ListEmpty = useMemo(
    () => (
      <View className="mx-4 mt-6 items-center rounded-xl border border-gray300 bg-white px-4 py-10">
        <Ionicons name="car-outline" size={42} color="#bdbdbd" />
        <Text className="mt-2 text-[14px] font-semibold text-gray900">
          등록된 매물이 없어요
        </Text>
        <Text className="mt-1 text-[12px] text-gray700">
          잠시 후 다시 시도해주세요.
        </Text>
      </View>
    ),
    [],
  );

  return (
    <Screen variant="tab" className="flex-1 bg-white">
      <View className="bg-white px-4 pt-2 pb-3">
        <Text className="text-[22px] font-bold text-gray900">내차구매</Text>

        <View className="mt-3 flex-row items-center rounded-[10px] border border-gray300 bg-gray100 px-3">
          <TextInput
            value={keywordDraft}
            onChangeText={onChangeKeyword}
            placeholder="차량을 검색해보세요."
            placeholderTextColor="#bdbdbd"
            returnKeyType="search"
            className="h-11 flex-1 text-[14px] text-gray900"
          />
          {showSearchLoading ? (
            <SearchLoadingIndicator size={20} />
          ) : (
            <Pressable onPress={onPressFilter} hitSlop={8}>
              <Ionicons name="options-outline" size={20} color="#737373" />
            </Pressable>
          )}
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <SalesTypeDropdown
            value={filters.salesType}
            onChange={onSelectSalesType}
          />
          <View className="flex-row items-center">
            <Text className="mr-2 text-[13px] font-semibold text-gray800">
              1톤 보기
            </Text>
            <AppSwitch
              value={Boolean(filters.onlyOneTon)}
              onValueChange={toggleOneTon}
            />
          </View>
        </View>

        <View className="mt-2 flex-row items-center justify-between">
          {showClearFilters ? (
            <Pressable
              onPress={onClearFilters}
              className="flex-row items-center rounded-[8px] border border-gray300 bg-white px-3 py-1.5"
            >
              <Ionicons name="refresh" size={14} color="#737373" />
              <Text className="ml-1.5 text-[13px] font-semibold text-gray800">
                필터해제
              </Text>
            </Pressable>
          ) : (
            <View />
          )}
          <Pressable onPress={onPressSort} className="flex-row items-center">
            <Ionicons name="swap-vertical" size={14} color="#737373" />
            <Text className="ml-1 text-[12px] text-gray700">{sortLabel}</Text>
          </Pressable>
        </View>
      </View>

      <SortBottomSheet
        visible={isSortSheetOpen}
        selectedSort={filters.sort ?? "createdAt,DESC"}
        onClose={() => setIsSortSheetOpen(false)}
        onSelect={onSelectSort}
      />

      {isLoading && products.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator />
        </View>
      ) : (
        <View className="flex-1 bg-white">
          <FlatList
            ref={listRef}
            data={visibleProducts}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: fabListPaddingBottom,
            }}
            ListEmptyComponent={ListEmpty}
            ListFooterComponent={ListFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => loadFirstPage(true)}
              />
            }
            onScroll={onListScroll}
            scrollEventThrottle={16}
            onEndReached={() => loadMore()}
            onEndReachedThreshold={2}
            removeClippedSubviews
            initialNumToRender={8}
            maxToRenderPerBatch={6}
            windowSize={7}
            updateCellsBatchingPeriod={50}
          />

          <View className="absolute bottom-5 right-4">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/products/purchase/inquiry",
                  params: filtersToParams(filters),
                })
              }
            >
              <LinearGradient
                colors={["#535AFF", "#397AFF", "#10ACFF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="h-[44px] flex-row items-center justify-center rounded-full px-4"
              >
                <Ionicons name="search-outline" size={16} color="#fff" />
                <Text className="ml-2 text-[14px] font-bold text-white">
                  내가 찾는 차량이 없다면?
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </Screen>
  );
}
