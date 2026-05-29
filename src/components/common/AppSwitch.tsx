import React from "react";
import { Switch, type SwitchProps } from "react-native";

import { appColors } from "@/src/constants/colors";

type Props = Omit<SwitchProps, "trackColor" | "thumbColor" | "ios_backgroundColor">;

/**
 * ON: 연한 파란 트랙 + primary 썸 / OFF: 회색 트랙 + 흰 썸 (웹·디자인 시안)
 */
export function AppSwitch({ value, ...rest }: Props) {
  return (
    <Switch
      value={value}
      trackColor={{
        false: appColors.switchTrackOff,
        true: appColors.switchTrackOn,
      }}
      thumbColor={value ? appColors.switchThumbOn : appColors.switchThumbOff}
      ios_backgroundColor={appColors.switchTrackOff}
      {...rest}
    />
  );
}
