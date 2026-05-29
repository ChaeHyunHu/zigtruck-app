export type SignUpMemberType = 'NORMAL' | 'DEALER';

export type SignUpAgreementState = {
  terms: boolean;
  personalInfo: boolean;
  marketing: boolean;
  dealerTerms: boolean;
};

export type SignUpFormState = SignUpAgreementState & {
  phoneNumber: string;
  authNumber: string;
  isPhoneVerified: boolean;
  name: string;
  password: string;
};

export function parseSignUpMemberType(value: string | string[] | undefined): SignUpMemberType {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === 'DEALER' ? 'DEALER' : 'NORMAL';
}
