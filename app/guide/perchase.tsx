import React, { useEffect, useMemo, useState } from "react";

import { GuideScreenShell } from "@/src/features/guide/components/GuideScreenShell";
import { GuideTabPanels } from "@/src/features/guide/components/GuideTabPanels";
import type { GuideTabItem } from "@/src/features/guide/components/GuideTabBar";
import { preloadGuideImages } from "@/src/features/guide/guideImageCache";
import {
  PurchaseContractPanel,
  PurchaseOfflinePanel,
  PurchaseOnlinePanel,
} from "@/src/features/guide/purchase/PurchaseGuidePanels";

const TABS: GuideTabItem[] = [
  { key: "online", title: "온라인", icon: "globe-outline" },
  { key: "offline", title: "오프라인", icon: "bus-outline" },
  { key: "contract", title: "차량 계약", icon: "document-text-outline" },
];

export default function PurchaseGuideScreen() {
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    void preloadGuideImages();
  }, []);

  const panels = useMemo(
    () => [
      <PurchaseOnlinePanel key="online" />,
      <PurchaseOfflinePanel key="offline" />,
      <PurchaseContractPanel key="contract" />,
    ],
    [],
  );

  return (
    <GuideScreenShell
      title="화물차 구매 가이드"
      tabs={TABS}
      tabIndex={tabIndex}
      onTabChange={setTabIndex}
    >
      <GuideTabPanels activeIndex={tabIndex} panels={panels} />
    </GuideScreenShell>
  );
}
