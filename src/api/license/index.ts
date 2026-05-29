import axios from "axios";

import apiManager from "@/src/api/AxiosInstance";
import newApiManager from "@/src/api/NewAxiosInstance";

export type LicenseEnumItem = { code: string; desc: string };

export type LicenseFilterInfo = {
  licenseType: LicenseEnumItem[];
  licenseSalesType: LicenseEnumItem[];
  useClassification: LicenseEnumItem[];
  locate: LicenseEnumItem[];
};

export type LicensePriceData = {
  individualStartPrice?: number;
  individualEndPrice?: number;
  cargoStartPrice?: number;
  cargoEndPrice?: number;
};

export type LicenseGuideFaq = {
  question: string;
  answer: Record<string, unknown>;
};

export type LicenseGuideResponse = {
  title?: string;
  guideList?: LicenseGuideFaq[];
};

export const getLicenseFilterInfo = async (): Promise<LicenseFilterInfo> => {
  const res = await newApiManager.get("/api/v1/public/license/filter-info");
  return res.data as LicenseFilterInfo;
};

export const getLicenseList = (params?: Record<string, string | number>) =>
  newApiManager.get("/api/v1/public/license", { params });

export const getLicensePrice = async (): Promise<LicensePriceData> => {
  const res = await axios.get(
    "https://api.mchans.co.kr/zigTruck/licensePlatePrice",
  );
  return res.data as LicensePriceData;
};

export const getLicenseBuyGuide = async (): Promise<LicenseGuideResponse> => {
  const res = await axios.get("https://api.mchans.co.kr/zigTruck/LicenseBuyGuide");
  return res.data as LicenseGuideResponse;
};

export const getLicenseSalesGuide = async (): Promise<LicenseGuideResponse> => {
  const res = await axios.get(
    "https://api.mchans.co.kr/zigTruck/LicenseSalesGuide",
  );
  return res.data as LicenseGuideResponse;
};

export const postLicensePurchaseInquiry = (body: {
  memberId: number;
  year: string;
  tons: string;
  licenseSalesType: string;
  licenseType?: string;
  useClassification?: string;
  maxTons?: string | null;
}) => newApiManager.post("/api/v1/license-inquiry", body);

export const postLicenseItemPurchaseRequest = (body: {
  licenseId: number;
  memberId: number;
}) => newApiManager.post("/api/v1/license-inquiry", body);

export const createLicenseListing = (body: Record<string, unknown>) =>
  newApiManager.post("/api/v1/license", body);

export const getLicenseDetail = (id: string | number) =>
  newApiManager.get(`/api/v1/license/${id}`);

export const getMyLicenses = () => apiManager.get("/api/v1/license/my");

export { updateLicense } from "@/src/api/license/updateLicense";
export { deleteLicense } from "@/src/api/license/deleteLicense";
