const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()} (${DAY_NAMES[d.getDay()]})`;
}

export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
