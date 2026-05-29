import {
  NAVER_AUTH_URL,
  OAUTH_CALLBACK_URL,
} from '@/src/constants/url';

export type SocialLoginResult =
  | { type: 'success'; token: string }
  | { type: 'cancel' }
  | { type: 'error'; message: string };

const buildKakaoAuthUrl = () => {
  const clientId = process.env.EXPO_PUBLIC_KAKAO_KEY;
  if (!clientId) {
    throw new Error('EXPO_PUBLIC_KAKAO_KEY가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.EXPO_PUBLIC_SERVER_URL}/oauth2/code/kakao`,
    response_type: 'code',
    scope: 'name,profile_image,phone_number,account_email',
    prompt: 'select_account',
    // 카카오톡 앱으로 전환되면 WebView 세션이 끊겨 콜백을 받지 못함
    through_talk: 'false',
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

export const getSocialAuthUrl = (provider: 'kakao' | 'naver'): string => {
  if (!OAUTH_CALLBACK_URL) {
    throw new Error('서버 주소(EXPO_PUBLIC_SERVER_URL)가 설정되지 않았습니다.');
  }

  return provider === 'kakao' ? buildKakaoAuthUrl() : NAVER_AUTH_URL;
};

export const isOAuthCallbackUrl = (url: string): boolean =>
  Boolean(OAUTH_CALLBACK_URL && url.startsWith(OAUTH_CALLBACK_URL));

export const parseCallbackUrl = (url: string): SocialLoginResult => {
  const parsed = new URL(url);
  const token = parsed.searchParams.get('token');
  const errorCode = parsed.searchParams.get('errorCode');
  const errorMessage = parsed.searchParams.get('errorMessage');

  if (errorCode === 'DEALER_SOCIAL_LOGIN_NOT_ALLOWED') {
    return {
      type: 'error',
      message: '딜러 회원은 딜러회원 탭에서 전화번호로 로그인해주세요.',
    };
  }

  if (errorCode === 'OAUTH2_ERROR' || errorCode === 'KAKAO_FAIL') {
    return {
      type: 'error',
      message: errorMessage ?? '소셜 로그인에 실패했습니다.',
    };
  }

  if (token) {
    return { type: 'success', token };
  }

  return { type: 'error', message: '로그인 토큰을 받지 못했습니다.' };
};

/** Android intent:// URL에서 browser_fallback_url 추출 */
export const extractIntentFallbackUrl = (intentUrl: string): string | null => {
  const match = intentUrl.match(/S\.browser_fallback_url=([^;]+)/);
  if (!match?.[1]) {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};
