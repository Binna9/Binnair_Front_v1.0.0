import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '@/store/authSlice';
import axios from 'axios';

const AuthWrapper = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        console.log('🔄 새로고침 후 accessToken 갱신 시도...');
        const res = await axios.post('/auth/refresh', {
          withCredentials: true,
        });

        dispatch(
          setCredentials({
            accessToken: res.data.accessToken,
            user: res.data.user,
          })
        );

        console.log('✅ accessToken 갱신 완료:', res.data.accessToken);
      } catch (error) {
        console.error('🔴 새로고침 후 토큰 갱신 실패:', error);
        dispatch(logout());
      }
    };

    refreshAccessToken();
  }, [dispatch]);

  return null;
};

export default AuthWrapper;
