import { validateName } from "@/src/features/additional-services/validation";

const registrationRegex = /^\d{6}-?\d{7}$/;
const businessRegex = /^\d{3}-?\d{2}-?\d{5}$/;

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
  if (!validateName(value)) {
    return { isValid: false, errorMessage: "올바른 성명이 아닙니다." };
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
