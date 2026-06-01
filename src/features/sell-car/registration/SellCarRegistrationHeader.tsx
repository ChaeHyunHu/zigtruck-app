import React from "react";

import { RegistrationHeader } from "@/src/features/sell-car/registration/RegistrationHeader";

type SellCarRegistrationHeaderProps = {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
};

/** 내차판매 등록 플로우 헤더 — 뒤로가기 시 나가기 확인 모달 표시 */
export const SellCarRegistrationHeader = React.memo(function SellCarRegistrationHeader(
  props: SellCarRegistrationHeaderProps,
) {
  return <RegistrationHeader exitConfirmOnBack {...props} />;
});
