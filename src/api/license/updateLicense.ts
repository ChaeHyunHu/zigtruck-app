import apiManager from '../AxiosInstance';

export const updateLicense = (request: Record<string, unknown> & { id?: number }) => {
  return apiManager.patch(`/api/v1/license/${request?.id}`, request);
};
