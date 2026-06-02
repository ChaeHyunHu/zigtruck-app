import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheet } from "@/src/components/common/BottomSheet";
import { BasicButton } from "@/src/components/common/BasicButton";
import { appColors } from "@/src/constants/colors";

import type { ProductDetail } from "./types";

type OwnerVerificationBottomSheetProps = {
  visible: boolean;
  product: ProductDetail;
  onClose: () => void;
  onPressInquiry: () => void;
};

export function OwnerVerificationBottomSheet({
  visible,
  product,
  onClose,
  onPressInquiry,
}: OwnerVerificationBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const hasLastOwner = Boolean(product.lastOwnerInfo?.content);
  const bottomPadding = Math.max(insets.bottom, 12);

  // 첫 프레임용 추정치. onLayout 측정 후엔 실제 콘텐츠 높이로 정확히 맞춰 하단 공백/잘림을 방지한다.
  const estimatedHeight = useMemo(() => {
    const topPadding = 20;
    const headerBlock = 60;
    const descriptionBlock = product.realOwnerName ? 110 : 80;
    const lastOwnerBlock = hasLastOwner ? 110 : 0;
    const actionBlock = 24 + 48;
    return (
      topPadding +
      headerBlock +
      descriptionBlock +
      lastOwnerBlock +
      actionBlock +
      bottomPadding
    );
  }, [bottomPadding, hasLastOwner, product.realOwnerName]);

  const [measuredHeight, setMeasuredHeight] = useState(0);
  const sheetHeight = measuredHeight > 0 ? measuredHeight : estimatedHeight;

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    if (next > 0 && Math.abs(next - measuredHeight) > 1) {
      setMeasuredHeight(next);
    }
  };

  const ownerLine = product.realOwnerName
    ? `해당 차량의 소유자는 [${product.realOwnerName}]님입니다. `
    : "";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      sheetHeight={sheetHeight}
      contentLayout="hug"
      sheetStyle={{
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    >
      <View
        className="bg-white px-4 pt-5"
        style={{ paddingBottom: bottomPadding }}
        onLayout={handleContentLayout}
      >
        <View className="flex-row items-start">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-gray200">
            <Ionicons
              name="alert-circle-outline"
              size={26}
              color={appColors.gray500}
            />
          </View>
          <Text className="ml-2.5 flex-1 text-[20px] font-bold leading-[26px] text-gray800">
            차량 문의시{"\n"}소유자를 확인해주세요
          </Text>
        </View>

        <Text className="mt-3.5 text-[15px] leading-[22px] text-gray700">
          {ownerLine}
          안전한 거래를 위해 판매자가 실제 소유자인지 확인 후 거래해주세요.
        </Text>

        {hasLastOwner ? (
          <View className="mt-4 rounded-lg bg-gray100 p-4">
            {product.lastOwnerInfo?.date ? (
              <Text className="mb-2.5 text-[15px] font-semibold text-gray800">
                {product.lastOwnerInfo.date}
              </Text>
            ) : null}
            <Text className="text-[15px] leading-[19px] text-gray800">
              {product.lastOwnerInfo?.content}
            </Text>
          </View>
        ) : null}

        <View className="mt-6 flex-row gap-2" style={{}}>
          <View style={{ width: "32%" }}>
            <BasicButton
              name="닫기"
              bgColor="#ffffff"
              borderColor={appColors.gray300}
              textColor={appColors.gray600}
              height={48}
              fontSize={15}
              fontWeight="semibold"
              onClick={onClose}
            />
          </View>
          <View className="flex-1">
            <BasicButton
              name="문의하기"
              bgColor={appColors.primary}
              borderColor={appColors.primary}
              textColor="#ffffff"
              height={48}
              fontSize={15}
              fontWeight="bold"
              onClick={onPressInquiry}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
}
