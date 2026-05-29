export const IMAGE_BASE_URL = 'https://zigtruck-service-public-image.s3.ap-northeast-2.amazonaws.com';
export const ZIGTRUCK_YOUTUBE_HOME_URL = 'https://www.youtube.com/@zigtruck/featured';

const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? '';

export const KAKAO_AUTH_URL = `${serverUrl}/oauth2/authorization/kakao`;
export const NAVER_AUTH_URL = `${serverUrl}/oauth2/authorization/naver`;
export const KAKAO_OAUTH_REDIRECT_URL = `${serverUrl}/oauth2/code/kakao`;
export const OAUTH_CALLBACK_URL = `${serverUrl}/login/callback`;
