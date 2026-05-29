import React, { useMemo, useState } from "react";

import { GuideScreenShell } from "@/src/features/guide/components/GuideScreenShell";
import type { GuideTabItem } from "@/src/features/guide/components/GuideTabBar";
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

  const panel = useMemo(() => {
    switch (tabIndex) {
      case 0:
        return <PurchaseOnlinePanel />;
      case 1:
        return <PurchaseOfflinePanel />;
      case 2:
        return <PurchaseContractPanel />;
      default:
        return <PurchaseOnlinePanel />;
    }
  }, [tabIndex]);

  return (
    <GuideScreenShell
      title="화물차 구매 가이드"
      tabs={TABS}
      tabIndex={tabIndex}
      onTabChange={setTabIndex}
    >
      {panel}
    </GuideScreenShell>
  );
}
