import React from "react";
import { View } from "react-native";

type Props = {
  activeIndex: number;
  panels: React.ReactNode[];
};

/** 탭 전환 시 패널을 언마운트하지 않아 이미지가 다시 깜빡이지 않도록 유지 */
export function GuideTabPanels({ activeIndex, panels }: Props) {
  return (
    <>
      {panels.map((panel, index) => (
        <View
          key={index}
          style={{ display: index === activeIndex ? "flex" : "none" }}
        >
          {panel}
        </View>
      ))}
    </>
  );
}
