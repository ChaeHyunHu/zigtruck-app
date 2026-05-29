import { REPRESENTATIVE_NUMBER } from "@/src/features/additional-services/constants";
import { SALES_TYPE_THIRD_PARTY_DEALER } from "@/src/constants/products";

import type { ProductDetail } from "./types";
import { enumCode } from "./utils";

/** 딜러 회원(로그인 사용자) 여부 */
export function isDealerMember(memberTypeCode?: string | null) {
  return Boolean(memberTypeCode && memberTypeCode !== "NORMAL");
}

/** 딜러 회원이 등록한 매물 여부 */
export function isDealerProduct(product: ProductDetail) {
  return enumCode(product.salesType) === SALES_TYPE_THIRD_PARTY_DEALER;
}

/** 채팅 문의 버튼 노출 여부 */
export function canShowChatInquiry(product: ProductDetail) {
  return !isDealerProduct(product);
}

/**
 * 전화 문의 번호 (웹 ProductDetailFooter.startPhoneCall 동일)
 * - 딜러 회원 또는 딜러 매물 → 직트럭 대표번호
 * - 일반 → 안심번호(sellerSafetyNumber)
 */
export function resolveInquiryPhoneNumber(
  product: ProductDetail,
  memberTypeCode?: string | null,
) {
  if (isDealerMember(memberTypeCode) || isDealerProduct(product)) {
    return REPRESENTATIVE_NUMBER;
  }
  return (
    product.sellerSafetyNumber ??
    product.salesPeople?.safetyNumber ??
    product.safetyNumber ??
    REPRESENTATIVE_NUMBER
  );
}
