import { useState, useEffect } from 'react';
import {
  StarIcon,
  CurrencyDollarIcon,
  WalletIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';
import BookmarkPopup from '../popup/BookmarkPopup';
import ChatPopUp from '../popup/ChatPopup';
import CoinPricePopup from '../popup/CoinPricePopup';
import WalletPopup from '../popup/WalletPopup';
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  
  const [selected, setSelected] = useState<
    ('bookmark' | 'coin' | 'wallet' | 'messages')[]
  >(isMainPage ? ['coin'] : []);

  // 메인 페이지로 이동할 때 코인 팝업을 자동으로 열기
  useEffect(() => {
    if (isMainPage) {
      setSelected(['coin']);
    } else {
      setSelected([]);
    }
  }, [isMainPage]);

  const menuItems = [
    { id: 'bookmark', icon: StarIcon, label: '즐겨찾기' },
    { id: 'wallet', icon: WalletIcon, label: '지갑' },
    { id: 'messages', icon: ChatBubbleLeftRightIcon, label: '메시지' },
    { id: 'coin', icon: CurrencyDollarIcon, label: '코인' },
  ];

  const togglePopup = (id: 'bookmark' | 'coin' | 'wallet' | 'messages') => {
    setSelected((prev) => {
      if (id === 'bookmark' || id === 'wallet') {
        // 즐겨찾기와 지갑은 단독으로만 열림
        return prev.includes(id) ? [] : [id];
      } else {
        // 나머지는 동시에 열 수 있음
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        } else {
          return [
            ...prev.filter((item) => item !== 'bookmark' && item !== 'wallet'),
            id,
          ];
        }
      }
    });
  };

  return (
    <>
      {/* 사이드바 */}
      <div
        className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-300 z-[60]"
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation();
              togglePopup(
                item.id as 'bookmark' | 'coin' | 'wallet' | 'messages'
              );
            }}
            className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all duration-300 ${
              selected.includes(
                item.id as 'bookmark' | 'coin' | 'wallet' | 'messages'
              )
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
      {/* 지갑 팝업 */}
      {selected.includes('wallet') && (
        <WalletPopup
          isOpen={selected.includes('wallet')}
          closePopup={() => togglePopup('wallet')}
        />
      )}
      {/* 즐겨찾기 팝업 */}
      {selected.includes('bookmark') && (
        <BookmarkPopup
          isOpen={selected.includes('bookmark')}
          closePopup={() => togglePopup('bookmark')}
        />
      )}
      {/* 채팅 팝업 */}
      {selected.includes('messages') && (
        <ChatPopUp
          isOpen={selected.includes('messages')}
          closePopup={() => togglePopup('messages')}
        />
      )}
      {/* 코인 가격 팝업 */}
      {selected.includes('coin') && (
        <CoinPricePopup
          isOpen={selected.includes('coin')}
          closePopup={() => togglePopup('coin')}
        />
      )}
    </>
  );
};

export default Sidebar;
