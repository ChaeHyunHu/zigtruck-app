import { Stack } from "expo-router";
import React from "react";

import { LicenseSearchProvider } from "@/src/features/license/LicenseSearchContext";
import { useAuth } from "@/src/hooks/useAuth";

export default function LicenseLayout() {
  const { memberId } = useAuth();
  const parsedMemberId =
    memberId !== undefined && memberId !== null ? Number(memberId) : null;

  return (
    <LicenseSearchProvider
      memberId={Number.isFinite(parsedMemberId) ? parsedMemberId : null}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </LicenseSearchProvider>
  );
}
