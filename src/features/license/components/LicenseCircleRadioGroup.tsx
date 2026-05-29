import { Image } from "expo-image";
import React from "react";
import { Platform, Text, View, type ViewStyle } from "react-native";

import { IMAGE_BASE_URL } from "@/src/constants/url";
import {
  getLicenseTheme,
  type LicenseGuideVariant,
} from "@/src/features/license/licenseTheme";
import {
  PriceTrendRadioGroup,
  type RadioOption,
} from "@/src/features/price-trend/PriceTrendRadioGroup";

const LICENSE_IDEA_ICON_URI = `${IMAGE_BASE_URL}/idea.png`;

const noticeShadowStyle: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
  default: {},
}) as ViewStyle;

export type LicenseRadioOption = { code: string; label: string };

type RadioProps = {
  label: string;
  required?: boolean;
  options: LicenseRadioOption[];
  value: string;
  onChange: (code: string) => void;
  variant?: LicenseGuideVariant;
};

/** 앱 공통 라디오(PriceTrendRadioGroup) 스타일 */
export function LicenseCircleRadioGroup({
  label,
  required,
  options,
  value,
  onChange,
  variant = "purchase",
}: RadioProps) {
  const theme = getLicenseTheme(variant);
  const radioOptions: RadioOption[] = options.map((option) => ({
    code: option.code,
    label: option.label,
  }));

  return (
    <PriceTrendRadioGroup
      label={label}
      required={required}
      options={radioOptions}
      value={value}
      onChange={onChange}
      accentColor={theme.accent}
      selectedBgColor={theme.selectedRadioBg}
    />
  );
}

type NoticeProps = {
  mode: "purchase" | "sales";
};

/** 웹 번호판 문의 안내 박스와 동일 (idea.png + 회색 박스 + 그림자) */
export function LicenseNoticeBox({ mode }: NoticeProps) {
  const actionLabel = mode === "purchase" ? "구매" : "판매";

  return (
    <View
      className="mb-4 flex-row items-center gap-2.5 rounded-lg border border-gray300 bg-gray100 p-2.5"
      style={noticeShadowStyle}
    >
      <Image
        source={{ uri: LICENSE_IDEA_ICON_URI }}
        style={{ width: 32, height: 32 }}
        contentFit="contain"
      />
      <Text className="flex-1 text-[14px] leading-[20px] text-gray800">
        <Text className="font-bold">번호판 {actionLabel} 문의시</Text> 직트럭
        담당자가 내용을 확인한 후 연락드립니다.
      </Text>
    </View>
  );
}
