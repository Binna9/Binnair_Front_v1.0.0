import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, GripHorizontal } from 'lucide-react';
import { FaBitcoin } from 'react-icons/fa';

interface CoinPricePopupProps {
  isOpen: boolean;
  closePopup: () => void;
}

/** 바이낸스 USDT 스팟 — 소문자 stream id */
const USDT_CATALOG: { id: string; label: string }[] = [
  { id: 'btcusdt', label: 'BTC' },
  { id: 'ethusdt', label: 'ETH' },
  { id: 'bnbusdt', label: 'BNB' },
  { id: 'solusdt', label: 'SOL' },
  { id: 'xrpusdt', label: 'XRP' },
  { id: 'adausdt', label: 'ADA' },
  { id: 'dogeusdt', label: 'DOGE' },
  { id: 'dotusdt', label: 'DOT' },
  { id: 'ltcusdt', label: 'LTC' },
  { id: 'avaxusdt', label: 'AVAX' },
  { id: 'linkusdt', label: 'LINK' },
  { id: 'atomusdt', label: 'ATOM' },
  { id: 'etcusdt', label: 'ETC' },
  { id: 'xlmusdt', label: 'XLM' },
  { id: 'nearusdt', label: 'NEAR' },
  { id: 'aptusdt', label: 'APT' },
  { id: 'opusdt', label: 'OP' },
  { id: 'arbusdt', label: 'ARB' },
  { id: 'injusdt', label: 'INJ' },
  { id: 'suiusdt', label: 'SUI' },
  { id: 'pepeusdt', label: 'PEPE' },
  { id: 'shibusdt', label: 'SHIB' },
  { id: 'trxusdt', label: 'TRX' },
  { id: 'filusdt', label: 'FIL' },
  { id: 'uniusdt', label: 'UNI' },
  { id: 'aaveusdt', label: 'AAVE' },
  { id: 'galausdt', label: 'GALA' },
  { id: 'sandusdt', label: 'SAND' },
  { id: 'manausdt', label: 'MANA' },
  { id: 'axsusdt', label: 'AXS' },
  { id: 'crvusdt', label: 'CRV' },
  { id: 'ldousdt', label: 'LDO' },
  { id: 'tiausdt', label: 'TIA' },
  { id: 'seiusdt', label: 'SEI' },
];

const CATALOG = USDT_CATALOG;

const ALL_SYMBOL_IDS = CATALOG.map((c) => c.id).sort();

interface CombinedKlinePayload {
  stream?: string;
  data?: {
    e?: string;
    k?: {
      c?: string;
    };
  };
}

function streamIdFromStreamName(stream: string): string | null {
  if (!stream.endsWith('@kline_1s')) return null;
  return stream.slice(0, -'@kline_1s'.length).toLowerCase();
}

/** USDT≈USD 로 보고 USD→KRW — Dunamu 등 DNS 불안정 소스는 제외, 여러 공개 API 순차 시도 */
async function fetchKrwPerUsdt(): Promise<number> {
  const tryOne = async (
    fn: () => Promise<number | null>
  ): Promise<number | null> => {
    try {
      return await fn();
    } catch {
      return null;
    }
  };

  const n =
    (await tryOne(async () => {
      const r = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!r.ok) return null;
      const j = (await r.json()) as { conversion_rates?: { KRW?: number } };
      const k = j?.conversion_rates?.KRW;
      return typeof k === 'number' && k > 0 ? k : null;
    })) ??
    (await tryOne(async () => {
      const r = await fetch(
        'https://api.frankfurter.app/latest?from=USD&to=KRW'
      );
      if (!r.ok) return null;
      const j = (await r.json()) as { rates?: { KRW?: number } };
      const k = j?.rates?.KRW;
      return typeof k === 'number' && k > 0 ? k : null;
    })) ??
    (await tryOne(async () => {
      const r = await fetch(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
      );
      if (!r.ok) return null;
      const j = (await r.json()) as { usd?: { krw?: number } };
      const k = j?.usd?.krw;
      return typeof k === 'number' && k > 0 ? k : null;
    })) ??
    (await tryOne(async () => {
      const r = await fetch(
        'https://latest.currency-api.pages.dev/v1/currencies/usd.json'
      );
      if (!r.ok) return null;
      const j = (await r.json()) as { usd?: { krw?: number } };
      const k = j?.usd?.krw;
      return typeof k === 'number' && k > 0 ? k : null;
    }));

  if (n != null) return n;
  throw new Error('환율 조회 실패');
}

