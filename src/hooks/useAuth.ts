import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout, setUser, selectAuth } from '@/store/authSlice';
import {
  fetchUser,
  loginUser,
  logoutUser,
  googleLogin,
} from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { accessToken, user } = useSelector(selectAuth); // ✅ Redux에서 accessToken과 user 가져오기

  useEffect(() => {}, [accessToken, user]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!accessToken) return; // ✅ accessToken이 없으면 실행하지 않음

      try {
        const data = await fetchUser();

        dispatch(setUser(data)); // ✅ Redux에 사용자 정보 저장
      } catch {
        dispatch(logout()); // 만료된 경우 로그아웃 처리
      }
    };

    loadUser();
  }, [accessToken, dispatch]);

  const handleLogin = async (loginId: string, loginPassword: string) => {
    try {
      const { accessToken } = await loginUser(loginId, loginPassword);

      dispatch(loginSuccess({ accessToken })); // ✅ Redux에 accessToken 저장

      navigate('/');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      setError('로그인 실패. 다시 시도하세요.');
    }
  };

  const handleGoogleLogin = async (code: string) => {
    try {
      const { accessToken } = await googleLogin(code);

      dispatch(loginSuccess({ accessToken })); // ✅ Redux에 accessToken 저장

      navigate('/');
    } catch (error) {
      console.error('❌ Google 로그인 실패:', error);
      setError('Google 로그인 실패. 다시 시도하세요.');
    }
  };

  const handleLogout = async () => {
    await logoutUser();

    dispatch(logout()); // ✅ Redux에서 accessToken 및 user 초기화

    navigate('/auth/login');
  };

  return {
    user,
    accessToken,
    handleLogin,
    handleGoogleLogin,
    handleLogout,
    error,
  };
}
