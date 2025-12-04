import { useEffect, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface ExchangePrice {
  exchange: string;
  price: string;
  change: number;
  loading: boolean;
}

export default function ExchangeBar() {
  const [prices, setPrices] = useState<ExchangePrice[]>([
    { exchange: 'Binance', price: '0', change: 0, loading: true },
    { exchange: 'Coinbase', price: '0', change: 0, loading: true },
    { exchange: 'Kraken', price: '0', change: 0, loading: true },
    { exchange: 'Bitfinex', price: '0', change: 0, loading: true },
    { exchange: 'Huobi', price: '0', change: 0, loading: true },
    { exchange: 'Bithumb', price: '0', change: 0, loading: true },
    { exchange: 'Upbit', price: '0', change: 0, loading: true },
    { exchange: 'OKX', price: '0', change: 0, loading: true },
  ]);
  const [isOpen, setIsOpen] = useState(true);

  const fetchExchangePrice = async (exchange: string) => {
    try {
      let price = '0';
      let change = 0;

      switch (exchange) {
        case 'Binance':
          const binanceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
          const binanceData = await binanceRes.json();
          price = parseFloat(binanceData.price).toFixed(2);
          break;
        case 'Coinbase':
          const coinbaseRes = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
          const coinbaseData = await coinbaseRes.json();
          price = parseFloat(coinbaseData.data.amount).toFixed(2);
          break;
        case 'Kraken':
          const krakenRes = await fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
          const krakenData = await krakenRes.json();
          price = parseFloat(krakenData.result.XXBTZUSD.c[0]).toFixed(2);
          break;
        case 'Bitfinex':
          const bitfinexRes = await fetch('https://api-pub.bitfinex.com/v2/ticker/tBTCUSD');
          const bitfinexData = await bitfinexRes.json();
          price = parseFloat(bitfinexData[6]).toFixed(2);
          break;
        case 'Huobi':
          const huobiRes = await fetch('https://api.huobi.pro/market/detail/merged?symbol=btcusdt');
          const huobiData = await huobiRes.json();
          price = parseFloat(huobiData.tick.close).toFixed(2);
          break;
        case 'Bithumb':
          const bithumbRes = await fetch('https://api.bithumb.com/public/ticker/BTC_KRW');
          const bithumbData = await bithumbRes.json();
          price = (parseFloat(bithumbData.data.closing_price) / 1000).toFixed(2);
          break;
        case 'Upbit':
          const upbitRes = await fetch('https://api.upbit.com/v1/ticker?markets=KRW-BTC');
          const upbitData = await upbitRes.json();
          price = (parseFloat(upbitData[0].trade_price) / 1000).toFixed(2);
          break;
        case 'OKX':
          const okxRes = await fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT');
          const okxData = await okxRes.json();
          price = parseFloat(okxData.data[0].last).toFixed(2);
          break;
      }

      setPrices(prevPrices => 
        prevPrices.map(item => 
          item.exchange === exchange 
            ? { ...item, price, change, loading: false }
            : item
        )
      );
    } catch (error) {
      console.error(`Error fetching ${exchange} price:`, error);
      setPrices(prevPrices => 
        prevPrices.map(item => 
          item.exchange === exchange 
            ? { ...item, loading: false }
            : item
        )
      );
    }
  };

  useEffect(() => {
    // 초기 데이터 로드
    prices.forEach(item => fetchExchangePrice(item.exchange));

    // 30초마다 각 거래소 데이터 업데이트
    const intervalIds = prices.map(item => 
      setInterval(() => fetchExchangePrice(item.exchange), 30000)
    );

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => intervalIds.forEach(id => clearInterval(id));
  }, []);

  return (
    <div className="fixed top-12 left-0 w-full bg-gradient-to-r from-red-400 via-red-600 to-red-900 backdrop-blur-sm shadow-md z-40">
      <div className={`flex items-center justify-center gap-3 transition-all duration-300 ${isOpen ? 'h-7' : 'h-0 overflow-hidden'}`}>
        {prices.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <img 
              src={
                item.exchange === 'Binance' ? 'https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png' :
                item.exchange === 'Coinbase' ? 'https://assets.coingecko.com/coins/images/7310/large/coinbase.png' :
                item.exchange === 'Kraken' ? 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' :
                item.exchange === 'Bitfinex' ? 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' :
                item.exchange === 'Huobi' ? 'https://assets.coingecko.com/coins/images/2822/large/huobi-token-logo.png' :
                item.exchange === 'Bithumb' ? 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' :
                item.exchange === 'Upbit' ? 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' :
                'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
              }
              alt={item.exchange}
              className="w-4 h-4 object-contain bg-white/10 rounded-full p-0.5"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png';
              }}
            />
            <span className="text-xs font-medium text-white">{item.exchange}</span>
            <span className="text-xs text-white">
              ${item.loading ? 'Loading...' : item.price}
            </span>
            <span className={`text-xs ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-4 top-[70%] -translate-y-1/3 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 rounded-full p-1 text-white transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>
    </div>
  );
} 