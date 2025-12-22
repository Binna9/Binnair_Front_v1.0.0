import { Navigate, useLocation } from 'react-router-dom';
import { useRoles } from '@/hooks/auth/useRoles';
import { useNotification } from '@/context/NotificationContext';
import { useEffect, useMemo, useRef } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * 접근에 필요한 roles (하나라도 있으면 접근 가능)
   * 비어있으면 로그인만 확인
   */
  requiredRoles?: string[];
  /**
   * 모든 roles가 필요한지 여부 (기본값: false - 하나라도 있으면 접근 가능)
   */
  requireAll?: boolean;
  /**
   * 권한 없을 때 리다이렉트할 경로 (기본값: '/login')
   */
  redirectTo?: string;
  /**
   * 권한 없을 때 에러 메시지 표시 여부 (기본값: true)
   */
  showErrorMessage?: boolean;
}

/**
 * 역할 기반 라우트 가드 컴포넌트
 * Access Token의 roles를 확인하여 접근 권한을 제어합니다.
 */
export default function ProtectedRoute({
  children,
  requiredRoles = [],
  requireAll = false,
  redirectTo = '/login',
  showErrorMessage = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasAnyRole, hasAllRoles } = useRoles();
  const location = useLocation();
  const { showAlert } = useNotification();
  const hasShownErrorRef = useRef<string | null>(null); // 경로별로 에러 메시지 표시 여부 추적

  // 권한 체크
  const hasPermission = useMemo(() => {
    // 로그인 체크
    if (!isAuthenticated) {
      return false;
    }

    // roles가 지정되지 않았으면 로그인만 확인
    if (requiredRoles.length === 0) {
      return true;
    }

    // requireAll이 true면 모든 roles 필요, false면 하나라도 있으면 됨
    return requireAll ? hasAllRoles(requiredRoles) : hasAnyRole(requiredRoles);
  }, [isAuthenticated, requiredRoles, requireAll, hasAnyRole, hasAllRoles]);

  // 권한이 없을 때 한 번만 에러 메시지 표시 (경로별로)
  useEffect(() => {
    // /login 페이지 자체에는 에러 메시지 표시하지 않음
    if (location.pathname === '/login') {
      return;
    }

    // 경로가 변경되면 플래그 리셋
    if (hasShownErrorRef.current !== location.pathname) {
      hasShownErrorRef.current = null;
    }

    if (!hasPermission && showErrorMessage && hasShownErrorRef.current !== location.pathname) {
      hasShownErrorRef.current = location.pathname; // 현재 경로로 플래그 설정
      
      // 약간의 지연을 두어 리다이렉트 전에 메시지가 표시되도록 함
      setTimeout(() => {
        if (!isAuthenticated) {
          showAlert('로그인 필요', '이 페이지에 접근하려면 로그인이 필요합니다.');
        } else {
          showAlert(
            '접근 권한 없음',
            '이 페이지에 접근할 권한이 없습니다. 관리자에게 문의해주세요.'
          );
        }
      }, 0);
    }
  }, [hasPermission, isAuthenticated, showErrorMessage, location.pathname, requiredRoles]);

  if (!hasPermission) {
    // 로그인하지 않은 경우에만 /login으로, 로그인했지만 권한이 없는 경우는 /로 리다이렉트
    const redirectPath = !isAuthenticated ? '/login' : '/';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

