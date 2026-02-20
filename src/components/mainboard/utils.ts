import type { StatusLevel } from './types';

export function formatDateTimeKST(date: Date) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get(
    'minute',
  )}`;
}

export function formatDurationSeconds(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '-';
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function statusLabel(level: StatusLevel) {
  switch (level) {
    case 'ok':
      return '정상';
    case 'warn':
      return '경고';
    case 'error':
      return '위험';
  }
}

export function statusClasses(level: StatusLevel) {
  switch (level) {
    case 'ok':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'warn':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'error':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
  }
}

export function statusColor(level: StatusLevel) {
  switch (level) {
    case 'ok':
      return '#10b981';
    case 'warn':
      return '#f59e0b';
    case 'error':
      return '#ef4444';
  }
}

