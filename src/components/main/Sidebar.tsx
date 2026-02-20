import { useState } from 'react';
import {
  StarIcon,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/solid';
import BookmarkPopup from '../popup/BookmarkPopup';
import RealTimeChatPopup from '../popup/RealTimeChatPopup';

type PopupId = 'bookmark' | 'realtime-chat';

const Sidebar = () => {
  const [selected, setSelected] = useState<PopupId[]>([]);

  const menuItems = [
    { id: 'bookmark' as const, icon: StarIcon, label: '즐겨찾기' },
    { id: 'realtime-chat' as const, icon: ChatBubbleOvalLeftIcon, label: '실시간 채팅' },
  ];

  const togglePopup = (id: PopupId) => {
    setSelected((prev) => {
      if (id === 'bookmark') {
        // 즐겨찾기는 단독으로만 열림
        return prev.includes(id) ? [] : [id];
      } else {
        // 나머지는 동시에 열 수 있음
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        } else {
          return [...prev.filter((item) => item !== 'bookmark'), id];
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
              togglePopup(item.id);
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 ${
              selected.includes(item.id)
                ? 'bg-blue-500 text-white shadow-md shadow-blue-300'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </div>
      {/* 즐겨찾기 팝업 */}
      {selected.includes('bookmark') && (
        <BookmarkPopup
          isOpen={selected.includes('bookmark')}
          closePopup={() => togglePopup('bookmark')}
        />
      )}
      {/* 실시간 채팅 팝업 */}
      {selected.includes('realtime-chat') && (
        <RealTimeChatPopup
          isOpen={selected.includes('realtime-chat')}
          closePopup={() => togglePopup('realtime-chat')}
        />
      )}
    </>
  );
};

export default Sidebar;
