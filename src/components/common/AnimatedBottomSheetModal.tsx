import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

/** @see BottomSheet — 앱에서는 BottomSheet 컴포넌트를 사용하세요 */
const SCREEN_HEIGHT = Dimensions.get("window").height;
const CLOSE_EASING = Easing.out(Easing.cubic);
const CLOSE_DURATION = 280;
const OPEN_GUARD_MS = 500;

type AnimatedBottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  sheetHeight: number;
  children: React.ReactNode;
  /** 시트 위쪽 딤 영역 탭 시 닫기 (상단 여백) */
  topDismissArea?: boolean;
  /** 시트 위에 확보할 최소 높이(상태바·배경 헤더 노출) */
  minTopInset?: number;
  sheetStyle?: StyleProp<ViewStyle>;
  /** false면 backdrop dim을 그리지 않음 (시트 누적 시 아래 시트는 dim 끔) */
  showBackdrop?: boolean;
  /**
   * true면 RN Modal로 감싸지 않고 부모 컨테이너 안에 absoluteFill로 렌더.
   * 여러 시트가 같은 native window 안에서 stacking되어 Modal 전환 깜빡임이 사라진다.
   */
  noModal?: boolean;
  /** noModal stacking 시 z-index (기본 1001) */
  overlayZIndex?: number;
  /**
   * Modal 안 root 위에 absolute로 그릴 추가 오버레이.
   * 튜토리얼 spotlight처럼 시트와 같은 native window에서 가장 위에 그려야 하는 경우 사용.
   */
  tutorialOverlay?: React.ReactNode;
};

export type AnimatedBottomSheetModalRef = {
  dismiss: () => void;
};

export const AnimatedBottomSheetModal = forwardRef<
  AnimatedBottomSheetModalRef,
  AnimatedBottomSheetModalProps
