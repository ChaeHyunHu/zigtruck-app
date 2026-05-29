import React, { useEffect, useRef } from "react";
import { ScrollView } from "react-native";

import { Screen } from "@/src/components/common/Screen";
import { GuideTabBar, type GuideTabItem } from "@/src/features/guide/components/GuideTabBar";
import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

type Props = {
  title: string;
  tabs: GuideTabItem[];
  tabIndex: number;
  onTabChange: (index: number) => void;
  children: React.ReactNode;
};

export function GuideScreenShell({
  title,
  tabs,
  tabIndex,
  onTabChange,
  children,
}: Props) {
  const insets = useAppSafeAreaInsets();
  const scrollBottomPadding = Math.max(insets.bottom, 12) + 16;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [tabIndex]);

  return (
    <Screen variant="stack" className="flex-1 bg-white">
      <RegistrationHeader title={title} />
      <GuideTabBar tabs={tabs} value={tabIndex} onChange={onTabChange} />
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </Screen>
  );
}
