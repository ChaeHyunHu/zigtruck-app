import type { ChatRoomDetail } from "@/src/features/chat/types";
import { toContractBool } from "@/src/features/contract/navigation";

type Props = {
  room: ChatRoomDetail;
  memberId?: number;
};

/** 채팅 시나리오 메시지와 중복되므로 상단 배너는 표시하지 않음 */
export function ContractChatBanners(_props: Props) {
  return null;
}

export function getContractButtonLabel(
  room: ChatRoomDetail,
  memberId?: number,
): string {
  const isBuyer = Number(memberId) === Number(room.buyer?.id);
  const transferorCompleted = toContractBool(room.transferorCompleted);
  const transfereeCompleted = toContractBool(room.transfereeCompleted);
  if (!transferorCompleted && !transfereeCompleted) {
    return "안심 전자계약서 작성하기";
  }
  if (transferorCompleted && !transfereeCompleted) {
    return isBuyer ? "안심 전자계약서 작성하기" : "안심 전자계약서 확인하기";
  }
  if (transferorCompleted && transfereeCompleted) {
    return "안심 전자 계약서 보기";
  }
  return "안심 전자계약서 작성하기";
}
