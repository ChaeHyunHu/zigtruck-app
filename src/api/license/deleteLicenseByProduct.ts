import apiManager from '../AxiosInstance';

export const deleteLicenseByProduct = (request: { productId: number }) => {
  return apiManager.delete(`/api/v1/license/product/${request.productId}`);
};
