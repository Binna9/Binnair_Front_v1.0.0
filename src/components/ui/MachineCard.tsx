import React from 'react';
import { Machine } from '@/types/MachineCardTypes';

const MachineCard: React.FC<Machine & { className?: string }> = ({
  title,
  description,
  date,
  image,
  className = '',
}) => {
  return (
    <div
      className={`w-72 bg-white shadow-lg rounded-xl overflow-hidden transform transition-transform hover:scale-105 ${className}`}
    >
      {/* ✅ 배경 이미지 */}
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      ></div>

      {/* ✅ 카드 내용 */}
      <div className="p-4">
        {/* 날짜 */}
        <div className="text-sm text-gray-500">{date}</div>

        {/* 제목 */}
        <h2 className="text-lg font-bold text-gray-900 mt-1 hover:text-blue-600 cursor-pointer">
          {title}
        </h2>

        {/* 설명 */}
        <p className="text-sm text-gray-700 mt-2">{description}</p>
      </div>

      {/* ✅ 아이콘 메뉴 */}
      <div className="flex justify-between p-3 bg-gray-100 border-t border-gray-200">
        <button className="text-gray-500 hover:text-red-500">
          <i className="fa fa-heart"></i>
        </button>
        <button className="text-gray-500 hover:text-blue-500">
          <i className="fa fa-comment"></i>
        </button>
        <button className="text-gray-500 hover:text-yellow-500">
          <i className="fa fa-bookmark"></i>
        </button>
      </div>
    </div>
  );
};

export default MachineCard;
