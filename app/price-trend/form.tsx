import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";

import { PriceTrendSearchFormView } from "@/src/features/price-trend/PriceTrendSearchFormView";
import type { PriceTrendOriginData } from "@/src/features/price-trend/types";

export default function PriceTrendFormScreen() {
  const params = useLocalSearchParams<{ ownerName?: string; originData?: string }>();

  const originData = useMemo(() => {
    if (!params.originData) return undefined;
    try {
      return JSON.parse(params.originData) as PriceTrendOriginData;
    } catch {
      return undefined;
    }
  }, [params.originData]);

  return (
    <PriceTrendSearchFormView
      ownerName={params.ownerName}
      originData={originData}
    />
  );
}
