/** 날짜(YYYY-MM-DD) ↔ history API ISO8601 변환 (KST 기준, to_at은 미만) */

const KST_OFFSET = '+09:00';

/** 로컬(브라우저) 날짜를 YYYY-MM-DD로 */
export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 타이핑/캘린더 입력을 YYYY-MM-DD로 정규화.
 * 허용: 2026-07-17, 2026/7/17, 2026.07.17, 20260717
 * 빈 문자열·잘못된 값은 ''
 */
export function normalizeDateInput(raw: string): string {
  const t = raw.trim();
  if (!t) return '';

  let y: number;
  let m: number;
  let d: number;

  const dashed = t.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (dashed) {
    y = Number(dashed[1]);
    m = Number(dashed[2]);
    d = Number(dashed[3]);
  } else {
    const compact = t.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!compact) return '';
    y = Number(compact[1]);
    m = Number(compact[2]);
    d = Number(compact[3]);
  }

  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return '';
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return '';
  }
  return toDateInputValue(dt);
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
