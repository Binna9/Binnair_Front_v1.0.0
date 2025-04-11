import axios from 'axios';
import { store } from '@/store/store';
import { setCredentials, logout } from '@/store/slices/authSlice';
import { useNotification } from '@/context/NotificationContext';
import { useEffect } from 'react';

// 기존 apiClient 유지
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

export const setupNotificationInterceptor = (showToast) => {
  // 응답 인터셉터에 에러 표시 기능 추가
  const responseInterceptor = apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // ✅ accessToken 만료 (401 에러) 시 처리
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
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
          store.dispatch(logout());

          // 토스트 메시지 표시
          showToast(
            'LOGIN',
            '세션이 만료되었습니다. 다시 로그인해주세요.',
            'warning',
            5000,
            'top-center'
          );

          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      if (originalRequest.url && originalRequest.url.includes('/users/fetch')) {
        return Promise.reject(error);
      }

      if (error.response) {
        // 서버에서 응답이 왔지만 에러 상태 코드인 경우
        const status = error.response.status;
        let errorTitle = 'ERROR';
        let errorMessage = '서버와 통신 중 문제가 발생했습니다.';
        let errorType = 'error';

        // 상태 코드별 처리
        switch (status) {
          case 400:
            errorTitle = 'ERROR';
            errorMessage = '요청이 잘못되었습니다. 입력 값을 확인해주세요.';
            break;
          case 401:
            break;
          case 403:
            errorTitle = 'ERROR';
            errorMessage = '접근 권한이 없습니다.';
            break;
          case 404:
            errorTitle = 'ERROR';
            errorMessage = '요청한 리소스를 찾을 수 없습니다.';
            errorType = 'warning';
            break;
          case 500:
          case 502:
          case 503:
            errorTitle = 'ERROR';
            errorMessage = '서버에서 처리 중 오류가 발생했습니다.';
            break;
          default:
            break;
        }

        // 서버에서 보낸 에러 메시지가 있다면 사용
        if (error.response.data && typeof error.response.data === 'object') {
          // 다양한 API 응답 형식 처리
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.msg) {
            errorMessage = error.response.data.msg;
          }
        }

        // 401이 아닌 경우에만 토스트 표시 (401은 위에서 처리)
        if (status !== 401) {
          showToast(errorTitle, errorMessage, errorType, 5000, 'top-center');
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        showToast(
          'ERROR',
          '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
          'warning',
          5000,
          'top-center'
        );
      } else {
        // 요청 설정 중에 오류가 발생한 경우
        showToast(
          'ERROR',
          '요청을 보내는 중 오류가 발생했습니다.',
          'error',
          5000,
          'top-center'
        );
      }

      return Promise.reject(error);
    }
  );

  // 인터셉터 해제 함수 반환 (필요한 경우)
  return () => {
    apiClient.interceptors.response.eject(responseInterceptor);
  };
};

// API 호출을 위한 커스텀 훅
export const useApiWithNotification = () => {
  const { showToast } = useNotification();

  // 컴포넌트가 마운트될 때 인터셉터 설정
  useEffect(() => {
    const cleanupInterceptor = setupNotificationInterceptor(showToast);
    return () => {
      // 컴포넌트 언마운트 시 인터셉터 정리
      cleanupInterceptor();
    };
  }, [showToast]);

  return apiClient;
};

export default apiClient;
