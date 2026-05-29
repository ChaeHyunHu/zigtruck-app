export function validatePower(
  value: string | number,
  tons: string | number,
): { isValid: boolean; errorMessage: string } {
  const power = typeof value === "string" ? parseFloat(value) : value;
  const tonnage = parseFloat(String(tons));

  if (value === "" || value === null || value === undefined) {
    return { isValid: false, errorMessage: "마력수는 필수값입니다." };
  }

  if (Number.isNaN(power) || power < 0) {
    return { isValid: false, errorMessage: "0 이상으로 입력해주세요." };
  }

  if (power > 0 && power < 1) {
    return { isValid: false, errorMessage: "1 이상으로 입력해주세요." };
  }

  if (Number.isNaN(tonnage)) {
    return { isValid: false, errorMessage: "톤수를 올바르게 입력해주세요." };
  }

  return { isValid: true, errorMessage: "" };
}

export function hasPowerValue(value: string | number | null | undefined): boolean {
  return value !== "" && value !== null && value !== undefined;
}

export function powerMatchesHorsepowerList(
  saved: string | number | null | undefined,
  horsepower: unknown[],
): boolean {
  if (!hasPowerValue(saved)) return false;
  const n = Number(saved);
  const s = String(saved).trim();
  if (s === "" || Number.isNaN(n)) return false;
  return horsepower.some((hp) => {
    const hs = String(hp).trim();
    return hs === s || Number(hp) === n;
  });
}
