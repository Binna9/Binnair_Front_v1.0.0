import React from 'react';

const MOCK_POSITIONS = [
  { symbol: 'BTCUSDT', size: '0.05', entryPrice: 71234.5, markPrice: 71580.2, liqPrice: 58200.0, marginRatio: '12.5%', pnl: 172.78, pnlRoi: '4.85%' },
  { symbol: 'BTCUSDT', size: '0.12', entryPrice: 69800.0, markPrice: 71580.2, liqPrice: 55100.0, marginRatio: '8.2%', pnl: 213.62, pnlRoi: '2.55%' },
  { symbol: 'ETHUSDT', size: '1.5', entryPrice: 3620.0, markPrice: 3650.2, liqPrice: 2980.0, marginRatio: '15.0%', pnl: 45.3, pnlRoi: '0.83%' },
  { symbol: 'ETHUSDT', size: '0.5', entryPrice: 3710.0, markPrice: 3650.2, liqPrice: 3200.0, marginRatio: '22.1%', pnl: -29.9, pnlRoi: '-1.61%' },
  { symbol: 'SOLUSDT', size: '10', entryPrice: 175.2, markPrice: 178.5, liqPrice: 142.0, marginRatio: '11.3%', pnl: 33.0, pnlRoi: '1.88%' },
  { symbol: 'SOLUSDT', size: '25', entryPrice: 182.0, markPrice: 178.5, liqPrice: 155.0, marginRatio: '9.5%', pnl: -87.5, pnlRoi: '-1.92%' },
  { symbol: 'BTCUSDT', size: '0.02', entryPrice: 70500.0, markPrice: 71580.2, liqPrice: 62000.0, marginRatio: '18.0%', pnl: 21.6, pnlRoi: '1.53%' },
  { symbol: 'ETHUSDT', size: '2.0', entryPrice: 3580.0, markPrice: 3650.2, liqPrice: 2900.0, marginRatio: '12.8%', pnl: 140.4, pnlRoi: '1.96%' },
  { symbol: 'SOLUSDT', size: '50', entryPrice: 168.0, markPrice: 178.5, liqPrice: 138.0, marginRatio: '8.0%', pnl: 525.0, pnlRoi: '6.25%' },
  { symbol: 'BTCUSDT', size: '0.01', entryPrice: 72000.0, markPrice: 71580.2, liqPrice: 65000.0, marginRatio: '25.0%', pnl: -4.2, pnlRoi: '-0.58%' },
  { symbol: 'BNBUSDT', size: '5', entryPrice: 580.0, markPrice: 592.3, liqPrice: 450.0, marginRatio: '14.2%', pnl: 61.5, pnlRoi: '2.12%' },
  { symbol: 'XRPUSDT', size: '500', entryPrice: 0.52, markPrice: 0.54, liqPrice: 0.38, marginRatio: '10.5%', pnl: 10.0, pnlRoi: '3.85%' },
  { symbol: 'DOGEUSDT', size: '2000', entryPrice: 0.18, markPrice: 0.17, liqPrice: 0.12, marginRatio: '11.0%', pnl: -20.0, pnlRoi: '-5.56%' },
  { symbol: 'AVAXUSDT', size: '30', entryPrice: 38.5, markPrice: 39.2, liqPrice: 28.0, marginRatio: '13.0%', pnl: 21.0, pnlRoi: '1.82%' },
  { symbol: 'LINKUSDT', size: '80', entryPrice: 14.2, markPrice: 14.5, liqPrice: 10.5, marginRatio: '9.8%', pnl: 24.0, pnlRoi: '2.11%' },
  { symbol: 'ADAUSDT', size: '1000', entryPrice: 0.42, markPrice: 0.44, liqPrice: 0.32, marginRatio: '12.0%', pnl: 20.0, pnlRoi: '4.76%' },
  { symbol: 'DOTUSDT', size: '150', entryPrice: 6.8, markPrice: 6.95, liqPrice: 5.2, marginRatio: '15.0%', pnl: 22.5, pnlRoi: '2.21%' },
  { symbol: 'MATICUSDT', size: '400', entryPrice: 0.65, markPrice: 0.63, liqPrice: 0.48, marginRatio: '11.5%', pnl: -8.0, pnlRoi: '-3.08%' },
  { symbol: 'APTUSDT', size: '20', entryPrice: 8.5, markPrice: 8.9, liqPrice: 6.2, marginRatio: '10.2%', pnl: 8.0, pnlRoi: '4.71%' },
  { symbol: 'ARBUSDT', size: '100', entryPrice: 0.72, markPrice: 0.75, liqPrice: 0.55, marginRatio: '14.0%', pnl: 3.0, pnlRoi: '4.17%' },
  { symbol: 'SUIUSDT', size: '120', entryPrice: 2.15, markPrice: 2.28, liqPrice: 1.65, marginRatio: '12.5%', pnl: 15.6, pnlRoi: '6.05%' },
  { symbol: 'NEARUSDT', size: '60', entryPrice: 5.2, markPrice: 5.1, liqPrice: 4.0, marginRatio: '11.0%', pnl: -6.0, pnlRoi: '-1.92%' },
  { symbol: 'INJUSDT', size: '15', entryPrice: 32.0, markPrice: 33.5, liqPrice: 24.0, marginRatio: '13.2%', pnl: 22.5, pnlRoi: '4.69%' },
  { symbol: 'FILUSDT', size: '40', entryPrice: 5.8, markPrice: 5.95, liqPrice: 4.2, marginRatio: '10.8%', pnl: 6.0, pnlRoi: '2.59%' },
  { symbol: 'ATOMUSDT', size: '45', entryPrice: 9.2, markPrice: 9.0, liqPrice: 7.0, marginRatio: '14.5%', pnl: -9.0, pnlRoi: '-2.17%' },
  { symbol: 'LTCUSDT', size: '8', entryPrice: 92.5, markPrice: 94.2, liqPrice: 72.0, marginRatio: '12.0%', pnl: 13.6, pnlRoi: '1.84%' },
  { symbol: 'UNIUSDT', size: '100', entryPrice: 9.5, markPrice: 9.8, liqPrice: 7.2, marginRatio: '11.5%', pnl: 30.0, pnlRoi: '3.16%' },
  { symbol: 'AAVEUSDT', size: '5', entryPrice: 285.0, markPrice: 292.0, liqPrice: 220.0, marginRatio: '9.8%', pnl: 35.0, pnlRoi: '2.46%' },
  { symbol: 'OPUSDT', size: '50', entryPrice: 2.35, markPrice: 2.4, liqPrice: 1.8, marginRatio: '13.0%', pnl: 2.5, pnlRoi: '2.13%' },
  { symbol: 'PEPEUSDT', size: '5000000', entryPrice: 0.000012, markPrice: 0.0000125, liqPrice: 0.000009, marginRatio: '15.0%', pnl: 25.0, pnlRoi: '4.17%' },
  { symbol: 'FETUSDT', size: '200', entryPrice: 1.85, markPrice: 1.92, liqPrice: 1.35, marginRatio: '12.0%', pnl: 14.0, pnlRoi: '3.78%' },
  { symbol: 'WIFUSDT', size: '300', entryPrice: 2.8, markPrice: 2.65, liqPrice: 2.0, marginRatio: '10.5%', pnl: -45.0, pnlRoi: '-5.36%' },
  { symbol: 'TIAUSDT', size: '25', entryPrice: 6.2, markPrice: 6.5, liqPrice: 4.8, marginRatio: '11.5%', pnl: 7.5, pnlRoi: '4.84%' },
  { symbol: 'RENDERUSDT', size: '35', entryPrice: 7.5, markPrice: 7.8, liqPrice: 5.6, marginRatio: '13.0%', pnl: 10.5, pnlRoi: '4.00%' },
  { symbol: 'IMXUSDT', size: '90', entryPrice: 1.95, markPrice: 2.02, liqPrice: 1.45, marginRatio: '12.2%', pnl: 6.3, pnlRoi: '3.59%' },
  { symbol: 'SEIUSDT', size: '150', entryPrice: 0.55, markPrice: 0.58, liqPrice: 0.42, marginRatio: '11.0%', pnl: 4.5, pnlRoi: '5.45%' },
  { symbol: 'STXUSDT', size: '80', entryPrice: 2.25, markPrice: 2.18, liqPrice: 1.65, marginRatio: '14.0%', pnl: -5.6, pnlRoi: '-3.11%' },
  { symbol: 'RUNEUSDT', size: '120', entryPrice: 4.2, markPrice: 4.35, liqPrice: 3.2, marginRatio: '10.8%', pnl: 18.0, pnlRoi: '3.57%' },
  { symbol: 'SANDUSDT', size: '250', entryPrice: 0.48, markPrice: 0.52, liqPrice: 0.36, marginRatio: '12.5%', pnl: 10.0, pnlRoi: '8.33%' },
];

