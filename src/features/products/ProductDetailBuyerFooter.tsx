import { ProductDetailServiceBottomSheet } from "@/src/features/additional-services/components/ProductDetailServiceBottomSheet";
import { PurchaseAccompanyingServiceBottomSheet } from "@/src/features/additional-services/components/PurchaseAccompanyingServiceBottomSheet";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  deleteInterestProducts,
  postProductInquiryCall,
} from "@/src/api/public";
import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import {
  SALES_TYPE_ASSURANCE,
  SALES_TYPE_CONSIGNMENT,
} from "@/src/constants/products";
import { ACTUAL_REPRESENTATIVE_PHONE_NUMBER } from "@/src/features/additional-services/constants";
import { navigateToProductChatSafely } from "@/src/features/chat/navigateToProductChat";
import {
  invalidateInterestProductsCache,
  createInterestProduct as registerInterestProduct,
} from "@/src/features/interest-products/interestProductService";
import type { ProductDetail } from "@/src/features/products/types";
import { enumCode } from "@/src/features/products/utils";
import { useNotificationSettings } from "@/src/features/settings/useNotificationSettings";
import { useAuth } from "@/src/hooks/useAuth";
import { promptLogin } from "@/src/lib/authNavigation";
import { showAppAlert } from "@/src/providers/appDialog";

import { OwnerVerificationBottomSheet } from "./OwnerVerificationBottomSheet";
import { ProductInquiryModal } from "./ProductInquiryModal";
import {
  isDealerMember,
  resolveInquiryPhoneNumber,
} from "./productInquiryUtils";

type ProductDetailBuyerFooterProps = {
  product: ProductDetail;
  onInterestChange?: (interestProductId: number | null) => void;
};

