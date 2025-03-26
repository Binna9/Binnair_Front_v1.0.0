import apiClient from '@/utils/apiClient';

/** Login */
export const loginUser = async (loginId: string, loginPassword: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      loginId,
      loginPassword,
    });
    return response.data; // ✅ accessToken, refreshToken 반환
  } catch (error) {
    console.error('❌ [authService] 로그인 실패:', error);
    throw error;
  }
};

/** SSO Login_Google */
export const googleLogin = async (code: string) => {
  try {
    const response = await apiClient.post('/auth/google/login', { code });
    return response.data;
  } catch (error) {
    console.error('❌ [authService] Google 로그인 실패:', error);
    throw error;
  }
};

/** Logout */
export const logoutUser = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('❌ [authService] 로그아웃 요청 실패:', error);
  } finally {
    localStorage.removeItem('accessToken'); // 토큰 삭제
  }
};
