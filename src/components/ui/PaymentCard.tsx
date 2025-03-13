import React, { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';

type CardProps = {
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvc?: string;
  cardType?: 'visa' | 'mastercard' | 'amex' | 'generic';
};

const PaymentCard: React.FC<CardProps> = ({
  cardNumber = '',
  cardHolder = '',
  expiryDate = '',
  cvc = '',
  cardType = 'generic',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 카드 타입에 따른 배경색 설정
  const cardBackground =
    cardType === 'mastercard'
      ? 'from-red-500 to-orange-500'
      : cardType === 'visa'
      ? 'from-blue-500 to-blue-700'
      : cardType === 'amex'
      ? 'from-blue-400 to-cyan-500'
      : 'from-gray-700 to-gray-900';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <div className="relative" style={{ perspective: '1000px' }}>
          {/* 카드 컨테이너 */}
          <div
            className="relative w-full h-64 cursor-pointer transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
            onClick={() => setIsFlipped(!isFlipped)}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
          >
            {/* 카드 전면 */}
            <div
              className={`absolute w-full h-full rounded-xl p-6 bg-gradient-to-r ${cardBackground} shadow-lg text-white flex flex-col justify-between`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  <div className="w-12 h-8 rounded bg-opacity-80 bg-yellow-100"></div>
                  <div className="w-12 h-8 rounded bg-opacity-80 bg-red-500"></div>
                </div>
                <CreditCard className="text-white opacity-80" size={30} />
              </div>

              <div className="mb-6">
                <div className="text-sm opacity-80 mb-1">Card Number</div>
                <div className="text-xl tracking-wider font-medium">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <div className="text-sm opacity-80 mb-1">Card Holder</div>
                  <div className="font-medium truncate max-w-[180px]">
                    {cardHolder || 'YOUR NAME'}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-80 mb-1">Expires</div>
                  <div className="font-medium">{expiryDate || 'MM/YY'}</div>
                </div>
              </div>
            </div>

            {/* 카드 후면 */}
            <div
              className="absolute w-full h-full rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 shadow-lg overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="w-full h-12 bg-black mt-6"></div>
              <div className="px-6 mt-4">
                <div className="flex justify-end items-center mb-4">
                  <div className="bg-white opacity-90 h-10 w-3/4 rounded flex items-center justify-end px-3 text-gray-900">
                    <div>{cvc || '•••'}</div>
                  </div>
                </div>
                <div className="h-8 w-full bg-gray-600 rounded-md opacity-40 mt-2"></div>
                <div className="h-8 w-3/4 bg-gray-600 rounded-md opacity-40 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
