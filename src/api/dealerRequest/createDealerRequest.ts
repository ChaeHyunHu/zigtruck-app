import apiManager from '../AxiosInstance';

export const postDealerRequest = () => {
  return apiManager.post('/api/v1/dealer-request');
};
