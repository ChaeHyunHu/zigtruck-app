export type ChatListItem = {
  chatRoomId: number;
  lastMessage?: string;
  lastMessageTime?: string;
  memberName?: string;
  profileImageUrl?: string;
  productRepresentImageUrl?: string;
  truckNumber?: string;
  truckName?: string;
  productId?: number;
  price?: number;
  notReadChatMessageCount?: number;
};

export type ChatSocketMessage = {
  id?: number;
  chatRoomId: number;
  senderId?: number;
  memberName?: string;
  profileImageUrl?: string;
  frontSideImageUrl?: string;
  truckNumber?: string;
  contents?: string;
  createdDate?: string;
  type?: { code?: string; desc?: string };
};

export type ChatMessageItem = {
  id: number;
  tempId?: number;
  createdDate?: string;
  contents: string;
  type?: { code?: string; desc?: string };
  senderId: number;
  sender?: ChatRoomMember;
  isRead?: boolean;
  isLoading?: boolean;
};

export type ChatScenarioButton = {
  text: string;
  url?: string;
  method?: string | null;
  desc?: string;
};

export type ChatRoomMember = {
  id?: number;
  name?: string;
  profileImageUrl?: string;
};

export type ChatRoomDetail = {
  id?: number;
  productId?: number;
  truckNumber?: string;
  truckName?: string;
  price?: string | number;
  productRepresentImageUrl?: string;
  productStatus?: { code?: string; desc?: string };
  isDeletedProduct?: boolean;
  chatMessages?: ChatMessageItem[];
  buyer?: ChatRoomMember;
  seller?: ChatRoomMember;
  safetyNumbers?: { safetyNumber?: string };
  transferorCompleted?: boolean;
  transfereeCompleted?: boolean;
};
