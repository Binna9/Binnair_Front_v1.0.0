// src/contexts/NotificationContext.tsx
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

// 알림 인터페이스 정의
interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// 컨텍스트 인터페이스 정의
interface NotificationContextType {
  showConfirm: (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => void;
  showAlert: (title: string, message: string, onConfirm?: () => void) => void;
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

  const showConfirm = (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setNotification({
      type: 'confirm',
      title,
      message,
      onConfirm,
      onCancel,
    });
    setIsOpen(true);
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

  const hideNotification = () => {
    setIsOpen(false);
    setTimeout(() => setNotification(null), 300);
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

  return (
    <NotificationContext.Provider
      value={{ showConfirm, showAlert, hideNotification }}
    >
      {children}

      <Dialog open={!!isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{notification?.title}</DialogTitle>
            <DialogDescription>{notification?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            {notification?.type === 'confirm' && (
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
            )}
            <Button onClick={handleConfirm}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NotificationContext.Provider>
  );
};

// 커스텀 훅 생성
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      showConfirm: () =>
        console.error(
          '❌ showConfirm() is called outside NotificationProvider'
        ),
      showAlert: () =>
        console.error('❌ showAlert() is called outside NotificationProvider'),
      hideNotification: () =>
        console.error(
          '❌ hideNotification() is called outside NotificationProvider'
        ),
    };
  }
  return context;
};
