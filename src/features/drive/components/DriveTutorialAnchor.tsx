import React, { useCallback, useRef } from "react";
import { View, type ViewProps } from "react-native";

import { useDriveTutorialOptional } from "@/src/features/drive/driveTutorialContext";
import type { DriveTutorialStep } from "@/src/features/drive/driveTutorialSteps";

type DriveTutorialAnchorProps = ViewProps & {
  step: DriveTutorialStep;
  children: React.ReactNode;
};

/**
 * 웹 reactour `selector: '.add-drive-form-btn'` 등 — 해당 UI를 감싸고
 * Provider 루트 기준 measureLayout으로 hole 좌표를 맞춘다.
 */
export function DriveTutorialAnchor({
  step,
  children,
  style,
  ...rest
}: DriveTutorialAnchorProps) {
  const tutorial = useDriveTutorialOptional();
  const ref = useRef<View>(null);

  const attachRef = useCallback(
    (node: View | null) => {
      ref.current = node;
      tutorial?.registerAnchorRef(step, node);
    },
    [step, tutorial],
  );

  const onLayout = useCallback(() => {
    if (!tutorial?.isActive || tutorial.step !== step) return;
    tutorial.requestMeasure(step);
  }, [step, tutorial]);

  if (!tutorial) {
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <View
      ref={attachRef}
      collapsable={false}
      onLayout={onLayout}
      pointerEvents="box-none"
      style={style}
      {...rest}
    >
      {children}
    </View>
  );
}
