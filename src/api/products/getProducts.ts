import apiManager from '../AxiosInstance';
import newApiManager from '../NewAxiosInstance';

export const fetchMyProducts = async () => {
  const res = await apiManager.get('/api/v1/products/my');
  return res.data;
};

export const fetchSimilarProducts = async (queryParams: ApiQueryParams) => {
  const res = await apiManager.get('/api/v1/products/similar?', { params: queryParams });
  return res.data;
};

export const fetchProductDetail = async (id: number | string) => {
  const res = await newApiManager.get(`/api/v1/public/products/${id}`);
  return res.data;
};

export const fetchAuthedProductDetail = async (id: number | string) => {
  const res = await apiManager.get(`/api/v1/products/${id}`);
  return res.data;
};

export const deleteProduct = async (id: number | string) => {
  await apiManager.delete(`/api/v1/products/${id}`);
  return id;
};

export const patchProductPrice = async (id: number | string, price: number) => {
  const res = await newApiManager.patch(`/api/v1/products/${id}`, { price });
  return res.data;
};
