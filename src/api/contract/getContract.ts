import apiManager from '../AxiosInstance';

export const getPublicContracts = async (contractId?: string, phoneNumber?: string) => {
  if (!contractId) {
    return;
  }
  const res = await apiManager.get(`/api/v1/public/contracts/${contractId}`, { params: { phoneNumber } });
  return res.data;
};
