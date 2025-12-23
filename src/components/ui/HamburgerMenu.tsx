// HamburgerMenu.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../assets/css/hamburger.css';

interface MenuItem {
  name: string;
  id: string;
  icon?: React.ReactNode;
}

interface HamburgerMenuProps {
  menuName: string;
  items?: MenuItem[];
  isOpen?: boolean;
  onClick: () => void; // toggle/close
  onItemClick?: (item: MenuItem) => void;
  icon?: React.ReactNode;
  className?: string;

  // ✅ 추가: 반응형용 Drawer 지원
  variant?: 'dropdown' | 'drawer';
  closeOnSelect?: boolean;
  align?: 'left' | 'center' | 'right';
  side?: 'left' | 'right';
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  menuName,
  items = [],
  isOpen = false,
  onClick,
  onItemClick,
  icon,
  className,

  variant = 'dropdown',
  closeOnSelect = true,
  align = 'left',
  side = 'right',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClick]);

  const handleSelect = (item: MenuItem) => {
    onItemClick?.(item);
    if (closeOnSelect) onClick();
  };

  const dropdownAlignClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  const arrowPositionClass =
    align === 'left'
      ? 'left-4'
      : align === 'right'
      ? 'right-4'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div className={`relative ${className || ''}`}>
      {/* Trigger */}
      <button
        type="button"
        className="flex items-center space-x-2 cursor-pointer"
        onClick={onClick}
      >
        {variant !== 'drawer' && (
          <label className="hamburger group pointer-events-none">
            <svg
              viewBox="0 0 32 32"
              width="32"
              height="32"
              className="transition-transform duration-300 group-hover:scale-110"
            >
              <path
                className="line line-top-bottom transition-all duration-300 group-hover:stroke-gray-300"
                d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
              />
              <path
                className="line transition-all duration-300 group-hover:stroke-gray-300"
                d="M7 16 27 16"
              />
            </svg>
          </label>
        )}

        <div className="flex items-center">
          {icon && <span className="text-white mr-1">{icon}</span>}
          <span className="text-white font-medium text-sm whitespace-nowrap">
            {menuName}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {/* Dropdown */}
        {isOpen && variant === 'dropdown' && (
          <motion.div
            ref={panelRef}
            className={`absolute ${dropdownAlignClass} top-14 w-44 bg-zinc-900 border border-white/30 text-white shadow-lg rounded-lg`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
          >
            {/* 말풍선 포인터 */}
            <div
              className={`absolute ${arrowPositionClass} -top-1.5 w-3 h-3 bg-zinc-900 border-l border-t border-white/30 rotate-45`}
            />
            <ul className="py-1 text-center space-y-0.5 relative z-10">
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="py-1 px-2 w-11/12 mx-auto transition cursor-pointer hover:bg-white/15 rounded-md flex items-center justify-center space-x-1.5 whitespace-nowrap text-xs"
                >
                  {item.icon && (
                    <span className="flex items-center text-xs [&>svg]:w-3 [&>svg]:h-3">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Drawer */}
        {isOpen && variant === 'drawer' && (
          <motion.div
            className="fixed inset-0 z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              className={`absolute top-0 ${
                side === 'right' ? 'right-0' : 'left-0'
              } h-full w-[280px] bg-zinc-900 border-l border-white/10 shadow-xl p-3`}
              initial={{ x: side === 'right' ? 24 : -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: side === 'right' ? 24 : -24,
                opacity: 0,
                transition: { duration: 0.18 },
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-semibold">{menuName}</div>
                <button
                  type="button"
                  className="text-white/70 hover:text-white"
                  onClick={onClick}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 text-left text-sm text-white"
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HamburgerMenu;
