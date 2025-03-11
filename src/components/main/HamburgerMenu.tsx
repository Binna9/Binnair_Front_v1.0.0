import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/hamburger.css';

interface HamburgerMenuProps {
  menuName: string;
  items?: { name: string; id: string }[];
  isOpen?: boolean;
  onClick: () => void;
  onItemClick?: (item: { name: string; id: string }) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  menuName,
  items,
  isOpen,
  onClick,
  onItemClick,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null); // ✅ useRef로 closeTimeout 유지
  const [closing, setClosing] = useState(false);

  // ✅ 배경 클릭 시 부드럽게 닫힘
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setClosing(true);
        closeTimeout.current = setTimeout(() => {
          onClick(); // ✅ 애니메이션 후 닫힘 처리
          setClosing(false);
        }, 300); // ✅ 0.3초 후 닫힘
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current); // ✅ 기존 타이머가 있으면 초기화
      }
    };
  }, [isOpen, onClick]); // ✅ 의존성 배열 유지

  // ✅ 새로운 메뉴 선택 시 `closing` 상태 즉시 초기화
  useEffect(() => {
    if (isOpen) {
      setClosing(false);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* 햄버거 버튼 */}
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={onClick}
      >
        <label className="hamburger group">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={onClick}
            className="hidden"
          />
          <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <path
              className="line line-top-bottom transition-all duration-300 group-hover:stroke-gray-300"
              d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
            ></path>
            <path
              className="line transition-all duration-300 group-hover:stroke-gray-300"
              d="M7 16 27 16"
            ></path>
          </svg>
        </label>

        <span className="text-white font-medium text-sm">{menuName}</span>
      </div>

      {/* 📌 드롭다운 메뉴 (부드럽게 열리고 닫힘) */}
      <AnimatePresence>
        {isOpen && !closing && (
          <motion.div
            ref={menuRef}
            className="absolute left-0 top-12 w-48 bg-gray-800/70 border-2 border-white/70 text-white shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.3 } }}
          >
            <ul className="py-2 text-center space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => onItemClick(item)} // ✅ 클릭 시 onItemClick 실행
                  className="py-2 px-4 w-4/5 mx-auto transition cursor-pointer hover:bg-white/50 rounded-sm"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HamburgerMenu;
