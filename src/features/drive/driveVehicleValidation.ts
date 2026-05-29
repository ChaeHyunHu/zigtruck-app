import { getTonnageErrorMessage } from "@/src/features/sell-car/registration/validation";

export function isValidLoadedInnerLengthRange(length: number): boolean {
  return Number.isFinite(length) && length >= 1 && length <= 10.5;
}

export function getDriveLoadedInnerLengthError(
  tons: number | string | undefined,
  value: string | number,
): string {
  const length = Number(value);
  if (!value && value !== 0) return "적재함 길이를 입력해주세요.";
  if (!Number.isFinite(length) || length <= 0) return "적재함 길이를 입력해주세요.";
  if (!isValidLoadedInnerLengthRange(length)) {
    return "적재함 길이는 1m 이상 10.5m 이하로 입력해주세요.";
  }
  const t = Number(tons);
  if (Number.isFinite(t) && t >= 4.5 && length < 5) {
    return "적재함 길이는 5m 이상으로 입력해주세요.";
  }
  if (Number.isFinite(t) && t >= 2 && length < 3) {
    return "적재함 길이는 3m 이상으로 입력해주세요.";
  }
  if (Number.isFinite(t) && t < 2 && length < 2) {
    return "적재함 길이는 2m 이상으로 입력해주세요.";
  }
  return "";
}

export function validateDriveVehicleForm(params: {
  tons: string;
  axisCode: string;
  loadedCode: string;
  loadedInnerLength: string;
  fuelEfficiency: string;
  axisDisabled: boolean;
}): string | null {
  const tonsError = getTonnageErrorMessage(params.tons);
  if (tonsError) return tonsError;

  if (!params.axisDisabled && !params.axisCode) {
    return "가변축을 입력해주세요.";
  }
  if (!params.loadedCode) {
    return "적재함 종류를 입력해주세요.";
  }

  const lengthError = getDriveLoadedInnerLengthError(params.tons, params.loadedInnerLength);
  if (lengthError) return lengthError;

  const fuel = Number(params.fuelEfficiency);
  if (!params.fuelEfficiency || !Number.isFinite(fuel) || fuel === 0) {
    return "연비를 입력해주세요.";
  }

  return null;
}
