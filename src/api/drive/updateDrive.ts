import apiManager from '../AxiosInstance';

export const updateOtherExpensesCategory = (request: OtherExpensesCategoryUpdateRequest) => {
  return apiManager.patch(`/api/v1/other-expenses-category/${request.otherExpensesCategoryId}`, { name: request.name });
};

export const updateOtherExpensesHistory = (request: { id: number; formData: OtherExpensesHistoryUpdateRequest }) => {
  return apiManager.patch(`/api/v1/other-expenses-history/${request.id}`, request.formData);
};
