import { useState } from 'react';
import {
  ShoppingCartIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import CartBookmarkPopup from '../popup/CartBookmarkPopup';
import ChatPopUp from '../popup/ChatPopup';

const Sidebar = () => {
  const [selected, setSelected] = useState<
    'cart' | 'bookmark' | 'messages' | 'help' | 'settings' | null
  >(null);

  const menuItems = [
    { id: 'cart', icon: ShoppingCartIcon, label: '장바구니' },
    { id: 'bookmark', icon: StarIcon, label: '즐겨찾기' },
    { id: 'messages', icon: ChatBubbleLeftRightIcon, label: '메시지' },
    { id: 'help', icon: QuestionMarkCircleIcon, label: '도움말' },
    { id: 'settings', icon: Cog6ToothIcon, label: '설정' },
  ];

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
              setSelected(
                selected === item.id
                  ? null
                  : (item.id as
                      | 'cart'
                      | 'bookmark'
                      | 'messages'
                      | 'help'
                      | 'settings')
              );
            }}
            className={`w-14 h-14 flex items-center justify-center rounded-lg transition-all duration-300 ${
              selected === item.id
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>

      {/* 장바구니 팝업 - 수정된 props */}
      {selected === 'cart' && (
        <CartBookmarkPopup
          isOpen={selected === 'cart'}
          type="cart"
          closePopup={() => setSelected(null)}
        />
      )}

      {/* 즐겨찾기 팝업 - 수정된 props */}
      {selected === 'bookmark' && (
        <CartBookmarkPopup
          isOpen={selected === 'bookmark'}
          type="bookmark"
          closePopup={() => setSelected(null)}
        />
      )}

      {/* ChatPopUp */}
      {selected === 'messages' && (
        <ChatPopUp
          isOpen={selected === 'messages'}
          closePopup={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default Sidebar;
