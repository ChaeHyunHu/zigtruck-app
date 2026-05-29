import apiManager from '@/src/api/AxiosInstance';

export type NotificationSettingsDto = {
  id: number;
  chatting: boolean;
  interestProduct: boolean;
  marketing: boolean;
  trade: boolean;
  driveHistory: boolean;
  driveHistoryTime?: string | number;
  marketingAgreeDate?: string;
};

export type MemberDetailDto = {
  id?: number;
  name?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  type?: { code?: string };
  notificationSettings?: NotificationSettingsDto;
};

export async function getMemberDetail(memberId: number) {
  const response = await apiManager.get<MemberDetailDto>(`/api/v1/members/${memberId}`);
  return response.data;
}

export async function patchMember(body: Record<string, unknown>) {
  const response = await apiManager.patch<MemberDetailDto>('/api/v1/members', body);
  return response.data;
}

export async function checkCurrentPassword(password: string) {
  await apiManager.post('/api/v1/members/password/check', { password });
}

export async function uploadProfileImage(uri: string) {
  const formData = new FormData();
  const fileName = uri.split('/').pop() ?? 'profile.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase();
  const mimeType =
    extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('uploadFile', {
    uri,
    name: fileName.includes('.') ? fileName : `${fileName}.jpg`,
    type: mimeType,
  } as unknown as Blob);

  const response = await apiManager.post<{ url: string }>('/api/v1/members/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data?.url;
}

export async function requestPhoneAuthCode(phoneNumber: string) {
  await apiManager.get('/api/v1/members/authentication', {
    params: { phoneNumber },
  });
}

export async function confirmPhoneAuthCode(phoneNumber: string, authNumber: string) {
  await apiManager.get('/api/v1/members/authentication/confirm', {
    params: { phoneNumber, authNumber },
  });
}

export async function sendTemporaryPassword(phoneNumber: string) {
  await apiManager.get('/api/v1/members/temporary-password', {
    params: { phoneNumber },
  });
}

export type SignUpRequestBody = {
  dealerTerms: boolean;
  marketing: boolean;
  phoneNumber: string;
  name: string;
  password: string;
  referralCode?: string;
  dealerEmployeeNumber?: string;
  type?: 'DEALER';
};

export type SignUpResponse = {
  authTokenInfo?: {
    accessToken?: string;
  };
};

export async function signUpMember(body: SignUpRequestBody) {
  const response = await apiManager.post<SignUpResponse>('/api/v1/members/sign-up', body);
  return response.data;
}

export async function registerDeviceToken(deviceToken: string) {
  await apiManager.post('/api/v1/fire-base/device-token', { deviceToken });
}

export async function patchNotificationSetting(
  settingsId: number,
  body: Record<string, boolean | number>,
) {
  const response = await apiManager.patch<NotificationSettingsDto>(
    `/api/v1/notification-settings/${settingsId}`,
    body,
  );
  return response.data;
}
