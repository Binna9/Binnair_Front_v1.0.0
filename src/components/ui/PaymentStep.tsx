import React, { useState } from 'react';
import {
  CreditCard,
  Shield,
  User,
  Calendar,
  Lock,
  Check,
  ArrowLeft,
} from 'lucide-react';
import PaymentCard from './PaymentCard';

const PaymentStep = ({
  total,
  calculateShippingCost,
  discountApplied,
  onBack,
  onComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  interface CardData {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  }

  // 카드 데이터 상태 관리
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  // 폼 에러 상태 관리
  const [errors, setErrors] = useState<Partial<CardData>>({});

  // 카드 타입 감지 함수
  const getCardType = () => {
    const number = cardData.number.replace(/\s/g, '');
    if (number.startsWith('5')) return 'mastercard';
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('3')) return 'amex';
    return 'generic';
  };

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
    }

    if (name === 'expiry') {
      formattedValue = value.replace(/\//g, '');
      if (formattedValue.length > 2) {
        formattedValue =
          formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      formattedValue = formattedValue.slice(0, 5);
    }

    if (name === 'cvc') {
      formattedValue = value.slice(0, 3);
    }

    setCardData({
      ...cardData,
      [name]: formattedValue,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors: Partial<CardData> = {};

    if (!cardData.number || cardData.number.replace(/\s/g, '').length !== 16) {
      newErrors.number = '유효한 16자리 카드번호를 입력해주세요';
    }

    if (!cardData.name) {
      newErrors.name = '카드에 표시된 이름을 입력해주세요';
    }

    if (!cardData.expiry || !cardData.expiry.includes('/')) {
      newErrors.expiry = '유효기간을 입력해주세요 (MM/YY)';
    }

    if (!cardData.cvc || cardData.cvc.length !== 3) {
      newErrors.cvc = '3자리 보안코드를 입력해주세요';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handlePaymentComplete();
    }
  };

  // 결제 완료 처리 함수
  const handlePaymentComplete = () => {
    setIsProcessing(true);

    // 결제 처리 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      // 결제 성공 후 확인 페이지로 이동
      setTimeout(() => {
        onComplete && onComplete();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="w-full bg-zinc-100 rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-semibold mb-6 flex items-center drop-shadow-md">
        <CreditCard size={24} className="mr-3" /> 결제 정보
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {paymentSuccess ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-green-600 mb-2">
                결제가 성공적으로 완료되었습니다!
              </h2>
              <p className="text-gray-600 mb-6">
                잠시 후 주문 확인 페이지로 이동합니다...
              </p>
            </div>
          ) : isProcessing ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-lg">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                결제 처리 중...
              </h2>
              <p className="text-gray-600">
                페이지를 닫지 마세요. 결제가 완료될 때까지 기다려 주세요.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h2 className="text-lg font-semibold">카드 정보 입력</h2>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield size={16} className="mr-2" />
                  <span>안전한 결제</span>
                </div>
              </div>

              {/* 시각적 카드 UI 컴포넌트 */}
              <PaymentCard
                cardNumber={cardData.number}
                cardHolder={cardData.name}
                expiryDate={cardData.expiry}
                cvc={cardData.cvc}
                cardType={getCardType()}
              />

              {/* 카드 입력 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    카드 번호
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="number"
                      value={cardData.number}
                      onChange={handleChange}
                      placeholder="0000 0000 0000 0000"
                      className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                        errors.number ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <CreditCard
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  {errors.number && (
                    <p className="text-red-500 text-xs mt-1">{errors.number}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    카드 소유자 이름
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={cardData.name}
                      onChange={handleChange}
                      placeholder="카드에 표시된 이름"
                      className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <User
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      유효기간
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="expiry"
                        value={cardData.expiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                          errors.expiry ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <Calendar
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                      />
                    </div>
                    {errors.expiry && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.expiry}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      CVC
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cvc"
                        value={cardData.cvc}
                        onChange={handleChange}
                        placeholder="000"
                        className={`w-full pl-10 pr-3 py-2 rounded-lg border ${
                          errors.cvc ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <Lock
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                      />
                    </div>
                    {errors.cvc && (
                      <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center"
                >
                  <CreditCard size={18} className="mr-2" />
                  결제 완료
                </button>
              </form>

              <div className="mt-6 pt-4 border-t flex items-center text-sm text-gray-500">
                <Lock size={16} className="mr-2 text-gray-400" />
                <span>모든 결제 정보는 안전하게 암호화되어 처리됩니다.</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-6 sticky top-6 shadow-lg">
            <h2 className="text-lg font-medium mb-4">결제 요약</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span>상품 금액</span>
                <span>{(total?.totalAmount || 0).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>배송비</span>
                <span>
                  {calculateShippingCost() > 0
                    ? `${calculateShippingCost().toLocaleString()}원`
                    : '무료'}
                </span>
              </div>
              {discountApplied && total?.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>할인</span>
                  <span>
                    -{(total?.discountAmount || 0).toLocaleString()}원
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between border-t pt-4 font-medium text-lg mb-6">
              <span>총 결제금액</span>
              <span className="text-blue-600">
                {(
                  (total?.discountedTotal || total?.totalAmount || 0) +
                  calculateShippingCost()
                ).toLocaleString()}
                원
              </span>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-sm font-medium text-blue-700 mb-2">
                결제 안내
              </h3>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• 카드 정보는 안전하게 보호됩니다</li>
                <li>• 입력하신 카드로 즉시 결제됩니다</li>
                <li>• 배송은 결제 완료 후 1-3일 내 진행됩니다</li>
              </ul>
            </div>

            <button
              className="w-full py-3 bg-zinc-200 text-gray-700 rounded-lg hover:bg-zinc-300 transition mb-2 flex items-center justify-center"
              onClick={onBack}
            >
              <ArrowLeft size={16} className="mr-2" />
              이전 단계
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
