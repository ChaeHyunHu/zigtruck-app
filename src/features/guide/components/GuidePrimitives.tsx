import { type Href, router } from "expo-router";
import React from "react";
import { Dimensions, Linking, Pressable, Text, View } from "react-native";

import { RemoteImageWithSkeleton } from "@/src/components/common/RemoteImageWithSkeleton";

const GUIDE_IMAGE_BASE =
  "https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GUIDE_CONTENT_WIDTH = SCREEN_WIDTH - 32;
const GUIDE_COVER_HEIGHT = SCREEN_WIDTH / 2;
const GUIDE_INLINE_HEIGHT = GUIDE_CONTENT_WIDTH / 1.4;
const GUIDE_CONTRACT_HEIGHT = GUIDE_CONTENT_WIDTH / 0.72;

export const guideImages = {
  salePlanCover: `${GUIDE_IMAGE_BASE}/guide_sale_plan_cover.png`,
  preSaleChecklistCover: `${GUIDE_IMAGE_BASE}/guide_pre_sale_checklist_cover.png`,
  saleContractCover: `${GUIDE_IMAGE_BASE}/guide_sale_contract_cover.png`,
  saleAfterCareCover: `${GUIDE_IMAGE_BASE}/guide_sale_after_care_cover.png`,
  contractSample: `${GUIDE_IMAGE_BASE}/guide_contract_image.png`,
  onlineCover: `${GUIDE_IMAGE_BASE}/guide_online_cover.png`,
  online1: `${GUIDE_IMAGE_BASE}/guide_online_1.png`,
  online2: `${GUIDE_IMAGE_BASE}/guide_online_2.png`,
  online3: `${GUIDE_IMAGE_BASE}/guide_online_3.png`,
  offlineCover: `${GUIDE_IMAGE_BASE}/guide_offline_cover.png`,
  purchaseContractCover: `${GUIDE_IMAGE_BASE}/guide_purchase_contract_cover.png`,
} as const;

export function GuideCoverImage({ uri, alt }: { uri: string; alt?: string }) {
  return (
    <View
      className="w-full items-center justify-center overflow-hidden bg-white"
      accessibilityLabel={alt}
    >
      <RemoteImageWithSkeleton
        source={{ uri }}
        recyclingKey={uri}
        style={{ width: "100%", height: GUIDE_COVER_HEIGHT }}
        contentFit="contain"
        contentPosition="center"
        priority="high"
      />
    </View>
  );
}

export function GuideSection({
  children,
  bordered = true,
  className = "",
}: {
  children: React.ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <View
      className={`px-4 py-4 ${bordered ? "border-b-8 border-gray100" : ""} ${className}`}
    >
      {children}
    </View>
  );
}

export function GuideHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text className="py-4 text-[20px] font-semibold leading-[26px] text-gray800">
      {children}
    </Text>
  );
}

export function GuideParagraph({ children }: { children: React.ReactNode }) {
  return (
    <Text className="pb-8 text-[15px] leading-[28px] text-gray700">{children}</Text>
  );
}

export function GuideBulletList({ items }: { items: string[] }) {
  return (
    <View className="pb-8">
      {items.map((item) => (
        <Text
          key={item}
          className="text-[15px] leading-[28px] text-gray700"
        >
          {item}
        </Text>
      ))}
    </View>
  );
}

function GuideOrderedBody({ body }: { body: string }) {
  return (
    <Text className="mt-1 text-[15px] leading-[28px] text-gray700">{body}</Text>
  );
}

export function GuideOrderedBlock({
  items,
}: {
  items: { title: string; body?: string }[];
}) {
  return (
    <View>
      {items.map((item) => (
        <View key={item.title} className="pb-8">
          <Text className="text-[15px] leading-[28px] text-gray700">{item.title}</Text>
          {item.body ? <GuideOrderedBody body={item.body} /> : null}
        </View>
      ))}
    </View>
  );
}

export function GuideLink({ href, children }: { href: string; children: string }) {
  return (
    <Text
      className="text-[15px] leading-[24px] text-primary underline"
      onPress={() => {
        void Linking.openURL(href.trim());
      }}
    >
      {children}
    </Text>
  );
}

export function GuideInlineImage({ uri }: { uri: string }) {
  return (
    <RemoteImageWithSkeleton
      source={{ uri }}
      recyclingKey={uri}
      className="mb-4 w-full"
      style={{ width: "100%", height: GUIDE_INLINE_HEIGHT }}
      contentFit="contain"
    />
  );
}

/** 계약서 샘플 등 세로형 문서 — 화면 너비 기준으로 크게 표시 */
export function GuideContractSampleImage({ uri }: { uri: string }) {
  return (
    <View className="mb-4 w-full">
      <RemoteImageWithSkeleton
        source={{ uri }}
        recyclingKey={uri}
        style={{ width: "100%", height: GUIDE_CONTRACT_HEIGHT }}
        contentFit="contain"
        contentPosition="top center"
      />
    </View>
  );
}

export function GuideServiceLinks({
  links,
}: {
  links: { label: string; path: Href }[];
}) {
  return (
    <View className="pb-8">
      <Text className="mb-4 text-[12px] text-gray500">관련 서비스</Text>
      <View className="flex-row flex-wrap gap-2">
        {links.map((link) => (
          <Pressable
            key={link.label}
            onPress={() => router.push(link.path)}
            className="rounded-lg bg-gray100 px-4 py-2"
          >
            <Text className="text-[14px] text-gray700">{link.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function GuideEmphasis({ children }: { children: React.ReactNode }) {
  return <Text className="font-semibold text-gray800">{children}</Text>;
}

export function GuideAccent({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: "#E5484D" }}>{children}</Text>;
}

export function GuideNote({ children }: { children: React.ReactNode }) {
  return (
    <Text className="pb-8 text-[13px] leading-[22px] text-gray700">{children}</Text>
  );
}
