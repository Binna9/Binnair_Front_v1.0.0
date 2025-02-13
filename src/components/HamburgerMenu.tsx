import React from 'react';
import '../assets/css/hamburger.css';

interface HamburgerMenuProps {
  menuName: string;
  items: string[];
  isOpen: boolean;
  onClick: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  menuName,
  items,
  isOpen,
  onClick,
}) => {
  return (
    <div className="relative">
      {/* 햄버거 버튼 */}
      <div className="flex items-center space-x-2 cursor-pointer">
        <label className="hamburger">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={() => {
              onClick();
            }}
            className="hidden"
          />
          <svg viewBox="0 0 32 32" width="32" height="32">
            <path
              className="line line-top-bottom"
              d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
            ></path>
            <path className="line" d="M7 16 27 16"></path>
          </svg>
        </label>
        <span className="text-white font-medium text-sm">{menuName}</span>
      </div>

      {/* 📌 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute left-0 top-12 w-48 bg-gray-800/70 border-2 border-white-200 text-white rounded-lg shadow-lg transition-all duration-300 ">
          <ul className="py-2 text-center space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className={`py-2 text-sm transition cursor-pointer hover:bg-white-200 
              ${index !== 0 ? 'border-t-2 border-gray-600 w-4/5 mx-auto' : ''}`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
