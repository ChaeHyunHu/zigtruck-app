import { Stack } from "expo-router";

import { ProductRegistrationProvider } from "@/src/providers/ProductRegistrationProvider";

export default function ProductSalesLayout() {
  return (
    <ProductRegistrationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProductRegistrationProvider>
  );
}
