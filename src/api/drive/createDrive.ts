import apiManager from '../AxiosInstance';

export const createOtherExpensesCategory = (request: OtherExpensesCategoryRequest) => {
  return apiManager.post('/api/v1/other-expenses-category', request);
};

export const createOtherExpensesHistory = (request: OtherExpensesHistoryRequest) => {
  return apiManager.post('/api/v1/other-expenses-history', request);
};
