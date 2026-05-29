import React from "react";
import { Pressable, Text, type TextStyle } from "react-native";

type BasicButtonProps = {
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  fontSize?: number;
  height?: number;
  fontWeight?: TextStyle["fontWeight"];
  borderRadius?: number;
  onClick: () => void;
};

export const BasicButton = React.memo(function BasicButton({
  name,
  bgColor,
  borderColor,
  textColor,
  fontSize = 16,
  height = 48,
  fontWeight = "bold",
  borderRadius = 8,
  onClick,
}: BasicButtonProps) {
  return (
    <Pressable
      onPress={onClick}
      className="w-full items-center justify-center"
      style={{
        backgroundColor: bgColor,
        borderColor,
        borderWidth: 1,
        height,
        borderRadius,
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize,
          fontWeight,
        }}
      >
        {name}
      </Text>
    </Pressable>
  );
});
