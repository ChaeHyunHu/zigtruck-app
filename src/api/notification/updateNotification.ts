import apiManager from '../AxiosInstance';

export const updateMemberNotificationsMark = (notificationRequestType: string) => {
  return apiManager.patch('/api/v1/member-notifications/mark', { notificationRequestType });
};

export const updateNotificationSetting = (notificationSettingsId: number) => {
  return apiManager.patch(`/api/v1/notification-settings/${notificationSettingsId}`, { leaseTruck: true });
};
