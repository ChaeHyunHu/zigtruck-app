import { Image } from "expo-image";
import React, { useCallback, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.75;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_RESET_THRESHOLD = 1.05;

type Props = {
  uri: string;
  isActive: boolean;
  recyclingKey: string;
  onZoomChange: (zoomed: boolean) => void;
};

export function ProductImageViewerZoomableImage({
  uri,
  isActive,
  recyclingKey,
  onZoomChange,
}: Props) {
  const notifyZoom = useCallback(
    (zoomed: boolean) => {
      onZoomChange(zoomed);
    },
    [onZoomChange],
  );

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const isZoomed = useSharedValue(false);

  const resetTransform = (notify = true) => {
    "worklet";
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    if (isZoomed.value) {
      isZoomed.value = false;
      if (notify) {
        runOnJS(notifyZoom)(false);
      }
    }
  };

  const setZoomed = (zoomed: boolean) => {
    "worklet";
    if (isZoomed.value === zoomed) return;
    isZoomed.value = zoomed;
    runOnJS(notifyZoom)(zoomed);
  };

  useEffect(() => {
    if (isActive) return;
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    isZoomed.value = false;
    onZoomChange(false);
  }, [isActive, onZoomChange]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(nextScale, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value < ZOOM_RESET_THRESHOLD) {
        resetTransform();
        return;
      }
      if (scale.value > MAX_SCALE) {
        scale.value = withTiming(MAX_SCALE);
        savedScale.value = MAX_SCALE;
      } else {
        savedScale.value = scale.value;
      }
      setZoomed(savedScale.value > ZOOM_RESET_THRESHOLD);
    });

  const panGesture = Gesture.Pan()
    .manualActivation(true)
    .maxPointers(1)
    .onTouchesMove((_event, state) => {
      if (scale.value > ZOOM_RESET_THRESHOLD) {
        state.activate();
      } else {
        state.fail();
      }
    })
    .onUpdate((event) => {
      if (scale.value <= ZOOM_RESET_THRESHOLD) return;
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd(() => {
      if (scale.value > ZOOM_RESET_THRESHOLD) {
        resetTransform();
        return;
      }
      scale.value = withTiming(2);
      savedScale.value = 2;
      setZoomed(true);
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.slide, animatedStyle]}>
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="contain"
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey}
          transition={0}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
});