const tabs = [
  `Positions(${MOCK_POSITIONS.length})`,
  'Open Orders(0)',
  'Order History',
  'Trade History',
  'Transaction History',
  'Position History',
  'Bots',
  'Assets',
];

const PositionTabsPlaceholder: React.FC = () => {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-[#0b0e11]">
      <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border-b border-[#2b3139] overflow-x-auto custom-scroll">
        {tabs.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`flex-shrink-0 px-3 py-1.5 text-sm rounded ${
              i === 0 ? 'bg-[#2b3139] text-[#eaecef]' : 'text-[#848e9c] hover:text-[#eaecef]'
            }`}
          >
            {label}
          </button>
        ))}
        <label className="flex-shrink-0 flex items-center gap-2 ml-4 text-xs text-[#848e9c]">
          <input type="checkbox" className="rounded" />
          Hide Other Symbols
        </label>
      </div>
      <div className="flex-1 min-h-0 max-h-[320px] overflow-y-auto overflow-x-hidden custom-scroll">
        <table className="w-full text-xs text-left">
          <thead className="sticky top-0 bg-[#0b0e11] text-[#848e9c] border-b border-[#2b3139]">
            <tr>
              <th className="px-3 py-2 font-medium">Symbol</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Entry Price</th>
              <th className="px-3 py-2 font-medium">Mark Price</th>
              <th className="px-3 py-2 font-medium">Liq. Price</th>
              <th className="px-3 py-2 font-medium">Margin Ratio</th>
              <th className="px-3 py-2 font-medium">PNL(ROI%)</th>
            </tr>
          </thead>
          <tbody className="text-[#eaecef]">
            {MOCK_POSITIONS.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-[#848e9c]">
                  No positions
                </td>
              </tr>
            ) : (
              MOCK_POSITIONS.map((pos, i) => (
                <tr key={i} className="border-b border-[#2b3139]/50 hover:bg-[#1e2329]/50">
                  <td className="px-3 py-2 font-medium">{pos.symbol}</td>
                  <td className="px-3 py-2">{pos.size}</td>
                  <td className="px-3 py-2">{pos.entryPrice.toLocaleString()}</td>
                  <td className="px-3 py-2">{pos.markPrice.toLocaleString()}</td>
                  <td className="px-3 py-2">{pos.liqPrice.toLocaleString()}</td>
                  <td className="px-3 py-2">{pos.marginRatio}</td>
                  <td className={`px-3 py-2 font-medium ${pos.pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} ({pos.pnlRoi})
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionTabsPlaceholder;
