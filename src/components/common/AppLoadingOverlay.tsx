import LottieView from "lottie-react-native";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

const APP_LOADING_ANIMATION = require("@/assets/animations/app-loading.json");

const LOTTIE_SIZE = 140;

type OverlayContentProps = {
  message?: string;
};

function OverlayContent({ message }: OverlayContentProps) {
  return (
    <>
      <View style={StyleSheet.absoluteFillObject} className="bg-black/75" />
      <View
        style={StyleSheet.absoluteFillObject}
        className="items-center justify-center px-6"
        pointerEvents="none"
      >
        <LottieView
          source={APP_LOADING_ANIMATION}
          autoPlay
          loop
          style={{ width: LOTTIE_SIZE, height: LOTTIE_SIZE }}
        />
        {message ? (
          <Text className="mt-4 text-center text-[15px] leading-[22px] text-white">
            {message}
          </Text>
        ) : null}
      </View>
    </>
  );
}

type Props = OverlayContentProps & {
  visible: boolean;
  /** true면 현재 화면 위 절대 위치 오버레이, false면 전역 Modal */
  embedded?: boolean;
};

/** 페이지 위 검정 오버레이 + Lottie 로딩 */
export function AppLoadingOverlay({
  visible,
  message,
  embedded = false,
}: Props) {
  if (!visible) return null;

  if (embedded) {
    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="auto">
        <OverlayContent message={message} />
      </View>
    );
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.modalRoot} pointerEvents="auto">
        <OverlayContent message={message} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
});
