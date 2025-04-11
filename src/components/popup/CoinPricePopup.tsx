import { useEffect, useState, useCallback } from 'react';
import {
  XCircleIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

interface CoinPrice {
  symbol: string;
  price: string;
}

interface CoinPricePopupProps {
  isOpen: boolean;
  closePopup: () => void;
}

const CoinPricePopup: React.FC<CoinPricePopupProps> = ({
  isOpen,
  closePopup,
}) => {
  const [coinPrices, setCoinPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [position, setPosition] = useState({
    x: window.innerWidth - 450,
    y: window.innerHeight / 2 - 380,
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const fetchCoinPrices = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price'
      );
      const data = await response.json();
      // USDT 페어만 필터링하고 정렬
      const usdtPairs = data
        .filter((coin: CoinPrice) => coin.symbol.endsWith('USDT'))
        .sort((a: CoinPrice, b: CoinPrice) => a.symbol.localeCompare(b.symbol));
      setCoinPrices(usdtPairs);
    } catch (error) {
      console.error('Failed to fetch coin prices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 초기 데이터 로드
      fetchCoinPrices();

      // 1분마다 데이터 업데이트
      const intervalId = setInterval(fetchCoinPrices, 30000);

      // 컴포넌트 언마운트 시 인터벌 정리
      return () => clearInterval(intervalId);
    }
  }, [isOpen, fetchCoinPrices]);

  // 검색어로 필터링된 코인 목록
  const filteredCoins = coinPrices.filter((coin) =>
    coin.symbol
      .replace('USDT', '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // 마우스 드래그 이동
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    },
    [dragging, offset.x, offset.y]
  );

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove]);

  // 즐겨찾기 토글 함수
  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      } else {
        return [...prev, symbol];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bg-white border border-gray-200 shadow-2xl rounded-2xl w-[300px] h-[820px] 
      overflow-hidden z-30 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: dragging ? 'grabbing' : 'grab',
      }}
    >
      {/* 헤더 영역 (마우스로 드래그 가능) */}
      <div
        className="flex justify-between items-center px-4 py-3 border-b cursor-grab select-none bg-zinc-300"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-900">Coin Price</h2>
        </div>
        <button
          onClick={closePopup}
          className="text-gray-500 hover:text-gray-800"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 검색 입력창 */}
      <div className="px-4 py-2 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="코인 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 코인 리스트 */}
      <div className="h-[calc(100%-8rem)] overflow-y-auto space-y-3 custom-scroll p-4">
        {loading ? (
          <div className="text-center py-4">로딩 중...</div>
        ) : filteredCoins.length > 0 ? (
          filteredCoins.map((coin) => (
            <div
              key={coin.symbol}
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 select-none shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleFavorite(coin.symbol)}
                className="mr-3 text-gray-400 hover:text-yellow-400 transition-colors duration-200"
              >
                <StarIcon
                  className={`w-5 h-5 ${
                    favorites.includes(coin.symbol) ? 'text-yellow-400' : ''
                  }`}
                />
              </button>
              <div className="flex-1 flex justify-between items-center">
                <span className="font-medium">
                  {coin.symbol.replace('USDT', '')}
                </span>
                <span className="text-gray-700">
                  ${parseFloat(coin.price).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default CoinPricePopup;
