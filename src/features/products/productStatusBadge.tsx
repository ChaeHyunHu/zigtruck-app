import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { palette } from "@/src/constants/colors";
import {
  PRODUCT_STATUS_COMPLETE,
  PRODUCT_STATUS_PAUSE,
  PRODUCT_STATUS_SALE,
} from "@/src/constants/products";

export type ProductStatusBadgeStyle = {
  backgroundColor: string;
  textColor: string;
  showChevron: boolean;
};

export const PRODUCT_STATUS_DESC: Record<string, string> = {
  [PRODUCT_STATUS_SALE]: "판매중",
  [PRODUCT_STATUS_PAUSE]: "판매중지",
  [PRODUCT_STATUS_COMPLETE]: "판매완료",
};

/** zigtruck-front 내차관리·상품상세 상태 배지 색상 */
export function getProductStatusBadgeStyle(
  statusCode?: string,
  options?: { canChangeStatus?: boolean },
): ProductStatusBadgeStyle {
  const canChange = options?.canChangeStatus ?? false;

  switch (statusCode) {
    case PRODUCT_STATUS_SALE:
      return {
        backgroundColor: palette.primary[10],
        textColor: "#FFFFFF",
        showChevron: canChange,
      };
    case PRODUCT_STATUS_PAUSE:
      return {
        backgroundColor: palette.secondaryRed[1],
        textColor: "#FFFFFF",
        showChevron: canChange,
      };
    case PRODUCT_STATUS_COMPLETE:
      return {
        backgroundColor: palette.grey[2],
        textColor: palette.grey[6],
        showChevron: false,
      };
    default:
      return {
        backgroundColor: palette.primary[10],
        textColor: "#FFFFFF",
        showChevron: canChange,
      };
  }
}

type ProductStatusBadgeProps = {
  statusCode?: string;
  statusDesc?: string;
  canChangeStatus?: boolean;
  onPress?: () => void;
  /** 상품상세 등 더 큰 라운드 */
  size?: "manage" | "detail";
};

export function ProductStatusBadge({
  statusCode,
  statusDesc,
  canChangeStatus = false,
  onPress,
  size = "manage",
}: ProductStatusBadgeProps) {
  const badgeStyle = getProductStatusBadgeStyle(statusCode, { canChangeStatus });
  const label =
    statusDesc ??
    (statusCode ? PRODUCT_STATUS_DESC[statusCode] : undefined) ??
    "판매중";
  const roundedClass = size === "detail" ? "rounded-[10px] px-3 py-1.5" : "rounded-[8px] px-2 py-1";

  const content = (
    <>
      <Text
        className={`text-[14px] font-bold ${badgeStyle.showChevron ? "pr-1" : ""}`}
        style={{ color: badgeStyle.textColor }}
      >
        {label}
      </Text>
      {badgeStyle.showChevron ? (
        <Ionicons name="chevron-down" size={14} color={badgeStyle.textColor} />
      ) : null}
    </>
  );

  if (canChangeStatus && onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`flex-row items-center self-start ${roundedClass}`}
        style={{ backgroundColor: badgeStyle.backgroundColor }}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className={`flex-row items-center self-start ${roundedClass}`}
      style={{ backgroundColor: badgeStyle.backgroundColor }}
    >
      {content}
    </View>
  );
}
