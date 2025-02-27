import { useState } from 'react';
import {
  ShoppingCartIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import CartBookmarkPopup from './CartBookmarkPopup';
import ChatPopUp from './ChatPopup';
import { useCartBookmark } from '../hooks/useCartBookmark';

const Sidebar = () => {
  const [selected, setSelected] = useState<
    'cart' | 'bookmark' | 'messages' | 'help' | 'settings' | null
  >(null);

  const {
    cartItems,
    bookmarkItems,
    deleteCartItem,
    deleteBookmarkItem,
    updateCartQuantity,
  } = useCartBookmark(selected as 'cart' | 'bookmark'); // ✅ 타입 단언 (as 사용)
  // ✅ 삭제 함수 추가

  const menuItems = [
    { id: 'cart', icon: ShoppingCartIcon, label: '장바구니' },
    { id: 'bookmark', icon: StarIcon, label: '즐겨찾기' },
    { id: 'messages', icon: ChatBubbleLeftRightIcon, label: '메시지' }, // ✅ ChatPopUp 추가
    { id: 'help', icon: QuestionMarkCircleIcon, label: '도움말' },
    { id: 'settings', icon: Cog6ToothIcon, label: '설정' },
  ];

  return (
    <>
      {/* ✅ 사이드바 */}
      <div
        className="fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-300 z-[60]"
        onClick={(e) => e.stopPropagation()} // ✅ 사이드바 클릭 시 배경 클릭 이벤트 방지
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.stopPropagation(); // ✅ 클릭 이벤트 전파 방지
              setSelected(
                selected === item.id
                  ? null
                  : (item.id as
                      | 'cart'
                      | 'bookmark'
                      | 'messages'
                      | 'help'
                      | 'settings')
              ); // ✅ 타입 강제 지정// ✅ 선택 / 해제 토글
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

      {/* ✅ 장바구니 팝업 */}
      {selected === 'cart' && (
        <CartBookmarkPopup
          isOpen={selected === 'cart'}
          type="cart"
          items={cartItems}
          closePopup={() => setSelected(null)}
          removeItem={deleteCartItem} // ✅ 삭제 함수 연결
          updateCartQuantity={updateCartQuantity}
        />
      )}

      {/* ✅ 즐겨찾기 팝업 */}
      {selected === 'bookmark' && (
        <CartBookmarkPopup
          isOpen={selected === 'bookmark'}
          type="bookmark"
          items={bookmarkItems}
          closePopup={() => setSelected(null)}
          removeItem={deleteBookmarkItem} // ✅ 삭제 함수 연결
        />
      )}

      {/* ✅ ChatPopUp 추가 (사이드바 옆에서 뜨도록) */}
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
