import React from "react";

import { SelectVehicleFromChatList } from "@/src/features/additional-services/components/SelectVehicleFromChatList";

export default function TransferAgencySelectScreen() {
  return (
    <SelectVehicleFromChatList
      serviceType="transfer-agency-service"
      returnPath="/transfer-agency-service"
    />
  );
}
