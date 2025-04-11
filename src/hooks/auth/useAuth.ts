import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginSuccess,
  logout,
  setUser,
  selectAuth,
} from '@/store/slices/authSlice';
import { loginUser, logoutUser, googleLogin } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '@/context/NotificationContext';
import userService from '@/services/UserService';

export function useAuth() {
  const { accessToken, user } = useSelector(selectAuth); // ✅ Redux에서 accessToken과 user 가져오기
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notification = useNotification();

  const loadUser = useCallback(async () => {
    if (!accessToken) return;

    try {
      const data = await userService.fetchUser();
      dispatch(setUser(data));
      console.log(data);
    } catch {
      dispatch(logout());
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogin = async (loginId: string, loginPassword: string) => {
    try {
      const { accessToken } = await loginUser(loginId, loginPassword);

      dispatch(loginSuccess({ accessToken })); // ✅ Redux에 accessToken 저장

      notification.showToast(
        'SUCCESS',
        '환영합니다! 로그인에 성공하셨습니다.',
        'success',
        5000,
        'top-center'
      );

      navigate('/');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
    }
  };

  const handleGoogleLogin = async (code: string) => {
    try {
      const { accessToken } = await googleLogin(code);

      dispatch(loginSuccess({ accessToken })); // ✅ Redux에 accessToken 저장

      navigate('/');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    const isConfirmed = await notification.showConfirm(
      'LOGOUT',
      '로그아웃하시겠습니까?'
    );
    if (isConfirmed) {
      await logoutUser();
      dispatch(logout()); // ✅ Redux에서 accessToken 및 user 초기화
      navigate('/auth/login');
    }
  };

  return {
    user,
    accessToken,
    handleLogin,
    handleGoogleLogin,
    handleLogout,
  };
}
