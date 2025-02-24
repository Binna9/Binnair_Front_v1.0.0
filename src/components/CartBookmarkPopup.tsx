import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  XCircleIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { CartItem, BookmarkItem } from '../types/CartBookmarkTypes';
import { useProductImageBatch } from '../hooks/useProductImageBatch'; // ✅ 여러 제품 이미지 가져오는 커스텀 훅
import { useCartBookmark } from '../hooks/useCartBookmark';

interface CartBookmarkPopupProps {
  isOpen: boolean;
  type: 'cart' | 'bookmark';
  items: CartItem[] | BookmarkItem[];
  totalAmount: number | null;
  closePopup: () => void;
  removeItem: (id: string) => void;
  updateCartQuantity?: (id: string, newQuantity: number) => void;
}

const CartBookmarkPopup: React.FC<CartBookmarkPopupProps> = ({
  isOpen,
  type,
  items,
  closePopup,
  removeItem,
  updateCartQuantity,
}) => {
  // ✅ 모든 제품의 ID 추출 후 한번에 이미지 로드
  const productIds = items.map((item) => item.productId);
  const productImages = useProductImageBatch(productIds); // ✅ 여러 개의 이미지 불러오기
  const { totalAmount } = useCartBookmark('cart');

  useEffect(() => {
    console.log('🔄 CartBookmarkPopup: totalAmount 상태 변경됨:', totalAmount);
  }, [totalAmount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white rounded-2xl shadow-xl w-[600px] max-w-full p-6 relative"
      >
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-4">
          {type === 'cart' ? (
            <ShoppingCartIcon className="w-7 h-7 text-blue-500" />
          ) : (
            <StarIcon className="w-7 h-7 text-yellow-500" />
          )}
          <h2 className="text-xl font-semibold">
            {type === 'cart' ? '장바구니' : '즐겨찾기'}
          </h2>
        </div>

        {/* 아이템 목록 */}
        <div className="max-h-64 overflow-y-auto space-y-4 custom-scroll p-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="border-b pb-4 flex justify-between items-center space-x-4"
              >
                {/* ✅ 제품 이미지 표시 */}
                <div className="flex items-center gap-4">
                  <img
                    src={
                      productImages[item.productId] || '/default-product.png'
                    }
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md border"
                  />

                  <div>
                    <p className="text-gray-800 font-semibold">
                      {item.productName}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {item.productDescription}
                    </p>
                  </div>
                </div>

                {/* ✅ 수량 조절 버튼 */}
                {type === 'cart' &&
                  'quantity' in item &&
                  updateCartQuantity && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <p className="text-gray-700">{item.quantity}</p>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  )}

                {/* ✅ 가격 정보 */}
                {typeof item.price === 'number' ? (
                  <p className="text-gray-700 font-semibold">
                    {item.price.toLocaleString()} 원
                  </p>
                ) : (
                  <p className="text-gray-500">가격 정보 없음</p>
                )}

                {/* ✅ 삭제 버튼 */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700 ml-4"
                >
                  삭제
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">아이템이 없습니다.</p>
          )}
        </div>
        {/* ✅ 총 금액 표시 (cart 타입인 경우) */}
        {type === 'cart' && (
          <div className="mt-4 text-right font-bold text-lg">
            {' '}
            {totalAmount !== null && totalAmount !== undefined
              ? totalAmount.toLocaleString()
              : '🚨 totalAmount가 null 또는 undefined입니다.'}{' '}
            원
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartBookmarkPopup;