/** 바이낸스 스팟 24시간 변동률(%) — 달력 ‘전일’이 아니라 최근 24시간 롤링 */
async function fetchBinance24hChangePercent(): Promise<Record<string, number>> {
  const symbols = ALL_SYMBOL_IDS.map((id) => id.toUpperCase());
  const param = encodeURIComponent(JSON.stringify(symbols));
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${param}`
  );
  if (!res.ok) throw new Error('24hr ticker');
  const arr = (await res.json()) as {
    symbol: string;
    priceChangePercent: string;
  }[];
  if (!Array.isArray(arr)) throw new Error('24hr shape');
  const out: Record<string, number> = {};
  for (const t of arr) {
    const key = t.symbol.toLowerCase();
    const p = parseFloat(t.priceChangePercent);
    if (!Number.isNaN(p)) out[key] = p;
  }
  return out;
}

function formatUsdtPrice(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
  return `${sign}$${s}`;
}

function formatKrw(krw: number): string {
  const sign = krw < 0 ? '-' : '';
  const v = Math.abs(krw);
  if (v >= 100) {
    return `${sign}₩${Math.round(v).toLocaleString('ko-KR')}`;
  }
  if (v >= 1) {
    return `${sign}₩${v.toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${sign}₩${v.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })}`;
}

const CoinPricePopup: React.FC<CoinPricePopupProps> = ({
  isOpen,
  closePopup,
}) => {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'connecting' | 'open' | 'error'>(
    'idle'
  );
  const [search, setSearch] = useState('');
  const [krwPerUsdt, setKrwPerUsdt] = useState<number | null>(null);
  const [fxError, setFxError] = useState(false);
  const [showUsdt, setShowUsdt] = useState(false);
  const [pct24h, setPct24h] = useState<Record<string, number>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const wsClientClosingRef = useRef(false);
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth - 440 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 250 : 0,
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (row) =>
        row.id.includes(q) ||
        row.label.toLowerCase().includes(q) ||
        `${row.label}/usdt`.toLowerCase().includes(q)
    );
  }, [search]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [dragging, offset.x, offset.y]
  );

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const tick = () => {
      fetchKrwPerUsdt()
        .then((n) => {
          if (!cancelled) {
            setKrwPerUsdt(n);
            setFxError(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFxError(true);
            setKrwPerUsdt(null);
          }
        });
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPct24h({});
      return;
    }

    let cancelled = false;
    const load24h = () => {
      fetchBinance24hChangePercent()
        .then((m) => {
          if (!cancelled) setPct24h(m);
        })
        .catch(() => {
          if (!cancelled) setPct24h({});
        });
    };
    load24h();
    const id = window.setInterval(load24h, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const prev = wsRef.current;
      if (prev) {
        prev.onopen = null;
        prev.onerror = null;
        prev.onclose = null;
        prev.onmessage = null;
        if (
          prev.readyState === WebSocket.OPEN ||
          prev.readyState === WebSocket.CONNECTING
        ) {
          prev.close(1000, 'client');
        }
        wsRef.current = null;
      }
      wsClientClosingRef.current = false;
      setStatus('idle');
      return;
    }

    let cancelled = false;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (cancelled) return;
      setStatus('connecting');
      const streams = ALL_SYMBOL_IDS.map((s) => `${s}@kline_1s`).join('/');
      const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
      socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        if (cancelled || socket !== wsRef.current) return;
        wsClientClosingRef.current = false;
        setStatus('open');
      };

      socket.onerror = () => {
        if (wsClientClosingRef.current || !isOpenRef.current) return;
        setStatus('error');
      };

      socket.onclose = () => {
        if (wsClientClosingRef.current || !isOpenRef.current) {
          wsClientClosingRef.current = false;
          return;
        }
        setStatus((s) => (s === 'open' || s === 'connecting' ? 'error' : s));
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        if (cancelled || socket !== wsRef.current) return;
        try {
          const msg = JSON.parse(event.data) as CombinedKlinePayload;
          const stream = msg.stream;
          const close = msg.data?.k?.c;
          if (!stream || close == null) return;
          const sym = streamIdFromStreamName(stream);
          if (!sym) return;
          setPrices((prev) => ({ ...prev, [sym]: close }));
        } catch {
          /* ignore */
        }
      };
    };

    const timer = window.setTimeout(connect, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      wsClientClosingRef.current = true;
      if (socket) {
        socket.onopen = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.onmessage = null;
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close(1000, 'client');
        }
      }
      if (wsRef.current === socket) wsRef.current = null;
      wsClientClosingRef.current = false;
    };
  }, [isOpen]);

  const statusText =
    status === 'open'
      ? '실시간 · 1초 봉'
      : status === 'connecting'
        ? '연결 중…'
        : status === 'error'
          ? '연결 끊김'
          : '';

  return (
    <div
      className={`fixed z-50 flex flex-col rounded-lg bg-zinc-50 shadow-xl border border-zinc-200/80 w-[min(325px,calc(100vw-4rem))] h-[min(560px,calc(100vh-4rem))] transition-opacity duration-300 ${
        isOpen
          ? 'opacity-100 scale-100'
          : 'pointer-events-none opacity-0 scale-95'
      }`}
      style={{
        left: position.x,
        top: position.y,
        cursor: dragging ? 'grabbing' : 'default',
      }}
    >
      <div
        className="flex shrink-0 cursor-grab select-none items-center gap-2 border-b border-zinc-200 bg-zinc-100/90 px-3 py-2.5"
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
        <FaBitcoin className="h-4 w-4 shrink-0 text-[#f7931a]" aria-hidden />
        <h3 className="min-w-0 flex-1 text-sm font-bold text-zinc-800">
          실시간 시세 [SPOT]
        </h3>
        {statusText && (
          <span
            className={`truncate text-[10px] font-medium ${
              status === 'open'
                ? 'text-emerald-600'
                : status === 'error'
                  ? 'text-red-600'
                  : 'text-zinc-500'
            }`}
          >
            {statusText}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            closePopup();
          }}
          className="shrink-0 rounded-full p-1 hover:bg-zinc-200"
          aria-label="닫기"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="심볼 검색 (예: btc, pepe, sol…)"
            className="min-w-0 flex-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <div className="flex shrink-0 rounded-full border border-zinc-200 bg-white p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setShowUsdt(false)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                !showUsdt ? 'bg-zinc-700 text-white' : 'text-zinc-600'
              }`}
            >
              원화
            </button>
            <button
              type="button"
              onClick={() => setShowUsdt(true)}
              className={`rounded-full px-2.5 py-1 font-medium transition ${
                showUsdt ? 'bg-zinc-700 text-white' : 'text-zinc-600'
              }`}
            >
              USDT
            </button>
          </div>
        </div>
        {!showUsdt && (
          <p className="text-[10px] leading-snug text-zinc-500">
            {fxError || krwPerUsdt == null ? (
              <span className="text-amber-700">
                환율을 불러오지 못했습니다. USDT 탭으로 원시 가격을 확인하세요.
              </span>
            ) : (
              <>
                시세는 바이낸스 <span className="font-medium">USDT</span> 기준이며,{' '}
                <span className="font-medium">
                  USDT 1 ≈ ₩{Math.round(krwPerUsdt).toLocaleString('ko-KR')}
                </span>
                로 환산했습니다.
              </>
            )}
          </p>
        )}
        <p className="text-[10px] text-zinc-400">
          등락률은 바이낸스 기준 <span className="font-medium text-zinc-500">최근 24시간</span> 변동입니다.
        </p>

        <div className="flex min-h-0 flex-1 flex-col rounded-md border border-zinc-200 bg-white">
          <div className="shrink-0 border-b border-zinc-100 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            심볼 · 가격 · 24h ({filteredCatalog.length})
          </div>
          <ul className="custom-scroll min-h-0 flex-1 overflow-y-auto p-1">
            {filteredCatalog.length === 0 ? (
              <li className="px-2 py-8 text-center text-xs text-zinc-400">
                검색 결과 없음
              </li>
            ) : (
              filteredCatalog.map((row) => {
                const price = prices[row.id];
                const usdtNum = price != null ? Number(price) : null;
                const krwNum =
                  usdtNum != null && krwPerUsdt != null
                    ? usdtNum * krwPerUsdt
                    : null;
                const display =
                  price == null
                    ? '—'
                    : showUsdt
                      ? formatUsdtPrice(Number(price))
                      : krwNum != null
                        ? formatKrw(krwNum)
                        : fxError && usdtNum != null
                          ? formatUsdtPrice(usdtNum)
                          : '…';
                const pct = pct24h[row.id];
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-2 border-b border-zinc-50 px-2 py-2 last:border-0"
                  >
                    <span className="min-w-0 text-xs font-semibold text-zinc-800">
                      {row.label}
                      <span className="font-normal text-zinc-400">/USDT</span>
                    </span>
                    <div className="flex shrink-0 items-center justify-end gap-2">
                      {pct != null && (
                        <span
                          className={`font-price text-[10px] font-semibold tabular-nums tracking-tight ${
                            pct >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {pct >= 0 ? '+' : ''}
                          {pct.toFixed(2)}%
                        </span>
                      )}
                      <span className="font-price text-sm font-medium tabular-nums tracking-tight text-zinc-900">
                        {display}
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoinPricePopup;
