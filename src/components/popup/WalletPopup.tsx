import { useState } from 'react';
import { XMarkIcon, WalletIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface WalletPopupProps {
  isOpen: boolean;
  closePopup: () => void;
}

const WalletPopup = ({ isOpen, closePopup }: WalletPopupProps) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50" onClick={closePopup} />

      {/* 모달 컨테이너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative bg-white rounded-2xl shadow-xl w-[600px] max-w-full max-h-[90vh] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <WalletIcon className="w-7 h-7 text-gray-800" />
          <h2 className="text-xl font-semibold">Wallet</h2>
          <button
            onClick={closePopup}
            className="ml-auto p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-4">
          {/* 잔액 섹션 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">총 잔액</h3>
            <div className="text-3xl font-bold text-blue-600">$12,345.67</div>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'balance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('balance')}
            >
              잔액
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('history')}
            >
              거래 내역
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === 'balance' ? (
            <div>
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  입금
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex-1 bg-red-400 text-gray-800 py-3 rounded-lg font-medium hover:bg-red-600"
                >
                  출금
                </button>
              </div>

              {/* 자산 목록 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">USDT</div>
                    <div className="text-sm text-gray-500">Tether</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$10,000.00</div>
                    <div className="text-sm text-gray-500">10,000 USDT</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">BTC</div>
                    <div className="text-sm text-gray-500">Bitcoin</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$2,345.67</div>
                    <div className="text-sm text-gray-500">0.05 BTC</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* 거래 내역 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">입금</div>
                    <div className="text-sm text-gray-500">
                      2024-03-20 14:30
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">+$1,000.00</div>
                    <div className="text-sm text-gray-500">USDT</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">출금</div>
                    <div className="text-sm text-gray-500">
                      2024-03-19 10:15
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">-$500.00</div>
                    <div className="text-sm text-gray-500">USDT</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 입금 모달 */}
      {showDepositModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[80] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDepositModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-6">
            <h3 className="text-xl font-semibold mb-4">입금</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입금 주소
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="0x1234...5678"
                    readOnly
                    className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    복사
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 출금 모달 */}
      {showWithdrawModal && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[80] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWithdrawModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-[400px] max-w-full p-6">
            <h3 className="text-xl font-semibold mb-4">출금</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출금 주소
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  금액
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                출금하기
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WalletPopup;
