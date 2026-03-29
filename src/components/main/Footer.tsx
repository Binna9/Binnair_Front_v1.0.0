import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`bg-gray-100/90 text-gray-700 mt-4 py-4 z-20 relative ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1️⃣ Introduction */}
          <div>
            <h2 className="text-base font-bold text-gray-800">BinnAIR</h2>
            <p className="text-xs mt-1">
              Training AI를 통해 최고의 트레이딩 경험을 제공합니다.
            </p>
          </div>

          {/* 2️⃣ Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Customer Service
            </h3>
            <ul className="mt-1 space-y-1 text-xs">
              <li>
                <a href="#" className="hover:underline">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  트레이드 안내
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  트레이드 정보
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>

          {/* 3️⃣ Customer Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Customer Information
            </h3>
            <ul className="mt-1 space-y-1 text-xs">
              <li>📍 Seoul Korea</li>
              <li>📧 binnair@gmail.com</li>
              <li>📞 010-6338-3806</li>
            </ul>
          </div>

          {/* 4️⃣ Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Social Media
            </h3>
            <div className="flex space-x-3 mt-1 text-xs">
              <li>준비 중 입니다.</li>
            </div>
          </div>
        </div>

        {/* 5️⃣ 저작권 정보 */}
        <div className="text-center text-xs text-gray-500 border-t mt-4 pt-3">
          Ⓒ 2025 SHOP. All Rights Reserved. 본 사이트의 모든 콘텐츠는 저작권법의
          보호를 받습니다.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
