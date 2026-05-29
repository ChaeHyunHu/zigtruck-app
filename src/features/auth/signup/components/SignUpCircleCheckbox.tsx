import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { appColors } from '@/src/constants/colors';

type SignUpCircleCheckboxProps = {
  checked: boolean;
  onPress: () => void;
  accentColor?: string;
};

export function SignUpCircleCheckbox({
  checked,
  onPress,
  accentColor = appColors.primary,
}: SignUpCircleCheckboxProps) {
  return (
    <Pressable onPress={onPress} hitSlop={6} className="mr-2">
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={checked ? accentColor : appColors.gray400}
      />
    </Pressable>
  );
}

export function SignUpCheckboxRow({
  checked,
  onToggle,
  children,
  rightElement,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-start justify-between py-1">
      <Pressable onPress={onToggle} className="flex-1 flex-row items-start pr-2">
        <SignUpCircleCheckbox checked={checked} onPress={onToggle} />
        <View className="flex-1 pt-0.5">{children}</View>
      </Pressable>
      {rightElement}
    </View>
  );
}
