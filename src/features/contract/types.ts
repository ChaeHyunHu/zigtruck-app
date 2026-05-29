export type ContractInfo = {
  id: number;
  balance: number | null;
  balancePaymentDate: string;
  carName: string;
  carNumber: string;
  carType: string;
  carUse: string;
  downPayment: number | null;
  downPaymentDate: string;
  identificationNumber: string;
  intermediatePayment: number | null;
  intermediatePaymentDate: string;
  motorType: string;
  tradingAmount: number;
  transfereeAddress: string;
  transfereeCompleted: boolean;
  transfereeCompletedDate: string;
  transfereeName: string;
  transfereePhoneNumber: string;
  transfereeRegistrationNumber: string;
  transfereeSignImageUrl: string;
  transferorAddress: string;
  transferorCompleted: boolean;
  transferorCompletedDate: string;
  transferorName: string;
  transferorPhoneNumber: string;
  transferorRegistrationNumber: string;
  transferorSignImageUrl: string;
  year: string;
  additionalConditions: string;
  fileUrl?: string;
};

export type ContractRequest = {
  balance?: number | null;
  balancePaymentDate?: string;
  carName?: string;
  carNumber?: string;
  carType?: string;
  carUse?: string;
  chatRoomId: number;
  contractWriterType?: string;
  downPayment?: number | null;
  downPaymentDate?: string;
  identificationNumber?: string;
  intermediatePayment?: number | null;
  intermediatePaymentDate?: string;
  motorType?: string;
  tradingAmount?: number;
  transfereeAddress?: string;
  transfereeName?: string;
  transfereePhoneNumber?: string;
  transfereeRegistrationNumber?: string;
  transfereeSignImageUrl?: string;
  transferorAddress?: string;
  transferorName?: string;
  transferorPhoneNumber?: string;
  transferorRegistrationNumber?: string;
  transferorSignImageUrl?: string;
  year?: string;
  additionalConditions?: string;
};

export const INITIAL_CONTRACT_INFO: ContractInfo = {
  id: 0,
  balance: null,
  balancePaymentDate: "",
  carName: "",
  carNumber: "",
  carType: "",
  carUse: "",
  downPayment: null,
  downPaymentDate: "",
  identificationNumber: "",
  intermediatePayment: null,
  intermediatePaymentDate: "",
  motorType: "",
  tradingAmount: 0,
  transfereeAddress: "",
  transfereeCompleted: false,
  transfereeCompletedDate: "",
  transfereeName: "",
  transfereePhoneNumber: "",
  transfereeRegistrationNumber: "",
  transfereeSignImageUrl: "",
  transferorAddress: "",
  transferorCompleted: false,
  transferorCompletedDate: "",
  transferorName: "",
  transferorPhoneNumber: "",
  transferorRegistrationNumber: "",
  transferorSignImageUrl: "",
  year: "",
  additionalConditions: "",
};
