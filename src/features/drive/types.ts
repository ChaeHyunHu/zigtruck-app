export type DriveEnumField = { code: string; desc: string };

export type IncomeHistoryDay = {
  baseDay: string;
  expense: number;
  sales: number;
};

export type IncomeHistoryMonth = {
  baseYearMonth?: string;
  income?: number;
  sales?: number;
  expense?: number;
  fixedCost?: number;
  fuelCost?: number;
  otherExpensesCost?: number;
  otherIncome?: number;
  toll?: number;
  subsidyForFuel?: number;
  outstandingAmount?: number;
  totalTransportCost?: number;
};

export type DriveVehicleInfo = {
  id: number;
  tons?: number;
  axis?: DriveEnumField;
  loaded?: DriveEnumField;
  loadedInnerLength?: number;
  fuelEfficiency?: number;
  fee?: number;
  insuranceFee?: number;
  capitalFee?: number;
};

export type TransportInfoItem = {
  id?: number;
  transportCompany?: string;
  transportItem?: string | null;
  transportCost?: number | null;
  cancelCost?: number | null;
  isCancel?: boolean;
  isReceivedReceipt?: boolean;
  isReceivedCost?: boolean;
};

export type DriveHistoryItem = {
  id: number;
  driveHistoryType?: DriveEnumField;
  title?: string;
  transferStartDate?: string;
  transferStartFullLocate?: string;
  transferStartShortLocate?: string;
  transferEndFullLocate?: string;
  transferEndShortLocate?: string;
  transferTransitLocate?: Array<{
    transferTransitFullLocate?: string;
    transferTransitShortLocate?: string;
  }>;
  transportInfos?: TransportInfoItem[];
  distance?: number;
  fuelCost?: number;
  toll?: number | null;
  memo?: string | null;
};

export type FuelingHistoryItem = {
  id: number;
  refuelDay?: string;
  baseDay?: string;
  amount?: number;
  price?: number;
  unitPrice?: number;
  subsidyForFuel?: number;
  receiptImageUrl?: string;
};

export type FuelingHistoryByDay = {
  baseDay: string;
  totalFuelingCostOfDay: number;
  fuelingHistoryList: FuelingHistoryItem[];
};

export type FuelingHistoryResponse = {
  totalFuelingCostOfMonth?: number;
  fuelingHistoryByBaseDayList?: FuelingHistoryByDay[];
};

export type OtherExpenseHistoryLine = {
  otherExpensesHistoryId: number;
  otherExpensesCategoryId: number;
  otherExpensesCategoryType: DriveEnumField;
  price: number;
  categoryName: string;
  contents?: string;
};

export type OtherExpenseHistoryDay = {
  baseDay: string;
  data: OtherExpenseHistoryLine[];
  totalCost: number;
};

export type OtherExpenseHistoryResponse = {
  response?: OtherExpenseHistoryDay[];
  totalExpense?: number;
  totalIncome?: number;
};

export type OtherExpenseDayDetail = {
  baseDay: string;
  data?: OtherExpenseHistoryLine[];
};

export type OtherExpensesCategory = {
  id: number;
  name: string;
  type: DriveEnumField;
};

export type OtherExpenseWithCategory = {
  id: number;
  baseDay?: string;
  contents?: string;
  price?: number;
  otherExpensesCategory?: OtherExpensesCategory;
};

export type OutstandingAmountDay = {
  baseDay: string;
  outstandingAmountOfDay?: number;
  driveHistories: DriveHistoryItem[];
};

export type OutstandingAmountResponse = {
  sales?: number;
  outstandingAmount?: number;
  driveHistoryWithTransportInfo?: OutstandingAmountDay[];
};

export type DriveInfoResponse = {
  driveHistoryList?: DriveHistoryItem[];
  incomeHistoryDayList?: IncomeHistoryDay[];
  incomeHistoryMonth?: IncomeHistoryMonth | null;
  isFirstDriveHistory?: boolean;
  fuelingHistories?: FuelingHistoryItem[];
  otherExpensesHistory?: OtherExpenseWithCategory[];
};
