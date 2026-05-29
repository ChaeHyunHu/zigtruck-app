import { useCallback, useRef, useState } from "react";
import { View } from "react-native";

import type { SpotlightRect } from "@/src/features/drive/components/DriveSpotlightOverlay";
import { normalizeSpotlightRect } from "@/src/features/drive/measureSpotlightRect";

/** 레이아웃·시트 슬라이드 애니메이션 직후 measureInWindow가 안정되도록 대기 */
function afterLayoutFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  });
}

export function useMeasureTarget() {
  const ref = useRef<View>(null);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const measure = useCallback(async () => {
    await afterLayoutFrames();
    const node = ref.current;
    if (!node) return null;

    return new Promise<SpotlightRect | null>((resolve) => {
      node.measureInWindow((x, y, width, height) => {
        const next = normalizeSpotlightRect(x, y, width, height);
        if (next) setRect(next);
        resolve(next);
      });
    });
  }, []);

  return { ref, rect, measure, setRect };
}
