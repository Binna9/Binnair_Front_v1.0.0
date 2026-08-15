import type {
  TradingControlSchemaGroup,
  TradingControlSchemaParam,
} from '@/types/TradingControlTypes';

/**
 * schema visible_when이 없거나 구 API여도
 * timesfm_* / fincast_* 키·그룹은 predictor_type에 따라 상호 배타.
 */
export function resolveVisibleWhen(
  visibleWhen: Record<string, string> | undefined,
  keyOrGroupId?: string
): Record<string, string> | undefined {
  if (visibleWhen && Object.keys(visibleWhen).length > 0) {
    return visibleWhen;
  }
  if (!keyOrGroupId) return undefined;
  if (
    keyOrGroupId === 'timesfm' ||
    keyOrGroupId.startsWith('timesfm_')
  ) {
    return { predictor_type: 'timesfm' };
  }
  if (
    keyOrGroupId === 'fincast' ||
    keyOrGroupId.startsWith('fincast_')
  ) {
    return { predictor_type: 'fincast' };
  }
  return undefined;
}

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
  const rule =
    resolveVisibleWhen(param.visible_when, param.key) ??
    resolveVisibleWhen(undefined, param.group);
  return (
    matchesVisibleWhen(rule, values) &&
    isAutopilotGatedVisible(param.key, values)
  );
}

export function isControlGroupVisible(
  group: TradingControlSchemaGroup,
  values: Record<string, unknown>
): boolean {
  const rule = resolveVisibleWhen(group.visible_when, group.id);
  return matchesVisibleWhen(rule, values);
}
