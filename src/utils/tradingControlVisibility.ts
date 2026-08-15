import type { TradingControlSchemaParam } from '@/types/TradingControlTypes';

/** schema visible_when — 현재 form 값과 모두 일치해야 표시 */
export function matchesVisibleWhen(
  visibleWhen: Record<string, string> | undefined,
  values: Record<string, unknown>
): boolean {
  if (!visibleWhen) return true;
  return Object.entries(visibleWhen).every(
    ([key, expected]) => String(values[key] ?? '') === expected
  );
}

/**
 * Autopilot on → 고정 TP/SL % 숨김, percentile 표시
 * Autopilot off → 반대
 */
export function isAutopilotGatedVisible(
  key: string,
  values: Record<string, unknown>
): boolean {
  const autopilotOn = Boolean(values.autopilot_enabled);
  if (key === 'trade_tp_pct' || key === 'trade_sl_pct') return !autopilotOn;
  if (key === 'autopilot_score_percentile') return autopilotOn;
  return true;
}

export function isControlParamVisible(
  param: TradingControlSchemaParam,
  values: Record<string, unknown>
): boolean {
  return (
    matchesVisibleWhen(param.visible_when, values) &&
    isAutopilotGatedVisible(param.key, values)
  );
}
