import { Screen } from "@/src/components/common/Screen";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  getAssuranceProducts,
  getBanner,
  getCounts,
  getRecommendProducts,
  getYoutubeVideos,
} from "@/src/api/public";
import { GradientOutlineButton } from "@/src/components/common/GradientOutlineButton";
import { showAppAlert } from "@/src/providers/appDialog";
import { appColors } from "@/src/constants/colors";
import { SALES_TYPE_ASSURANCE } from "@/src/constants/products";
import { IMAGE_BASE_URL, ZIGTRUCK_YOUTUBE_HOME_URL } from "@/src/constants/url";
import { HomeBannerCarousel } from "@/src/features/home/HomeBannerCarousel";
import { HomePopupBannerModal } from "@/src/features/home/HomePopupBannerModal";
import { HomeInterestProducts } from "@/src/features/home/HomeInterestProducts";
import { HomeProductCard } from "@/src/features/home/HomeProductCard";
import { RecommendProducts } from "@/src/features/home/RecommendProducts";
import {
  BannerItem,
  ProductsListItem,
  YoutubeVideoItem,
} from "@/src/features/home/types";
import { fetchOnSaleInterestProducts } from "@/src/features/interest-products/interestProductService";
import type { InterestProductItem } from "@/src/features/interest-products/types";
import {
  createDefaultFilters,
  filtersToParams,
  setPendingPurchaseFilterParams,
} from "@/src/features/products/filterUtils";
import { normalizeListItem } from "@/src/features/products/utils";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";
import { useNotifications } from "@/src/providers/NotificationProvider";

const toHomeProductItem = (
  item: ReturnType<typeof normalizeListItem>,
): ProductsListItem | null => {
  if (!item) return null;
  return {
    id: item.id,
    productsNumber: item.productsNumber,
    representImageUrl: item.representImageUrl,
    truckName: item.truckName,
    firstRegistrationDate: item.firstRegistrationDate,
    distance: item.distance,
    loadedInnerLength: item.loadedInnerLength,
    transmission: item.transmission,
    power: item.power,
    price: item.price,
    salesType: item.salesType,
    status: item.status,
    youtubeUrl: item.youtubeUrl,
    region: item.region,
    location: item.location,
  };
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const ASSURANCE_CARD_GAP = 12;
const ASSURANCE_CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.82);
const ASSURANCE_CARD_IMAGE_HEIGHT = Math.round(ASSURANCE_CARD_WIDTH * 0.56);
const ASSURANCE_SIDE_INSET = (SCREEN_WIDTH - ASSURANCE_CARD_WIDTH) / 2;
const ASSURANCE_SNAP_INTERVAL = ASSURANCE_CARD_WIDTH + ASSURANCE_CARD_GAP;

type Counts = {
  jobCount: number;
  licenseCount: number;
  productsCount: number;
};

const serviceCards = [
  {
    title: "시세검색",
    subTitle: "시세검색",
    icon: "chart_gra.gif",
    path: "/price-trend",
  },
  {
    title: "번호판거래",
    subTitle: "번호판거래",
    icon: "license_gra.gif",
    path: "/license",
  },
  {
    title: "운행일지",
    subTitle: "운행일지",
    icon: "diary_gra.gif",
    path: "/drive",
  },
  {
    title: "일자리구하기",
    subTitle: "일자리구하기",
    icon: "bag_gra.gif",
    path: "/job",
  },
  {
    title: "위탁판매 서비스",
    subTitle: "거래절차가 복잡하다면?",
    icon: "sale_car_gra.gif",
    path: "/one-stop-service",
  },
  {
    title: "구매동행 서비스",
    subTitle: "차량을 안전하게 구매하고 싶으시다면?",
    icon: "truck_gra.gif",
    path: "/purchase-accompanying-service",
  },
];

const businessInfo = [
  { title: "상호", content: "주식회사 직트럭" },
  { title: "대표", content: "양요한" },
  { title: "주소", content: "경기도 평택시 월곡길 9-9" },
  { title: "대표 전화", content: "1599-6249" },
  { title: "사업자 번호", content: "721-87-01975" },
  { title: "통신판매업 신고번호", content: "제 2023-경기평택-1174호" },
];

