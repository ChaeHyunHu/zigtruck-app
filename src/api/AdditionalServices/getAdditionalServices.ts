import apiManager from '../AxiosInstance';

export const getLeaseTrucks = async () => {
  const res = await apiManager.get('/api/v1/public/lease-trucks');
  return res.data;
};
