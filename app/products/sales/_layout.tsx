import { Stack } from "expo-router";

import { RegistrationExitGuardProvider } from "@/src/features/sell-car/registration/RegistrationExitGuard";
import { ProductRegistrationProvider } from "@/src/providers/ProductRegistrationProvider";

export default function ProductSalesLayout() {
  return (
    <ProductRegistrationProvider>
      <RegistrationExitGuardProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RegistrationExitGuardProvider>
    </ProductRegistrationProvider>
  );
}
