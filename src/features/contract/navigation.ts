import { router } from "expo-router";

import { TRANSFEREE, TRANSFEROR } from "@/src/constants/contract";
import type { ChatRoomDetail } from "@/src/features/chat/types";
import type { ContractInfo } from "@/src/features/contract/types";

export function getContractWriterType(
  room: Pick<ChatRoomDetail, "buyer">,
  memberId?: number,
): typeof TRANSFEROR | typeof TRANSFEREE {
  const isBuyer = Number(memberId) === Number(room.buyer?.id);
  return isBuyer ? TRANSFEREE : TRANSFEROR;
}

export function toContractBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function normalizeContractInfo(data: Partial<ContractInfo>): ContractInfo {
  return {
    ...(data as ContractInfo),
    transferorCompleted: toContractBool(data.transferorCompleted),
    transfereeCompleted: toContractBool(data.transfereeCompleted),
  };
}

/** 채팅·배너에서 계약서 화면 열기 (항상 1단계 미리보기부터) */
export function navigateToContract(room: ChatRoomDetail, memberId?: number) {
  if (!room.id) return;

  const contractWriterType = getContractWriterType(room, memberId);

  router.push({
    pathname: "/contract",
    params: {
      chatRoomId: String(room.id),
      contractWriterType,
      productPrice: room.price != null ? String(room.price) : "",
    },
  });
}
