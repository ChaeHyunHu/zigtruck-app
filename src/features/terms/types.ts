export type TermTypeCode =
  | "USE_TERMS"
  | "PERSONAL_INFO_TERMS"
  | "MARKETING"
  | string;

export type TermItem = {
  id: number;
  termsType: {
    code: TermTypeCode;
    desc: string;
  };
  membersType?: {
    code: string;
    desc?: string;
  };
  contents?: string;
};

export const TERM_TYPE_TITLES: Record<string, string> = {
  USE_TERMS: "서비스 이용약관",
  PERSONAL_INFO_TERMS: "개인정보 처리방침",
  MARKETING: "마케팅 정보 수신 동의 약관",
};
