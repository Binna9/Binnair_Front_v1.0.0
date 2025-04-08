import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { XCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import { useBookmark } from '@/hooks/bookmark/useBookmark';
import { useNotification } from '@/context/NotificationContext';

interface BookmarkPopupProps {
  isOpen: boolean;
  closePopup: () => void;
}

const BookmarkPopup: React.FC<BookmarkPopupProps> = ({
  isOpen,
  closePopup,
}) => {
  const { bookmarkItems, deleteBookmarkItem } = useBookmark();

  const notification = useNotification();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && bookmarkItems.length > 0) {
      const allItemIds = bookmarkItems.map((item) => item.bookmarkId);
      if (selectedItems.length === 0) {
        setSelectedItems(allItemIds);
        setSelectAll(true);
      }
    }
  }, [isOpen, bookmarkItems, selectedItems.length]);

  useEffect(() => {
    if (selectAll) {
      const allItemIds = bookmarkItems.map((item) => item.bookmarkId);
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  }, [selectAll, bookmarkItems, selectedItems.length]);

  // 개별 항목 선택 토글
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSelection = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      setSelectAll(newSelection.length === bookmarkItems.length);
      return newSelection;
    });
  };

  // 선택된 항목 삭제
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;

    const confirmed = await notification.showConfirm(
      'DELETE',
      '삭제하시겠습니까?'
    );

    if (confirmed) {
      try {
        for (const itemId of selectedItems) {
          await deleteBookmarkItem(itemId);
        }
        setTimeout(() => {
          setSelectedItems([]);
          setSelectAll(false);
        }, 100);
      } catch (error) {
        console.error('❌ 선택된 아이템 삭제 실패:', error);
      }
    }
  };

  // 전체 선택 / 해제
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedItems(
      selectAll ? [] : bookmarkItems.map((item) => item.bookmarkId)
    );
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
          <StarIcon className="w-7 h-7 text-yellow-500" />
          <h2 className="text-xl font-semibold">Bookmark</h2>
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
          {bookmarkItems.length > 0 ? (
            bookmarkItems.map((item) => (
              <div
                key={item.bookmarkId}
                className="border-b pb-4 flex justify-between items-center space-x-4"
              >
                <div className="flex items-center gap-4">
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.bookmarkId)}
                    onChange={() => toggleItemSelection(item.bookmarkId)}
                    className="w-4 h-4 cursor-pointer"
                  />

                  {/* 상품 이미지 */}
                  <img
                    src={item.imageUrl || '/default-product.png'}
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

                {/* 가격 */}
                <p className="text-gray-700 font-semibold">
                  {typeof item.price === 'number'
                    ? `${item.price.toLocaleString()} 원`
                    : '가격 정보 없음'}
                </p>

                {/* 삭제 버튼 */}
                <button
                  onClick={async () => {
                    const isConfirmed = await notification.showConfirm(
                      'DELETE',
                      '삭제하시겠습니까?'
                    );
                    if (isConfirmed) {
                      await deleteBookmarkItem(item.bookmarkId);
                    }
                  }}
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
      </motion.div>
    </div>
  );
};

export default BookmarkPopup;
