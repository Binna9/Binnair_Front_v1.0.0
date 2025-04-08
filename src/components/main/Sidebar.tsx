import { useState } from 'react';
import {
  StarIcon,
  Cog6ToothIcon,
  WalletIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';
import BookmarkPopup from '../popup/BookmarkPopup';
import ChatPopUp from '../popup/ChatPopup';

const Sidebar = () => {
  const [selected, setSelected] = useState<
    'bookmark' | 'settings' | 'wallet' | 'messages' | null
  >(null);

  const menuItems = [
    { id: 'bookmark', icon: StarIcon, label: '즐겨찾기' },
    { id: 'wallet', icon: WalletIcon, label: '지갑' },
    { id: 'messages', icon: ChatBubbleLeftRightIcon, label: '메시지' },
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
                  : (item.id as 'bookmark' | 'settings' | 'wallet' | 'messages')
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
      {/* TODO: 지갑 팝업 */}
      {selected === 'wallet' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[600px] max-w-full p-6">
            <h2 className="text-xl font-semibold mb-4">지갑</h2>
            <p>지갑 기능은 준비 중입니다.</p>
          </div>
        </div>
      )}
      {/* 즐겨찾기 팝업 */}
      {selected === 'bookmark' && (
        <BookmarkPopup
          isOpen={selected === 'bookmark'}
          closePopup={() => setSelected(null)}
        />
      )}
      {/* 채팅 팝업 */}
      {selected === 'messages' && (
        <ChatPopUp
          isOpen={selected === 'messages'}
          closePopup={() => setSelected(null)}
        />
      )}
      {/* TODO: 설정 팝업 */}
      {selected === 'settings' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[600px] max-w-full p-6">
            <h2 className="text-xl font-semibold mb-4">설정</h2>
            <p>설정 기능은 준비 중입니다.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
