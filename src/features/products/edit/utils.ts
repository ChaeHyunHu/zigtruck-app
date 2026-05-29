import { ADDRESS2, ADDRESS3 } from "@/src/constants/address";
import type { RegistrationProduct } from "@/src/features/sell-car/registration/types";

export function isOneTonRange(tons?: number | string): boolean {
  const n = Number(tons);
  return n === 1 || n === 1.1 || n === 1.2;
}

export function sanitizeTonsInput(value: string): string {
  let next = value.replace(/[^\d.]/g, "");
  const dotIndex = next.indexOf(".");
  if (dotIndex >= 0) {
    const intPart = next.slice(0, dotIndex);
    const decPart = next.slice(dotIndex + 1).replace(/\./g, "").slice(0, 1);
    next =
      decPart.length > 0
        ? `${intPart}.${decPart}`
        : intPart + (next.endsWith(".") ? "." : "");
  }
  return next;
}

export function sanitizePowerInput(value: string): string {
  return value.replace(/[^\d]/g, "").slice(0, 4);
}

export function formatDistanceInput(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const n = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return String(value);
  return String(n);
}

export function getArea2Options(area1: string) {
  return ADDRESS2[area1] ?? [];
}

export function getArea3Options(area1: string) {
  return ADDRESS3[area1] ?? [];
}

export function validateVehicleForm(form: RegistrationProduct): string | null {
  if (!form.manufacturerCategories?.name) return "제조사 정보가 없습니다.";
  if (!form.model?.id && !form.model?.name) return "모델을 선택해주세요.";
  if (!form.tons) return "톤수를 입력해주세요.";
  if (!form.loaded?.code) return "적재함 종류를 선택해주세요.";
  if (!form.loadedInnerLength) return "적재함 길이를 입력해주세요.";
  if (!form.transmission?.code) return "변속기를 선택해주세요.";
  if (!form.distance && form.distance !== 0) return "주행거리를 입력해주세요.";
  if (!form.fuel?.code) return "연료를 선택해주세요.";
  if (!hasPowerValue(form.power)) return "마력수를 입력하거나 선택해주세요.";
  return null;
}

function hasPowerValue(value: string | number | null | undefined): boolean {
  return value !== "" && value !== null && value !== undefined;
}
