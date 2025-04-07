import React from 'react';
import { Gift, TrendingUp, Heart, Shield } from 'lucide-react';

const CartPromotionBox = () => {
  const promotions = [
    {
      icon: <Gift size={16} />,
      title: '신규 가입 혜택',
      description: '첫 구매 시 10% 할인',
    },
    {
      icon: <TrendingUp size={16} />,
      title: '인기 상품 추천',
      description: '인기 상품 확인하기',
    },
    {
      icon: <Heart size={16} />,
      title: '회원 전용 특가',
      description: '회원 특별 할인',
    },
    {
      icon: <Shield size={16} />,
      title: '안전한 결제',
      description: '100% 안전 결제',
    },
  ];

  return (
    <div className="w-64 h-full flex-shrink-0">
      <div className="bg-white rounded-lg shadow-lg p-3 h-full">
        <h3 className="font-bold text-base text-gray-800 mb-3 border-b pb-2">
          쇼핑 혜택
        </h3>

        <div className="space-y-3">
          {promotions.map((promo, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 mr-2 mt-1 text-blue-500">
                {promo.icon}
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-800 whitespace-nowrap truncate">
                  {promo.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap truncate">
                  {promo.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t">
          <div className="bg-blue-50 p-2 rounded-md">
            <p className="text-xs font-medium text-blue-700">지금 주문하면</p>
            <p className="text-xs text-blue-600 mt-1">오늘 출발! 내일 도착!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPromotionBox;
