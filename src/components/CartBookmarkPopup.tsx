import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  XCircleIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { useProductImageBatch } from '../hooks/useProductImageBatch';
import { useCartBookmark } from '@/context/CartBookmarkContext';
import { CartItem } from '../types/CartBookmarkTypes';

interface CartBookmarkPopupProps {
  isOpen: boolean;
  type: 'cart' | 'bookmark';
  closePopup: () => void;
}

const CartBookmarkPopup: React.FC<CartBookmarkPopupProps> = ({
  isOpen,
  type,
  closePopup,
}) => {
  const {
    cartItems,
    bookmarkItems,
    totalAmount,
    updateCartQuantity,
    deleteCartItem,
    deleteBookmarkItem,
    fetchCartItems,
    fetchBookmarkItems,
  } = useCartBookmark();

  // ✅ 현재 선택된 항목 (Cart 또는 Bookmark)
  const items = type === 'cart' ? cartItems : bookmarkItems;
  const isCart = type === 'cart';

  // ✅ 제품 이미지 불러오기
  const productIds = items.map((item) => item.productId);
  const productImages = useProductImageBatch(productIds);

  const isFetched = useRef(false);

  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    console.log('🔄 useEffect 실행됨! type:', type);
    if (type === 'cart') {
      console.log('📢 fetchCartItems 호출!');
      fetchCartItems();
    } else if (type === 'bookmark') {
      console.log('📢 fetchBookmarkItems 호출!');
      fetchBookmarkItems();
    }
  }, [type]);

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
          {isCart ? (
            <ShoppingCartIcon className="w-7 h-7 text-blue-500" />
          ) : (
            <StarIcon className="w-7 h-7 text-yellow-500" />
          )}
          <h2 className="text-xl font-semibold">
            {isCart ? '장바구니' : '즐겨찾기'}
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

                {/* ✅ 장바구니일 때만 수량 조절 UI 표시 */}
                {isCart && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.id,
                          (item as CartItem).quantity - 1
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      disabled={(item as CartItem).quantity <= 1}
                    >
                      -
                    </button>
                    <p className="text-gray-700">
                      {(item as CartItem).quantity}
                    </p>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.id,
                          (item as CartItem).quantity + 1
                        )
                      }
                      className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                )}

                <p className="text-gray-700 font-semibold">
                  {typeof item.price === 'number'
                    ? `${item.price.toLocaleString()} 원`
                    : '가격 정보 없음'}
                </p>

                {/* 삭제 버튼 */}
                <button
                  onClick={() =>
                    isCart
                      ? deleteCartItem(item.id)
                      : deleteBookmarkItem(item.id)
                  }
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

        {/* ✅ 장바구니일 때만 총 금액 표시 */}
        {isCart && (
          <div className="mt-4 text-right font-bold text-lg">
            {totalAmount.toLocaleString()} 원
          </div>
        )}
        {/* ✅ 장바구니일 때만 구매하기 버튼 표시 */}
        {isCart && (
          <div className="flex justify-center mt-3">
            <button className="w-1/4 py-3 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition text-center">
              구매하기
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartBookmarkPopup;
