const registrationRegex = /^\d{6}-?\d{7}$/;
const businessRegex = /^\d{3}-?\d{2}-?\d{5}$/;
// 성명: 한글/영문만 허용 (공백·숫자·특수문자 불가)
const contractNameRegex = /^[가-힣a-zA-Z]+$/;

export const CONTRACT_NAME_VALIDATION_MESSAGE = "한글과 영문만 입력해주세요.";

export function validateContractRegistrationNumber(value: string): {
  isValid: boolean;
  errorMessage: string;
} {
  const raw = value.replace(/-/g, "");
  if (!raw) {
    return { isValid: false, errorMessage: "주민등록번호(사업자번호)는 필수값입니다." };
  }
  if (raw.length === 10 && businessRegex.test(value.replace(/\s/g, ""))) {
    return { isValid: true, errorMessage: "" };
  }
  if ((raw.length === 13 || value.includes("-")) && registrationRegex.test(value.replace(/\s/g, ""))) {
    return { isValid: true, errorMessage: "" };
  }
  if (raw.length === 13) {
    return { isValid: true, errorMessage: "" };
  }
  if (raw.length === 10) {
    return { isValid: true, errorMessage: "" };
  }
  return { isValid: false, errorMessage: "올바른 주민등록번호(사업자번호)가 아닙니다." };
}

export function validateContractName(value: string) {
  if (!value.trim()) {
    return { isValid: false, errorMessage: "성명은 필수값입니다." };
  }
  if (/\s/.test(value)) {
    return { isValid: false, errorMessage: "올바른 성명이 아닙니다." };
  }
  if (!contractNameRegex.test(value)) {
    return { isValid: false, errorMessage: CONTRACT_NAME_VALIDATION_MESSAGE };
  }
  return { isValid: true, errorMessage: "" };
}

export function validatePositiveAmount(value: string, label: string) {
  if (!value.trim()) {
    return { isValid: false, errorMessage: `${label}은 필수값입니다.` };
  }
  const num = Number(value.replace(/[^\d]/g, ""));
  if (!Number.isFinite(num) || num <= 0) {
    return { isValid: false, errorMessage: `${label}을 올바르게 입력해주세요.` };
  }
  return { isValid: true, errorMessage: "" };
}
