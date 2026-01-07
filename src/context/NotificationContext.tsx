import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
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

// 상단에 추가 (컴포넌트 밖에 두면 렌더 비용 줄어듦)
const POSITIONS: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const STATUS_STYLE: Record<
  ToastStatus,
  { accent: string; ring: string; icon: string }
> = {
  success: {
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-400/30',
    icon: 'text-emerald-500',
  },
  error: {
    accent: 'bg-rose-500',
    ring: 'ring-rose-400/30',
    icon: 'text-rose-500',
  },
  warning: {
    accent: 'bg-amber-500',
    ring: 'ring-amber-400/30',
    icon: 'text-amber-500',
  },
  info: {
    accent: 'bg-sky-500',
    ring: 'ring-sky-400/30',
    icon: 'text-sky-500',
  },
  default: {
    accent: 'bg-zinc-400',
    ring: 'ring-zinc-400/25',
    icon: 'text-zinc-500',
  },
};

const MAX_TOASTS = 5;

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

  // id별 timeout 누적 방지 및 cleanup을 위해 Map으로 관리
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());

  const clearToastTimeout = (id: string) => {
    const handle = toastTimeoutsRef.current.get(id);
    if (handle !== undefined) {
      window.clearTimeout(handle);
      toastTimeoutsRef.current.delete(id);
    }
  };

  const removeToast = (id: string) => {
    clearToastTimeout(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach((handle) => window.clearTimeout(handle));
      toastTimeoutsRef.current.clear();
    };
  }, []);

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
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast = {
      id,
      type: 'toast' as NotificationType,
      title,
      message,
      duration,
      position,
      status,
    };

    setToasts((prev) => {
      const next = [...prev, toast];
      if (next.length <= MAX_TOASTS) return next;

      const overflow = next.length - MAX_TOASTS;
      const removed = next.slice(0, overflow);
      removed.forEach((t) => clearToastTimeout(t.id));
      return next.slice(overflow);
    });

    clearToastTimeout(id);
    const timeoutHandle = window.setTimeout(() => removeToast(id), duration);
    toastTimeoutsRef.current.set(id, timeoutHandle);
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

  // 토스트 상태에 따른 아이콘 표시 (더 심플한 디자인)
  const getStatusIcon = (status: ToastStatus) => {
    const iconClass = 'w-5 h-5';
    switch (status) {
      case 'success':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClass}
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClass}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'warning':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClass}
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClass}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClass}
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
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
      {POSITIONS.map((position) => (
        <div
          key={position}
          className={`fixed z-50 flex flex-col gap-3 ${getPositionClasses(position)}`}
        >
          {toasts
            .filter((toast) => toast.position === position)
            .map((toast) => {
              const status = toast.status ?? 'default';
              const s = STATUS_STYLE[status];

              return (
                <div
                  key={toast.id}
                  role="alert"
                  className={[
                    // gradient border wrapper
                    'relative rounded-2xl p-[1px]',
                    'bg-gradient-to-br from-white/60 via-white/20 to-white/60 dark:from-white/10 dark:via-white/5 dark:to-white/10',
                    // depth
                    'shadow-[0_18px_60px_-18px_rgba(0,0,0,0.35)] dark:shadow-[0_22px_70px_-22px_rgba(0,0,0,0.65)]',
                    // motion
                    'animate-in fade-in zoom-in-95 duration-200',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'relative overflow-hidden rounded-2xl',
                      'bg-white/85 dark:bg-zinc-950/72',
                      'backdrop-blur-xl',
                      'ring-1 ring-black/5 dark:ring-white/10',
                      `ring-2 ${s.ring}`, // 상태별 은은한 링
                      'min-w-[320px] max-w-md',
                      'transition-transform will-change-transform',
                      'hover:-translate-y-0.5 hover:shadow-[0_24px_80px_-28px_rgba(0,0,0,0.45)]',
                      'active:translate-y-0',
                    ].join(' ')}
                  >
                    {/* 좌측 accent bar */}
                    <div
                      className={`absolute left-0 top-0 h-full w-1.5 ${s.accent}`}
                    />

                    {/* 상단 progress bar (은은한 라인) */}
                    <div className="absolute left-0 top-0 h-[2px] w-full bg-black/5 dark:bg-white/10">
                      <div
                        className={`h-full ${s.accent} opacity-70`}
                        style={{
                          width: '100%',
                          animation: `toast-shrink ${toast.duration}ms linear forwards`,
                          transformOrigin: 'left',
                        }}
                      />
                    </div>

                    <div className="flex items-start gap-3 p-4 pl-5">
                      {/* 아이콘 */}
                      <div className={`mt-0.5 flex-shrink-0 ${s.icon}`}>
                        {getStatusIcon(status)}
                      </div>

                      {/* 텍스트 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold leading-5 text-zinc-900 dark:text-zinc-50">
                          {toast.title}
                        </h3>
                        {!!toast.message && (
                          <p className="mt-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                            {toast.message}
                          </p>
                        )}
                      </div>

                      {/* 닫기 */}
                      <button
                        type="button"
                        onClick={() => removeToast(toast.id)}
                        aria-label="닫기"
                        className={[
                          'flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-xl',
                          'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200',
                          'hover:bg-black/5 dark:hover:bg-white/10',
                          'transition-colors',
                        ].join(' ')}
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
