import apiManager from '../AxiosInstance';

export const deleteOtherExpensesCategory = (otherExpensesCategoryId: number) => {
  return apiManager.delete(`/api/v1/other-expenses-category/${otherExpensesCategoryId}`);
};

export const deleteOtherExpensesHistory = (deleteList: number[]) => {
  return apiManager.delete('/api/v1/other-expenses-history', {
    data: { otherExpensesHistoriesId: deleteList },
  });
};
