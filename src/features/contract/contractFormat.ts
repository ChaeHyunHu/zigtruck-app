import { formatNumberWithComma, formatPrice } from "@/src/features/home/utils";

export function formatContractDisplayDate(value?: string) {
  if (!value) return "년 월 일";
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return value;
  return `${year}년 ${month}월 ${day}일`;
}

export function formatContractCompletedDate(value?: string) {
  if (!value) return "";
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return "";
  return `${year.slice(-2)}.${month}.${day}`;
}

export function formatContractAmountMan(value?: number | null) {
  if (value == null || value === 0) return "";
  return `${formatNumberWithComma(value)}만원`;
}

export function formatContractWon(value?: number | null) {
  if (value == null) return "";
  return formatNumberWithComma(Number(value) * 10000);
}

export function formatContractTradingLine(tradingAmount?: number) {
  if (tradingAmount == null) return "";
  return `一金 원정은 <strong>${formatPrice(tradingAmount)}</strong> 정 (₩${formatContractWon(tradingAmount)})`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatAdditionalConditionsHtml(value?: string) {
  if (!value) return "";
  return value
    .split("\n")
    .map((line) => `${escapeHtml(line)}<br/>`)
    .join("");
}