>(function AnimatedBottomSheetModal(
  {
    visible,
    onClose,
    sheetHeight,
    children,
    topDismissArea = true,
    minTopInset = 0,
    sheetStyle,
    showBackdrop = true,
    noModal = false,
    overlayZIndex = 1001,
    tutorialOverlay,
  },
  ref,
) {
  const topDismissMinHeight = Math.max(56, minTopInset);
  const effectiveSheetHeight = Math.min(sheetHeight, SCREEN_HEIGHT - minTopInset);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const isClosingRef = useRef(false);
  const isOpeningRef = useRef(false);
  const openedAtRef = useRef(0);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(effectiveSheetHeight)).current;
  const insets = useAppSafeAreaInsets();

  useEffect(() => {
    if (!isOnScreen) {
      sheetTranslateY.setValue(effectiveSheetHeight);
    }
  }, [isOnScreen, effectiveSheetHeight, sheetTranslateY]);

  const completeClose = useCallback(
    (afterClose?: () => void) => {
      sheetTranslateY.setValue(effectiveSheetHeight);
      backdropOpacity.setValue(0);
      isOpeningRef.current = false;
      isClosingRef.current = false;
      setIsOnScreen(false);
      afterClose?.();
    },
    [backdropOpacity, effectiveSheetHeight, sheetTranslateY],
  );

  const runCloseAnimation = useCallback(
    (afterClose?: () => void) => {
      if (isClosingRef.current || !isOnScreen) {
        afterClose?.();
        return;
      }
      isClosingRef.current = true;

      // 닫을 때: 시트 슬라이드 다운과 backdrop fade-out을 함께 → 깜빡임 없음
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: CLOSE_DURATION,
          easing: CLOSE_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: effectiveSheetHeight,
          duration: CLOSE_DURATION,
          easing: CLOSE_EASING,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        completeClose(finished ? afterClose : undefined);
        if (!finished) {
          afterClose?.();
        }
      });
    },
    [
      completeClose,
      isOnScreen,
      effectiveSheetHeight,
      sheetTranslateY,
      backdropOpacity,
    ],
  );

  const prevVisibleRef = useRef(false);

  const runOpenAnimation = useCallback(() => {
    sheetTranslateY.setValue(effectiveSheetHeight);
    isOpeningRef.current = true;

    const completeOpen = () => {
      isOpeningRef.current = false;
    };

    const sheetAnim = Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    if (showBackdrop) {
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        sheetAnim,
      ]).start(completeOpen);
      return;
    }

    sheetAnim.start(completeOpen);
  }, [backdropOpacity, effectiveSheetHeight, sheetTranslateY, showBackdrop]);

  useLayoutEffect(() => {
    const wasVisible = prevVisibleRef.current;
    const rising = visible && !wasVisible;
    prevVisibleRef.current = visible;

    if (visible) {
      if (rising) {
        openedAtRef.current = Date.now();
      }
      isClosingRef.current = false;
      setIsOnScreen(true);
      if (rising) {
        runOpenAnimation();
      }
      return;
    }

    if (wasVisible && isOnScreen && !isClosingRef.current) {
      runCloseAnimation();
    }
  }, [visible, isOnScreen, runCloseAnimation, runOpenAnimation]);

  const requestClose = useCallback(() => {
    // 오픈 직후 같은 탭 이벤트가 backdrop/top-dismiss로 전달되며 즉시 닫히는 깜빡임 방지
    if (isOpeningRef.current) {
      return;
    }
    if (visible && Date.now() - openedAtRef.current < OPEN_GUARD_MS) {
      return;
    }
    runCloseAnimation(onClose);
  }, [onClose, runCloseAnimation, visible]);

  useImperativeHandle(ref, () => ({ dismiss: requestClose }), [requestClose]);

  const shouldRender = visible || isOnScreen;
  if (!shouldRender) return null;

  const interactive = visible && !isClosingRef.current;

  // noModal: 닫힌 뒤 Android에서 elevation 잔여 레이어가 터치를 막는 문제 방지
  if (noModal && !interactive) {
    return null;
  }

  // noModal: 상태바 영역만 확장. 하단은 시스템 네비와 겹치지 않게 bottom: 0 유지.
  const noModalRootStyle: ViewStyle = {
    position: "absolute",
    top: -insets.top,
    left: -insets.left,
    right: -insets.right,
    bottom: 0,
    zIndex: overlayZIndex,
    elevation: overlayZIndex,
  };

  const inner = (
    <View
      style={noModal ? noModalRootStyle : styles.root}
      pointerEvents={interactive ? "box-none" : "none"}
    >
      {showBackdrop ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable
            style={styles.backdropPressable}
            onPress={requestClose}
          />
        </Animated.View>
      ) : null}

      <View style={styles.sheetContainer} pointerEvents="box-none">
        {topDismissArea ? (
          <Pressable
            style={[styles.topDismiss, { minHeight: topDismissMinHeight }]}
            onPress={requestClose}
          />
        ) : (
          <View
            style={[styles.topDismiss, { minHeight: topDismissMinHeight }]}
            pointerEvents="none"
          />
        )}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: effectiveSheetHeight,
              transform: [{ translateY: sheetTranslateY }],
            },
            sheetStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>

      {tutorialOverlay ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          {tutorialOverlay}
        </View>
      ) : null}
    </View>
  );

  // noModal: 부모 컨테이너 안에 absoluteFill로 그려 native Modal 전환 없이 stacking.
  if (noModal) return inner;

  return (
    <Modal
      visible={isOnScreen}
      transparent
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={requestClose}
    >
      {inner}
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  absoluteRoot: {
    ...StyleSheet.absoluteFillObject,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContainer: {
    flex: 1,
  },
  topDismiss: {
    flex: 1,
    minHeight: 56,
  },
  sheet: {
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export function getDefaultBottomSheetHeight(
  ratio = 0.88,
  topGap = 48,
  bottomGap = 0,
) {
  return Math.min(
    Math.round(SCREEN_HEIGHT * ratio),
    SCREEN_HEIGHT - topGap - bottomGap,
  );
}
