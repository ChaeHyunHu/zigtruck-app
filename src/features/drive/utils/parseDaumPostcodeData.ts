export type DaumAddressResult = {
  fullLocate: string;
  shortLocate: string;
};

/** 다음 우편번호 oncomplete 원본 데이터 → 표시용 주소 (웹 TransferForm 동일) */
export function parseDaumPostcodeData(raw: Record<string, unknown>): DaumAddressResult | null {
  const addressType = String(raw.addressType ?? "");
  let fullLocate = String(raw.address ?? "");

  if (addressType === "R") {
    fullLocate = String(raw.roadAddress ?? raw.address ?? "");
    const bname = String(raw.bname ?? "");
    const buildingName = String(raw.buildingName ?? "");
    let extra = bname;
    if (buildingName) {
      extra = extra ? `${extra}, ${buildingName}` : buildingName;
    }
    if (extra) fullLocate += ` (${extra})`;
  } else if (addressType === "J") {
    fullLocate = String(raw.jibunAddress ?? raw.address ?? "");
  }

  if (!fullLocate.trim()) {
    fullLocate =
      String(raw.roadAddress ?? "") ||
      String(raw.jibunAddress ?? "") ||
      String(raw.autoRoadAddress ?? "") ||
      String(raw.autoJibunAddress ?? "") ||
      "";
  }

  if (!fullLocate.trim()) return null;

  let sido = String(raw.sido ?? "");
  if (sido.includes("특별자치도")) {
    sido = sido.replace("특별자치도", "");
  }
  const shortLocate = `${sido} ${String(raw.sigungu ?? "")}`.trim();

  return { fullLocate: fullLocate.trim(), shortLocate };
}
