import newApiManager from '../NewAxiosInstance';

export const createLicense = (request: LicenseRequest) => {
  return newApiManager.post('/api/v1/license', request);
};
