const DUE_FORMATTER = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });
const TIME_FORMATTER = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" });

export function formatDue(date: Date) {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return "วันนี้";
  return DUE_FORMATTER.format(date);
}

export function formatDateTime(date: Date) {
  return `${DUE_FORMATTER.format(date)} · ${TIME_FORMATTER.format(date)}`;
}

export function formatTime(date: Date) {
  return TIME_FORMATTER.format(date);
}
