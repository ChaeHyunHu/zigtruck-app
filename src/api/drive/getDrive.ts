import apiManager from '../AxiosInstance';

export const getOtherExpensesHistory = async (queryParams: ApiQueryParams) => {
  const res = await apiManager.get('/api/v1/other-expenses-history', { params: queryParams });
  return res.data;
};

export const getOtherExpensesCategory = async (queryParams: ApiQueryParams) => {
  const res = await apiManager.get('/api/v1/other-expenses-category', { params: queryParams });
  return res.data;
};
