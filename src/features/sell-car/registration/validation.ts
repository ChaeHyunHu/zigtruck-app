export const getTonnageErrorMessage = (value: string | number) => {
  const n = Number(value);
  if (!value && value !== 0) return "톤수를 입력해주세요.";
  if (!Number.isFinite(n) || n < 1 || n >= 30) return "1톤 이상 30톤 미만으로 입력해주세요.";
  return "";
};

export const validateDistance = (value: string | number) => {
  const n = Number(String(value).replace(/,/g, ""));
  if (!value && value !== 0) return "주행거리를 입력해주세요.";
  if (!Number.isFinite(n) || n < 1 || n > 2000000) {
    return "1km 이상 2,000,000km 이하로 입력해주세요.";
  }
  return "";
};

export const validatePrice = (value: string | number) => {
  const n = Number(String(value).replace(/,/g, ""));
  if (!value && value !== 0) return "판매 가격을 입력해주세요.";
  if (!Number.isFinite(n) || n <= 0) return "판매 가격을 올바르게 입력해주세요.";
  return "";
};

export const validateLoadedInnerLength = (
  tons: number | string | undefined,
  value: string | number,
) => {
  const length = Number(value);
  if (!value && value !== 0) return "적재함 길이를 입력해주세요.";
  if (!Number.isFinite(length) || length <= 0) return "적재함 길이를 입력해주세요.";
  const t = Number(tons);
  if (Number.isFinite(t) && t >= 4.5 && length < 5) {
    return "4.5톤 이상 차량은 적재함 길이 5m 이상 입력해주세요.";
  }
  return "";
};
