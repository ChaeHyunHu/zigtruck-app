export function formatNumberWithComma(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "";
  const digits = String(value).replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("ko-KR");
}

/** price는 만원 단위 (API 저장값과 동일) */
export function formatPrice(value?: number | null) {
  if (value === undefined || value === null) return "-";
  const numericPrice = Number(value);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return "-";

  if (numericPrice < 10000) {
    return `${formatNumberWithComma(numericPrice)}만원`;
  }

  const billion = Math.floor(numericPrice / 10000);
  const remainder = numericPrice % 10000;

  if (billion >= 1 && remainder === 0) {
    return `${billion}억원`;
  }

  return `${billion}억 ${formatNumberWithComma(remainder)}만원`;
}

export function formatDistanceToThousandKm(value?: number | null) {
  if (!value && value !== 0) return '-';
  return `${Math.floor(value / 1000).toLocaleString('ko-KR')}`;
}

export function formatShortYear(year?: string) {
  if (!year || year.length < 2) return '-';
  return year.slice(-2);
}
