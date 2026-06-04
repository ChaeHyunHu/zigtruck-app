import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const SHIMMER_BAND_WIDTH = 140;

type Props = {
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function ShimmerSkeleton({ style, className }: Props) {
  const translateX = useRef(new Animated.Value(-SHIMMER_BAND_WIDTH)).current;

  useEffect(() => {
    translateX.setValue(-SHIMMER_BAND_WIDTH);
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 480,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <View style={[styles.base, style]} className={className}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmerTrack,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0)",
            "rgba(255,255,255,0.55)",
            "rgba(255,255,255,0)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.shimmerBand}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#D1D5DB",
    overflow: "hidden",
  },
  shimmerTrack: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SHIMMER_BAND_WIDTH,
  },
  shimmerBand: {
    flex: 1,
    width: SHIMMER_BAND_WIDTH,
  },
});
