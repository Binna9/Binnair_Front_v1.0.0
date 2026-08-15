import React, { useEffect, useMemo, useState } from 'react';
import { TradingControlService } from '@/services/TradingControlService';
import type {
  TradingControlSchemaGroup,
  TradingControlSchemaParam,
  TradingControlSchemaResponse,
  TradingControlStatusResponse,
} from '@/types/TradingControlTypes';
import { applyPredictorPreset } from '@/utils/predictorPresets';
import {
  isControlGroupVisible,
  isControlParamVisible,
} from '@/utils/tradingControlVisibility';

function mergeStatusConfig(statusData: TradingControlStatusResponse) {
  return {
    ...(statusData.config ?? {}),
    ...(statusData.config_basic ?? {}),
    ...(statusData.config_advanced ?? {}),
  };
}

/** status/DB 값이 timesfm 잔여여도 현재 predictor_type에 맞게 run/model 동기화 */
function formValuesFromStatus(statusData: TradingControlStatusResponse) {
  const merged = mergeStatusConfig(statusData);
  return applyPredictorPreset(merged, merged.predictor_type);
}

const TradingControlPanel: React.FC = () => {
  const [schema, setSchema] = useState<TradingControlSchemaResponse | null>(null);
  const [status, setStatus] = useState<TradingControlStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [schemaData, statusData] = await Promise.all([
          TradingControlService.getSchema(),
          TradingControlService.getStatus(),
        ]);
        setSchema(schemaData);
        setStatus(statusData);
        setFormValues(formValuesFromStatus(statusData));
      } catch (error) {
        console.error('Failed to load trading control data', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const visibleParams = useMemo(() => {
    return (schema?.params ?? []).filter((param) =>
      isControlParamVisible(param, formValues)
    );
  }, [schema, formValues]);

  const basicFields = useMemo(
    () => visibleParams.filter((p) => p.tier === 'basic'),
    [visibleParams]
  );

  const advancedFields = useMemo(
    () => visibleParams.filter((p) => p.tier === 'advanced'),
    [visibleParams]
  );

  const groupLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of schema?.groups ?? []) {
      map.set(g.id, g.label);
    }
    return map;
  }, [schema]);

  const visibleGroups = useMemo(() => {
    const fromSchema = schema?.groups;
    if (fromSchema && fromSchema.length > 0) {
      return fromSchema.filter((g) => isControlGroupVisible(g, formValues));
    }
    // schema에 groups 없으면 등장 순서 기반
    const seen = new Set<string>();
    const inferred: TradingControlSchemaGroup[] = [];
    for (const p of visibleParams) {
      if (seen.has(p.group)) continue;
      seen.add(p.group);
      inferred.push({ id: p.group, label: groupLabelById.get(p.group) ?? p.group });
    }
    return inferred.filter((g) => isControlGroupVisible(g, formValues));
  }, [schema, formValues, visibleParams, groupLabelById]);

  const updateField = (key: string, value: unknown) => {
    setFormValues((prev) => {
      if (key === 'predictor_type') {
        return applyPredictorPreset(prev, value);
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await TradingControlService.saveConfig(formValues);
      const statusData = await TradingControlService.getStatus();
      setStatus(statusData);
      setFormValues(formValuesFromStatus(statusData));
    } catch (error) {
      console.error('Failed to save config', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStart = async () => {
    try {
      await TradingControlService.startTrading(formValues);
      const statusData = await TradingControlService.getStatus();
      setStatus(statusData);
      setFormValues(formValuesFromStatus(statusData));
    } catch (error) {
      console.error('Failed to start trading', error);
    }
  };

  const handleStop = async () => {
    try {
      await TradingControlService.stopTrading();
      const statusData = await TradingControlService.getStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to stop trading', error);
    }
  };

  const renderField = (param: TradingControlSchemaParam) => {
    const value = formValues[param.key];
    const inputClassName =
      'w-full rounded border border-[#2b3139] bg-[#0b0e11] px-2 py-1.5 text-xs text-[#eaecef] outline-none focus:border-[#0ecb81]';
    const hint = param.hint ? (
      <span className="text-[10px] text-[#5e6673]">{param.hint}</span>
    ) : null;

    if (param.options && param.options.length > 0) {
      return (
        <label key={param.key} className="flex flex-col gap-1 text-[11px] text-[#848e9c]">
          <span>{param.label}</span>
          <select
            value={String(value ?? param.options[0] ?? '')}
            onChange={(e) => updateField(param.key, e.target.value)}
            className={inputClassName}
          >
            {param.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {hint}
        </label>
      );
    }

    if (param.type === 'bool' || param.type === 'boolean') {
      return (
        <label
          key={param.key}
          className="flex flex-col gap-1 rounded border border-[#2b3139] bg-[#0b0e11] px-2 py-2 text-[11px] text-[#eaecef]"
        >
          <div className="flex items-center justify-between">
            <span>{param.label}</span>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => updateField(param.key, e.target.checked)}
              className="h-4 w-4 rounded border-[#2b3139] bg-[#0b0e11]"
            />
          </div>
          {hint}
        </label>
      );
    }

    return (
      <label key={param.key} className="flex flex-col gap-1 text-[11px] text-[#848e9c]">
        <span>{param.label}</span>
        <input
          type={param.type === 'number' || param.type === 'int' ? 'number' : 'text'}
          min={param.min}
          max={param.max}
          placeholder={param.example}
          value={value === null || value === undefined ? '' : String(value)}
          onChange={(e) => {
            const rawValue = e.target.value;
            if (param.type === 'int' || param.type === 'number') {
              updateField(param.key, rawValue === '' ? '' : Number(rawValue));
              return;
            }
            updateField(param.key, rawValue);
          }}
          className={inputClassName}
        />
        {hint}
      </label>
    );
  };

  const renderGroupedFields = (fields: TradingControlSchemaParam[]) => {
    return visibleGroups.map((group) => {
      const groupFields = fields.filter((f) => f.group === group.id);
      if (groupFields.length === 0) return null;
      return (
        <div key={group.id} className="space-y-2">
          <div className="text-[10px] font-medium uppercase tracking-wide text-[#5e6673]">
            {group.label}
          </div>
          <div className="grid grid-cols-1 gap-2">{groupFields.map(renderField)}</div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b0e11] p-3 text-xs text-[#848e9c]">
        컨트롤 정보를 불러오는 중...
      </div>
    );
  }

  const engineStatus = status?.engine_run?.status;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0b0e11]">
      <div className="flex-shrink-0 border-b border-[#2b3139] bg-[#0b0e11] p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-[#eaecef]">트레이딩 컨트롤</div>
            <div className="mt-0.5 text-[10px] text-[#848e9c]">자동 매매 실행 상태</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStop}
              className="group min-w-[84px] rounded-lg border border-[#f6465d33] bg-[#f6465d22] px-4 py-2 text-sm font-semibold text-[#f6465d] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#f6465d55] hover:bg-[#f6465d33] hover:shadow-md active:translate-y-0"
            >
              <span className="transition-colors group-hover:text-[#ff6370]">중지</span>
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="group min-w-[84px] rounded-lg border border-[#0ecb8133] bg-[#0ecb8122] px-4 py-2 text-sm font-semibold text-[#0ecb81] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0ecb8155] hover:bg-[#0ecb8133] hover:shadow-md active:translate-y-0"
            >
              <span className="transition-colors group-hover:text-[#18d28b]">시작</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between rounded-lg border border-[#2b3139] bg-[#11161b] px-2.5 py-2 text-[11px]">
            <span className="text-[#848e9c]">매매 상태</span>
            <span
              className={`rounded-full px-2 py-0.5 font-semibold ${
                status?.trading_enabled
                  ? 'bg-[#0ecb8133] text-[#0ecb81]'
                  : 'bg-[#f6465d33] text-[#f6465d]'
              }`}
            >
              {status?.trading_enabled ? 'ON' : 'OFF'}
            </span>
          </div>
          {engineStatus ? (
            <div className="flex items-center justify-between rounded-lg border border-[#2b3139] bg-[#11161b] px-2.5 py-2 text-[11px]">
              <span className="text-[#848e9c]">엔진 run</span>
              <span className="font-semibold text-[#eaecef]">{engineStatus}</span>
            </div>
          ) : null}
          {typeof formValues.predictor_type === 'string' ? (
            <div className="flex items-center justify-between rounded-lg border border-[#2b3139] bg-[#11161b] px-2.5 py-2 text-[11px]">
              <span className="text-[#848e9c]">모델</span>
              <span className="font-semibold text-[#eaecef]">
                {String(formValues.predictor_type)}
                {formValues.model_version ? ` · ${String(formValues.model_version)}` : ''}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-3 pt-2">
        <div className="space-y-3">
          <section className="rounded-lg border border-[#2b3139] bg-[#11161b] p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-semibold text-[#eaecef]">기본 설정</div>
              <div className="text-[10px] text-[#848e9c]">basic</div>
            </div>
            <div className="space-y-3">{renderGroupedFields(basicFields)}</div>
          </section>

          <section className="rounded-lg border border-[#2b3139] bg-[#11161b] p-2.5">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="mb-2 flex w-full items-center justify-between text-left"
            >
              <div className="text-[11px] font-semibold text-[#eaecef]">고급 설정</div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full text-[#848e9c] transition-colors hover:bg-[#2b3139] hover:text-[#eaecef]">
                {showAdvanced ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </div>
            </button>
            {showAdvanced && (
              <div className="space-y-3">{renderGroupedFields(advancedFields)}</div>
            )}
          </section>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => status && setFormValues(formValuesFromStatus(status))}
            className="min-w-[92px] rounded-lg border border-[#2b3139] bg-[#11161b] px-3.5 py-2 text-[12px] font-medium text-[#848e9c] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#3a434d] hover:bg-[#171d24] hover:text-[#eaecef] active:translate-y-0"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[92px] rounded-lg border border-[#0ecb8133] bg-[#0ecb8122] px-3.5 py-2 text-[12px] font-semibold text-[#0ecb81] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#0ecb8155] hover:bg-[#0ecb8133] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingControlPanel;
