import React from "react";
import { Text, View } from "react-native";

import { RangeSlider } from "@/src/components/common/RangeSlider";
import { LabeledTextInput } from "@/src/features/additional-services/components/LabeledTextInput";

type Props = {
  label: string;
  min: number;
  max: number;
  valueMin: string;
  valueMax: string;
  unit?: string;
  step?: number;
  keyboardType?: "number-pad" | "decimal-pad";
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onRangeCommit: (low: number, high: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

const formatSliderValue = (value: number, step: number) => {
  if (step >= 1) return String(Math.round(value));
  const precision = String(step).split(".")[1]?.length ?? 1;
  return value.toFixed(precision);
};

export function LicenseSearchRangeSection({
  label,
  min,
  max,
  valueMin,
  valueMax,
  unit,
  step = 1,
  keyboardType = "number-pad",
  onChangeMin,
  onChangeMax,
  onRangeCommit,
  onDragStart,
  onDragEnd,
}: Props) {
  const minNum = Math.min(max, Math.max(min, Number(valueMin) || min));
  const maxNum = Math.min(max, Math.max(min, Number(valueMax) || max));
  const rangeLow = Math.min(minNum, maxNum);
  const rangeHigh = Math.max(minNum, maxNum);

  return (
    <View className="border-t border-gray300 px-4 pb-10 pt-7">
      <Text className="mb-4 text-[16px] font-semibold text-gray800">{label}</Text>
      <View className="mb-4">
        <RangeSlider
          min={min}
          max={max}
          low={rangeLow}
          high={rangeHigh}
          step={step}
          onLowChange={() => {}}
          onHighChange={() => {}}
          onRangeChange={(lowVal, highVal) => {
            onRangeCommit(lowVal, highVal);
            onChangeMin(formatSliderValue(lowVal, step));
            onChangeMax(formatSliderValue(highVal, step));
          }}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      </View>
      <View className="flex-row items-center">
        <View className="flex-1">
          <LabeledTextInput
            hideLabel
            label=""
            value={valueMin}
            keyboardType={keyboardType}
            unit={unit}
            onChangeText={onChangeMin}
          />
        </View>
        <Text className="mx-2 text-[16px] text-gray600">~</Text>
        <View className="flex-1">
          <LabeledTextInput
            hideLabel
            label=""
            value={valueMax}
            keyboardType={keyboardType}
            unit={unit}
            onChangeText={onChangeMax}
          />
        </View>
      </View>
    </View>
  );
}
