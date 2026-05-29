import apiManager from '../AxiosInstance';

export const createChatMessages = async (formData: FormData) => {
  const response = await apiManager.post("/api/v1/chat-messages", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
