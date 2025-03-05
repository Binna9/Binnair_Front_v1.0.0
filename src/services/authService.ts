import apiClient from '@/utils/apiClient';

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

export const googleLogin = async (code: string) => {
  try {
    const response = await apiClient.post('/auth/google/login', { code });
    return response.data;
  } catch (error) {
    console.error('❌ [authService] Google 로그인 실패:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('❌ [authService] 로그아웃 요청 실패:', error);
  } finally {
    localStorage.removeItem('accessToken'); // 토큰 삭제
  }
};

export const registerUser = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/registers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('❌ [authService] 회원가입 실패:', error);
    throw error;
  }
};

export const fetchUser = async () => {
  try {
    const response = await apiClient.get('/auth/user');

    return response.data; // 응답 데이터 반환
  } catch (error) {
    console.error('❌ [authService] 사용자 정보 가져오기 실패:', error);
    throw error;
  }
};
