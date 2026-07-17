/** history 테이블 공통 라벨/포맷 */

export const EXIT_REASON_LABEL: Record<string, string> = {
  TAKE_PROFIT: '익절(TP)',
  STOP_LOSS: '손절(SL)',
  MODEL_SELL: '모델 매도',
  TP: '익절(TP)',
  SL: '손절(SL)',
  SIGNAL: '시그널',
};

export function formatDuration(seconds?: number | null) {
  if (seconds == null) return '-';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}분 ${s}초`;
}

export function formatExitReason(reason?: string | null) {
  if (!reason) return '-';
  return EXIT_REASON_LABEL[reason] ?? reason;
}
