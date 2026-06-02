import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { RangeSlider } from "@/src/components/common/RangeSlider";
import { appColors } from "@/src/constants/colors";

type Props = {
  label: string;
  required?: boolean;
  min: number;
  max: number;
  valueMin: string;
  valueMax: string;
  unit?: string;
  step?: number;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
  onRangeCommit?: (low: number, high: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

const formatSliderValue = (value: number, step: number) => {
  if (step >= 1) return String(Math.round(value));
  const precision = String(step).split(".")[1]?.length ?? 1;
  return value.toFixed(precision);
};

export function FilterRangeSection({
  label,
  required,
  min,
  max,
  valueMin,
  valueMax,
  unit,
  step = 1,
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

  // 드래그 중 실시간 표시값 (커밋 전). 드래그가 아닐 땐 props와 동기화
  const draggingRef = useRef(false);
  const [displayMin, setDisplayMin] = useState(valueMin);
  const [displayMax, setDisplayMax] = useState(valueMax);

  useEffect(() => {
    if (!draggingRef.current) {
      setDisplayMin(valueMin);
      setDisplayMax(valueMax);
    }
  }, [valueMin, valueMax]);

  const parsedMin = Number(displayMin);
  const parsedMax = Number(displayMax);
  const hasInvalidRange =
    Number.isFinite(parsedMin) &&
    Number.isFinite(parsedMax) &&
    parsedMin > parsedMax;

  return (
    <View className="border-b border-gray200 px-4 py-5">
      <Text className="mb-4 text-[15px] font-bold text-gray900">
        {label}
        {required ? <Text className="font-normal text-red-500">(필수)</Text> : null}
      </Text>
      <View className="mb-4">
        <RangeSlider
          min={min}
          max={max}
          low={rangeLow}
          high={rangeHigh}
          step={step}
          onLowChange={() => {}}
          onHighChange={() => {}}
          onValuesChange={(lowVal, highVal) => {
            setDisplayMin(formatSliderValue(lowVal, step));
            setDisplayMax(formatSliderValue(highVal, step));
          }}
          onRangeChange={(lowVal, highVal) => {
            if (onRangeCommit) {
              onRangeCommit(lowVal, highVal);
              return;
            }
            onChangeMin(formatSliderValue(lowVal, step));
            onChangeMax(formatSliderValue(highVal, step));
          }}
          onDragStart={() => {
            draggingRef.current = true;
            onDragStart?.();
          }}
          onDragEnd={() => {
            draggingRef.current = false;
            onDragEnd?.();
          }}
        />
      </View>
      <View className="flex-row items-end">
        <View
          className={`flex-1 flex-row items-end border-b pb-1 ${
            hasInvalidRange ? "border-danger" : "border-gray400"
          }`}
        >
          <TextInput
            value={displayMin}
            onChangeText={(text) => {
              setDisplayMin(text);
              onChangeMin(text);
            }}
            keyboardType="numeric"
            style={{ flex: 1 }}
            className={`text-[16px] ${
              hasInvalidRange ? "text-danger" : "text-gray900"
            }`}
          />
          {unit ? (
            <Text className="ml-1 text-[14px] text-gray600">{unit}</Text>
          ) : null}
        </View>
        <Text className="mx-3 mb-1 text-[16px] text-gray700">~</Text>
        <View className="flex-1 flex-row items-end border-b border-gray400 pb-1">
          <TextInput
            value={displayMax}
            onChangeText={(text) => {
              setDisplayMax(text);
              onChangeMax(text);
            }}
            keyboardType="numeric"
            style={{ flex: 1 }}
            className="text-[16px] text-gray900"
          />
          {unit ? (
            <Text className="ml-1 text-[14px] text-gray600">{unit}</Text>
          ) : null}
        </View>
      </View>
      {hasInvalidRange ? (
        <Text className="mt-1.5 text-[12px] text-danger">
          최대값보다 작아야합니다.
        </Text>
      ) : null}
    </View>
  );
}

type LengthProps = {
  valueMin: string;
  valueMax: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
};

export function FilterLengthSection({
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: LengthProps) {
  const parsedMin = Number(valueMin);
  const parsedMax = Number(valueMax);
  const hasInvalidRange =
    Boolean(valueMin) &&
    Boolean(valueMax) &&
    Number.isFinite(parsedMin) &&
    Number.isFinite(parsedMax) &&
    parsedMin > parsedMax;

  return (
    <View className="border-b border-gray200 px-4 py-5">
      <Text className="mb-4 text-[15px] font-bold text-gray900">
        적재함 길이 (내측 사이즈)
      </Text>
      <View className="flex-row items-end">
        <View
          className={`flex-1 flex-row items-end border-b pb-1 ${
            hasInvalidRange ? "border-danger" : "border-gray400"
          }`}
        >
          <TextInput
            value={valueMin}
            onChangeText={onChangeMin}
            placeholder="최소 길이"
            placeholderTextColor={appColors.gray500}
            keyboardType="decimal-pad"
            style={{ flex: 1 }}
            className={`text-[16px] ${
              hasInvalidRange ? "text-danger" : "text-gray900"
            }`}
          />
          <Text className="ml-1 text-[14px] text-gray600">m</Text>
        </View>
        <Text className="mx-3 mb-1 text-[16px] text-gray700">~</Text>
        <View className="flex-1 flex-row items-end border-b border-gray400 pb-1">
          <TextInput
            value={valueMax}
            onChangeText={onChangeMax}
            placeholder="최대 길이"
            placeholderTextColor={appColors.gray500}
            keyboardType="decimal-pad"
            style={{ flex: 1 }}
            className="text-[16px] text-gray900"
          />
          <Text className="ml-1 text-[14px] text-gray600">m</Text>
        </View>
      </View>
      {hasInvalidRange ? (
        <Text className="mt-1.5 text-[12px] text-danger">
          최대값보다 작아야합니다.
        </Text>
      ) : null}
    </View>
  );
}

type RadioProps = {
  label: string;
  options: Array<{ code: string; label: string; count?: number }>;
  selectedCode?: string;
  onSelect: (code?: string) => void;
};

export function FilterRadioSection({
  label,
  options,
  selectedCode,
  onSelect,
}: RadioProps) {
  return (
    <View className="border-b border-gray200 px-4 py-5">
      <Text className="mb-4 text-[15px] font-bold text-gray900">{label}</Text>
      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => {
          const isActive = selectedCode === option.code;
          return (
            <PressableRadio
              key={option.code}
              label={option.label}
              active={isActive}
              onPress={() => {
                if (isActive) return;
                onSelect(option.code);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function PressableRadio({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const buttonClass = active
    ? "border-primary bg-primary-1"
    : "border-gray300 bg-white";
  const textClass = active
    ? "font-bold text-primary"
    : "font-medium text-gray800";
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[44px] min-w-[100px] flex-1 items-center justify-center rounded-lg border px-3 py-2 ${buttonClass}`}
    >
      <Text className={`text-[15px] ${textClass}`}>{label}</Text>
    </Pressable>
  );
}
