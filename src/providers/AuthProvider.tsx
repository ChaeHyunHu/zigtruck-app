import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

import apiManager from '@/src/api/AxiosInstance';
import {
  getMemberDetail,
  patchMember,
  registerDeviceToken,
  uploadProfileImage as uploadProfileImageApi,
  type NotificationSettingsDto,
} from '@/src/api/members';
import { subscribeAuthSession } from '@/src/api/authSession';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/src/api/authStorage';
import {
  getMemberIdFromToken,
  isAccessTokenExpired,
  refreshAccessToken,
} from '@/src/api/authTokenUtils';
import {
  clearStoredDeviceToken,
  getStoredDeviceToken,
  registerForPushNotificationsAsync,
} from '@/src/lib/pushNotifications';
import { resetOutgoingReadReceipts } from '@/src/features/chat/outgoingReadReceipts';

type LoginPayload = {
  phoneNumber: string;
  password: string;
  type: 'NORMAL' | 'DEALER';
};

export type UserProfile = {
  memberId?: number;
  name: string;
  phoneNumber: string;
  profileImageUri?: string;
  memberTypeCode?: string;
  notificationSettings?: NotificationSettingsDto;
};

type AuthContextValue = {
  isInitializing: boolean;
  isAuthenticated: boolean;
  isProfileUpdating: boolean;
  token: string | null;
  memberId?: number;
  profile: UserProfile | null;
  login: (payload: LoginPayload) => Promise<{
    loginByTempPassword?: boolean;
    blockedDeleted?: boolean;
    deleteReason?: string | null;
  }>;
  loginWithToken: (accessToken: string) => Promise<{ isNewMember: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfileName: (name: string) => Promise<void>;
  uploadProfileImage: (uri: string) => Promise<void>;
  syncPushToken: (opts?: { promptIfNeeded?: boolean }) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_STORAGE_KEY = 'member-profile-v1';

const mapMemberToProfile = (memberId: number | undefined, data: any): UserProfile => ({
  memberId,
  name: data?.name ?? '직트럭 사용자',
  phoneNumber: data?.phoneNumber ?? '',
  profileImageUri: data?.profileImageUrl ?? undefined,
  memberTypeCode: data?.type?.code,
  notificationSettings: data?.notificationSettings,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);

  const persistProfile = useCallback(async (nextProfile: UserProfile | null) => {
    if (!nextProfile?.memberId) {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
  }, []);

  const syncPushToken = useCallback(async (opts?: { promptIfNeeded?: boolean }) => {
    const accessToken = await getAccessToken();
    if (!accessToken) return;

    // 앱 부팅·세션 갱신 시점에 OS 권한 다이얼로그가 스플래시 위에서 뜨는 것을 막기 위해
    // 기본적으로 prompt 는 생략하고, 권한이 이미 허용된 경우에만 토큰을 발급한다.
    // 첫 권한 요청은 홈 탭이 떴을 때 별도로 trigger 한다 (promptIfNeeded=true).
    const registration = await registerForPushNotificationsAsync({
      skipPermissionPrompt: !opts?.promptIfNeeded,
    });
    const deviceToken = registration.token;
    if (!deviceToken) {
      return;
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await registerDeviceToken(deviceToken);
        if (__DEV__) {
          console.log("[push] device token synced to server");
        }
        return;
      } catch (error) {
        if (__DEV__) {
          console.warn(`[push] server token sync failed (attempt ${attempt + 1})`, error);
        }
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }
  }, []);

  const fetchProfileByToken = useCallback(
    async (accessToken: string) => {
      const memberId = getMemberIdFromToken(accessToken);
      if (!memberId) return null;

      const response = await getMemberDetail(memberId).catch(() => null);
      if (!response) return null;

      const nextProfile = mapMemberToProfile(memberId, response);
      setProfile(nextProfile);
      await persistProfile(nextProfile);
      return nextProfile;
    },
    [persistProfile],
  );

  const refreshProfile = useCallback(async () => {
    const accessToken = await getAccessToken();
    if (!accessToken) return null;
    return fetchProfileByToken(accessToken);
  }, [fetchProfileByToken]);

  const resolveStoredToken = useCallback(async () => {
    let storedToken = await getAccessToken();
    if (!storedToken) return null;

    if (isAccessTokenExpired(storedToken)) {
      const previousMemberId = getMemberIdFromToken(storedToken);
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        const nextMemberId = getMemberIdFromToken(refreshedToken);
        if (
          previousMemberId != null &&
          nextMemberId != null &&
          previousMemberId !== nextMemberId
        ) {
          await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
        }
      }
      storedToken = refreshedToken;
    }

    return storedToken;
  }, []);

  const syncSession = useCallback(async () => {
    const validToken = await resolveStoredToken();
    setToken(validToken);

    if (!validToken) {
      setProfile(null);
      await persistProfile(null);
      return;
    }

    const memberId = getMemberIdFromToken(validToken);
    const fetchedProfile = await fetchProfileByToken(validToken);
    if (fetchedProfile) {
      void syncPushToken();
      return;
    }

    const savedProfileRaw = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
    if (!savedProfileRaw) {
      setProfile(null);
      return;
    }

    try {
      const savedProfile = JSON.parse(savedProfileRaw) as UserProfile;
      if (Number(savedProfile.memberId) === Number(memberId)) {
        setProfile(savedProfile);
        void syncPushToken();
      } else {
        setProfile(null);
        await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    } catch {
      setProfile(null);
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    }
  }, [fetchProfileByToken, persistProfile, resolveStoredToken, syncPushToken]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        if (!mounted) return;
        await syncSession();
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [syncSession]);

  useEffect(() => {
    return subscribeAuthSession((event, nextToken) => {
      if (event === 'token-updated' && nextToken) {
        const nextMemberId = getMemberIdFromToken(nextToken);
        setToken(nextToken);
        setProfile((prev) =>
          prev && Number(prev.memberId) === Number(nextMemberId) ? prev : null,
        );
        void fetchProfileByToken(nextToken);
        void syncPushToken();
        return;
      }

      if (event === 'session-ended') {
        setToken(null);
        setProfile(null);
        void persistProfile(null);
      }
    });
  }, [fetchProfileByToken, persistProfile, syncPushToken]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncSession();
      }
    });

    return () => subscription.remove();
  }, [syncSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    if (!process.env.EXPO_PUBLIC_SERVER_URL) {
      throw new Error('서버 주소(EXPO_PUBLIC_SERVER_URL)가 설정되지 않았습니다.');
    }

    const response = await apiManager.post('/auth/login', payload, {
      withCredentials: true,
    });
    const nextToken =
      response?.data?.token ??
      response?.data?.accessToken ??
      response?.data?.data?.token ??
      response?.data?.data?.accessToken;
    if (!nextToken) {
      throw new Error(response?.data?.message ?? '로그인 토큰을 받지 못했습니다.');
    }

    const memberId = getMemberIdFromToken(nextToken);

    // 승인 전/반려 딜러 등 삭제(deleted) 상태 계정 차단:
    // 토큰을 세션에 저장하기 전(자동 로그인되기 전)에 회원 상세를 조회해 확인한다.
    const profileResponse = memberId
      ? await getMemberDetail(memberId, nextToken).catch(() => null)
      : null;

    if (profileResponse?.deleted) {
      return {
        blockedDeleted: true,
        deleteReason: profileResponse.deleteReason ?? null,
      };
    }

    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    await setAccessToken(nextToken);
    setToken(nextToken);

    const nextProfile: UserProfile = profileResponse
      ? mapMemberToProfile(memberId, profileResponse)
      : {
          memberId,
          name: '직트럭 사용자',
          phoneNumber: payload.phoneNumber,
        };
    setProfile(nextProfile);
    await persistProfile(nextProfile);
    void syncPushToken();

    return { loginByTempPassword: response?.data?.loginByTempPassword };
  }, [persistProfile, syncPushToken]);

  const loginWithToken = useCallback(async (accessToken: string) => {
    if (!accessToken) {
      throw new Error('로그인 토큰을 받지 못했습니다.');
    }

    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    await setAccessToken(accessToken);
    setToken(accessToken);

    const memberId = getMemberIdFromToken(accessToken);
    const profileResponse = memberId
      ? await getMemberDetail(memberId).catch(() => null)
      : null;

    if (profileResponse) {
      const nextProfile = mapMemberToProfile(memberId, profileResponse);
      setProfile(nextProfile);
      await persistProfile(nextProfile);
      void syncPushToken();
      return { isNewMember: false };
    }

    const fallbackProfile: UserProfile = {
      memberId,
      name: '직트럭 사용자',
      phoneNumber: '',
    };
    setProfile(fallbackProfile);
    await persistProfile(fallbackProfile);
    void syncPushToken();
    return { isNewMember: true };
  }, [persistProfile, syncPushToken]);

  const logout = useCallback(async () => {
    const memberId = profile?.memberId;
    const deviceToken = await getStoredDeviceToken();
    try {
      await apiManager.post(
        '/auth/logout',
        {
          ...(memberId ? { memberId } : {}),
          ...(deviceToken ? { deviceToken } : {}),
        },
        { withCredentials: true },
      );
    } catch {
      // 서버 로그아웃 실패여도 로컬 세션은 정리한다.
    } finally {
      resetOutgoingReadReceipts();
      await clearAccessToken();
      await clearStoredDeviceToken();
      setToken(null);
      setProfile(null);
      await persistProfile(null);
    }
  }, [persistProfile, profile?.memberId]);

  const updateProfileName = useCallback(
    async (name: string) => {
      const updated = await patchMember({ name });
      setProfile((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          name: updated?.name ?? name,
          phoneNumber: updated?.phoneNumber ?? prev.phoneNumber,
          profileImageUri: updated?.profileImageUrl ?? prev.profileImageUri,
          notificationSettings: updated?.notificationSettings ?? prev.notificationSettings,
        };
        void persistProfile(next);
        return next;
      });
    },
    [persistProfile],
  );

  const uploadProfileImage = useCallback(
    async (uri: string) => {
      setIsProfileUpdating(true);
      try {
        const url = await uploadProfileImageApi(uri);
        if (!url) {
          throw new Error('프로필 이미지 URL을 받지 못했습니다.');
        }
        setProfile((prev) => {
          if (!prev) return prev;
          const next = { ...prev, profileImageUri: url };
          void persistProfile(next);
          return next;
        });
      } finally {
        setIsProfileUpdating(false);
      }
    },
    [persistProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isInitializing,
      isAuthenticated: Boolean(token),
      isProfileUpdating,
      token,
      memberId: token ? getMemberIdFromToken(token) : undefined,
      profile,
      login,
      loginWithToken,
      logout,
      refreshProfile,
      updateProfileName,
      uploadProfileImage,
      syncPushToken,
    }),
    [
      isInitializing,
      token,
      profile,
      isProfileUpdating,
      login,
      loginWithToken,
      logout,
      refreshProfile,
      updateProfileName,
      uploadProfileImage,
      syncPushToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
