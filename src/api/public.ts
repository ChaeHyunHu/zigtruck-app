import axios from 'axios';

import apiManager from './AxiosInstance';
import newApiManager from './NewAxiosInstance';
import { SALES_TYPE_ASSURANCE } from '@/src/constants/products';
import type { ProductPurchasingInquiryRequest } from '@/src/features/products/purchase-inquiry/types';

export const getTerm = () => apiManager.get('/api/v1/public/terms');

export const getPublicPriceTrend = async (queryParams: ApiQueryParams) => {
  const res = await newApiManager.get('/api/v1/public/prices/prices-info', { params: queryParams });
  return res.data;
};

export const getPriceTrend = async (queryParams: ApiQueryParams) => {
  const res = await newApiManager.get('/api/v1/prices/prices-info', { params: queryParams });
  return res.data;
};

export const getProductFilterInfo = (queryParams?: ApiQueryParams) => {
  return newApiManager.get("/api/v1/public/products/filter-info", {
    params: queryParams,
  });
};

export const getProductCount = (queryParams?: ApiQueryParams) => {
  return newApiManager.get("/api/v1/public/products/count", {
    params: queryParams,
  });
};

export const getProductList = (queryParams?: ApiQueryParams) => {
  return newApiManager.get('/api/v1/public/products', { params: queryParams });
};

export const getNotifications = () => apiManager.get('/api/v1/notifications');

export const deleteNotification = async (id: number) => {
  await apiManager.delete(`/api/v1/notifications/${id}`);
  return id;
};

export const getInterestProductsNotificationSettings = () => {
  return apiManager.get('/api/v1/interest-product-notification-settings');
};

export const deleteInterestProductNotificationSettings = (id: number) => {
  return apiManager.delete(`/api/v1/interest-product-notification-settings/${id}`);
};

export const postInterestProductNotificationSettings = (request: InterestProductNotificationSettingsRequest) => {
  return apiManager.post('/api/v1/interest-product-notification-settings', request);
};

export const patchInterestProductNotificationSettings = (
  id: number,
  request: InterestProductNotificationSettingsRequest,
) => apiManager.patch(`/api/v1/interest-product-notification-settings/${id}`, request);

export const postOneStopService = (request: OneStopServiceRequestData) => {
  return newApiManager.post('/api/v1/one-stop-services', request);
};

export const patchProducts = (request: ProductRegisterRequest) => {
  return newApiManager.patch(`/api/v1/products/${request.id}`, request);
};

export const patchProductsStatus = (request: { productId: number; status: string }) => {
  return newApiManager.patch(`/api/v1/products/${request.productId}`, { status: request.status });
};

export const patchProductPause = (request: { productId: number; pauseReason: string }) => {
  return newApiManager.patch(`/api/v1/products/${request.productId}`, {
    pauseReason: request.pauseReason,
    status: "PAUSE",
  });
};

export const getJobList = (queryParams?: ApiQueryParams) => {
  return apiManager.get('/api/v1/public/job', { params: queryParams });
};

export const getJobFilterInfo = () => apiManager.get('/api/v1/public/job/filter-info');

export const downloadContractFile = (request: { contractId: number; formData: FormData }) => {
  return apiManager.post(`/api/v1/contracts/${request.contractId}/download`, request.formData);
};

export const postDriveVehicleInfo = (request: VehicleInfoRequest) => {
  return apiManager.post('/api/v1/drive-vehicle-info', request);
};

export const patchDriveVehicleInfo = (request: { id: number; requestData: VehicleInfoRequest }) => {
  return apiManager.patch(`/api/v1/drive-vehicle-info/${request.id}`, request.requestData);
};

export const getDriveMyVehicleInfo = () => apiManager.get('/api/v1/drive-vehicle-info/my');

export const getFuelingHistory = (queryParams?: ApiQueryParams) => {
  return apiManager.get('/api/v1/fueling-history', { params: queryParams });
};

export const postDriveHistory = (request: DriveHistoryForm) => apiManager.post('/api/v1/drive-history', request);

export const patchDriveHistory = (request: { id: number; body: DriveHistoryForm }) => {
  return apiManager.patch(`/api/v1/drive-history/${request.id}`, request.body);
};

export const deleteFuelingHistory = (id: number) => apiManager.delete(`/api/v1/fueling-history/${id}`);

export const postFuelingHistoryReceipt = (file: ReactNativeUploadFile | Blob) => {
  const formData = new FormData();
  formData.append('file', file as any);
  return apiManager.post('/api/v1/fueling-history/receipt', formData);
};

export const postFuelingHistory = (request: FuelingForm) => apiManager.post('/api/v1/fueling-history', request);