export function ProductDetailBuyerFooter({
  product,
  onInterestChange,
}: ProductDetailBuyerFooterProps) {
  const { isAuthenticated, profile } = useAuth();
  const { settings, isLoaded } = useNotificationSettings();
  const [interestProductId, setInterestProductId] = useState<
    number | null | undefined
  >(product.interestedProductId ?? null);
  const [isMutating, setIsMutating] = useState(false);
  const [likeConfirmOpen, setLikeConfirmOpen] = useState(false);
  const [ownerSheetOpen, setOwnerSheetOpen] = useState(false);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [accompanyingOpen, setAccompanyingOpen] = useState(false);
  const [capitalSheetOpen, setCapitalSheetOpen] = useState(false);

  useEffect(() => {
    setInterestProductId(product.interestedProductId ?? null);
  }, [product.interestedProductId, product.id]);

  const isInterestProductOn = isLoaded ? settings.interestProduct : true;
  const salesTypeCode = enumCode(product.salesType);
  const isNotDirectProduct =
    salesTypeCode === SALES_TYPE_ASSURANCE ||
    salesTypeCode === SALES_TYPE_CONSIGNMENT;
  const memberTypeCode = profile?.memberTypeCode;
  // 직거래 매물 + 로그인 회원이 딜러일 때: '차주에게 연락하기' 대신 본사 전화 문의
  const isDealerDirectInquiry =
    !isNotDirectProduct && isDealerMember(memberTypeCode);

  const createInterestProduct = useCallback(async () => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    if (isMutating) return;
    setIsMutating(true);
    try {
      const createdId = await registerInterestProduct(product.id);
      if (createdId != null) {
        setInterestProductId(createdId);
        onInterestChange?.(createdId);
      }
      setLikeConfirmOpen(true);
    } catch {
      showAppAlert({
        title: "오류",
        message: "찜하기에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsMutating(false);
    }
  }, [isAuthenticated, isMutating, onInterestChange, product.id]);

  const deleteInterestProduct = useCallback(async () => {
    if (!interestProductId || isMutating) return;
    setIsMutating(true);
    const prev = interestProductId;
    setInterestProductId(null);
    try {
      await deleteInterestProducts(prev);
      invalidateInterestProductsCache();
      onInterestChange?.(null);
    } catch {
      setInterestProductId(prev);
      showAppAlert({ title: "오류", message: "찜 해제에 실패했습니다." });
    } finally {
      setIsMutating(false);
    }
  }, [interestProductId, isMutating, onInterestChange]);

  const onPressLike = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    if (interestProductId) {
      deleteInterestProduct();
    } else {
      createInterestProduct();
    }
  }, [
    createInterestProduct,
    deleteInterestProduct,
    interestProductId,
    isAuthenticated,
  ]);

  const onPressPhone = useCallback(async () => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    try {
      await postProductInquiryCall(product.id);
    } catch {
      // 통화 API 실패해도 전화 연결은 시도
    }
    const phone = resolveInquiryPhoneNumber(product, memberTypeCode);
    Linking.openURL(`tel:${phone}`).catch(() =>
      showAppAlert({ title: "오류", message: "전화 연결을 할 수 없습니다." }),
    );
    setInquiryModalOpen(false);
    setOwnerSheetOpen(false);
  }, [isAuthenticated, memberTypeCode, product]);

  const onPressChat = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    setInquiryModalOpen(false);
    setOwnerSheetOpen(false);
    // iOS: 소유자 확인 시트(native Modal) 닫기 애니메이션이 끝나기 전에 채팅방으로
    // 이동하면 Modal이 orphaned 상태로 남아, 뒤로 돌아왔을 때 투명 레이어가 터치를
    // 막는다. 시트가 완전히 닫힌 뒤 이동한다.
    setTimeout(() => {
      void navigateToProductChatSafely(product.id);
    }, 320);
  }, [isAuthenticated, product.id]);

  // 비로그인 상태에서도 바텀시트는 열고, 시트 내부 '신청하기'에서 로그인 유도
  const onPressPurchaseAccompanying = useCallback(() => {
    setAccompanyingOpen(true);
  }, []);

  const onPressCapital = useCallback(() => {
    setCapitalSheetOpen(true);
  }, []);

  const onPressContact = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    setOwnerSheetOpen(true);
  }, [isAuthenticated]);

  // 딜러 회원: 직거래 매물 전화 문의 → 직트럭 본사 번호로 바로 연결
  const onPressDealerHeadOfficeCall = useCallback(async () => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    try {
      await postProductInquiryCall(product.id);
    } catch {
      // 통화 API 실패해도 전화 연결은 시도
    }
    Linking.openURL(`tel:${ACTUAL_REPRESENTATIVE_PHONE_NUMBER}`).catch(() =>
      showAppAlert({ title: "오류", message: "전화 연결을 할 수 없습니다." }),
    );
  }, [isAuthenticated, product.id]);

  const onPressDirectPhone = useCallback(() => {
    if (!isAuthenticated) {
      promptLogin();
      return;
    }
    void onPressPhone();
  }, [isAuthenticated, onPressPhone]);

  // 소유자 확인 시트를 닫지 않고, 같은 Modal window 안에 문의 모달을 오버레이로 띄운다.
  // (iOS에서 Modal 닫고 곧바로 다른 Modal 띄울 때 터치 막히는 문제 방지)
  const onOwnerSheetInquiry = useCallback(() => {
    setInquiryModalOpen(true);
  }, []);

  const closeOwnerFlow = useCallback(() => {
    setInquiryModalOpen(false);
    setOwnerSheetOpen(false);
  }, []);

  return (
    <>
      <SafeAreaView
        edges={["bottom"]}
        className="border-t border-gray300 bg-white"
      >
        <View className="flex-row items-center gap-2 px-4 py-3">
          <Pressable
            onPress={onPressLike}
            className="items-center"
            disabled={isMutating}
          >
            <Ionicons
              name={interestProductId ? "heart" : "heart-outline"}
              size={22}
              color={interestProductId ? "#FF4D4F" : "#737373"}
            />
            <Text className="mt-0.5 text-[10px] text-gray700">찜하기</Text>
          </Pressable>

          {isNotDirectProduct ? (
            <>
              <Pressable
                onPress={onPressCapital}
                className="flex-1 items-center justify-center rounded-md border border-gray300 py-3"
              >
                <Text className="text-[14px] font-bold text-gray800">
                  대출상담 신청하기
                </Text>
              </Pressable>
              <Pressable
                onPress={onPressDirectPhone}
                className="flex-1 items-center justify-center rounded-md bg-primary py-3"
              >
                <Text className="text-[14px] font-bold text-white">
                  전화 문의하기
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={onPressPurchaseAccompanying}
                className="flex-1 items-center justify-center rounded-md border border-gray300 py-3"
              >
                <Text className="text-[14px] font-bold text-gray800">
                  구매동행 서비스
                </Text>
              </Pressable>
              {isDealerDirectInquiry ? (
                <Pressable
                  onPress={onPressDealerHeadOfficeCall}
                  className="flex-1 items-center justify-center rounded-md bg-primary py-3"
                >
                  <Text className="text-[14px] font-bold text-white">
                    전화 문의하기
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={onPressContact}
                  className="flex-1 items-center justify-center rounded-md bg-primary py-3"
                >
                  <Text className="text-[14px] font-bold text-white">
                    차주에게 연락하기
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </SafeAreaView>

      <ConfirmDialog
        visible={likeConfirmOpen}
        title="찜한차량에 추가되었습니다!"
        leftLabel="닫기"
        rightLabel={isInterestProductOn ? undefined : "설정으로 이동"}
        onLeft={() => setLikeConfirmOpen(false)}
        onRight={
          isInterestProductOn
            ? undefined
            : () => {
                setLikeConfirmOpen(false);
                router.push("/notification-settings");
              }
        }
      >
        <Text className="text-center text-[16px] leading-[24px] text-gray800">
          관심 차량의 가격이 변경되면 직트럭 앱으로 알림을 보내드려요.
        </Text>
        {!isInterestProductOn ? (
          <Text className="mt-3 text-center text-[13px] leading-[20px] text-gray700">
            * 알림 설정 : 더보기 &gt; 설정 &gt; 알림설정 &gt; 관심차량 알림 on
          </Text>
        ) : null}
      </ConfirmDialog>

      <PurchaseAccompanyingServiceBottomSheet
        visible={accompanyingOpen}
        onClose={() => setAccompanyingOpen(false)}
        initialVehicle={{
          productId: product.id,
          truckName: product.truckName ?? "",
        }}
      />

      <ProductDetailServiceBottomSheet
        kind={capitalSheetOpen ? "capital" : null}
        onClose={() => setCapitalSheetOpen(false)}
        productId={product.id}
        truckName={product.truckName}
        price={product.price}
      />

      <OwnerVerificationBottomSheet
        visible={ownerSheetOpen}
        product={product}
        onClose={closeOwnerFlow}
        onPressInquiry={onOwnerSheetInquiry}
        nestedSheets={
          <ProductInquiryModal
            asOverlay
            visible={inquiryModalOpen}
            product={product}
            memberTypeCode={memberTypeCode}
            onClose={() => setInquiryModalOpen(false)}
            onPressPhone={onPressPhone}
            onPressChat={onPressChat}
          />
        }
      />
    </>
  );
}
