import { Dimensions, PixelRatio } from "react-native";

import type { SpotlightRect } from "@/src/features/drive/components/DriveSpotlightOverlay";

const roundPx = (value: number) => PixelRatio.roundToNearestPixel(value);

export function normalizeSpotlightRect(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds?: { width: number; height: number },
): SpotlightRect | null {
  const { width: maxW, height: maxH } = bounds ?? Dimensions.get("window");
  const next = {
    x: roundPx(x),
    y: roundPx(y),
    width: roundPx(width),
    height: roundPx(height),
  };
  if (
    next.width <= 0 ||
    next.height <= 0 ||
    !Number.isFinite(next.x) ||
    !Number.isFinite(next.y) ||
    next.x + next.width < 1 ||
    next.y + next.height < 1 ||
    next.x >= maxW + 8 ||
    next.y >= maxH + 8
  ) {
    return null;
  }
  return next;
}
