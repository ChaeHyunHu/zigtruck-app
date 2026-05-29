import apiManager from '../AxiosInstance';

export const deleteLicense = (request: { id: number; isSoftDelete?: boolean }) => {
  const queryParam = request.isSoftDelete !== undefined ? `?isSoftDelete=${request.isSoftDelete}` : '';
  return apiManager.delete(`/api/v1/license/${request.id}${queryParam}`);
};
