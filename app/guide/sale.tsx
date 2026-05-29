import React, { useMemo, useState } from "react";

import { GuideScreenShell } from "@/src/features/guide/components/GuideScreenShell";
import type { GuideTabItem } from "@/src/features/guide/components/GuideTabBar";
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

  const panel = useMemo(() => {
    switch (tabIndex) {
      case 0:
        return <SalePlanPanel />;
      case 1:
        return <PreSaleCheckListPanel />;
      case 2:
        return <SaleContractPanel />;
      case 3:
        return <SaleAfterCarePanel />;
      default:
        return <SalePlanPanel />;
    }
  }, [tabIndex]);

  return (
    <GuideScreenShell
      title="화물차 판매 가이드"
      tabs={TABS}
      tabIndex={tabIndex}
      onTabChange={setTabIndex}
    >
      {panel}
    </GuideScreenShell>
  );
}
