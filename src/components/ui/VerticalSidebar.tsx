import React from 'react';
import { ShoppingCart, FileText, CreditCard, Check } from 'lucide-react';

const VerticalSidebar = ({ currentStep, onStepClick }) => {
  const steps = [
    {
      id: 'cart',
      label: '장바구니',
      description: '상품 확인 및 선택',
      icon: <ShoppingCart size={16} />,
    },
    {
      id: 'checkout',
      label: '주문서 작성',
      description: '배송 정보 입력',
      icon: <FileText size={16} />,
    },
    {
      id: 'payment',
      label: '결제하기',
      description: '결제 수단 선택',
      icon: <CreditCard size={16} />,
    },
    {
      id: 'confirmation',
      label: '주문완료',
      description: '주문 확인',
      icon: <Check size={16} />,
    },
  ];

  return (
    <div className="w-64 h-full flex-shrink-0">
      <div className="bg-white rounded-lg shadow-md p-3 h-full">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPast =
            (currentStep === 'checkout' && step.id === 'cart') ||
            (currentStep === 'payment' &&
              (step.id === 'cart' || step.id === 'checkout')) ||
            (currentStep === 'confirmation' && step.id !== 'confirmation');

          return (
            <div key={step.id} className="mb-2 last:mb-0">
              <div
                className={`flex items-start transition-all duration-200 p-2 rounded-md cursor-pointer
                  ${
                    isActive
                      ? 'bg-blue-50'
                      : isPast
                      ? 'hover:bg-green-50'
                      : 'hover:bg-gray-50'
                  }`}
                onClick={() => onStepClick && onStepClick(step.id)}
              >
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mr-2
                    transition-colors duration-300 ease-in-out
                    ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : isPast
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                >
                  {isPast ? <Check size={16} /> : step.icon}
                </div>
                <div className="flex-grow overflow-hidden">
                  <p
                    className={`font-medium text-sm whitespace-nowrap truncate
                      ${
                        isActive
                          ? 'text-blue-700'
                          : isPast
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap truncate">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="mx-4 my-1 border-b border-dashed border-gray-300"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VerticalSidebar;
