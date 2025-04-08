import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`bg-gray-100/90 text-gray-700 mt-10 py-8 z-20 relative ${className}`}
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 1️⃣ 브랜드 소개 */}
          <div>
            <h2 className="text-xl font-bold text-gray-800">BinnAIR</h2>
            <p className="text-sm mt-2">
              최고의 제품을 합리적인 가격에 제공합니다.
            </p>
          </div>

          {/* 2️⃣ 고객 서비스 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">고객센터</h3>
            <ul className="mt-2 space-y-2 text-sm">
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

          {/* 3️⃣ 회사 정보 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">회사 정보</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>📍 서울시 강남구</li>
              <li>📧 support@shop.com</li>
              <li>📞 02-1234-5678</li>
              <li>사업자등록번호: 123-45-67890</li>
              <li>통신판매업 신고번호: 2025-서울-1234</li>
            </ul>
          </div>

          {/* 4️⃣ 소셜 미디어 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              팔로우하세요
            </h3>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="hover:text-blue-500">
                📘 Facebook
              </a>
              <a href="#" className="hover:text-pink-500">
                📷 Instagram
              </a>
              <a href="#" className="hover:text-blue-400">
                🐦 Twitter
              </a>
            </div>
          </div>
        </div>

        {/* 5️⃣ 저작권 정보 */}
        <div className="text-center text-sm text-gray-500 border-t mt-6 pt-4">
          Ⓒ 2025 SHOP. All Rights Reserved. 본 사이트의 모든 콘텐츠는 저작권법의
          보호를 받습니다.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
