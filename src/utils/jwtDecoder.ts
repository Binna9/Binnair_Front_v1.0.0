/**
 * JWT 토큰 디코딩 유틸리티
 * Access Token에서 payload를 파싱하여 roles 등을 추출
 */

export interface JWTPayload {
  sub?: string;
  userId?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Base64URL 디코딩 (JWT 표준에 따라)
 * JWT는 Base64가 아닌 Base64URL을 사용합니다.
 */
function base64UrlDecode(str: string): string {
  // Base64URL을 일반 Base64로 변환
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 패딩 추가
  while (base64.length % 4) {
    base64 += '=';
  }
  
  try {
    // 브라우저 환경에서는 atob 사용
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (error) {
    console.error('Base64URL 디코딩 실패:', error);
    throw new Error('토큰 디코딩 실패');
  }
}

/**
 * JWT 토큰 디코딩 (자체 구현)
 * JWT는 header.payload.signature 형식입니다.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token) {
      return null;
    }

    // JWT는 .으로 구분된 3부분
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('잘못된 JWT 형식');
      return null;
    }

    // payload (두 번째 부분) 디코딩
    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    
    // JSON 파싱
    const parsed = JSON.parse(decodedPayload);
    
    return parsed as JWTPayload;
  } catch (error) {
    console.error('JWT 디코딩 중 오류:', error);
    return null;
  }
}

/**
 * Access Token에서 roles 추출
 */
export function extractRolesFromToken(token: string | null): string[] {
  if (!token) {
    return [];
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return [];
  }

  // roles가 배열인 경우
  if (Array.isArray(payload.roles)) {
    return payload.roles;
  }

  // roles가 문자열인 경우 배열로 변환
  if (typeof payload.roles === 'string') {
    return [payload.roles];
  }

  // 권한 정보가 다른 필드명으로 있을 수 있음 (예: authority, authorities)
  if (Array.isArray(payload.authority)) {
    return payload.authority;
  }
  if (Array.isArray(payload.authorities)) {
    return payload.authorities;
  }

  return [];
}

/**
 * 토큰 만료 시간 확인
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp는 Unix timestamp (초 단위)
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

