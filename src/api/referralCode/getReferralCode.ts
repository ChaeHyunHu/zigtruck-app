import apiManager from '../AxiosInstance';

export const getRefferalCodesValidate = (queryParams: ApiQueryParams) => {
  return apiManager.get('/api/v1/public/referral-codes/validate', { params: queryParams });
};
