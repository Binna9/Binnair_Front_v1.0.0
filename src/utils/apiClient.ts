import axios from 'axios';
import { store } from '@/store/store';
import { loginSuccess, logout } from '@/store/authSlice';

const apiClient = axios.create({
  baseURL: '/', // API 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 요청 인터셉터: 모든 요청에 accessToken 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = store.getState().auth;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 응답 인터셉터: accessToken 만료 시 자동으로 refreshToken 요청
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ accessToken 만료 (401 에러) 시 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Refresh Token 요청 (쿠키에서 자동 전송됨)
        const response = await axios.post(
          '/auth/refresh',
          {},
          { withCredentials: true }
        );

        // ✅ 새로운 accessToken 저장
        const newAccessToken = response.data.accessToken;

        store.dispatch(loginSuccess({ accessToken: newAccessToken }));

        // ✅ 기존 요청 재시도 (새 accessToken 사용)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout()); // Refresh Token도 만료된 경우 로그아웃 처리
        window.location.href = '/login'; // 로그인 페이지로 이동
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
