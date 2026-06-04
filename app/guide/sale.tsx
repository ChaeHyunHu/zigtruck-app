import React, { useEffect, useMemo, useState } from "react";

import { GuideScreenShell } from "@/src/features/guide/components/GuideScreenShell";
import { GuideTabPanels } from "@/src/features/guide/components/GuideTabPanels";
import type { GuideTabItem } from "@/src/features/guide/components/GuideTabBar";
import { preloadGuideImages } from "@/src/features/guide/guideImageCache";
import {
  PreSaleCheckListPanel,
  SaleAfterCarePanel,
  SaleContractPanel,
  SalePlanPanel,
} from "@/src/features/guide/sale/SaleGuidePanels";

const TABS: GuideTabItem[] = [
  { key: "plan", title: "판매 계획", icon: "calendar-outline" },
  { key: "check", title: "체크 사항", icon: "cube-outline" },
  { key: "contract", title: "차량 계약", icon: "document-text-outline" },
  { key: "after", title: "사후 관리", icon: "people-outline" },
];

export default function SaleGuideScreen() {
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    void preloadGuideImages();
  }, []);

  const panels = useMemo(
    () => [
      <SalePlanPanel key="plan" />,
      <PreSaleCheckListPanel key="check" />,
      <SaleContractPanel key="contract" />,
      <SaleAfterCarePanel key="after" />,
    ],
    [],
  );

  return (
    <GuideScreenShell
      title="화물차 판매 가이드"
      tabs={TABS}
      tabIndex={tabIndex}
      onTabChange={setTabIndex}
    >
      <GuideTabPanels activeIndex={tabIndex} panels={panels} />
    </GuideScreenShell>
  );
}
