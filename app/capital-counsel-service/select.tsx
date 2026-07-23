import React from "react";

import { SelectVehicleFromChatList } from "@/src/features/additional-services/components/SelectVehicleFromChatList";

export default function CapitalCounselSelectScreen() {
  return (
    <SelectVehicleFromChatList
      serviceType="capital-counsel-service"
      returnPath="/capital-counsel-service"
    />
  );
}
