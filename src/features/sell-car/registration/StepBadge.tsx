import React from "react";
import { Text, View } from "react-native";

import { appColors } from "@/src/constants/colors";

export const StepBadge = React.memo(function StepBadge({ text }: { text: string }) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: "#E8F0FF" }}
    >
      <Text className="text-[13px] font-semibold" style={{ color: appColors.primary }}>
        {text}
      </Text>
    </View>
  );
});
