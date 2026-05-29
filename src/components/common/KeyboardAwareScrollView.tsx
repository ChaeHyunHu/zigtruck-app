import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useAppSafeAreaInsets } from "@/src/hooks/useAppSafeAreaInsets";

type KeyboardAwareScrollViewProps = ScrollViewProps & {
  /** 키보드 가시 영역 계산용(고정 푸터 높이) */
  footerInset?: number;
  extraKeyboardSpace?: number;
  /** 키보드 닫힘 시 스크롤 콘텐츠 하단 여백 */
  restingBottomPadding?: number;
  /** true: 푸터가 스크롤 밖(형제)일 때 footerInset을 콘텐츠 패딩에 더하지 않음 */
  stackedFooter?: boolean;
};

type KeyboardAwareScrollContextValue = {
  ensureInputVisible: (node: View | null) => void;
  isKeyboardVisible: boolean;
};

const KeyboardAwareScrollContext = createContext<KeyboardAwareScrollContextValue | null>(
  null,
);

export function useKeyboardAwareScroll() {
  return useContext(KeyboardAwareScrollContext);
}

const SCROLL_TOLERANCE = 4;

function getKeyboardScrollPadding(
  keyboardHeight: number,
  keyboardTop: number,
  footerInset: number,
  bottomInset: number,
): number {
  if (keyboardHeight <= 0) return 0;

  const windowHeight = Dimensions.get("window").height;
  const footerTop = windowHeight - footerInset - bottomInset;
  const resolvedKeyboardTop =
    keyboardTop > 0 ? keyboardTop : windowHeight - keyboardHeight;

  const scrollViewportOverlap = Math.max(0, footerTop - resolvedKeyboardTop);
  const overlapPadding = scrollViewportOverlap + 16;
  // 하단 필드(연료·가변축 등)까지 스크롤 가능한 최소 여유
  const minScrollPadding = Math.max(0, keyboardHeight - footerInset);
  return Math.max(overlapPadding, minScrollPadding);
}

export const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(
  function KeyboardAwareScrollView(
    {
      children,
      contentContainerStyle,
      keyboardShouldPersistTaps = "handled",
      footerInset = 0,
      extraKeyboardSpace = 36,
      restingBottomPadding = 8,
      stackedFooter = false,
      onScroll: onScrollProp,
      ...scrollProps
    },
    ref,
  ) {
    const insets = useAppSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const scrollWrapperRef = useRef<View>(null);
    const scrollYRef = useRef(0);
    const keyboardHeightRef = useRef(0);
    const keyboardTopRef = useRef(0);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardTop, setKeyboardTop] = useState(0);

    useImperativeHandle(ref, () => scrollRef.current as ScrollView);

    const getVisibleBottom = useCallback(() => {
      const windowHeight = Dimensions.get("window").height;
      const footerTop = windowHeight - footerInset - insets.bottom;

      if (keyboardHeightRef.current > 0) {
        const resolvedKeyboardTop =
          keyboardTopRef.current > 0
            ? keyboardTopRef.current
            : windowHeight - keyboardHeightRef.current;
        return Math.min(resolvedKeyboardTop, footerTop) - extraKeyboardSpace;
      }

      return footerTop - extraKeyboardSpace;
    }, [extraKeyboardSpace, footerInset, insets.bottom]);

    const ensureInputVisible = useCallback(
      (node: View | null) => {
        if (!node || !scrollRef.current || !scrollWrapperRef.current) {
          return;
        }
        if (keyboardHeightRef.current <= 0) return;

        requestAnimationFrame(() => {
          node.measureInWindow((_px, pageY, _pw, ph) => {
            const visibleBottom = getVisibleBottom();
            const overflow = pageY + ph - visibleBottom;
            if (overflow <= SCROLL_TOLERANCE) return;

            const targetScrollY = Math.max(0, scrollYRef.current + overflow);
            scrollYRef.current = targetScrollY;
            scrollRef.current?.scrollTo({ y: targetScrollY, animated: true });
          });
        });
      },
      [getVisibleBottom],
    );

    useEffect(() => {
      const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
      const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

      const showSub = Keyboard.addListener(showEvent, (event) => {
        keyboardHeightRef.current = event.endCoordinates.height;
        keyboardTopRef.current = event.endCoordinates.screenY;
        setKeyboardHeight(event.endCoordinates.height);
        setKeyboardTop(event.endCoordinates.screenY);
      });
      const hideSub = Keyboard.addListener(hideEvent, () => {
        keyboardHeightRef.current = 0;
        keyboardTopRef.current = 0;
        setKeyboardHeight(0);
        setKeyboardTop(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, []);

    const onScroll = useCallback(
      (event: Parameters<NonNullable<ScrollViewProps["onScroll"]>>[0]) => {
        scrollYRef.current = event.nativeEvent.contentOffset.y;
        onScrollProp?.(event);
      },
      [onScrollProp],
    );

    const keyboardScrollPadding = useMemo(
      () => getKeyboardScrollPadding(keyboardHeight, keyboardTop, footerInset, insets.bottom),
      [footerInset, insets.bottom, keyboardHeight, keyboardTop],
    );

    const bottomPadding =
      restingBottomPadding +
      keyboardScrollPadding +
      (stackedFooter ? 0 : footerInset);

    const mergedContentStyle: StyleProp<ViewStyle> = [
      contentContainerStyle,
      { paddingBottom: bottomPadding },
    ];

    const contextValue: KeyboardAwareScrollContextValue = {
      ensureInputVisible,
      isKeyboardVisible: keyboardHeight > 0,
    };

    return (
      <KeyboardAwareScrollContext.Provider value={contextValue}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View ref={scrollWrapperRef} className="flex-1" collapsable={false}>
            <ScrollView
              ref={scrollRef}
              {...scrollProps}
              onScroll={onScroll}
              scrollEventThrottle={scrollProps.scrollEventThrottle ?? 16}
              keyboardShouldPersistTaps={keyboardShouldPersistTaps}
              keyboardDismissMode="on-drag"
              contentContainerStyle={mergedContentStyle}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </KeyboardAwareScrollContext.Provider>
    );
  },
);
