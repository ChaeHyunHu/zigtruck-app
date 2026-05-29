import type { PickerOption } from "./OptionPickerSheet";

export type HorsepowerApiResponse = {
  result?: string;
  horsepower?: Array<number | string>;
  options?: Array<number | string>;
};

export const ZERO_HORSEPOWER_OPTION: PickerOption = {
  code: "0",
  desc: "0",
};

/** 웹 PriceTrendSearchForm과 동일: result Y + horsepower 배열 파싱 */
export function parseHorsepowerApiResponse(data: unknown): number[] | null {
  if (Array.isArray(data)) {
    return data
      .map((item) => Number(item))
      .filter((value) => !Number.isNaN(value));
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const response = data as HorsepowerApiResponse;

  if (response.result === "Y" && Array.isArray(response.horsepower)) {
    return response.horsepower
      .map((item) => Number(item))
      .filter((value) => !Number.isNaN(value));
  }

  if (Array.isArray(response.horsepower)) {
    return response.horsepower
      .map((item) => Number(item))
      .filter((value) => !Number.isNaN(value));
  }

  if (Array.isArray(response.options)) {
    return response.options
      .map((item) => Number(item))
      .filter((value) => !Number.isNaN(value));
  }

  return null;
}

export function mapHorsepowerToPickerOptions(list: number[]): PickerOption[] {
  return list.map((hp) => ({
    code: String(hp),
    desc: String(hp),
  }));
}
