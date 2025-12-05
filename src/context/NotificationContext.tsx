import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// 알림 타입 정의
type NotificationType = 'confirm' | 'alert' | 'toast';
// 토스트 상태 정의
type ToastStatus = 'success' | 'error' | 'warning' | 'info' | 'default';
// 토스트 위치 정의
type ToastPosition =
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left';

// 알림 인터페이스 정의
interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  duration?: number; // 토스트 지속 시간 (ms)
  position?: ToastPosition; // 토스트 위치
  status?: ToastStatus; // 토스트 상태 (색상)
}

// 컨텍스트 인터페이스 정의
interface NotificationContextType {
  showConfirm: (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => Promise<boolean>;
  showAlert: (title: string, message: string, onConfirm?: () => void) => void;
  showToast: (
    title: string,
    message: string,
    status?: ToastStatus,
    duration?: number,
    position?: ToastPosition
  ) => void;
  hideNotification: () => void;
}

// 컨텍스트 생성
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// 프로바이더 Props 정의
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  const [toasts, setToasts] = useState<
    Array<NotificationData & { id: string }>
  >([]);

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setNotification({
        type: 'confirm',
        title,
        message,
        onConfirm: () => resolve(true), // 확인 버튼을 누르면 true 반환
        onCancel: () => resolve(false), // 취소 버튼을 누르면 false 반환
      });
      setIsOpen(true);
    });
  };

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setNotification({
      type: 'alert',
      title,
      message,
      onConfirm,
    });
    setIsOpen(true);
  };

  const showToast = (
    title: string,
    message: string,
    status: ToastStatus = 'default',
    duration = 5000,
    position: ToastPosition = 'top-right'
  ) => {
    const id = Date.now().toString();
    const toast = {
      id,
      type: 'toast' as NotificationType,
      title,
      message,
      duration,
      position,
      status,
    };

    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const hideNotification = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (notification?.onConfirm) {
      notification.onConfirm();
    }
    hideNotification();
  };

  const handleCancel = () => {
    if (notification?.onCancel) {
      notification.onCancel();
    }
    hideNotification();
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // 토스트 위치에 따른 클래스 지정
  const getPositionClasses = (position: ToastPosition) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  };

  // 토스트 상태에 따른 클래스 지정
  const getStatusClasses = (status: ToastStatus) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'default':
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // 토스트 상태에 따른 아이콘 표시
  const getStatusIcon = (status: ToastStatus) => {
    switch (status) {
      case 'success':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-green-500 dark:text-green-400"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-red-500 dark:text-red-400"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-yellow-500 dark:text-yellow-400"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-blue-500 dark:text-blue-400"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // 토스트 상태에 따른 제목 텍스트 색상
  const getTitleColorClass = (status: ToastStatus) => {
    switch (status) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      case 'default':
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  return (
    <NotificationContext.Provider
      value={{ showConfirm, showAlert, showToast, hideNotification }}
    >
      {children}

      {/* 다이얼로그 (confirm, alert) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm p-4">
          <DialogHeader>
            <DialogTitle className="text-base">{notification?.title}</DialogTitle>
            <DialogDescription className="text-xs">{notification?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            {notification?.type === 'confirm' && (
              <Button variant="outline" onClick={handleCancel} className="text-sm px-3 py-1.5 h-auto">
                취소
              </Button>
            )}
            <Button onClick={handleConfirm} className="text-sm px-3 py-1.5 h-auto">확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 토스트 컨테이너들 */}
      {[
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ].map((position) => (
        <div
          key={position}
          className={`fixed z-50 flex flex-col gap-2 ${getPositionClasses(
            position as ToastPosition
          )}`}
        >
          {toasts
            .filter((toast) => toast.position === position)
            .map((toast) => (
              <div
              key={toast.id}
              className={`relative overflow-hidden backdrop-blur-sm shadow-2xl rounded-2xl p-4 min-w-[20rem] max-w-sm animate-in fade-in slide-in-from-top-5 duration-500 border-2 ${getStatusClasses(
                toast.status || 'default'
              )}`}
              role="alert"
              style={{
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* 배경 그라디언트 효과 */}
              <div className="absolute inset-0 opacity-30">
                <div className={`absolute inset-0 ${
                  toast.status === 'success' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                  toast.status === 'error' ? 'bg-gradient-to-br from-red-400 to-rose-500' :
                  toast.status === 'warning' ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                  toast.status === 'info' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' :
                  'bg-gradient-to-br from-gray-300 to-gray-400'
                }`} />
              </div>

              {/* 애니메이션 바 */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-pulse" 
                   style={{ 
                     width: '100%',
                     animation: `shrink ${toast.duration}ms linear forwards`
                   }} 
              />

              <div className="relative flex items-start space-x-3">
                {/* 아이콘 영역 - 더 크고 눈에 띄게 */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                     style={{
                       background: toast.status === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                 toast.status === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                 toast.status === 'warning' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                 toast.status === 'info' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                     }}>
                  <div className="w-6 h-6 text-white">
                    {getStatusIcon(toast.status || 'default')}
                  </div>
                </div>

                {/* 텍스트 영역 */}
                <div className="flex-1 pt-0.5">
                  <h3 className={`text-base font-bold tracking-tight ${getTitleColorClass(
                      toast.status || 'default'
                    )}`}>
                    {toast.title}
                  </h3>
                  <div className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                    {toast.message}
                  </div>
                </div>

                {/* 닫기 버튼 - 더 현대적인 디자인 */}
                <button
                  type="button"
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  onClick={() => removeToast(toast.id)}
                >
                  <span className="sr-only">닫기</span>
                  <svg
                    className="h-4 w-4 text-gray-500 dark:text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            ))}
        </div>
      ))}
    </NotificationContext.Provider>
  );
};
// 커스텀 훅 생성
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      showConfirm: () => {
        console.error(
          '❌ showConfirm() is called outside NotificationProvider'
        );
        return Promise.resolve(false); // Promise<boolean> 반환
      },
      showAlert: () => {
        console.error('❌ showAlert() is called outside NotificationProvider');
      },
      showToast: () => {
        console.error('❌ showToast() is called outside NotificationProvider');
      },
      hideNotification: () => {
        console.error(
          '❌ hideNotification() is called outside NotificationProvider'
        );
      },
    };
  }
  return context;
};
