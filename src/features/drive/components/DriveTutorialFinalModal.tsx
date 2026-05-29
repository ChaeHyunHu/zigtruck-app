import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { DRIVE_TUTORIAL_POPUP_IMAGE } from "@/src/features/drive/driveConstants";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function DriveTutorialFinalModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="배너 닫기"
        />
        <View style={styles.card} pointerEvents="box-none">
          <Image
            source={{ uri: DRIVE_TUTORIAL_POPUP_IMAGE }}
            style={styles.image}
            contentFit="cover"
          />
          <Pressable
            onPress={onClose}
            hitSlop={16}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 12,
    overflow: "hidden",
    zIndex: 10,
    elevation: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 5,
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 20,
    elevation: 12,
  },
});
