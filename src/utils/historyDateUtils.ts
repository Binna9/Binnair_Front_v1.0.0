/** 날짜(YYYY-MM-DD) ↔ history API ISO8601 변환 (KST 기준, to_at은 미만) */

const KST_OFFSET = '+09:00';

/** 로컬(브라우저) 날짜를 YYYY-MM-DD로 */
export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** fromDate(YYYY-MM-DD) → 그날 00:00:00 KST ISO */
export function dateToFromAt(dateStr: string | null | undefined): string | undefined {
  if (!dateStr) return undefined;
  return `${dateStr}T00:00:00${KST_OFFSET}`;
}

/**
 * toDate(YYYY-MM-DD) → 다음날 00:00:00 KST ISO (API to_at은 미만 `<`)
 */
export function dateToToAt(dateStr: string | null | undefined): string | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split('-').map(Number);
  const next = new Date(y, m - 1, d + 1);
  return `${toDateInputValue(next)}T00:00:00${KST_OFFSET}`;
}

export function daysAgoDateInput(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return toDateInputValue(d);
}

export function todayDateInput(): string {
  return toDateInputValue(new Date());
}
