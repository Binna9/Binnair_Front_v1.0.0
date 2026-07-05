import { useEffect } from 'react';
import { useLiveAccountStore, LivePosition } from '@/store/trading/liveAccountStore';
import tradingWalletService from '@/services/TradingWalletService';
import { LiveMessage } from '@/types/TradingLiveTypes';
import { TRADING_WS_URL } from '@/utils/tradingApiConfig';

const RECONNECT_DELAY_MS = 5000;
const REST_FALLBACK_POLL_MS = 5000;

/**
 * BinnAIR Live WebSocket(/ws/v1/live)으로 지갑·포지션·체결을 실시간 반영.
 * 연결이 끊기면 REST GET /account/wallet 5초 폴링으로 자동 폴백하고,
 * 재연결되면 폴백 폴링을 멈추고 다시 push 기반으로 전환한다.
 */
export function useLiveAccountSocket() {
  useEffect(() => {
    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let fallbackTimer: number | undefined;

    const stopFallbackPolling = () => {
      if (fallbackTimer !== undefined) {
        window.clearInterval(fallbackTimer);
        fallbackTimer = undefined;
      }
    };

    const startFallbackPolling = () => {
      if (fallbackTimer !== undefined || cancelled) return;

      const poll = async () => {
        try {
          const data = await tradingWalletService.getAccountWallet();
          if (cancelled || !data.ok) return;

          const positions: LivePosition[] = data.positions.map((p) => ({
            symbol: p.symbol,
            side: p.position_amt >= 0 ? 'LONG' : 'SHORT',
            quantity: Math.abs(p.position_amt),
            entry_price: p.entry_price,
            unrealized_pnl: p.unrealized_profit,
            leverage: p.leverage,
            margin_type: p.margin_type,
          }));

          useLiveAccountStore.getState().applyRestFallback({
            wallet: {
              available_balance: data.account.available_balance,
              total_wallet_balance: data.account.total_wallet_balance,
              total_unrealized_profit: data.account.total_unrealized_profit,
              total_margin_balance: data.account.total_margin_balance,
              can_trade: data.account.can_trade,
            },
            positions,
            paperMode: data.paper_mode,
            quoteAsset: data.quote_asset ?? 'USDT',
          });
        } catch {
          // 다음 폴링에서 재시도
        }
      };

      poll();
      fallbackTimer = window.setInterval(poll, REST_FALLBACK_POLL_MS);
    };

    const handleMessage = (raw: string) => {
      let msg: LiveMessage;
      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      const store = useLiveAccountStore.getState();
      switch (msg.type) {
        case 'snapshot':
          store.applySnapshot(msg);
          break;
        case 'stream_status':
          store.setStreamStatus(msg);
          break;
        case 'wallet_update':
          store.applyWalletUpdate(msg);
          break;
        case 'position_update':
          store.applyPositionUpdate(msg);
          break;
        case 'position_closed':
          store.applyPositionClosed(msg);
          break;
        case 'order_update':
          store.applyOrderUpdate(msg);
          break;
        case 'mark_price':
          store.applyMarkPrice(msg);
          break;
        case 'ping':
          socket?.send(JSON.stringify({ action: 'pong' }));
          break;
        case 'stream_error':
          store.setError(msg.message);
          break;
      }
    };

    const connect = () => {
      if (cancelled) return;

      socket = new WebSocket(TRADING_WS_URL);

      socket.onopen = () => {
        if (cancelled) return;
        useLiveAccountStore.getState().setWsConnected(true);
        useLiveAccountStore.getState().setError(null);
        stopFallbackPolling();
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        if (cancelled) return;
        handleMessage(event.data);
      };

      socket.onclose = () => {
        if (cancelled) return;
        useLiveAccountStore.getState().setWsConnected(false);
        startFallbackPolling();
        reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();
    startFallbackPolling();

    return () => {
      cancelled = true;
      window.clearTimeout(reconnectTimer);
      stopFallbackPolling();
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close(1000, 'client');
        }
      }
    };
  }, []);
}
