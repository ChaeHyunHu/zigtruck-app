import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { navigateToProductChatSafely } from "@/src/features/chat/navigateToProductChat";
import { LoginRequiredView } from "@/src/components/auth/LoginRequiredView";
import { BottomSheet } from "@/src/components/common/BottomSheet";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { Screen } from "@/src/components/common/Screen";
import {
  deleteInterestProducts,
  getInterestProducts,
  postInterestProductNotificationSettings,
  postInterestProducts,
  postProductInquiryCall,
} from "@/src/api/public";
import {
  PRODUCT_STATUS_SALE,
  SALES_TYPE_ASSURANCE,
  SALES_TYPE_CONSIGNMENT,
} from "@/src/constants/products";
import { appColors } from "@/src/constants/colors";
import { InterestProductCard } from "@/src/features/interest-products/InterestProductCard";
import type { InterestProductItem } from "@/src/features/interest-products/types";
import { invalidateInterestProductsCache } from "@/src/features/interest-products/interestProductService";
import {
  enumCode,
  isOnSale,
  normalizeInterestProducts,
} from "@/src/features/interest-products/utils";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAuth } from "@/src/hooks/useAuth";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";

const REPRESENTATIVE_PHONE = "15996249";

export default function InterestProductsScreen() {
  const { isAuthenticated } = useAuth();
  const { listPaddingBottom, bottom: bottomInset } = useScreenInsets();
  const inquiryBottomPadding = Math.max(bottomInset, 12);
  const inquirySheetHeight = 188 + inquiryBottomPadding;

  const [items, setItems] = useState<InterestProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlikeIds, setUnlikeIds] = useState<number[]>([]);
  const [disabledNotificationIds, setDisabledNotificationIds] = useState<number[]>([]);
  const [isMutating, setIsMutating] = useState(false);

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState<InterestProductItem | null>(null);

  const [notifyConfirmOpen, setNotifyConfirmOpen] = useState(false);
  const notifyTargetRef = useRef<InterestProductItem | null>(null);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getInterestProducts();
      invalidateInterestProductsCache();
      setItems(normalizeInterestProducts(data));
      setUnlikeIds([]);
    } catch {
      Alert.alert("오류", "찜한 차량 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const { onSaleItems, notOnSaleItems } = useMemo(() => {
    const onSale: InterestProductItem[] = [];
    const notOnSale: InterestProductItem[] = [];
    items.forEach((item) => {
      if (isOnSale(enumCode(item.status))) {
        onSale.push(item);
      } else {
        notOnSale.push(item);
      }
    });
    return { onSaleItems: onSale, notOnSaleItems: notOnSale };
  }, [items]);

  const toggleLike = useCallback(
    async (item: InterestProductItem) => {
      if (isMutating) return;
      const isUnlike = unlikeIds.includes(item.id);
      setIsMutating(true);
      try {
        if (isUnlike) {
          await postInterestProducts(item.productId);
          invalidateInterestProductsCache();
          setUnlikeIds((prev) => prev.filter((id) => id !== item.id));
        } else {
          await deleteInterestProducts(item.id);
          invalidateInterestProductsCache();
          setUnlikeIds((prev) => [...prev, item.id]);
        }
      } catch {
        Alert.alert("오류", "찜 상태 변경에 실패했습니다.");
      } finally {
        setIsMutating(false);
      }
    },
    [isMutating, unlikeIds],
  );

  const openInquiry = useCallback((item: InterestProductItem) => {
    setInquiryProduct(item);
    setInquiryOpen(true);
  }, []);

  const onPressPhoneInquiry = useCallback(async () => {
    if (!inquiryProduct) return;
    try {
      await postProductInquiryCall(inquiryProduct.productId);
    } catch {
      // ignore
    }
    const phone = inquiryProduct.safetyNumber ?? REPRESENTATIVE_PHONE;
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("오류", "전화 연결을 할 수 없습니다."),
    );
    setInquiryOpen(false);
  }, [inquiryProduct]);

  const onPressChatInquiry = useCallback(async () => {
    if (!inquiryProduct) return;
    setInquiryOpen(false);
    await navigateToProductChatSafely(inquiryProduct.productId);
  }, [inquiryProduct]);

  const registerSimilarNotification = useCallback(async () => {
    const item = notifyTargetRef.current;
    if (!item) return;
    setNotifyConfirmOpen(false);
    setDisabledNotificationIds((prev) => [...prev, item.id]);
    try {
      const request: Record<string, unknown> = {
        id: item.id,
        minYear: item.year,
        maxYear: item.year,
        minTons: item.tons,
        maxTons: item.tons,
        loaded: enumCode(item.loaded) ?? "",
        minLoadedInnerLength: item.loadedInnerLength,
        maxLoadedInnerLength: item.loadedInnerLength,
        axis: enumCode(item.axis),
        manufacturerCategoriesId: item.manufacturerCategoriesId,
        minDistance: item.distance,
        maxDistance: item.distance,
        transmission: enumCode(item.transmission),
      };
      if (Number(request.minTons) === 1 && Number(request.maxTons) === 27) {
        delete request.minTons;
        delete request.maxTons;
      }
      await postInterestProductNotificationSettings(request as never);
      Alert.alert("완료", "관심차량이 등록되었어요.");
    } catch (error: unknown) {
      setDisabledNotificationIds((prev) => prev.filter((id) => id !== item.id));
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: string }).message)
          : "알림 등록에 실패했습니다.";
      Alert.alert("오류", message);
    } finally {
      notifyTargetRef.current = null;
    }
  }, []);

  const getButtonInfo = useCallback(
    (item: InterestProductItem) => {
      const statusCode = enumCode(item.status);
      if (statusCode === PRODUCT_STATUS_SALE) {
        const salesCode = enumCode(item.salesType);
        const hasSalesPhone = Boolean(item.salesPeople?.phoneNumber);
        if (
          (salesCode === SALES_TYPE_ASSURANCE || salesCode === SALES_TYPE_CONSIGNMENT) &&
          hasSalesPhone
        ) {
          return {
            label: "전화문의 하기",
            disabled: false,
            onPress: () => {
              postProductInquiryCall(item.productId).catch(() => undefined);
              Linking.openURL(
                `tel:${item.safetyNumber ?? REPRESENTATIVE_PHONE}`,
              ).catch(() => undefined);
            },
          };
        }
        return {
          label: "차량 구매문의",
          disabled: false,
          onPress: () => openInquiry(item),
        };
      }
      const notifyDone =
        disabledNotificationIds.includes(item.id) || !item.isNotificationEnabled;
      return {
        label: notifyDone ? "알림 받기 완료" : "비슷한 차량 알림 받기",
        disabled: notifyDone,
        onPress: () => {
          notifyTargetRef.current = item;
          setNotifyConfirmOpen(true);
        },
      };
    },
    [disabledNotificationIds, openInquiry],
  );

  if (!isAuthenticated) {
    return (
      <Screen className="flex-1 bg-white">
        <RegistrationHeader title="찜한 차량 목록" />
        <LoginRequiredView message="찜한 차량은 로그인 후 확인할 수 있어요." />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-white">
      <RegistrationHeader title="찜한 차량 목록" />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="heart-outline" size={80} color={appColors.gray400} />
          <Text className="mt-8 text-[18px] text-gray700">찜한 차량 내역이 없습니다.</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: listPaddingBottom, paddingTop: 8 }}
        >
          {onSaleItems.map((item) => {
            const button = getButtonInfo(item);
            return (
              <InterestProductCard
                key={item.id}
                item={item}
                isLiked={!unlikeIds.includes(item.id)}
                buttonLabel={button.label}
                buttonDisabled={button.disabled}
                onPressCard={() => router.push(`/product/${item.productId}`)}
                onToggleLike={() => toggleLike(item)}
                onPressAction={button.onPress}
              />
            );
          })}

          {notOnSaleItems.length > 0 ? (
            <View className="my-6 flex-row items-center">
              <View className="h-px flex-1 bg-gray400" />
              <Text className="mx-2.5 text-[14px] text-gray600">판매종료</Text>
              <View className="h-px flex-1 bg-gray400" />
            </View>
          ) : null}

          {notOnSaleItems.map((item) => {
            const button = getButtonInfo(item);
            const notifyDone = disabledNotificationIds.includes(item.id);
            return (
              <InterestProductCard
                key={item.id}
                item={item}
                isLiked={!unlikeIds.includes(item.id)}
                buttonLabel={notifyDone ? "알림 받기 완료" : button.label}
                buttonDisabled={button.disabled || notifyDone}
                onToggleLike={() => toggleLike(item)}
                onPressAction={button.onPress}
              />
            );
          })}
        </ScrollView>
      )}

      <BottomSheet
        visible={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        sheetHeight={inquirySheetHeight}
        contentLayout="hug"
      >
        <View
          className="bg-white px-4 pt-4"
          style={{ paddingBottom: inquiryBottomPadding }}
        >
          <Text className="mb-4 text-center text-[17px] font-bold text-gray900" numberOfLines={2}>
            {inquiryProduct?.truckName}
          </Text>
          <Pressable
            onPress={onPressPhoneInquiry}
            className="mb-3 items-center justify-center rounded-lg border border-gray400 py-4"
          >
            <Text className="text-[18px] font-medium text-gray800">전화문의</Text>
          </Pressable>
          <Pressable
            onPress={onPressChatInquiry}
            className="items-center justify-center rounded-lg border border-gray400 py-4"
          >
            <Text className="text-[18px] font-medium text-gray800">채팅문의</Text>
          </Pressable>
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={notifyConfirmOpen}
        title="관심 차량 등록"
        leftLabel="닫기"
        rightLabel="알림 받기"
        onLeft={() => {
          setNotifyConfirmOpen(false);
          notifyTargetRef.current = null;
        }}
        onRight={registerSimilarNotification}
      >
        <Text className="text-center text-[16px] leading-[24px] text-gray800">
          비슷한 차량이 입고되면{"\n"}알림을 보내드릴까요?
        </Text>
      </ConfirmDialog>
    </Screen>
  );
}
