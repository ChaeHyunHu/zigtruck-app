const nameRegex = /^[가-힣a-zA-Z\s]+$/;
const phoneNumberRegex = /^01[0-9]{8,9}$/;

export const NAME_VALIDATION_MESSAGE = "한글, 영문만 입력 가능합니다.";
export const NAME_VALIDATION_LENGTH_MESSAGE = "이름은 20자 이내로 입력해주세요.";
export const PHONE_NUMBER_VALIDATION_LENGTH_MESSAGE =
  "휴대폰 번호는 11자리 이하로 입력해주세요.";
export const PHONE_NUMBER_VALIDATION_MESSAGE = "올바른 휴대폰 번호를 입력해주세요.";

export function validateName(name: string) {
  return nameRegex.test(name);
}

export function validatePhoneNumber(number: string) {
  if (!phoneNumberRegex.test(number)) {
    return {
      isValid: false as const,
      errorMessage: "올바른 휴대폰 번호가 아닙니다.",
    };
  }
  return { isValid: true as const, errorMessage: "" };
}

export function validateApplicantFields(name: string, phoneNumber: string) {
  let nameError = false;
  let nameErrorMessage = "";
  let phoneError = false;
  let phoneErrorMessage = "";

  if (name.length > 20) {
    nameError = true;
    nameErrorMessage = NAME_VALIDATION_LENGTH_MESSAGE;
  } else if (!validateName(name)) {
    nameError = true;
    nameErrorMessage = NAME_VALIDATION_MESSAGE;
  }

  if (phoneNumber.length > 11) {
    phoneError = true;
    phoneErrorMessage = PHONE_NUMBER_VALIDATION_LENGTH_MESSAGE;
  } else {
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      phoneError = true;
      phoneErrorMessage = phoneValidation.errorMessage;
    }
  }

  return {
    nameError,
    nameErrorMessage,
    phoneError,
    phoneErrorMessage,
    hasError: nameError || phoneError,
  };
}
