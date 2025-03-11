import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  XCircleIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import { useProductImageBatch } from '@/hooks/useProductImageBatch';
import { useCartBookmark } from '@/hooks/useCartBookmark';
import { CartItem } from '@/types/CartBookmarkTypes';

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
    discountAmount,
    discountedTotal,
    deleteCartItem,
    deleteBookmarkItem,
    updateCartQuantity,
    fetchDiscountedTotal,
  } = useCartBookmark(type);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);
  const [selectedTotalAmount, setSelectedTotalAmount] = useState<number>(0);
  const [selectedDiscountAmount, setSelectedDiscountAmount] =
    useState<number>(0);
  const [selectedDiscountedTotal, setSelectedDiscountedTotal] =
    useState<number>(0);

  const navigate = useNavigate();

  const items = type === 'cart' ? cartItems : bookmarkItems;
  const isCart = type === 'cart';

  const productIds = items.map((item) => item.productId);
  const productImages = useProductImageBatch(productIds);

  // 선택된 상품의 할인된 총 가격 가져오기
  const fetchSelectedDiscountedTotal = async (itemIds: string[]) => {
    if (isCart && itemIds.length > 0) {
      await fetchDiscountedTotal(itemIds);
    } else {
      setSelectedTotalAmount(0);
      setSelectedDiscountAmount(0);
      setSelectedDiscountedTotal(0);
    }
  };

  useEffect(() => {
    if (isOpen && isCart && items.length > 0) {
      const allItemIds = items.map((item) => item.id);
      if (selectedItems.length === 0) {
        setSelectedItems(allItemIds);
        setSelectAll(true);
        fetchSelectedDiscountedTotal(allItemIds);
      }
    }
  }, [isOpen, isCart, items.length]);

  useEffect(() => {
    if (isCart && selectedItems.length > 0) {
      fetchSelectedDiscountedTotal(selectedItems);
    }
  }, [selectedItems]);

  useEffect(() => {
    if (selectAll) {
      const allItemIds = items.map((item) => item.id);
      setSelectedItems(allItemIds);
      if (isCart) {
        fetchSelectedDiscountedTotal(allItemIds);
      }
    } else {
      // ✅ 전체 선택이 해제될 때만 선택 목록을 비우도록 수정
      setSelectedItems([]);
      setSelectedTotalAmount(0);
      setSelectedDiscountAmount(0);
      setSelectedDiscountedTotal(0);
    }
  }, [selectAll, items.length]);

  // 개별 항목 선택 토글
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSelection = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      setSelectAll(newSelection.length === items.length);
      if (isCart) {
        fetchSelectedDiscountedTotal(newSelection);
      }
      return newSelection;
    });
  };

  // 선택된 항목 삭제
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;
    try {
      for (const itemId of selectedItems) {
        if (isCart) {
          await deleteCartItem(itemId);
        } else {
          await deleteBookmarkItem(itemId);
        }
      }
      setTimeout(() => {
        setSelectedItems([]);
        setSelectAll(false);
        fetchSelectedDiscountedTotal([]);
      }, 100);
    } catch (error) {
      console.error('❌ 선택된 아이템 삭제 중 오류 발생:', error);
    }
  };

  // 전체 선택 / 해제
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(selectAll ? [] : items.map((item) => item.id));
  };

  // 장바구니 수량 업데이트
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!selectedItems.includes(itemId) || newQuantity < 1) return;
    try {
      await updateCartQuantity(itemId, newQuantity);
      setTimeout(() => {
        fetchSelectedDiscountedTotal(selectedItems);
      }, 100);
    } catch (error) {
      console.error('❌ 장바구니 수량 업데이트 중 오류 발생:', error);
    }
  };

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
        {/* 닫기 버튼 */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <XCircleIcon className="w-6 h-6" />
        </button>

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-4">
          {isCart ? (
            <ShoppingCartIcon className="w-7 h-7 text-zinc-700" />
          ) : (
            <StarIcon className="w-7 h-7 text-yellow-500" />
          )}
          <h2 className="text-xl font-semibold">
            {isCart ? '장바구니' : '즐겨찾기'}
          </h2>
        </div>

        {/* 전체 선택 / 삭제 */}
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              className="w-4 h-4 cursor-pointer"
            />
            <label className="text-sm cursor-pointer">전체 선택</label>
          </div>

          {selectedItems.length > 0 && (
            <button
              onClick={() => deleteSelectedItems()}
              className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              선택 삭제 ({selectedItems.length})
            </button>
          )}
        </div>

        {/* 상품 리스트 */}
        <div className="max-h-64 overflow-y-auto space-y-4 custom-scroll p-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="border-b pb-4 flex justify-between items-center space-x-4"
              >
                <div className="flex items-center gap-4">
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-4 h-4 cursor-pointer"
                  />

                  {/* 상품 이미지 */}
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

                {/* 수량 조절 (장바구니만) */}
                {isCart && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.id,
                          (item as CartItem).quantity - 1
                        )
                      }
                      className={`px-2 py-1 rounded-md ${
                        selectedItems.includes(item.id)
                          ? 'bg-gray-200 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={
                        (item as CartItem).quantity <= 1 ||
                        !selectedItems.includes(item.id)
                      }
                    >
                      -
                    </button>
                    <p className="text-gray-700 min-w-[20px] text-center">
                      {(item as CartItem).quantity}
                    </p>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.id,
                          (item as CartItem).quantity + 1
                        )
                      }
                      className={`px-2 py-1 rounded-md ${
                        selectedItems.includes(item.id)
                          ? 'bg-gray-200 hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!selectedItems.includes(item.id)}
                    >
                      +
                    </button>
                  </div>
                )}

                {/* 가격 */}
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

        {/* 결제 금액 (장바구니만) */}
        {isCart && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                {selectedItems.length === items.length
                  ? '전체 상품 금액'
                  : `선택한 상품 금액 (${selectedItems.length}개)`}
              </p>
              <p className="font-semibold text-lg">
                {selectedItems.length === items.length
                  ? totalAmount.toLocaleString()
                  : selectedTotalAmount.toLocaleString()}{' '}
                원
              </p>
            </div>

            {(discountAmount > 0 || selectedDiscountAmount > 0) && (
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">할인 금액</p>
                <p className="font-semibold text-lg text-red-500">
                  -
                  {selectedItems.length === items.length
                    ? discountAmount.toLocaleString()
                    : selectedDiscountAmount.toLocaleString()}{' '}
                  원
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t">
              <p className="text-gray-800 font-semibold">결제 예정 금액</p>
              <p className="font-bold text-xl text-blue-600">
                {selectedItems.length === items.length
                  ? discountedTotal.toLocaleString()
                  : selectedDiscountedTotal.toLocaleString()}{' '}
                원
              </p>
            </div>
          </div>
        )}

        {/* 구매 버튼 (장바구니만) */}
        {isCart && (
          <div className="flex justify-center gap-3 mt-5">
            <button
              className="w-1/3 py-3 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition text-center"
              onClick={() => navigate('/cart')}
            >
              구매 페이지 이동
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartBookmarkPopup;
