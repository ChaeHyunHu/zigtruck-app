import apiManager from '../AxiosInstance';

export const deleteChatRooms = (chatRoomId: string) => {
  return apiManager.delete(`api/v1/chat-rooms/${chatRoomId}`);
};
