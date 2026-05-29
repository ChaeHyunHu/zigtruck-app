export type EnumPresenter = {
  code?: string;
  desc?: string;
};

export type NotificationInfo = {
  id: number;
  title: string;
  contents: string;
  imageUrl?: string | null;
  redirectUrl?: string | null;
  sentDate?: string | null;
  notificationType?: EnumPresenter | null;
};

export type MemberNotification = {
  id: number;
  isRead: boolean;
  isDelete?: boolean;
  notification: NotificationInfo;
};

export type NotificationsResponse = {
  activityNotifications: MemberNotification[];
  interestProductNotifications: MemberNotification[];
  notReadActivityNotificationCount: number;
  notReadInterestProductNotificationCount: number;
};

export type InterestProductNotificationSetting = {
  id: number;
  minYear?: number;
  maxYear?: number;
  minTons?: number;
  maxTons?: number;
};