export const patchFuelingHistory = (request: { id: string; body: FuelingForm }) => {
  return apiManager.patch(`/api/v1/fueling-history/${request.id}`, request.body);
};

export const getDriveHistory = (queryParams: ApiQueryParams) => {
  return apiManager.get('/api/v2/drive-history', { params: queryParams });
};

export const deleteTransportInfo = (id: number) => apiManager.delete(`/api/v1/drive-history/${id}`);

export const patchTransportInfo = (request: { id: string; body: TransportInfoRequest }) => {
  return apiManager.patch(`/api/v1/transport-info/${request.id}`, request.body);
};

export const getTransportInfoOutstandingAmount = (queryParams: ApiQueryParams) => {
  return apiManager.get('/api/v1/transport-info/outstanding-amount', { params: queryParams });
};

export const patchTransportInfoOutstandingAmount = (request: TransportInfoOutstandingAmountModifyRequest) => {
  return apiManager.patch('/api/v1/transport-info/outstanding-amount', request);
};

export const getLicenseList = (queryParams?: ApiQueryParams) => {
  return newApiManager.get('/api/v1/public/license', { params: queryParams });
};

export const postProductInquiry = (request: ProductPurchasingInquiryRequest) => {
  return newApiManager.post('/api/v1/public/product-inquiry', request);
};

export const postInterestProducts = (productId: number) => apiManager.post('/api/v1/interest-products', { productId });

export const deleteInterestProducts = (interestProductId: number) => {
  return apiManager.delete(`/api/v1/interest-products/${interestProductId}`);
};

export const getInterestProducts = async (productsStatus?: string | string[]) => {
  const res = await apiManager.get('/api/v1/interest-products', { params: { productsStatus } });
  return res.data;
};

export const patchMemberNotifications = (memberNotificationsId: number) => {
  return apiManager.patch(`/api/v1/member-notifications/${memberNotificationsId}`);
};

export const postProductInquiryCall = (productId: number) => apiManager.post(`/api/v1/products/${productId}/inquiry/call`);

export const getSearchHistory = (queryParams?: ApiQueryParams) => {
  return apiManager.get('/api/v1/search-history', { params: queryParams });
};

export const deleteSearchHistory = (searchHistoryId: number) => {
  return apiManager.delete(`/api/v1/search-history/${searchHistoryId}`);
};

export type NoticePagingResponse = {
  totalElements?: number;
  totalPage?: number;
  data?: Array<{
    id: number;
    title: string;
    contents: string;
    createdDate: string;
    modifiedDate?: string;
  }>;
};

export const getNotice = async (page: number): Promise<NoticePagingResponse> => {
  const res = await apiManager.get<NoticePagingResponse | NoticePagingResponse['data']>(
    '/api/v1/notice',
    { params: { page } },
  );
  const body = res.data;
  if (Array.isArray(body)) {
    return { data: body, totalPage: 1, totalElements: body.length };
  }
  return body ?? { data: [] };
};

export const getNoticeDetail = async (id: string | undefined) => {
  const res = await apiManager.get(`/api/v1/notice/${id}`);
  return res.data;
};

export const patchProductsAfterPriceSearch = async (productId: string | undefined) => {
  const res = await apiManager.patch(`/api/v1/products/${productId}/after-price-search`);
  return res.data;
};

export const getBanner = async () => {
  const res = await newApiManager.get('/api/v1/public/banners');
  return res.data;
};

export const patchBanner = async (bannerId: number) => {
  const res = await newApiManager.patch(`/api/v1/public/bannersHitCount/${bannerId}`);
  return res.data;
};

export const getCounts = async () => {
  const res = await newApiManager.get('/api/v1/public/counts');
  return res.data;
};

export const getLiveStream = async () => {
  const res = await apiManager.get('/api/v1/public/youtube-videos/info');
  return res.data;
};

export const getAssuranceProducts = async () => {
  const res = await newApiManager.get(`/api/v1/public/products?salesType=${SALES_TYPE_ASSURANCE}`);
  return res.data;
};

export const getRecommendProducts = async () => {
  const res = await apiManager.get('/api/v1/products/recommend');
  return res.data;
};

export const postReferralCode = (request: { referralCode: string }) => {
  return apiManager.post('/api/v1/referral-codes', request);
};

export const getYoutubeVideos = async () => {
  const res = await apiManager.get('/api/v1/public/youtube-videos');
  return res.data;
};

export const getHorsepower = async (params: {
  manufacturer: string;
  modelName: string;
  tons: string;
  horsePower: string;
}) => {
  const res = await axios.get('https://api.mchans.co.kr/zigtruck/horsepower/', { params });
  return res.data;
};
