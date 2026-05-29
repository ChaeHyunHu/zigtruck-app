import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, type View as RNView } from "react-native";

import {
  DriveSpotlightOverlay,
  areSpotlightRectsEqual,
  type SpotlightRect,
} from "@/src/features/drive/components/DriveSpotlightOverlay";
import {
  getTutorialTooltipPlacement,
  TUTORIAL_STEP_DELAY_MS,
  type DriveTutorialStep,
} from "@/src/features/drive/driveTutorialSteps";
import { normalizeSpotlightRect } from "@/src/features/drive/measureSpotlightRect";

type DriveTutorialContextValue = {
  isActive: boolean;
  step: DriveTutorialStep | null;
  registerAnchorRef: (step: DriveTutorialStep, node: RNView | null) => void;
  requestMeasure: (step: DriveTutorialStep) => void;
};

const DriveTutorialContext = createContext<DriveTutorialContextValue | null>(
  null,
);

export function useDriveTutorial() {
  const ctx = useContext(DriveTutorialContext);
  if (!ctx) {
    throw new Error("useDriveTutorial must be used within DriveTutorialProvider");
  }
  return ctx;
}

export function useDriveTutorialOptional() {
  return useContext(DriveTutorialContext);
}

type DriveTutorialProviderProps = {
  isActive: boolean;
  step: DriveTutorialStep | null;
  onSkip: () => void;
  onHolePress?: () => void;
  tooltipContent: React.ReactNode;
  children: React.ReactNode;
};

const REMEASURE_MS = [0, 120, 280, 500];

/**
 * 웹 reactour: DOM selector → getBoundingClientRect, 단일 Tour 레이어.
 * RN: 동일 document 대신 **루트 View 기준 measureLayout** + **같은 트리 위 오버레이**(Modal 없음).
 */
export function DriveTutorialProvider({
  isActive,
  step,
  onSkip,
  onHolePress,
  tooltipContent,
  children,
}: DriveTutorialProviderProps) {
  const rootRef = useRef<RNView>(null);
  const anchorRefs = useRef(new Map<DriveTutorialStep, RNView>());
  const rectsRef = useRef<Partial<Record<DriveTutorialStep, SpotlightRect>>>({});
  const [displayRect, setDisplayRect] = useState<SpotlightRect | null>(null);

  const applyRect = useCallback(
    (targetStep: DriveTutorialStep, rect: SpotlightRect | null) => {
      if (rect) {
        rectsRef.current[targetStep] = rect;
      } else {
        delete rectsRef.current[targetStep];
      }
      if (step === targetStep) {
        setDisplayRect((prev) =>
          areSpotlightRectsEqual(prev, rect) ? prev : rect,
        );
      }
    },
    [step],
  );

  const measureStepRect = useCallback(
    (targetStep: DriveTutorialStep) => {
      const root = rootRef.current;
      const anchor = anchorRefs.current.get(targetStep);
      if (!root || !anchor) return;

      root.measure((_x, _y, rootWidth, rootHeight) => {
        const bounds = { width: rootWidth, height: rootHeight };
        anchor.measureLayout(
          root,
          (x, y, width, height) => {
            applyRect(
              targetStep,
              normalizeSpotlightRect(x, y, width, height, bounds),
            );
          },
          () => {
            anchor.measureInWindow((x, y, width, height) => {
              root.measureInWindow((rx, ry) => {
                applyRect(
                  targetStep,
                  normalizeSpotlightRect(
                    x - rx,
                    y - ry,
                    width,
                    height,
                    bounds,
                  ),
                );
              });
            });
          },
        );
      });
    },
    [applyRect],
  );

  const registerAnchorRef = useCallback(
    (targetStep: DriveTutorialStep, node: RNView | null) => {
      if (node) {
        anchorRefs.current.set(targetStep, node);
        if (isActive && step === targetStep) {
          requestAnimationFrame(() => measureStepRect(targetStep));
        }
      } else {
        anchorRefs.current.delete(targetStep);
      }
    },
    [isActive, measureStepRect, step],
  );

  const requestMeasure = useCallback(
    (targetStep: DriveTutorialStep) => {
      measureStepRect(targetStep);
    },
    [measureStepRect],
  );

  useEffect(() => {
    if (!isActive || step === null) {
      setDisplayRect(null);
      return;
    }
    setDisplayRect(rectsRef.current[step] ?? null);
    measureStepRect(step);
    const timers = REMEASURE_MS.map((ms) =>
      setTimeout(() => measureStepRect(step), ms),
    );
    const interval = setInterval(() => measureStepRect(step), 350);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [isActive, measureStepRect, step]);

  const value: DriveTutorialContextValue = {
    isActive,
    step,
    registerAnchorRef,
    requestMeasure,
  };

  return (
    <View
      ref={rootRef}
      style={styles.root}
      collapsable={false}
      onLayout={() => {
        if (isActive && step !== null) {
          measureStepRect(step);
        }
      }}
    >
      <DriveTutorialContext.Provider value={value}>
        {children}
      </DriveTutorialContext.Provider>
      {isActive && step !== null ? (
        <View style={styles.overlayHost} pointerEvents="box-none">
          <DriveSpotlightOverlay
            visible
            stepKey={step}
            rect={displayRect}
            tooltipPlacement={getTutorialTooltipPlacement(step)}
            holeCornerRadius={8}
            onHolePress={onHolePress}
            onSkip={onSkip}
          >
            {tooltipContent}
          </DriveSpotlightOverlay>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
});

export { TUTORIAL_STEP_DELAY_MS };
