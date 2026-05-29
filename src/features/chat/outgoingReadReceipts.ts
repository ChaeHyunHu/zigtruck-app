/**
 * 내가 보낸 메시지의 "읽음"은 상대가 실제로 읽었을 때만 표시한다.
 * - 같은 채팅방에 처음 들어온 시각 이후 보낸 메시지: READ 웹소켓으로만 읽음 처리 (서버/폴링 isRead 무시)
 * - 그 이전 메시지: 서버 isRead 신뢰 (나갔 있는 동안 상대가 읽은 경우)
 *
 * 자기 echo 방지:
 * - 클라가 직접 보낸 메시지 id 는 `markOutgoingMessageSent` 로 시각과 함께 기록한다.
 *   서버가 본인 메시지를 자동으로 read 처리해 READ 이벤트로 돌려보내도 짧은 grace 동안은 무시한다.
 * - 시간 동기화 차이로 sentAfterSessionStart 가 잘못 false 가 되는 케이스 방어용으로
 *   `outgoingSentAtById` 에 잡힌 메시지는 항상 "세션 이후 보낸 메시지" 로 간주한다.
 */
const roomSessionStartedAt = new Map<number, number>();
const readReceiptIdsByRoom = new Map<number, Set<number>>();
const outgoingSentAtById = new Map<number, number>();

const SELF_ECHO_GRACE_MS = 5000;
const SESSION_START_SKEW_MS = 60_000;

export function ensureRoomSession(roomId: number) {
  if (!roomSessionStartedAt.has(roomId)) {
    roomSessionStartedAt.set(roomId, Date.now());
  }
}

/** 방을 나갈 때: READ 수신 캐시만 비움. 세션 시작 시각은 앱 세션 동안 유지(재입장 시 서버 isRead 오판 방지). */
export function clearRoomSession(roomId: number) {
  readReceiptIdsByRoom.delete(roomId);
}

export function resetOutgoingReadReceipts() {
  roomSessionStartedAt.clear();
  readReceiptIdsByRoom.clear();
  outgoingSentAtById.clear();
}

export function getReadReceiptIds(roomId: number): Set<number> {
  let ids = readReceiptIdsByRoom.get(roomId);
  if (!ids) {
    ids = new Set();
    readReceiptIdsByRoom.set(roomId, ids);
  }
  return ids;
}

/** 내가 직접 send 한 메시지의 id 를 기록한다. tempId 가 아닌 서버 부여 id 로 호출한다. */
export function markOutgoingMessageSent(messageId: number | undefined) {
  if (messageId == null) return;
  const id = Number(messageId);
  if (!Number.isFinite(id) || id <= 0) return;
  outgoingSentAtById.set(id, Date.now());
}

export function addReadReceiptIds(roomId: number, messageIds: number[]) {
  const ids = getReadReceiptIds(roomId);
  const now = Date.now();
  messageIds.forEach((id) => {
    if (!Number.isFinite(id) || id <= 0) return;
    const sentAt = outgoingSentAtById.get(id);
    if (sentAt != null && now - sentAt < SELF_ECHO_GRACE_MS) {
      // 본인이 방금 send 한 메시지를 서버가 자동 read 처리해 돌려보낸 self-echo 는 무시
      return;
    }
    ids.add(id);
  });
}

function parseMessageTime(createdDate?: string) {
  if (!createdDate) return 0;
  const normalized = createdDate.includes("T")
    ? createdDate
    : createdDate.replace(" ", "T");
  const time = new Date(normalized).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/**
 * 상대 메시지가 있으면 그보다 앞에 있는 내 메시지는 읽은 것으로 간주한다.
 * (답장이 왔는데 안읽음인 경우 방지)
 */
export function syncReadReceiptsFromConversation(
  messages: { id: number; senderId: number; createdDate?: string; tempId?: number }[],
  memberId: number,
  roomId: number,
) {
  const sorted = messages
    .filter((m) => m.tempId == null && Number.isFinite(m.id) && m.id > 0)
    .sort((a, b) => {
      const ta = parseMessageTime(a.createdDate);
      const tb = parseMessageTime(b.createdDate);
      if (ta !== tb) return ta - tb;
      return a.id - b.id;
    });

  const ids: number[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (Number(sorted[i].senderId) === Number(memberId)) continue;
    for (let j = 0; j < i; j += 1) {
      const prev = sorted[j];
      if (Number(prev.senderId) === Number(memberId)) {
        ids.push(prev.id);
      }
    }
  }
  if (ids.length > 0) {
    addReadReceiptIds(roomId, ids);
  }
}

export function resolveOutgoingReadState(
  message: { id: number; senderId: number; createdDate?: string; isRead?: boolean },
  memberId: number | undefined,
  roomId: number | undefined,
): boolean | undefined {
  if (memberId == null || roomId == null) return undefined;
  if (Number(message.senderId) !== Number(memberId)) return undefined;

  const sessionStart = roomSessionStartedAt.get(roomId) ?? 0;
  const readReceiptIds = getReadReceiptIds(roomId);
  const sentAt = parseMessageTime(message.createdDate);
  const sentAfterSessionStart =
    sessionStart > 0 && sentAt >= sessionStart - SESSION_START_SKEW_MS;
  const locallyTracked = outgoingSentAtById.has(message.id);

  if (sentAfterSessionStart || locallyTracked) {
    return readReceiptIds.has(message.id);
  }

  return Boolean(message.isRead) || readReceiptIds.has(message.id);
}
