import axios from 'axios';

// ✅ Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: '/', // 🔹 API 기본 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 요청 인터셉터 추가: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ 응답 인터셉터 추가: 인증 만료 시 자동 로그아웃 처리 가능
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('🔴 인증 오류 - 로그아웃 처리 필요');
      localStorage.removeItem('accessToken'); // 토큰 삭제
      window.location.href = '/login'; // 로그인 페이지로 이동
    }
    return Promise.reject(error);
  }
);

export default apiClient;
