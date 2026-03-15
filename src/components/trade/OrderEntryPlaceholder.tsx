import React from 'react';

const OrderEntryPlaceholder: React.FC = () => {
  return (
    <div
      className="flex-1 min-h-0 flex flex-col overflow-y-auto custom-scroll bg-[#0b0e11] p-3"
      style={{ minHeight: '220px' }}
    >
      <div className="flex-shrink-0 flex gap-2 mb-3">
        <button
          type="button"
          className="px-3 py-1.5 text-sm rounded bg-[#2b3139] text-[#eaecef]"
        >
          Limit
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-sm text-[#848e9c] hover:text-[#eaecef]"
        >
          Market
        </button>
        <button
          type="button"
          className="px-3 py-1.5 text-sm text-[#848e9c] hover:text-[#eaecef]"
        >
          Stop Limit
        </button>
      </div>
      <div className="flex-shrink-0 text-xs text-[#848e9c] mb-2">
        Avbl 760.97 USDT
      </div>
      <div className="flex-shrink-0 space-y-2 mb-3">
        <div>
          <label className="block text-xs text-[#848e9c] mb-1">Price</label>
          <input
            type="text"
            placeholder="0.00"
            className="w-full px-3 py-2 rounded bg-[#1e2329] border border-[#2b3139] text-[#eaecef] text-sm"
            readOnly
          />
        </div>
        <div>
          <label className="block text-xs text-[#848e9c] mb-1">Size</label>
          <input
            type="text"
            placeholder="0.00"
            className="w-full px-3 py-2 rounded bg-[#1e2329] border border-[#2b3139] text-[#eaecef] text-sm"
            readOnly
          />
        </div>
      </div>
      <div className="flex-shrink-0 flex gap-2 mt-auto">
        <button
          type="button"
          className="flex-1 py-2.5 rounded text-sm font-medium bg-[#0ecb81] text-[#0b0e11] hover:opacity-90"
        >
          Buy / Long
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 rounded text-sm font-medium bg-[#f6465d] text-white hover:opacity-90"
        >
          Sell / Short
        </button>
      </div>
      <div className="flex-shrink-0 mt-2 text-xs text-[#848e9c]">
        Liq Price -- USDT · Cost 0.00 USDT
      </div>
    </div>
  );
};

export default OrderEntryPlaceholder;
