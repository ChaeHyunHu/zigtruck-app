import apiManager from '../AxiosInstance';

export const createReferralCodes = (request: { referralCode: string }) => {
  return apiManager.post('/api/v1/referral-codes', request);
};
