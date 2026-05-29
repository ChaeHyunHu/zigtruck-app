import apiManager from '../AxiosInstance';

export const fetchChatRooms = async (id?: string) => {
  const res = await apiManager.get(`/api/v1/chat-rooms/${id}`);
  return res.data;
};

export const fetchChatRoomList = async () => {
  const res = await apiManager.get('/api/v1/chat-rooms');
  return res.data;
};
