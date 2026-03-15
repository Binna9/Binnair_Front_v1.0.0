/**
 * Binance Perpetual 심볼을 TradingView 위젯 심볼 형식으로 변환.
 * 예: BTCUSDT -> BINANCE:BTCUSDT.P
 */
export function mapBinancePerpToTradingView(symbol: string): string {
  const trimmed = symbol.trim().toUpperCase();
  if (!trimmed) return 'BINANCE:BTCUSDT.P';
  if (trimmed.endsWith('.P')) return `BINANCE:${trimmed}`;
  return `BINANCE:${trimmed}.P`;
}
