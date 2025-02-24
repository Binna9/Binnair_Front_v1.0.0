import { useState, useEffect } from 'react';
import { User as UserType } from '@/types/user';
import { useNavigate } from 'react-router-dom';
import {
  fetchUser,
  loginUser,
  logoutUser,
  googleLogin,
} from '@/services/authService'; // ✅ 서비스에서 API 요청 처리

export function useAuth() {
  const [user, setUser] = useState<UserType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const data = await fetchUser();
        setUser({
          userId: data.userId,
          username: data.username,
          email: data.email,
          profileImageUrl: data.profileImageUrl,
        });
      } catch {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const handleLogin = async (loginId: string, loginPassword: string) => {
    try {
      const { accessToken, refreshToken } = await loginUser(
        loginId,
        loginPassword
      );

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      navigate('/'); // ✅ 로그인 성공 후 이동
    } catch (error) {
      console.log('', error);
    }
  };

  const handleGoogleLogin = async (code: string) => {
    try {
      const { accessToken } = await googleLogin(code);
      localStorage.setItem('accessToken', accessToken);
      navigate('/'); // 로그인 성공 후 홈으로 이동
    } catch (error) {
      console.error('❌ [useAuth] Google 로그인 실패:', error);
      setError('Google 로그인 실패. 다시 시도하세요.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/auth/login');
  };

  return { user, handleLogin, handleGoogleLogin, handleLogout, setUser, error };
}
