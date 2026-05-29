import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { appColors } from '@/src/constants/colors';
import {
  extractIntentFallbackUrl,
  getSocialAuthUrl,
  isOAuthCallbackUrl,
  parseCallbackUrl,
  type SocialLoginResult,
} from '@/src/features/auth/socialLogin';

type SocialLoginWebViewProps = {
  provider: 'kakao' | 'naver' | null;
  onClose: () => void;
  onResult: (result: SocialLoginResult) => void;
};

const EXTERNAL_SCHEMES = ['kakaotalk://', 'kakaokompassauth://', 'naversearchapp://'];

export function SocialLoginWebView({ provider, onClose, onResult }: SocialLoginWebViewProps) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const handledCallbackRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const authUrl = useMemo(() => {
    if (!provider) {
      return '';
    }
    try {
      return getSocialAuthUrl(provider);
    } catch (error: any) {
      return '';
    }
  }, [provider]);

  useEffect(() => {
    handledCallbackRef.current = false;
    setAuthError('');
    setIsLoading(true);
  }, [provider, authUrl]);

  const finishWithResult = useCallback(
    (result: SocialLoginResult) => {
      if (handledCallbackRef.current && result.type === 'success') {
        return;
      }
      if (result.type === 'success' || result.type === 'error') {
        handledCallbackRef.current = true;
      }
      onResult(result);
      onClose();
    },
    [onClose, onResult],
  );

  const handleUrl = useCallback(
    (url: string): boolean => {
      if (isOAuthCallbackUrl(url)) {
        finishWithResult(parseCallbackUrl(url));
        return false;
      }

      if (Platform.OS === 'android' && url.startsWith('intent:')) {
        Linking.openURL(url).catch(() => {
          const fallback = extractIntentFallbackUrl(url);
          if (fallback) {
            webViewRef.current?.injectJavaScript(`window.location.href = ${JSON.stringify(fallback)};`);
          }
        });
        return false;
      }

      if (EXTERNAL_SCHEMES.some((scheme) => url.startsWith(scheme))) {
        Linking.openURL(url).catch(() => undefined);
        return false;
      }

      return true;
    },
    [finishWithResult],
  );

  const handleShouldStartLoad = useCallback(
    (request: WebViewNavigation) => handleUrl(request.url),
    [handleUrl],
  );

  const handleClose = useCallback(() => {
    finishWithResult({ type: 'cancel' });
  }, [finishWithResult]);

  if (!provider) {
    return null;
  }

  if (!authUrl) {
    return null;
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="h-12 flex-row items-center justify-between border-b border-gray300 px-4">
          <Text className="text-[17px] font-bold text-gray900">
            {provider === 'kakao' ? '카카오 로그인' : '네이버 로그인'}
          </Text>
          <Pressable onPress={handleClose} className="px-2 py-1">
            <Text className="text-[16px] font-semibold text-primary">닫기</Text>
          </Pressable>
        </View>

        {authError ? (
          <View className="bg-danger/10 px-4 py-2">
            <Text className="text-[13px] text-danger">{authError}</Text>
          </View>
        ) : null}

        <View className="flex-1">
          {isLoading ? (
            <View className="absolute inset-0 z-10 items-center justify-center bg-white/80">
              <ActivityIndicator color={appColors.primary} />
            </View>
          ) : null}

          <WebView
            ref={webViewRef}
            source={{ uri: authUrl }}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onNavigationStateChange={(navState) => {
              handleUrl(navState.url);
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => setAuthError('로그인 페이지를 불러오지 못했습니다.')}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            setSupportMultipleWindows={false}
            startInLoadingState
          />
        </View>
      </View>
    </Modal>
  );
}