function NotificationBellButton() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { hasUnread } = useNotifications();

  const onPress = () => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    router.push("/notifications");
  };

  return (
    <Pressable onPress={onPress} hitSlop={10} className="relative">
      <Ionicons name="notifications-outline" size={24} color={appColors.gray800} />
      {hasUnread ? (
        <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
      ) : null}
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { listPaddingBottom } = useScreenInsets();
  const { isAuthenticated, syncPushToken } = useAuth();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [assuranceProducts, setAssuranceProducts] = useState<
    ProductsListItem[]
  >([]);
  const [assuranceTotalElements, setAssuranceTotalElements] = useState(0);
  const [recommendProducts, setRecommendProducts] = useState<
    ProductsListItem[]
  >([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideoItem[]>([]);
  const [counts, setCounts] = useState<Counts>({
    jobCount: 0,
    licenseCount: 0,
    productsCount: 0,
  });
  const [interestProducts, setInterestProducts] = useState<
    InterestProductItem[]
  >([]);
  const badgeScale = useRef(new Animated.Value(1)).current;
  const badgeRipple = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        BackHandler.exitApp();
        return true;
      });
      return () => subscription.remove();
    }, []),
  );

  const homeBanners = useMemo(
    () => banners.filter((banner) => banner.bannerLocation?.code === "HOME"),
    [banners],
  );

  useEffect(() => {
    let mounted = true;
    void getBanner()
      .then((bannerData) => {
        if (!mounted) return;
        setBanners(Array.isArray(bannerData) ? bannerData : []);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  // 홈이 처음 떴을 때(한 세션에 한 번) 알림 권한 다이얼로그를 띄운다.
  // 검정 splash 위가 아닌 홈 화면 위에서 OS 다이얼로그가 뜨도록 시점을 늦춘다.
  const pushPromptRequestedRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) return;
    if (pushPromptRequestedRef.current) return;
    pushPromptRequestedRef.current = true;
    const timer = setTimeout(() => {
      void syncPushToken({ promptIfNeeded: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, syncPushToken]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [countsData, assuranceData, recommendData, youtubeData] =
          await Promise.all([
            getCounts().catch(() => ({
              jobCount: 0,
              licenseCount: 0,
              productsCount: 0,
            })),
            getAssuranceProducts().catch(() => ({ data: [] })),
            getRecommendProducts().catch(() => []),
            getYoutubeVideos().catch(() => []),
          ]);

        if (!mounted) return;
        setCounts(
          countsData || { jobCount: 0, licenseCount: 0, productsCount: 0 },
        );
        const assuranceList = (assuranceData?.data ?? []).flatMap(
          (raw: unknown) => {
            const normalized = toHomeProductItem(normalizeListItem(raw));
            return normalized ? [normalized] : [];
          },
        );
        setAssuranceProducts(assuranceList);
        setAssuranceTotalElements(
          Number(assuranceData?.totalElements ?? assuranceList.length) || 0,
        );
        setRecommendProducts(
          (Array.isArray(recommendData) ? recommendData : []).flatMap(
            (raw: unknown) => {
              const normalized = toHomeProductItem(normalizeListItem(raw));
              return normalized ? [normalized] : [];
            },
          ),
        );
        setYoutubeVideos(Array.isArray(youtubeData) ? youtubeData : []);
      } catch {
        // 일부 API 실패는 화면 표시를 막지 않는다.
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const loadInterestProducts = useCallback(async () => {
    if (!isAuthenticated) {
      setInterestProducts([]);
      return;
    }
    try {
      const list = await fetchOnSaleInterestProducts(true);
      setInterestProducts(list);
    } catch {
      setInterestProducts([]);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadInterestProducts();
    }, [loadInterestProducts]),
  );

  useEffect(() => {
    if (counts.productsCount <= 0) return;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(badgeScale, {
            toValue: 1.08,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(badgeScale, {
            toValue: 1,
            duration: 700,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(badgeRipple, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(badgeRipple, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [badgeRipple, badgeScale, counts.productsCount]);

  const onPressProduct = useCallback(
    (id: number) => {
      router.push({
        pathname: "/product/[id]",
        params: { id: String(id) },
      });
    },
    [router],
  );

  const onClickMoreAssurance = useCallback(() => {
    setPendingPurchaseFilterParams(
      filtersToParams({
        ...createDefaultFilters(),
        salesType: SALES_TYPE_ASSURANCE,
      }),
    );
    router.push("/(tabs)/purchase");
  }, [router]);

  const onPressCall = useCallback(() => {
    Linking.openURL("tel:15996249").catch(() =>
      showAppAlert({ title: "전화 문의", message: "1599-6249" }),
    );
  }, []);

  const onPressSellCar = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    router.push("/sell-car");
  }, [isAuthenticated, router]);

  const onPressService = useCallback(
    (path: string, requiresAuth = false) => {
      if (requiresAuth && !isAuthenticated) {
        promptLogin();
        return;
      }
      router.push(path as Href);
    },
    [isAuthenticated, router],
  );

  return (
    <Screen variant="tab" className="flex-1 bg-white">
      <HomePopupBannerModal banners={banners} />
      <ScrollView
        className="flex-1 bg-gray100"
        contentContainerStyle={{ paddingBottom: listPaddingBottom }}
      >
        <View className="h-[52px] flex-row items-center justify-between bg-white/85 px-4">
          <Image
            source={{ uri: `${IMAGE_BASE_URL}/logo_gra.png` }}
            className="h-[26px] w-[52px]"
            contentFit="contain"
          />
          <View className="flex-row gap-[10px]">
            <Pressable onPress={onPressCall} hitSlop={10}>
              <Ionicons
                name="call-outline"
                size={24}
                color={appColors.gray800}
              />
            </Pressable>
            <NotificationBellButton />
          </View>
        </View>

        <View className="bg-white pb-4 pt-2">
          <HomeBannerCarousel banners={homeBanners} />
          <View className="mt-[14px] gap-[10px] px-4">
            <Pressable
              className="min-h-[100px] overflow-hidden rounded-xl bg-white px-[18px] py-4"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
              }}
              onPress={onPressSellCar}
            >
              <View className="z-10 w-[54%]">
                <Text className="text-[20px] font-bold text-gray900">
                  내차판매
                </Text>
                <Text className="mt-1.5 text-[12px] text-gray700">
                  1분만에 빠르게 판매 등록하기
                </Text>
              </View>
              <Image
                source={{ uri: `${IMAGE_BASE_URL}/car-sale.png` }}
                className="absolute right-[-8px] top-[-2px] h-[106px] w-[140px]"
                contentFit="contain"
              />
            </Pressable>
            <Pressable
              className="min-h-[100px] overflow-hidden rounded-xl bg-white px-[18px] py-4"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
              }}
              onPress={() => router.push("/(tabs)/purchase")}
            >
              <View className="z-10 w-[54%]">
                <Text className="text-[20px] font-bold text-gray900">
                  내차구매
                </Text>
                <Text className="mt-1.5 text-[12px] text-gray700">
                  찾고 있는 그 차량, 여기에 있어요!
                </Text>
              </View>
              {counts.productsCount > 0 ? (
                <View className="absolute right-[6px] top-[6px] h-[22px] min-w-[22px] items-center justify-center">
                  <Animated.View
                    className="absolute h-[22px] w-[22px] rounded-full bg-[#ef4444]"
                    style={{
                      opacity: badgeRipple.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.45, 0],
                      }),
                      transform: [
                        {
                          scale: badgeRipple.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.9],
                          }),
                        },
                      ],
                    }}
                  />
                  <Animated.View
                    className="h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#FB2C36] px-1.5"
                    style={{ transform: [{ scale: badgeScale }] }}
                  >
                    <Text className="text-[11px] font-bold text-white">
                      {counts.productsCount}
                    </Text>
                  </Animated.View>
                </View>
              ) : null}
              <Image
                source={{ uri: `${IMAGE_BASE_URL}/car-purchase.png` }}
                className="absolute right-[-4px] top-0 h-[102px] w-[132px]"
                contentFit="contain"
              />
            </Pressable>
          </View>
        </View>

        <View className="mt-[10px] bg-white py-[14px]">
          <Text className="mb-[10px] px-4 text-[20px] font-bold text-gray800">
            더 많은 서비스
          </Text>
          {serviceCards.map((item) => (
            <Pressable
              key={item.title}
              className="min-h-16 flex-row items-center justify-between px-4 py-2"
              onPress={() =>
                onPressService(
                  item.path,
                  item.path === "/drive" || item.path === "/one-stop-service",
                )
              }
            >
              <View className="flex-1 flex-row items-center gap-3">
                <Image
                  source={{ uri: `${IMAGE_BASE_URL}/${item.icon}` }}
                  className="h-10 w-10"
                />
                <View>
                  <Text className="mb-[3px] text-[12px] text-gray700">
                    {item.subTitle}
                  </Text>
                  <Text className="text-[16px] font-bold text-gray800">
                    {item.title}
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={appColors.gray700}
              />
            </Pressable>
          ))}
        </View>

        {assuranceProducts.length > 0 ? (
          <View className="mt-[10px] bg-white py-[14px]">
            <Text className="mb-[10px] px-4 text-[20px] font-bold text-gray800">
              직트럭에서 검수한 차량
            </Text>
            <FlatList
              horizontal
              data={assuranceProducts.slice(0, 10)}
              keyExtractor={(item) => String(item.id)}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              disableIntervalMomentum
              snapToInterval={ASSURANCE_SNAP_INTERVAL}
              snapToAlignment="start"
              contentContainerStyle={{
                paddingHorizontal: ASSURANCE_SIDE_INSET,
                paddingBottom: 6,
              }}
              getItemLayout={(_, index) => ({
                length: ASSURANCE_SNAP_INTERVAL,
                offset: ASSURANCE_SNAP_INTERVAL * index,
                index,
              })}
              renderItem={({ item }) => (
                <HomeProductCard
                  item={item}
                  onPress={onPressProduct}
                  elevated
                  width={ASSURANCE_CARD_WIDTH}
                  imageHeight={ASSURANCE_CARD_IMAGE_HEIGHT}
                  gap={ASSURANCE_CARD_GAP}
                  showAssuranceInspectionCompleteBadge={false}
                />
              )}
            />
            {assuranceTotalElements > 0 ? (
              <View className="mt-[10px] px-4">
                <GradientOutlineButton
                  name={`총 ${assuranceTotalElements}건 더보기`}
                  fontSize={16}
                  height={48}
                  borderRadius={8}
                  onClick={onClickMoreAssurance}
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {isAuthenticated && interestProducts.length > 0 ? (
          <HomeInterestProducts
            products={interestProducts}
            onPressProduct={onPressProduct}
          />
        ) : null}

        {recommendProducts.length > 0 ? (
          <RecommendProducts
            products={recommendProducts}
            onPressProduct={onPressProduct}
          />
        ) : null}

        <View className="mt-[10px] bg-white py-[14px]">
          <Pressable
            className="flex-row items-center gap-1.5 pr-4"
            onPress={() => Linking.openURL(ZIGTRUCK_YOUTUBE_HOME_URL)}
          >
            <Text className="mb-[10px] px-4 text-[20px] font-bold text-gray800">
              직트럭 유튜브
            </Text>
            <Ionicons name="logo-youtube" size={22} color={appColors.gray800} />
          </Pressable>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
          >
            {youtubeVideos.slice(0, 10).map((item) => (
              <Pressable
                key={`${item.videoUrl}-${item.title}`}
                className="mr-[10px] w-[158px]"
                onPress={() => Linking.openURL(item.videoUrl)}
              >
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  className="mb-[10px] h-[90px] w-full rounded-[10px] bg-gray200"
                  contentFit="cover"
                />
                <Text
                  numberOfLines={2}
                  className="text-[14px] font-bold leading-[18px] text-gray800"
                >
                  {item.title}
                </Text>
              </Pressable>
            ))}
            <Pressable
              className="mr-[10px] w-[158px]"
              onPress={() => Linking.openURL(ZIGTRUCK_YOUTUBE_HOME_URL)}
            >
              <Image
                source={{ uri: `${IMAGE_BASE_URL}/youtube_zigtruck.png` }}
                className="mb-[10px] h-[90px] w-full rounded-[10px] bg-gray200"
              />
              <Text
                numberOfLines={2}
                className="text-[14px] font-bold leading-[18px] text-gray800"
              >
                직트럭 유튜브에서 더 많은 화물 정보 얻으러 가기
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        <View className="mt-[10px] bg-gray200 p-4">
          <Text className="mb-1.5 text-[13px] font-semibold text-gray700">
            직트럭 사업자 정보
          </Text>
          {businessInfo.map((item) => (
            <Text
              key={item.title}
              className="text-[10px] leading-[14px] text-gray600"
            >
              {item.title} {item.content}
            </Text>
          ))}
          <Text className="mt-[10px] text-[10px] leading-[14px] text-gray600">
            ⓒ 2020 주식회사 직트럭 All Rights Reserved
          </Text>
          <Text className="text-[10px] leading-[14px] text-gray600">
            주식회사 직트럭은 통신판매중개자로서 통신판매의 당사자가 아닙니다.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
