import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { UserResponse } from '@/types/UserTypes';

type UserProfilePopupProps = {
  isOpen: boolean;
  closePopup: () => void;
  user?: UserResponse | null;
};

type UserPopupViewModel = {
  userId: string;
  userName: string;
  department: string;
  position: string;
  active: boolean;
  resigned: boolean;
};

const MOCK_META = {
  department: '품질관리팀',
  position: '매니저',
  resigned: false,
} as const;

const toYesNo = (value: boolean, yesLabel: string, noLabel: string) => (value ? yesLabel : noLabel);

const UserProfilePopup: React.FC<UserProfilePopupProps> = ({ isOpen, closePopup, user }) => {
  const vm = useMemo<UserPopupViewModel>(() => {
    return {
      userId: user?.userId ?? 'MOCK-USER-001',
      userName: user?.userName ?? '홍길동',
      department: MOCK_META.department,
      position: MOCK_META.position,
      active: user?.active ?? true,
      resigned: MOCK_META.resigned,
    };
  }, [user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closePopup();
          }}
        >
          <motion.div
            className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-950 text-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="font-semibold">사용자 정보</div>
              <button
                type="button"
                onClick={closePopup}
                className="p-1 rounded-md hover:bg-white/10 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <dl className="grid grid-cols-3 gap-y-3 gap-x-3 text-sm">
                <dt className="text-white/60">사용자 ID</dt>
                <dd className="col-span-2 font-medium">{vm.userId}</dd>

                <dt className="text-white/60">사용자 명</dt>
                <dd className="col-span-2 font-medium">{vm.userName}</dd>

                <dt className="text-white/60">부서</dt>
                <dd className="col-span-2 font-medium">{vm.department}</dd>

                <dt className="text-white/60">직급</dt>
                <dd className="col-span-2 font-medium">{vm.position}</dd>

                <dt className="text-white/60">사용여부</dt>
                <dd className="col-span-2 font-medium">
                  {toYesNo(vm.active, '사용', '미사용')}
                </dd>

                <dt className="text-white/60">퇴사여부</dt>
                <dd className="col-span-2 font-medium">
                  {toYesNo(vm.resigned, '퇴사', '재직')}
                </dd>
              </dl>

              <div className="mt-4 text-xs text-white/40">
                * 부서/직급/퇴사여부는 현재 목데이터입니다.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfilePopup;
