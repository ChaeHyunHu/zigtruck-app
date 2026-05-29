export function formatNoticeDate(value?: string, shortYear = true) {
  if (!value) return "-";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = shortYear ? match[1].slice(2) : match[1];
    return `${year}.${match[2]}.${match[3]}`;
  }
  return value;
}
