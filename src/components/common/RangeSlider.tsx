import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
  type PanResponderGestureState,
} from "react-native";

import { appColors } from "@/src/constants/colors";

const THUMB_SIZE = 16;
const THUMB_HIT = 44;

type Props = {
  min: number;
  max: number;
  low: number;
  high: number;
  step?: number;
  onLowChange: (value: number) => void;
  onHighChange: (value: number) => void;
  onRangeChange?: (low: number, high: number) => void;
  /** 드래그 중 실시간 값 변화 (커밋 전) */
  onValuesChange?: (low: number, high: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

const clamp = (value: number, lower: number, upper: number) =>
  Math.min(upper, Math.max(lower, value));

const snapToStep = (value: number, min: number, max: number, step: number) => {
  const stepped = Math.round(value / step) * step;
  const precision = step < 1 ? String(step).split(".")[1]?.length ?? 1 : 0;
  return clamp(Number(stepped.toFixed(precision)), min, max);
};

const toPosition = (
  value: number,
  min: number,
  max: number,
  trackWidth: number,
) => {
  if (trackWidth <= 0 || max === min) return 0;
  return ((value - min) / (max - min)) * trackWidth;
};

const toValue = (
  position: number,
  min: number,
  max: number,
  trackWidth: number,
  step: number,
) => {
  if (trackWidth <= 0) return min;
  const ratio = clamp(position / trackWidth, 0, 1);
  return snapToStep(min + ratio * (max - min), min, max, step);
};

export function RangeSlider({
  min,
  max,
  low,
  high,
  step = 1,
  onLowChange,
  onHighChange,
  onRangeChange,
  onValuesChange,
  onDragStart,
  onDragEnd,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);
  const [dragDx, setDragDx] = useState(0);
  const [localLow, setLocalLow] = useState(low);
  const [localHigh, setLocalHigh] = useState(high);

  const startValueRef = useRef(0);
  const startLeftRef = useRef(0);
  const localLowRef = useRef(low);
  const localHighRef = useRef(high);
  const draggingRef = useRef<"low" | "high" | null>(null);

  const dataRef = useRef({
    min,
    max,
    step,
    trackWidth: 0,
    onLowChange,
    onHighChange,
    onRangeChange,
    onValuesChange,
    onDragStart,
    onDragEnd,
  });

  localLowRef.current = localLow;
  localHighRef.current = localHigh;
  draggingRef.current = dragging;
  dataRef.current = {
    min,
    max,
    step,
    trackWidth,
    onLowChange,
    onHighChange,
    onRangeChange,
    onValuesChange,
    onDragStart,
    onDragEnd,
  };

  useEffect(() => {
    if (!draggingRef.current) {
      setLocalLow(low);
      setLocalHigh(high);
    }
  }, [high, low]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const resetDragState = () => {
    draggingRef.current = null;
    setDragging(null);
    setDragDx(0);
    dataRef.current.onDragEnd?.();
  };

  const commitAfterRelease = () => {
    resetDragState();
    requestAnimationFrame(() => {
      const lo = Math.min(localLowRef.current, localHighRef.current);
      const hi = Math.max(localLowRef.current, localHighRef.current);
      if (dataRef.current.onRangeChange) {
        dataRef.current.onRangeChange(lo, hi);
      } else {
        dataRef.current.onLowChange(lo);
        dataRef.current.onHighChange(hi);
      }
    });
  };

  const moveThumb = (type: "low" | "high", gesture: PanResponderGestureState) => {
    const data = dataRef.current;
    const width = data.trackWidth;
    if (width <= 0) return;

    const startPos = toPosition(startValueRef.current, data.min, data.max, width);
    const nextValue = clamp(
      toValue(startPos + gesture.dx, data.min, data.max, width, data.step),
      data.min,
      data.max,
    );

    setDragDx(gesture.dx);

    if (type === "low") {
      localLowRef.current = nextValue;
      setLocalLow(nextValue);
    } else {
      localHighRef.current = nextValue;
      setLocalHigh(nextValue);
    }

    const lo = Math.min(localLowRef.current, localHighRef.current);
    const hi = Math.max(localLowRef.current, localHighRef.current);
    data.onValuesChange?.(lo, hi);
  };

  const lowResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          startValueRef.current = localLowRef.current;
          startLeftRef.current = toPosition(
            localLowRef.current,
            dataRef.current.min,
            dataRef.current.max,
            dataRef.current.trackWidth,
          );
          draggingRef.current = "low";
          setDragDx(0);
          setDragging("low");
          dataRef.current.onDragStart?.();
        },
        onPanResponderMove: (_, gesture) => moveThumb("low", gesture),
        onPanResponderRelease: () => commitAfterRelease(),
        onPanResponderTerminate: () => resetDragState(),
      }),
    [],
  );

  const highResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: () => {
          startValueRef.current = localHighRef.current;
          startLeftRef.current = toPosition(
            localHighRef.current,
            dataRef.current.min,
            dataRef.current.max,
            dataRef.current.trackWidth,
          );
          draggingRef.current = "high";
          setDragDx(0);
          setDragging("high");
          dataRef.current.onDragStart?.();
        },
        onPanResponderMove: (_, gesture) => moveThumb("high", gesture),
        onPanResponderRelease: () => commitAfterRelease(),
        onPanResponderTerminate: () => resetDragState(),
      }),
    [],
  );

  const lowThumbLeft = toPosition(localLow, min, max, trackWidth);
  const highThumbLeft = toPosition(localHigh, min, max, trackWidth);
  const barLeft = Math.min(lowThumbLeft, highThumbLeft);
  const barWidth = Math.abs(highThumbLeft - lowThumbLeft);

  const lowThumbBaseLeft =
    dragging === "low" ? startLeftRef.current : lowThumbLeft;
  const highThumbBaseLeft =
    dragging === "high" ? startLeftRef.current : highThumbLeft;

  const lowThumbStyle = [
    styles.thumbHit,
    {
      left: lowThumbBaseLeft - THUMB_HIT / 2,
      zIndex: dragging === "low" ? 2 : localLow >= localHigh ? 1 : 0,
    },
    dragging === "low" ? { transform: [{ translateX: dragDx }] } : null,
  ];

  const highThumbStyle = [
    styles.thumbHit,
    {
      left: highThumbBaseLeft - THUMB_HIT / 2,
      zIndex: dragging === "high" ? 2 : localHigh >= localLow ? 1 : 0,
    },
    dragging === "high" ? { transform: [{ translateX: dragDx }] } : null,
  ];

  return (
    <View style={styles.trackContainer} onLayout={onTrackLayout}>
      <View style={styles.track}>
        <View
          style={[
            styles.activeTrack,
            { left: barLeft, width: barWidth },
          ]}
        />
      </View>

      <View {...lowResponder.panHandlers} style={lowThumbStyle}>
        <View style={styles.thumb} />
      </View>

      <View {...highResponder.panHandlers} style={highThumbStyle}>
        <View style={styles.thumb} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  trackContainer: {
    height: 44,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: appColors.gray300,
  },
  activeTrack: {
    position: "absolute",
    height: 4,
    borderRadius: 999,
    backgroundColor: appColors.primary,
  },
  thumbHit: {
    position: "absolute",
    width: THUMB_HIT,
    height: THUMB_HIT,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    borderColor: appColors.white,
    backgroundColor: appColors.primary,
  },
});
