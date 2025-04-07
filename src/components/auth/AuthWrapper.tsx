import { ReactNode, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '@/store/authSlice';
import axios from 'axios';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const dispatch = useDispatch();
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const res = await axios.post(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          }
        );

        dispatch(
          setCredentials({
            accessToken: res.data.accessToken,
            user: res.data.user,
          })
        );
      } catch (error) {
        dispatch(logout());
        console.error('❌ [AuthWrapper] 토큰 갱신 실패:', error);
      } finally {
        setIsAuthLoaded(true);
      }
    };

    refreshAccessToken();
  }, [dispatch]);

  // ✅ 토큰 갱신 완료 전에는 로딩 상태를 보여줌
  if (!isAuthLoaded) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthWrapper;
