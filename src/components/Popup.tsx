import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface PopupProps {
  title: string;
  items: { id: string; name: string; image: string }[];
  isOpen: boolean;
  onClose: () => void;
}

const Popup = ({ title, items, isOpen, onClose }: PopupProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed top-1/2 right-20 transform -translate-y-1/2 bg-white/80 w-80 max-w-full p-4 rounded-xl shadow-xl z-50"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
    >
      {/* 타이틀 영역 */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose}>
          <XCircleIcon className="w-6 h-6 text-gray-700 hover:text-gray-700 transition" />
        </button>
      </div>

      {/* 아이템 목록 */}
      <div className="flex flex-col gap-2 max-h-80 overflow-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-md object-cover"
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">항목이 없습니다.</p>
        )}
      </div>
    </motion.div>
  );
};

export default Popup;
