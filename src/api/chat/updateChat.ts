import apiManager from '../AxiosInstance';

export const patchChatMessagesRead = (chatMessagesId: number) => {
  return apiManager.patch(`/api/v1/chat-messages/read/${chatMessagesId}`);
};
