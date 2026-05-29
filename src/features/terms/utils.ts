import type { TermItem } from "@/src/features/terms/types";

export type TermsMemberTypeCode = "NORMAL" | "DEALER";

/** 비로그인·일반 회원 → NORMAL, 딜러 회원 → DEALER */
export function getTermsAudienceMemberType(
  isAuthenticated: boolean,
  memberTypeCode?: string,
): TermsMemberTypeCode {
  if (!isAuthenticated || memberTypeCode !== "DEALER") {
    return "NORMAL";
  }
  return "DEALER";
}

export function parseTermListResponse(res: { data?: unknown }): TermItem[] {
  const list =
    (res.data as { data?: TermItem[] })?.data ?? (res.data as TermItem[] | undefined) ?? [];
  return Array.isArray(list) ? list : [];
}

export function filterTermsForMemberType(
  terms: TermItem[],
  memberType: TermsMemberTypeCode,
): TermItem[] {
  return terms.filter((item) => (item.membersType?.code ?? "NORMAL") === memberType);
}
