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
import { useNotification } from '@/context/NotificationContext';

export function useAuth() {
  const { accessToken, user } = useSelector(selectAuth); // ✅ Redux에서 accessToken과 user 가져오기

  useEffect(() => {}, [accessToken, user]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notification = useNotification();
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

      notification.showToast(
        'SUCCESS',
        '환영합니다! 로그인에 성공하셨습니다.',
        'success',
        2000,
        'top-center'
      );

      navigate('/');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);

      notification.showToast(
        'FAIL',
        '아이디 또는 비밀번호를 확인해주세요.',
        'error',
        2000,
        'top-center'
      );
    }
  };

  const handleGoogleLogin = async (code: string) => {
    try {
      const { accessToken } = await googleLogin(code);

      dispatch(loginSuccess({ accessToken })); // ✅ Redux에 accessToken 저장

      navigate('/');
    } catch (error) {
      console.error('❌ Google 로그인 실패:', error);
      notification.showToast(
        'FAIL',
        'Google 로그인 실패. 다시 시도하세요.',
        'error',
        2000,
        'top-center'
      );
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
