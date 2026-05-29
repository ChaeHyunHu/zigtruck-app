import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

import { DRIVE_SCREEN_HEADER_HEIGHT } from "@/src/features/drive/useDriveSheetHeight";
import type {
  DriveTutorialStep,
  DriveTutorialTooltipPlacement,
} from "@/src/features/drive/driveTutorialSteps";

export type SpotlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function areSpotlightRectsEqual(
  a: SpotlightRect | null | undefined,
  b: SpotlightRect | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height
  );
}

type DriveSpotlightOverlayProps = {
  visible: boolean;
  /** 스텝이 바뀌면 hole을 이전 위치에서 스프링하지 않고 즉시 맞춤 */
  stepKey?: DriveTutorialStep | null;
  rect: SpotlightRect | null;
  tooltipPlacement?: DriveTutorialTooltipPlacement;
  holeCornerRadius?: number;
  onHolePress?: () => void;
  onSkip: () => void;
  onDimPress?: () => void;
  children: React.ReactNode;
};

const OVERLAY_COLOR = "rgba(0, 0, 0, 0.65)";
const HOLE_PAD = 4;
const TOOLTIP_ESTIMATE_HEIGHT = 88;
const RECT_MOVE_CONFIG = {
  duration: 240,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: false,
};

export function DriveSpotlightOverlay({
  visible,
  stepKey = null,
  rect,
  tooltipPlacement = "above",
  holeCornerRadius = 8,
  onHolePress,
  onSkip,
  onDimPress,
  children,
}: DriveSpotlightOverlayProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useAppSafeAreaInsets();
  const dimSpread = Math.ceil(Math.max(screenW, screenH));

  const headerBottom = insets.top + DRIVE_SCREEN_HEADER_HEIGHT;
  const minTooltipTop = headerBottom + 8;

  const holeX = useRef(new Animated.Value(rect?.x ?? 0)).current;
  const holeY = useRef(new Animated.Value(rect?.y ?? 0)).current;
  const holeW = useRef(new Animated.Value(rect?.width ?? 0)).current;
  const holeH = useRef(new Animated.Value(rect?.height ?? 0)).current;
  const tooltipOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const dimOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const tooltipTopAnim = useRef(new Animated.Value(minTooltipTop)).current;
  const isFirstRectRef = useRef(true);
  const isFirstVisibleEffectRef = useRef(true);
  const prevRectRef = useRef<SpotlightRect | null>(null);
  const prevStepKeyRef = useRef(stepKey);
  const prevVisibleRef = useRef(visible);

  useEffect(() => {
    if (prevStepKeyRef.current !== stepKey) {
      prevStepKeyRef.current = stepKey;
      isFirstRectRef.current = true;
      prevRectRef.current = null;
    }
  }, [stepKey]);

  useEffect(() => {
    if (isFirstVisibleEffectRef.current) {
      isFirstVisibleEffectRef.current = false;
      dimOpacity.setValue(visible ? 1 : 0);
      tooltipOpacity.setValue(visible ? 1 : 0);
      prevVisibleRef.current = visible;
      return;
    }
    if (prevVisibleRef.current === visible) return;

    Animated.parallel([
      Animated.timing(dimOpacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 180 : 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(tooltipOpacity, {
        toValue: visible ? 1 : 0,
        duration: visible ? 200 : 140,
        delay: visible ? 60 : 0,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    prevVisibleRef.current = visible;
  }, [visible, tooltipOpacity, dimOpacity]);

  useEffect(() => {
    if (areSpotlightRectsEqual(rect, prevRectRef.current)) return;
    prevRectRef.current = rect;

    if (!rect) {
      isFirstRectRef.current = true;
      return;
    }

    const padY = rect.y - HOLE_PAD;
    const padH = rect.height + HOLE_PAD * 2;
    const placeAbove =
      tooltipPlacement === "above" || padY + padH > screenH * 0.62;
    const newTooltipTop = placeAbove
      ? Math.max(minTooltipTop, padY - TOOLTIP_ESTIMATE_HEIGHT - 14)
      : Math.min(
          Math.max(padY + padH + 14, minTooltipTop),
          screenH - TOOLTIP_ESTIMATE_HEIGHT - insets.bottom - 16,
        );

    if (isFirstRectRef.current) {
      isFirstRectRef.current = false;
      holeX.setValue(rect.x);
      holeY.setValue(rect.y);
      holeW.setValue(rect.width);
      holeH.setValue(rect.height);
      tooltipTopAnim.setValue(newTooltipTop);
      return;
    }

    Animated.parallel([
      Animated.timing(holeX, { toValue: rect.x, ...RECT_MOVE_CONFIG }),
      Animated.timing(holeY, { toValue: rect.y, ...RECT_MOVE_CONFIG }),
      Animated.timing(holeW, { toValue: rect.width, ...RECT_MOVE_CONFIG }),
      Animated.timing(holeH, { toValue: rect.height, ...RECT_MOVE_CONFIG }),
      Animated.timing(tooltipTopAnim, {
        toValue: newTooltipTop,
        ...RECT_MOVE_CONFIG,
      }),
    ]).start();
  }, [
    rect,
    holeX,
    holeY,
    holeW,
    holeH,
    tooltipTopAnim,
    tooltipPlacement,
    minTooltipTop,
    screenH,
    insets.bottom,
  ]);

  if (!visible) return null;

  const skipTop =
    insets.top + Math.round((DRIVE_SCREEN_HEADER_HEIGHT - 22) / 2);
  const hasHole = Boolean(rect);

  const holePadX = Animated.subtract(holeX, HOLE_PAD);
  const holePadY = Animated.subtract(holeY, HOLE_PAD);
  const holePadW = Animated.add(holeW, HOLE_PAD * 2);
  const holePadH = Animated.add(holeH, HOLE_PAD * 2);

  const dimFrameTop = Animated.subtract(holePadY, dimSpread);
  const dimFrameLeft = Animated.subtract(holePadX, dimSpread);
  const dimFrameWidth = Animated.add(holePadW, dimSpread * 2);
  const dimFrameHeight = Animated.add(holePadH, dimSpread * 2);

  const content = (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity: dimOpacity }]}
      pointerEvents="box-none"
    >
      {!hasHole ? (
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: OVERLAY_COLOR }]}
          onPress={onDimPress}
        />
      ) : (
        <>
          {/* 단일 border 프레임 → 4분할 dim 이동 시 틈·깜빡임 없음 */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: dimFrameTop,
              left: dimFrameLeft,
              width: dimFrameWidth,
              height: dimFrameHeight,
              borderWidth: dimSpread,
              borderColor: OVERLAY_COLOR,
              backgroundColor: "transparent",
              borderRadius: holeCornerRadius + HOLE_PAD,
            }}
          />
          {onDimPress ? (
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={onDimPress}
            />
          ) : null}
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: holePadY,
              left: holePadX,
              width: holePadW,
              height: holePadH,
              borderRadius: holeCornerRadius,
              borderWidth: 2,
              borderColor: "#FFFFFF",
            }}
          />
          {onHolePress ? (
            <Animated.View
              style={{
                position: "absolute",
                top: holePadY,
                left: holePadX,
                width: holePadW,
                height: holePadH,
                zIndex: 220,
              }}
            >
              <Pressable style={{ flex: 1 }} onPress={onHolePress} />
            </Animated.View>
          ) : null}
        </>
      )}

      <Pressable
        onPress={onSkip}
        hitSlop={12}
        style={{
          position: "absolute",
          top: skipTop,
          right: 16,
          zIndex: 230,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text className="text-[16px] font-medium text-white">건너뛰기</Text>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
      </Pressable>

      <Animated.View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: tooltipTopAnim,
          left: 16,
          right: 16,
          maxWidth: screenW - 32,
          zIndex: 225,
        }}
      >
        <Animated.View
          pointerEvents="box-none"
          style={{ opacity: tooltipOpacity }}
        >
          <View
            className="rounded-[10px] bg-gray900 px-5 py-4"
            pointerEvents="box-none"
          >
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );

  return content;
}
