const nameRegex = /^[가-힣a-zA-Z0-9]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^*+=-])[A-Za-z\d!@#$%^*+=-]{8,20}$/;
const allowedSpecialCharsRegex = /^[A-Za-z\d!@#$%^*+=-]*$/;
const numberRegex = /^[0-9]+$/;

export const PASSWORD_VALIDATION_MESSAGE =
  '영문, 숫자, 특수문자를 포함해 8~20자리로 입력해주세요.';
export const PASSWORD_NOT_MATCH_MESSAGE = '비밀번호가 일치하지 않습니다.';
export const MEMBER_NAME_VALIDATION_MESSAGE =
  '이름은 띄어쓰기 없이 한글, 영문, 숫자만 입력해주세요.';

export function validateMemberName(name: string) {
  return nameRegex.test(name);
}

export function validateDigitsOnly(value: string) {
  return numberRegex.test(value);
}

export function validateMemberPassword(password: string): {
  isValid: boolean;
  errorMessage: string;
} {
  if (!allowedSpecialCharsRegex.test(password)) {
    return {
      isValid: false,
      errorMessage: '특수문자는 !@#$%^*+=- 만 사용 가능합니다.',
    };
  }
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      errorMessage: PASSWORD_VALIDATION_MESSAGE,
    };
  }
  return { isValid: true, errorMessage: '' };
}
