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
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
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
  /**
   * 시트와 같은 native window 안(가장 위)에 그릴 중첩 시트(달력·주소검색 등).
   * 부모가 Modal이어도 자식 noModal 시트가 같은 window에 stacking되어
   * Modal-on-Modal 문제(자식이 안 열리거나 닫은 뒤 터치 먹통) 없이 동작한다.
   */
  nestedSheets?: React.ReactNode;
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
    nestedSheets,
  },
  ref,
) {
  const { height: windowHeight } = useWindowDimensions();
  const topDismissMinHeight = Math.max(56, minTopInset);
  // 폴더블/회전 대응: 모듈 로드시 한 번 캡처한 값 대신 실시간 창 높이를 사용
  const effectiveSheetHeight = Math.min(
    sheetHeight,
    (windowHeight || SCREEN_HEIGHT) - minTopInset,
  );
  const [isOnScreen, setIsOnScreen] = useState(false);
  const isClosingRef = useRef(false);
  const isOpeningRef = useRef(false);
  const openedAtRef = useRef(0);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(effectiveSheetHeight)).current;
  const insets = useAppSafeAreaInsets();
  // 닫기 애니메이션 도중 다시 열렸는지 판단용 (teardown 취소)
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  // noModal 시트: 마운트 후 시트 뷰가 실제 레이아웃된 뒤(onLayout) 슬라이드업을 1회 시작
  const openOnLayoutRef = useRef(false);

  useEffect(() => {
    if (!isOnScreen) {
      sheetTranslateY.setValue(effectiveSheetHeight);
      return;
    }
    // noModal 시트에 한해: 열려 있어야 하는데(visible) 열기/닫기 애니메이션 중이 아니면
    // 항상 0으로 고정. (예: 운행일지 DaySheet 에서 listsSettled 변경으로 sheetHeight 가
    // 바뀔 때 시트가 화면 밖에 stuck 되어 backdrop 만 보이는 현상 방지)
    // RN Modal 시트는 onShow 기반 애니메이션을 건드리지 않도록 제외한다.
    if (noModal && visible && !isOpeningRef.current && !isClosingRef.current) {
      sheetTranslateY.setValue(0);
    }
  }, [isOnScreen, visible, effectiveSheetHeight, sheetTranslateY, noModal]);

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
      // iOS: 키보드가 열린 채 시트/Modal이 닫히면 투명 레이어가 남아 화면 터치가
      // 막히는 현상 방지 — 닫기 시작 시 키보드를 내린다.
      Keyboard.dismiss();
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
        // 닫는 도중 다시 열렸다면(useLayoutEffect rising 분기가 isClosingRef 를 false 로
        // 리셋하고 새 open 을 시작) teardown 을 건너뛴다.
        if (!isClosingRef.current) {
          return;
        }
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
      // 실기기에서 슬라이드업이 묻혀 화면 밖에 stuck 되는 경우 방지 — 끝나면 0으로 보장
      if (visibleRef.current && !isClosingRef.current) {
        sheetTranslateY.setValue(0);
      }
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
        // 입력(키보드) 중에 시트가 새로 열리면 키보드를 내린다.
        // (input 포커스 상태에서 날짜·카테고리 등 다른 시트 여는 버튼을 누른 경우)
        Keyboard.dismiss();
      }
      isClosingRef.current = false;
      setIsOnScreen(true);
      if (rising) {
        if (noModal) {
          // noModal은 인라인 렌더. 마운트 직후 즉시 애니메이션을 시작하면 실기기에서
          // 네이티브 뷰 레이아웃 경합으로 슬라이드업이 묻히거나 끊겨
          // "올라왔다 사라졌다 다시 올라오는" 모션이 생긴다.
          // → 시트 뷰가 실제 레이아웃된 뒤(onLayout) 한 번만 슬라이드업을 시작한다.
          sheetTranslateY.setValue(effectiveSheetHeight);
          backdropOpacity.setValue(0);
          isOpeningRef.current = true;
          openOnLayoutRef.current = true;
        } else {
          // RN Modal은 마운트 경합(특히 모달 위 모달)으로 슬라이드업이 묻히므로
          // Modal onShow에서 애니메이션을 시작한다. 그 전까지는 시트를 화면 밖에 둔다.
          sheetTranslateY.setValue(effectiveSheetHeight);
          backdropOpacity.setValue(0);
        }
      }
      return;
    }

    if (wasVisible && isOnScreen && !isClosingRef.current) {
      runCloseAnimation();
    }
  }, [
    visible,
    isOnScreen,
    runCloseAnimation,
    runOpenAnimation,
    noModal,
    effectiveSheetHeight,
    sheetTranslateY,
    backdropOpacity,
  ]);

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
          onLayout={() => {
            // noModal 시트는 뷰가 실제 레이아웃된 이 시점에 슬라이드업을 1회 시작 (묻힘/더블모션 방지)
            if (openOnLayoutRef.current) {
              openOnLayoutRef.current = false;
              runOpenAnimation();
            }
          }}
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

      {/* 중첩 시트(달력·주소검색 등)는 각자 absolute 오버레이라 래퍼 없이 직접 렌더한다.
          (불필요한 full-screen 레이어가 폼의 X·저장 버튼 터치를 가리는 문제 방지) */}
      {nestedSheets}
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
      onShow={() => {
        // Modal이 실제 표시된 뒤 슬라이드업 시작 (Android 마운트 경합/모달 위 모달 대응)
        if (visible) runOpenAnimation();
      }}
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
  // 폴더블/회전 대응: 호출 시점의 실시간 창 높이 사용
  const screenHeight = Dimensions.get("window").height || SCREEN_HEIGHT;
  return Math.min(
    Math.round(screenHeight * ratio),
    screenHeight - topGap - bottomGap,
  );
}
