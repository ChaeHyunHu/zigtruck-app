interface EnumPresenter {
  code: string;
  desc: string;
}

interface MemberToken {
  memberId: number;
  loginId: string;
  tokenKey: string;
}

interface Token {
  sub: string;
  details: MemberToken | string;
  iss: string;
  iat: number;
  exp: number;
}

type ApiQueryParams = Record<string, unknown>;
type ReactNativeUploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

type AdditionalServicesApplyRequest = Record<string, unknown>;
type OtherExpensesCategoryRequest = Record<string, unknown>;
type OtherExpensesHistoryRequest = Record<string, unknown>;
type OtherExpensesCategoryUpdateRequest = { otherExpensesCategoryId: number; name: string };
type OtherExpensesHistoryUpdateRequest = Record<string, unknown>;
type LicenseRequest = Record<string, unknown>;
type OneStopServiceRequestData = Record<string, unknown>;
type ProductRegisterRequest = Record<string, unknown> & { id: number; status?: string };
type InterestProductNotificationSettingsRequest = Record<string, unknown>;
type VehicleInfoRequest = Record<string, unknown>;
type DriveHistoryForm = Record<string, unknown>;
type FuelingForm = Record<string, unknown>;
type TransportInfoRequest = Record<string, unknown>;
type TransportInfoOutstandingAmountModifyRequest = Record<string, unknown>;
type ProductPurchasingInquiryRequest = Record<string, unknown>;
