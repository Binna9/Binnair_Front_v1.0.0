import { useEffect, useRef, useState, type CSSProperties } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/**
 * 값이 바뀔 때 살짝 흐려졌다가 스며드는 전환 (메인 Top / 모니터링 공통).
 */
export function SoftCloudText({
  text,
  reducedMotion,
  style,
  className,
}: {
  text: string;
  reducedMotion: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const [shown, setShown] = useState(text);
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const shownRef = useRef(text);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (text === shownRef.current) return;

    if (reducedMotion) {
      shownRef.current = text;
      setShown(text);
      setPhase('idle');
      return;
    }

    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    setPhase('out');

    const outId = window.setTimeout(() => {
      shownRef.current = text;
      setShown(text);
      setPhase('in');
      const inId = window.setTimeout(() => {
        setPhase('idle');
      }, 560);
      timersRef.current.push(inId);
    }, 220);
    timersRef.current.push(outId);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [reducedMotion, text]);

  const phaseClass =
    phase === 'out' ? 'anomaly-cloud-out' : phase === 'in' ? 'anomaly-cloud-in' : undefined;

  return (
    <span className={[className, phaseClass].filter(Boolean).join(' ') || undefined} style={style}>
      {shown}
    </span>
  );
}

/** 컨테이너에 옅은 안개 워시 — triggerKey 변경 시 */
export function useCloudMist(triggerKey: string, reducedMotion: boolean): boolean {
  const prevRef = useRef(triggerKey);
  const [mist, setMist] = useState(false);

  useEffect(() => {
    if (triggerKey === prevRef.current) return;
    prevRef.current = triggerKey;
    if (reducedMotion) return;
    setMist(true);
    const id = window.setTimeout(() => setMist(false), 850);
    return () => window.clearTimeout(id);
  }, [reducedMotion, triggerKey]);

  return mist;
}

/** 공통 keyframes — 페이지당 1회 마운트 */
export function SoftCloudMotionStyles() {
  return (
    <style>{`
      @keyframes anomalyLiveSoft {
        0%, 100% { opacity: 0.82; }
        50% { opacity: 1; }
      }
      @keyframes anomalyCloudOut {
        0% { opacity: 1; filter: blur(0); }
        100% { opacity: 0.55; filter: blur(1.2px); }
      }
      @keyframes anomalyCloudIn {
        0% { opacity: 0.55; filter: blur(1.2px); }
        100% { opacity: 1; filter: blur(0); }
      }
      @keyframes anomalyRowMist {
        0% {
          background: radial-gradient(110% 130% at 40% 50%, rgba(148,163,184,0.07), transparent 72%);
        }
        100% { background: transparent; }
      }
      .anomaly-live-soft {
        animation: anomalyLiveSoft 3.2s ease-in-out infinite;
      }
      .anomaly-cloud-out {
        animation: anomalyCloudOut 0.22s ease-out forwards;
        display: inline-block;
        will-change: opacity, filter;
      }
      .anomaly-cloud-in {
        animation: anomalyCloudIn 0.56s ease-out forwards;
        display: inline-block;
        will-change: opacity, filter;
      }
      .anomaly-row-mist {
        animation: anomalyRowMist 0.85s ease-out;
      }
      @media (prefers-reduced-motion: reduce) {
        .anomaly-live-soft,
        .anomaly-cloud-out,
        .anomaly-cloud-in,
        .anomaly-row-mist {
          animation: none !important;
          filter: none !important;
          opacity: 1 !important;
        }
      }
    `}</style>
  );
}
