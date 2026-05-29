import newApiManager from '../NewAxiosInstance';

export const patchProductsInfo = (request: { productId: number; type: string }) => {
  return newApiManager.patch(`/api/v1/products/${request.productId}`, { type: request.type });
};

export const patchProductSalePrice = (request: { id: number; actualSalePrice: number; completeReason: string }) => {
  return newApiManager.patch(`/api/v1/products/${request.id}`, {
    actualSalePrice: request.actualSalePrice,
    completeReason: request.completeReason,
  });
};
