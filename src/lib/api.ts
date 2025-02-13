import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // ✅ 백엔드 API 주소
});

// ✅ 모든 요청에 Authorization 헤더 자동 추가
api.interceptors.request.use(
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log('🔄 Access Token 만료됨, Refresh Token으로 재발급 시도');

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('❌ Refresh Token 없음, 재로그인 필요');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://localhost:8080/auth/refresh', {
          refreshToken,
        });

        if (res.status === 200) {
          const newAccessToken = res.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          console.log('✅ Access Token 재발급 성공');

          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(error.config); // ✅ 실패한 요청 다시 보내기
        }
      } catch (refreshError) {
        console.error('❌ Refresh Token도 만료됨, 재로그인 필요');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
