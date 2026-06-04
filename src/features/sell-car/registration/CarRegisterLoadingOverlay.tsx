import React from "react";

import { AppLoadingOverlay } from "@/src/components/common/AppLoadingOverlay";

type Props = {
  message?: string;
};

/** 소유자명 조회 중 — 페이지 위 오버레이 + Lottie */
export function CarRegisterLoadingOverlay({
  message = "데이터를 조회중입니다. 잠시만 기다려주세요.",
}: Props) {
  return <AppLoadingOverlay visible embedded message={message} />;
}
