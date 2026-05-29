export function formatChatDateLabel(dateStr?: string) {
  if (!dateStr) return "";
  const normalized = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}년 ${month}월 ${day}일`;
}

export function formatChatTimeLabel(dateStr?: string) {
  if (!dateStr) return "";
  const normalized = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  const hours = date.getHours();
  const ampm = hours < 12 ? "오전" : "오후";
  const hour12 = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${ampm} ${hour12}:${minutes}`;
}

export function isSameChatDay(a?: string, b?: string) {
  if (!a || !b) return false;
  return formatChatDateLabel(a) === formatChatDateLabel(b);
}

export function formatChatTimeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const normalized = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 5) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  return `${diffYear}년 전`;
}

export function isLastMessageInBlock(
  messages: { senderId: number; createdDate?: string; isRead?: boolean }[],
  index: number,
): boolean {
  const current = messages[index];
  const next = messages[index + 1];
  if (!next) return true;
  if (Number(current.senderId) !== Number(next.senderId)) return true;
  if (formatChatTimeLabel(current.createdDate) !== formatChatTimeLabel(next.createdDate)) {
    return true;
  }
  if (Boolean(current.isRead) !== Boolean(next.isRead)) return true;
  return false;
}
