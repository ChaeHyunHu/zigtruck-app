/** 주소에서 시·군·구 단위 short 주소 추출 (웹 extractCityCounty 동일) */
export function extractCityCounty(address: string): string {
  const targets = ["시", "군", "구"];
  let lastIndex = -1;
  for (const target of targets) {
    const index = address.lastIndexOf(target);
    if (index > lastIndex) lastIndex = index;
  }
  if (lastIndex !== -1) return address.slice(0, lastIndex + 1).trim();
  return address;
}
