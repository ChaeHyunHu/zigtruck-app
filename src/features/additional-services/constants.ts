import { IMAGE_BASE_URL } from "@/src/constants/url";

export const REPRESENTATIVE_NUMBER = "1599-6249";

export const PUBLIC_IMAGES = {
  purchaseAccompanyingGuide: `${IMAGE_BASE_URL}/purchase-compaion-guide.png`,
  transferAgency: `${IMAGE_BASE_URL}/transfer_agency_service.png`,
  capitalCounsel1: `${IMAGE_BASE_URL}/capital_counsel_service1.png`,
} as const;

export const LOAN_TERM_OPTIONS = ["12", "24", "36", "46", "60", "72"] as const;

export type AdditionalServiceType =
  | "one-stop-service"
  | "purchase-accompanying-service"
  | "transfer-agency-service"
  | "capital-counsel-service";

export const SERVICE_APPLY_FLAG_KEY: Record<
  AdditionalServiceType,
  | "isAlreadyApplyOneStopService"
  | "isAlreadyApplyPurchaseAccompanyingService"
  | "isAlreadyApplyTransferAgencyService"
  | "isAlreadyApplyCapitalCounselService"
> = {
  "one-stop-service": "isAlreadyApplyOneStopService",
  "purchase-accompanying-service": "isAlreadyApplyPurchaseAccompanyingService",
  "transfer-agency-service": "isAlreadyApplyTransferAgencyService",
  "capital-counsel-service": "isAlreadyApplyCapitalCounselService",
};
