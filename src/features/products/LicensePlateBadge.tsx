import React from "react";
import { Text, View } from "react-native";

type Props = {
  truckNumber: string;
};

export function LicensePlateBadge({ truckNumber }: Props) {
  return (
    <View
      className="self-start rounded border-2 border-gray900 bg-[#ffe27a]"
      style={{ borderColor: "#1a1a1a" }}
    >
      <View
        className="m-0.5 rounded border border-gray900 px-[7px] py-1"
        style={{ borderColor: "#1a1a1a" }}
      >
        <Text className="text-[10px] font-bold text-gray900">
          {truckNumber}
        </Text>
      </View>
    </View>
  );
}
