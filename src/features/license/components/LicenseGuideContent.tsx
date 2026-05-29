import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import type { LicenseGuideFaq } from "@/src/api/license";
import { appColors } from "@/src/constants/colors";
import {
  getLicenseTheme,
  type LicenseGuideVariant,
  type LicenseTheme,
} from "@/src/features/license/licenseTheme";
import { ProductYoutubePlayer } from "@/src/features/products/ProductYoutubePlayer";

const LICENSE_GUIDE_YOUTUBE_URL = "https://www.youtube.com/watch?v=4xNmCAw2Qtw";

type WarningCondition = {
  title?: string;
  description?: string;
  example?: Array<{ status?: string; description?: string }>;
};

type WarningItem = {
  title?: string;
  description?: string;
  example?: string;
  conditions?: WarningCondition[];
  exception?: { title?: string; description?: string };
};

function WarningCard({
  warning,
  index,
  theme,
}: {
  warning: WarningItem;
  index: number;
  theme: LicenseTheme;
}) {
  return (
    <View className="mb-3 rounded-lg border border-gray300 bg-white p-4">
      <Text className="text-[14px] font-bold text-gray900">
        {index + 1}. {warning.title}
      </Text>
      {warning.description ? (
        <Text className="mt-2 text-[13px] leading-[20px] text-gray800">
          {warning.description}
        </Text>
      ) : null}
      {warning.conditions?.map((condition, conditionIndex) => (
        <View
          key={`${condition.title}-${conditionIndex}`}
          className="mt-3 rounded-lg border border-gray300 bg-gray100 p-3"
        >
          <Text className="text-[13px] font-bold text-gray900">
            📌 {condition.title}
          </Text>
          {condition.description ? (
            <Text className="mt-1 text-[13px] leading-[20px] text-gray800">
              {condition.description}
            </Text>
          ) : null}
          {condition.example?.map((ex, exIndex) => {
            const ok = ex.status === "Y";
            return (
              <View
                key={`${ex.description}-${exIndex}`}
                className="mt-2 flex-row items-start gap-1"
              >
                <Text
                  className="text-[13px] font-bold"
                  style={{
                    color: ok ? theme.registerOkColor : theme.registerNgColor,
                  }}
                >
                  {ok ? "✓" : "×"}
                </Text>
                <Text className="flex-1 text-[13px] text-gray800">
                  {ex.description}
                  {ex.status === "N" ? (
                    <Text style={{ color: theme.registerNgColor }}>
                      {" "}
                      (등록불가)
                    </Text>
                  ) : null}
                  {ex.status === "Y" ? (
                    <Text style={{ color: theme.registerOkColor }}>
                      {" "}
                      (등록가능)
                    </Text>
                  ) : null}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
      {warning.exception ? (
        <View
          className="mt-3 rounded-lg border p-3"
          style={{
            borderColor: theme.exceptionBorder,
            backgroundColor: theme.exceptionBg,
          }}
        >
          <Text className="text-[13px] font-bold" style={{ color: theme.accent }}>
            💡 {warning.exception.title}
          </Text>
          <Text className="mt-1 text-[13px] leading-[20px] text-gray800">
            {warning.exception.description}
          </Text>
        </View>
      ) : null}
      {warning.example ? (
        <Text className="mt-2 text-[13px] italic leading-[20px] text-gray600">
          {warning.example}
        </Text>
      ) : null}
    </View>
  );
}

function renderAnswerBlock(
  answer: Record<string, unknown>,
  variant: LicenseGuideVariant,
) {
  const theme = getLicenseTheme(variant);
  const blocks: React.ReactNode[] = [];

  if (typeof answer.point === "string") {
    blocks.push(
      <Text
        key="point"
        className="mb-2 text-[14px] font-bold leading-[20px]"
        style={{ color: theme.accent }}
      >
        {answer.point}
      </Text>,
    );
  }

  if (typeof answer.introduction === "string") {
    blocks.push(
      <Text key="intro" className="mb-3 text-[14px] leading-[22px] text-gray800">
        {answer.introduction}
      </Text>,
    );
  }

  const steps = answer.steps as
    | Array<{
        stepNumber?: number;
        title?: string;
        description?: string;
        note?: string;
        sellerDocuments?: Array<{ name?: string; note?: string }>;
        buyerDocuments?: Array<{ name?: string; note?: string }>;
      }>
    | undefined;
  steps?.forEach((step, i) => {
    blocks.push(
      <View
        key={`step-${i}`}
        className="mb-3 rounded-lg p-3"
        style={{ backgroundColor: theme.stepCardBg }}
      >
        <Text className="text-[14px] font-bold" style={{ color: theme.accent }}>
          ◆ {step.stepNumber}단계. {step.title}
        </Text>
        {step.description ? (
          <Text className="mt-1 text-[13px] leading-[20px] text-gray800">
            {step.description}
          </Text>
        ) : null}
        {step.note ? (
          <Text className="mt-1 text-[13px] text-gray600">{step.note}</Text>
        ) : null}
        {step.sellerDocuments ? (
          <View className="mt-2">
            <Text className="text-[13px] font-semibold text-gray900">[판매자]</Text>
            {step.sellerDocuments.map((doc, docIndex) => (
              <Text
                key={`seller-${i}-${docIndex}`}
                className="text-[13px] text-gray800"
              >
                • {doc.name}
                {doc.note ? ` (${doc.note})` : ""}
              </Text>
            ))}
          </View>
        ) : null}
        {step.buyerDocuments ? (
          <View className="mt-2">
            <Text className="text-[13px] font-semibold text-gray900">[구매자]</Text>
            {step.buyerDocuments.map((doc, docIndex) => (
              <Text
                key={`buyer-${i}-${docIndex}`}
                className="text-[13px] text-gray800"
              >
                • {doc.name}
                {doc.note ? ` (${doc.note})` : ""}
              </Text>
            ))}
          </View>
        ) : null}
      </View>,
    );
  });

  const costs = answer.costs as
    | Array<{ title?: string; description?: string; estimatedCost?: string }>
    | undefined;
  costs?.forEach((cost, i) => {
    blocks.push(
      <View key={`cost-${i}`} className="mb-2">
        <Text className="text-[14px] font-semibold text-gray900">{cost.title}</Text>
        <Text className="text-[13px] leading-[20px] text-gray800">
          {cost.description}
        </Text>
        {cost.estimatedCost ? (
          <Text className="text-[13px] text-gray600">
            예상 비용: {cost.estimatedCost}
          </Text>
        ) : null}
      </View>,
    );
  });

  const warnings = answer.warnings as WarningItem[] | undefined;
  warnings?.forEach((warning, i) => {
    blocks.push(
      <WarningCard
        key={`warn-${i}`}
        warning={warning}
        index={i}
        theme={theme}
      />,
    );
  });

  const notes = answer.notes as string[] | undefined;
  if (notes?.length) {
    blocks.push(
      <View key="notes" className="mt-2 border-l-4 border-gray400 bg-gray100 p-3">
        <Text className="mb-1 text-[14px] font-bold text-gray900">[참고사항]</Text>
        {notes.map((note, noteIndex) => (
          <Text
            key={`note-${noteIndex}`}
            className="text-[13px] leading-[20px] text-gray800"
          >
            • {note}
          </Text>
        ))}
      </View>,
    );
  }

  const tips = answer.tip as string[] | undefined;
  if (tips?.length) {
    blocks.push(
      <View
        key="tips"
        className="mt-3 rounded-lg border border-[#f5e6a8] bg-[#fffbeb] p-4"
      >
        <Text className="mb-2 text-[14px] font-bold text-gray900">[TIP]</Text>
        {tips.map((tip, tipIndex) => (
          <Text
            key={`tip-${tipIndex}`}
            className="text-[13px] leading-[20px] text-gray800"
          >
            {tip}
          </Text>
        ))}
      </View>,
    );
  }

  return blocks;
}

function LicenseGuideIntroCard({
  variant,
  open,
  onToggle,
}: {
  variant: LicenseGuideVariant;
  open: boolean;
  onToggle: () => void;
}) {
  const theme = getLicenseTheme(variant);
  const items = [
    "서류 검토 및 행정 절차 안내",
    "지자체 접수 과정의 오류 방지",
    "거래 과정에서의 안전한 잔금 처리",
    "판매자·구매자 간 신뢰 보증",
  ];

  return (
    <View
      className="mb-3 rounded-lg border border-gray300 p-3"
      style={{ backgroundColor: theme.introCardBg }}
    >
      <Pressable className="flex-row items-center justify-between" onPress={onToggle}>
        <Text className="flex-1 text-[15px] text-gray900">
          번호판 {variant === "purchase" ? "구매" : "판매"}는{" "}
          <Text style={{ color: theme.accent, fontWeight: "700" }}>직트럭</Text>이
          직접 중개합니다.
        </Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={appColors.gray700}
        />
      </Pressable>
      {open ? (
        <View className="mt-4">
          {items.map((line) => (
            <View key={line} className="mb-2 flex-row items-start gap-2">
              <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
              <Text className="flex-1 text-[14px] leading-[20px] text-gray800">
                {line}
              </Text>
            </View>
          ))}
          <Text className="mt-2 text-[13px] text-gray600">
            중개 수수료 15만원(VAT 별도) 발생합니다.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function LicenseGuideFaqList({
  variant,
  faqs,
  openId,
  onToggleFaq,
}: {
  variant: LicenseGuideVariant;
  faqs: LicenseGuideFaq[];
  openId: number | null;
  onToggleFaq: (index: number) => void;
}) {
  const theme = getLicenseTheme(variant);
  return (
    <View>
      {faqs.map((faq, index) => {
        const open = openId === index;
        return (
          <View key={`faq-${index}`} className="border-b border-gray300 bg-white">
            <Pressable
              className="flex-row items-start justify-between px-2 py-4"
              onPress={() => onToggleFaq(index)}
            >
              <View className="flex-1 flex-row items-start gap-2 pr-2">
                <Text className="text-base font-semibold" style={{ color: theme.accent }}>
                  Q
                </Text>
                <Text className="flex-1 text-[15px] font-medium leading-[22px] text-gray900">
                  {faq.question}
                </Text>
              </View>
              <Ionicons
                name={open ? "chevron-up" : "chevron-down"}
                size={20}
                color={appColors.gray700}
              />
            </Pressable>
            {open ? (
              <View className="px-2 pb-4">
                {renderAnswerBlock(faq.answer, variant)}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function LicenseGuideVideo() {
  return (
    <View className="mb-4 -mx-4">
      <ProductYoutubePlayer youtubeUrl={LICENSE_GUIDE_YOUTUBE_URL} />
    </View>
  );
}

/** 직트럭 중개 소개 + 유튜브 + FAQ (Q 열 때 소개 자동 닫힘) */
export function LicenseGuidePanel({
  variant,
  faqs,
}: {
  variant: LicenseGuideVariant;
  faqs: LicenseGuideFaq[];
}) {
  const [introOpen, setIntroOpen] = useState(true);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const onToggleFaq = (index: number) => {
    const willOpen = openFaqId !== index;
    setOpenFaqId(willOpen ? index : null);
    if (willOpen) {
      setIntroOpen(false);
    } else {
      setIntroOpen(true);
    }
  };

  return (
    <>
      <LicenseGuideIntroCard
        variant={variant}
        open={introOpen}
        onToggle={() => setIntroOpen((v) => !v)}
      />
      <LicenseGuideVideo />
      <LicenseGuideFaqList
        variant={variant}
        faqs={faqs}
        openId={openFaqId}
        onToggleFaq={onToggleFaq}
      />
    </>
  );
}

// 하위 호환
export { LicenseGuideIntroCard, LicenseGuideFaqList };
