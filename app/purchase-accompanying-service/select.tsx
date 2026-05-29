import React from "react";

import { SelectVehicleFromChatList } from "@/src/features/additional-services/components/SelectVehicleFromChatList";

export default function PurchaseAccompanyingSelectScreen() {
  return (
    <SelectVehicleFromChatList
      serviceType="purchase-accompanying-service"
      returnPath="/purchase-accompanying-service"
    />
  );
}
