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

/** 판매완료 처리 + 실제 판매 금액 + 직트럭 후기 한 번에 반영 */
export const patchProductComplete = (request: {
  id: number;
  actualSalePrice: number;
  completeReason: string;
}) => {
  return newApiManager.patch(`/api/v1/products/${request.id}`, {
    status: "COMPLETED",
    actualSalePrice: request.actualSalePrice,
    completeReason: request.completeReason,
  });
};
