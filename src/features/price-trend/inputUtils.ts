/** 소수점 최대 2자리까지 허용 */
export function sanitizeDecimalMax2(value: string): string {
  let next = value.replace(/[^\d.]/g, "");
  const dotIndex = next.indexOf(".");
  if (dotIndex >= 0) {
    const intPart = next.slice(0, dotIndex);
    const decPart = next.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2);
    next = decPart.length > 0 ? `${intPart}.${decPart}` : intPart + (next.endsWith(".") ? "." : "");
  }
  return next;
}

export function isUnderFourTons(tons: string) {
  const n = Number(tons);
  return Number.isFinite(n) && n > 0 && n < 4;
}

const LOADED_INNER_LENGTH_MIN = 1;
const LOADED_INNER_LENGTH_MAX = 10.5;
const LOADED_INNER_DIMENSION_MIN = 1;
const DISTANCE_MIN = 1;
const DISTANCE_MAX = 2_000_000;

export const LOADED_INNER_LENGTH_RANGE_ERROR =
  "길이 1m 이상~ 10.5m 이하로 입력해주세요.";
export const LOADED_INNER_LENGTH_REQUIRED_ERROR = "길이를 입력해주세요.";
export const LOADED_INNER_WIDTH_MIN_ERROR = "1m 이상으로 입력해주세요.";
export const LOADED_INNER_HEIGHT_MIN_ERROR = "1m 이상으로 입력해주세요.";
export const DISTANCE_RANGE_ERROR =
  "주행거리 1km 이상 ~ 2,000,000 km 이하로 입력해주세요.";
export const DISTANCE_REQUIRED_ERROR = "주행거리를 입력해주세요.";

type FieldValidation = { error: boolean; message: string };

export function validateLoadedInnerLength(value: string): FieldValidation {
  if (!value) {
    return { error: true, message: LOADED_INNER_LENGTH_REQUIRED_ERROR };
  }
  const num = Number(value);
  if (
    !Number.isFinite(num) ||
    num < LOADED_INNER_LENGTH_MIN ||
    num > LOADED_INNER_LENGTH_MAX
  ) {
    return { error: true, message: LOADED_INNER_LENGTH_RANGE_ERROR };
  }
  return { error: false, message: "" };
}

/** 너비·높이는 선택 입력 — 빈 값은 에러 없음 */
export function validateLoadedInnerWidth(value: string): FieldValidation {
  if (!value.trim()) {
    return { error: false, message: "" };
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < LOADED_INNER_DIMENSION_MIN) {
    return { error: true, message: LOADED_INNER_WIDTH_MIN_ERROR };
  }
  return { error: false, message: "" };
}

export function validateLoadedInnerHeight(value: string): FieldValidation {
  if (!value.trim()) {
    return { error: false, message: "" };
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < LOADED_INNER_DIMENSION_MIN) {
    return { error: true, message: LOADED_INNER_HEIGHT_MIN_ERROR };
  }
  return { error: false, message: "" };
}

export function validateDistance(value: string): FieldValidation {
  if (!value) {
    return { error: true, message: DISTANCE_REQUIRED_ERROR };
  }
  const num = Number(value);
  if (!Number.isFinite(num) || num < DISTANCE_MIN || num > DISTANCE_MAX) {
    return { error: true, message: DISTANCE_RANGE_ERROR };
  }
  return { error: false, message: "" };
}
