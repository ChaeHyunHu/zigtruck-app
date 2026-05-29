import apiManager from '../AxiosInstance';
import newApiManager from '../NewAxiosInstance';

export const createPurchaseAccompanyingServices = (request: AdditionalServicesApplyRequest) => {
  return newApiManager.post('/api/v1/purchase-accompanying-services', request);
};

export const createTransferAgencyServices = (request: AdditionalServicesApplyRequest) => {
  return newApiManager.post('/api/v1/transfer-agency-services', request);
};

export const createCapitalCounselServices = (request: AdditionalServicesApplyRequest) => {
  return newApiManager.post('/api/v1/capital-counsel-services', request);
};

export const createLeaseServices = (leaseTruckId: number) => {
  return apiManager.post('/api/v1/lease-services', { leaseTruckId });
};

export const createNotificationsEvent = (request: { redirectUrl: string; notificationType: string }) => {
  return apiManager.post('/api/v1/notifications', request);
};
