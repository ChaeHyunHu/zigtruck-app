import newApiManager from '../NewAxiosInstance';

export const createProductsImages = async (formData: FormData) => {
  const res = await newApiManager.post('/api/v1/products-images', formData);
  return res;
};

export const createProductsImagesMulti = async (formData: FormData) => {
  const res = await newApiManager.post('/api/v1/products-images/multi', formData);
  return res;
};
