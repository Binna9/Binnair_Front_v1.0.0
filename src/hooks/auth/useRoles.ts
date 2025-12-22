import { useSelector } from 'react-redux';
import { selectAuth } from '@/store/slices/authSlice';
import { useMemo } from 'react';

/**
 * 사용자의 roles를 관리하고 권한 체크를 제공하는 Hook
 */
export function useRoles() {
  const { roles, accessToken } = useSelector(selectAuth);
  
  // roles가 undefined이거나 배열이 아닐 때 빈 배열로 기본값 설정
  const safeRoles = Array.isArray(roles) ? roles : [];

  /**
   * 특정 role이 있는지 확인
   */
  const hasRole = (role: string): boolean => {
    return safeRoles.includes(role);
  };

  /**
   * 여러 roles 중 하나라도 있는지 확인
   */
  const hasAnyRole = (requiredRoles: string[]): boolean => {
    if (requiredRoles.length === 0) return true;
    return requiredRoles.some((role) => safeRoles.includes(role));
  };

  /**
   * 모든 roles가 있는지 확인
   */
  const hasAllRoles = (requiredRoles: string[]): boolean => {
    if (requiredRoles.length === 0) return true;
    return requiredRoles.every((role) => safeRoles.includes(role));
  };

  /**
   * 관리자 권한 여부 확인 (ROLE_ADMIN 또는 ADMIN 역할)
   */
  const isAdmin = useMemo(() => {
    return hasAnyRole(['ROLE_ADMIN']);
  }, [safeRoles]);

  /**
   * 일반 사용자 권한 여부 확인
   */
  const isUser = useMemo(() => {
    return hasAnyRole(['ROLE_USER']) || safeRoles.length === 0;
  }, [safeRoles]);

  /**
   * 로그인 여부 확인
   */
  const isAuthenticated = useMemo(() => {
    return !!accessToken && safeRoles.length >= 0;
  }, [accessToken, safeRoles]);

  return {
    roles: safeRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isUser,
    isAuthenticated,
  };
}

