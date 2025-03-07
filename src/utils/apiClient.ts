import axios from 'axios';
import { store } from '@/store/store';
import { setCredentials, logout } from '@/store/authSlice';

const apiClient = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ 모든 요청에 쿠키 포함
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

// ✅ 응답 인터셉터: accessToken 만료 시 즉시 refreshToken 요청
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ✅ accessToken 만료 (401 에러) 시 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 accessToken 만료됨. refreshToken 요청 중...');
        const response = await axios.post('/auth/refresh', {
          withCredentials: true,
        });

        const newAccessToken = response.data.accessToken;
        const user = response.data.user;

        // ✅ Redux 상태 업데이트 (새로운 accessToken 저장)
        store.dispatch(setCredentials({ accessToken: newAccessToken, user }));

        // ✅ 기존 요청 재시도 (새로운 accessToken 사용)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('🔴 refreshToken 만료. 로그아웃 처리...');
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
