import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, ShoppingCart } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ✅ 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-0 p-2 bg-gray-800 text-white rounded-l-md shadow-lg z-50"
      >
        <ChevronLeft
          className={`w-6 h-6 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? '0%' : '100%' }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="sidebar"
      >
        {/* ✅ 사이드바 내용 */}
        <div className="grid grid-cols-2 gap-4 border-b pb-2 mb-4">
          <Button
            className="w-32 h-10 text-sm font-semibold text-white rounded-lg shadow-lg active:shadow-sm bg-gradient-to-r from-yellow-400 to-yellow-500"
            onClick={() => console.log('즐겨찾기 클릭됨')}
          >
            <Star className="w-5 h-5" />
            즐겨찾기
          </Button>

          <Button
            className="w-32 h-10 text-sm font-semibold text-white rounded-lg shadow-lg active:shadow-sm bg-gradient-to-r from-gray-500 to-gray-700"
            onClick={() => console.log('장바구니 클릭됨')}
          >
            <ShoppingCart className="w-5 h-5" />
            장바구니
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
