import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ConfirmDialog } from "@/src/components/common/ConfirmDialog";
import { appColors } from "@/src/constants/colors";
import { formatNumberWithComma, formatPrice } from "@/src/features/home/utils";

const MAX_REVIEW_LENGTH = 200;
const MAX_PRICE_DIGITS = 5;
const PRICE_DIFF_THRESHOLD = 1000;

function isLargePriceDifference(
  price: number | null | undefined,
  actualSalePrice: number,
) {
  if (price == null) return false;
  return (
    price + PRICE_DIFF_THRESHOLD < actualSalePrice ||
    price - PRICE_DIFF_THRESHOLD > actualSalePrice
  );
}

type SaleCompleteReviewModalProps = {
  visible: boolean;
  loading?: boolean;
  /** 기존(등록) 판매 금액 — 안내용 */
  price?: number | null;
  onClose: () => void;
  onConfirm: (actualSalePrice: number, completeReason: string) => void;
};

/**
 * 판매완료 처리 시 실제 판매 금액 + 직트럭 후기를 입력받는 모달.
 * 확인을 눌러야 판매완료로 변경되며, 닫기를 누르면 상태가 변경되지 않는다.
 */
export function SaleCompleteReviewModal({
  visible,
  loading = false,
  price,
  onClose,
  onConfirm,
}: SaleCompleteReviewModalProps) {
  const [priceDigits, setPriceDigits] = useState("");
  const [review, setReview] = useState("");
  const [priceError, setPriceError] = useState(false);
  const [reviewError, setReviewError] = useState(false);
  const [priceConfirmVisible, setPriceConfirmVisible] = useState(false);
  const [pendingActualSalePrice, setPendingActualSalePrice] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!visible) {
      setPriceDigits("");
      setReview("");
      setPriceError(false);
      setReviewError(false);
      setPriceConfirmVisible(false);
      setPendingActualSalePrice(null);
    }
  }, [visible]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleConfirm = () => {
    const actualSalePrice = Number(priceDigits.replace(/[^\d]/g, ""));
    const trimmedReview = review.trim();
    let hasError = false;
    if (!Number.isFinite(actualSalePrice) || actualSalePrice <= 0) {
      setPriceError(true);
      hasError = true;
    }
    if (!trimmedReview) {
      setReviewError(true);
      hasError = true;
    }
    if (hasError) return;

    if (isLargePriceDifference(price, actualSalePrice)) {
      setPendingActualSalePrice(actualSalePrice);
      setPriceConfirmVisible(true);
      return;
    }

    onConfirm(actualSalePrice, trimmedReview);
  };

  const handleConfirmPriceDifference = () => {
    if (pendingActualSalePrice == null || loading) return;
    setPriceConfirmVisible(false);
    onConfirm(pendingActualSalePrice, review.trim());
    setPendingActualSalePrice(null);
  };

  return (
    <>
      <Modal
        visible={visible && !priceConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
      <View className="flex-1 items-center justify-center bg-black/35 px-5">
        <View className="max-h-[85%] w-full overflow-hidden rounded-2xl bg-white">
          <ScrollView
            className="px-5 pt-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-center text-[20px] font-bold text-gray900">
              판매 완료로 변경되었어요
            </Text>
            <Text className="mt-3 text-center text-[16px] text-gray800">
              실제 판매 금액을 입력해주세요.
            </Text>

            <View className="mt-6">
              <View
                className={`flex-row items-center border-b px-1 ${
                  priceError ? "border-danger" : "border-primary"
                }`}
              >
                <TextInput
                  className="h-11 flex-1 text-[17px] font-semibold text-gray900"
                  style={{
                    paddingVertical: 0,
                    textAlignVertical: "center",
                    includeFontPadding: false,
                  }}
                  value={priceDigits ? formatNumberWithComma(priceDigits) : ""}
                  onChangeText={(text) => {
                    setPriceDigits(
                      text.replace(/[^\d]/g, "").slice(0, MAX_PRICE_DIGITS),
                    );
                    setPriceError(false);
                  }}
                  keyboardType="number-pad"
                  placeholder="판매 금액"
                  placeholderTextColor={appColors.gray500}
                  editable={!loading}
                />
                <Text className="ml-2 text-[16px] text-gray800">만원</Text>
              </View>
              {priceError ? (
                <Text className="mt-1.5 text-[14px] text-danger">
                  판매 금액을 입력해주세요.
                </Text>
              ) : price ? (
                <Text className="mt-1.5 text-[15px] text-gray700">
                  기존 금액 [{formatPrice(price)}]
                </Text>
              ) : null}
            </View>

            <View className="mt-6">
              <Text
                className={`mb-2 text-[16px] font-medium ${
                  reviewError ? "text-danger" : "text-gray900"
                }`}
              >
                직트럭 후기 <Text className="text-danger">(필수)</Text>
              </Text>
              <View
                className={`rounded-xl border bg-gray100 px-3 py-2 ${
                  reviewError ? "border-danger" : "border-gray300"
                }`}
              >
                <TextInput
                  className="min-h-[90px] text-[14px] text-gray900"
                  style={{ textAlignVertical: "top" }}
                  placeholder={
                    "판매 경험에 대한 자세한 후기를 남겨주세요.\n직트럭 APP 개선에 도움이됩니다."
                  }
                  placeholderTextColor={appColors.gray500}
                  multiline
                  maxLength={MAX_REVIEW_LENGTH}
                  value={review}
                  onChangeText={(text) => {
                    setReview(text);
                    if (text.trim()) setReviewError(false);
                  }}
                  editable={!loading}
                />
              </View>
              <Text className="mt-1 pb-2 text-right text-[12px] text-gray700">
                {review.length} / {MAX_REVIEW_LENGTH}자
              </Text>
            </View>
          </ScrollView>

          <View className="flex-row border-t border-gray300">
            <Pressable
              onPress={handleClose}
              disabled={loading}
              className="flex-1 items-center justify-center border-r border-gray300 py-4"
            >
              <Text className="text-[16px] font-semibold text-gray700">닫기</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              className="flex-1 items-center justify-center py-4"
            >
              <Text className="text-[16px] font-semibold text-primary">
                {loading ? "처리 중..." : "확인"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      </Modal>

      <ConfirmDialog
        visible={visible && priceConfirmVisible}
        leftLabel="다시 입력"
        rightLabel="이대로 입력"
        onLeft={() => {
          setPriceConfirmVisible(false);
          setPendingActualSalePrice(null);
        }}
        onRight={handleConfirmPriceDifference}
      >
        <Text className="text-center text-[16px] font-medium leading-[24px] text-gray900">
          입력하신 실제 판매 금액과{"\n"}
          기존 금액의 차이가 큽니다.{"\n"}
          이대로 입력하시겠어요?
        </Text>
        {price != null && pendingActualSalePrice != null ? (
          <View className="mt-6">
            <Text className="text-[16px] leading-[19px] text-gray700">
              기존 금액 {formatPrice(price)}
            </Text>
            <Text className="text-[16px] leading-[19px] text-gray700">
              실제 판매 금액 {formatPrice(pendingActualSalePrice)}
            </Text>
          </View>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
