import { useCallback, useEffect, useMemo, useState } from 'react';
import { patchNotificationSetting } from '@/src/api/members';
import { showAppAlert } from '@/src/providers/appDialog';
import { parseDriveHistoryHour } from '@/src/features/settings/driveHistoryTimeUtils';
import { useAuth } from '@/src/hooks/useAuth';

export type NotificationSettingKey =
  | 'chatting'
  | 'interestProduct'
  | 'marketing'
  | 'trade'
  | 'driveHistory';

type NotificationSettings = {
  chatting: boolean;
  interestProduct: boolean;
  marketing: boolean;
  trade: boolean;
  driveHistory: boolean;
  driveHistoryHour: number;
  marketingAgreeDate?: string;
};

const DEFAULT_VALUE: NotificationSettings = {
  chatting: true,
  interestProduct: true,
  marketing: false,
  trade: true,
  driveHistory: true,
  driveHistoryHour: 8,
};

function mapFromProfile(
  notificationSettings?: {
    chatting?: boolean;
    interestProduct?: boolean;
    marketing?: boolean;
    trade?: boolean;
    driveHistory?: boolean;
    driveHistoryTime?: string | number;
    marketingAgreeDate?: string;
  } | null,
): NotificationSettings {
  if (!notificationSettings) return DEFAULT_VALUE;
  return {
    chatting: notificationSettings.chatting ?? DEFAULT_VALUE.chatting,
    interestProduct:
      notificationSettings.interestProduct ?? DEFAULT_VALUE.interestProduct,
    marketing: notificationSettings.marketing ?? DEFAULT_VALUE.marketing,
    trade: notificationSettings.trade ?? DEFAULT_VALUE.trade,
    driveHistory: notificationSettings.driveHistory ?? DEFAULT_VALUE.driveHistory,
    driveHistoryHour: parseDriveHistoryHour(notificationSettings.driveHistoryTime),
    marketingAgreeDate: notificationSettings.marketingAgreeDate,
  };
}

export function useNotificationSettings() {
  const { profile, refreshProfile, syncPushToken } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_VALUE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const settingsId = profile?.notificationSettings?.id;

  useEffect(() => {
    setSettings(mapFromProfile(profile?.notificationSettings));
    setIsLoaded(Boolean(profile));
  }, [profile]);

  const update = useCallback(
    async (key: NotificationSettingKey, value: boolean) => {
      if (!settingsId) {
        showAppAlert({ title: '알림 설정', message: '알림 설정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' });
        return;
      }

      const previous = settings;
      setSettings((prev) => ({ ...prev, [key]: value }));
      setIsUpdating(true);
      try {
        const response = await patchNotificationSetting(settingsId, { [key]: value });
        setSettings((prev) => ({
          ...prev,
          [key]: (response?.[key] as boolean | undefined) ?? value,
          driveHistoryHour: parseDriveHistoryHour(
            response?.driveHistoryTime ?? prev.driveHistoryHour,
          ),
          marketingAgreeDate: response?.marketingAgreeDate ?? prev.marketingAgreeDate,
        }));
        await refreshProfile();
        if (key === "chatting" && value) {
          void syncPushToken();
        }
      } catch (error: any) {
        setSettings(previous);
        showAppAlert({ title: '변경 실패', message: error?.message ?? '알림 설정 변경에 실패했습니다.' });
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshProfile, settings, settingsId, syncPushToken],
  );

  const updateDriveHistoryTime = useCallback(
    async (hour: number) => {
      if (!settingsId) {
        showAppAlert({ title: '알림 설정', message: '알림 설정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' });
        return false;
      }

      const previous = settings;
      setSettings((prev) => ({ ...prev, driveHistoryHour: hour }));
      setIsUpdating(true);
      try {
        const response = await patchNotificationSetting(settingsId, {
          driveHistoryTime: hour,
        });
        setSettings((prev) => ({
          ...prev,
          driveHistoryHour: parseDriveHistoryHour(
            response?.driveHistoryTime ?? hour,
          ),
        }));
        await refreshProfile();
        return true;
      } catch (error: any) {
        setSettings(previous);
        showAppAlert({ title: '변경 실패', message: error?.message ?? '운행일지 시간 설정에 실패했습니다.' });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [refreshProfile, settings, settingsId],
  );

  return useMemo(
    () => ({
      settings,
      isLoaded,
      isUpdating,
      update,
      updateDriveHistoryTime,
    }),
    [settings, isLoaded, isUpdating, update, updateDriveHistoryTime],
  );
}
