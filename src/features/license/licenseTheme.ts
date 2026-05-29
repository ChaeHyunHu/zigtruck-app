/** 웹 zigtruck-front secondaryBlue / secondaryRed 와 동일 */
export type LicenseGuideVariant = "purchase" | "sales";

export type LicenseTheme = {
  accent: string;
  accentLightBg: string;
  introCardBg: string;
  stepCardBg: string;
  exceptionBg: string;
  exceptionBorder: string;
  selectedRadioBg: string;
  /** 등록 가능 여부 표시 (웹과 동일: 가능=파랑, 불가=빨강) */
  registerOkColor: string;
  registerNgColor: string;
};

export const licenseThemes: Record<LicenseGuideVariant, LicenseTheme> = {
  purchase: {
    accent: "#1E42A6",
    accentLightBg: "#EFF6FF",
    introCardBg: "#EFF6FF",
    stepCardBg: "#EFF6FF",
    exceptionBg: "#eef5ff",
    exceptionBorder: "#E4EBFF",
    selectedRadioBg: "#F1F5FF",
    registerOkColor: "#1E42A6",
    registerNgColor: "#A61E20",
  },
  sales: {
    accent: "#A61E20",
    accentLightBg: "#FFEFEF",
    introCardBg: "#FFF8F8",
    stepCardBg: "#FFEFEF",
    exceptionBg: "#FFEFEF",
    exceptionBorder: "#f5d0d0",
    selectedRadioBg: "#FFF0F0",
    registerOkColor: "#1E42A6",
    registerNgColor: "#A61E20",
  },
};

export function getLicenseTheme(variant: LicenseGuideVariant): LicenseTheme {
  return licenseThemes[variant];
}
