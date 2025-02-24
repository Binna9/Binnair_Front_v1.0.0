// GoogleAuthHandler.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleLogin } from '@/services/authService';

export default function GoogleAuthHandler() {
  console.log('[GoogleAuthHandler] 컴포넌트 렌더링됨');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(
      '[GoogleAuthHandler] useEffect 실행됨, location.search:',
      location.search
    );
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (code) {
      googleLogin(code)
        .then((data) => {
          localStorage.setItem('accessToken', data.accessToken);
          // 로그인 성공 후 홈 또는 원하는 페이지로 이동
          navigate('/', { replace: true });
        })
        .catch((error) => {
          console.error('❌ [GoogleAuthHandler] Google 로그인 실패:', error);
        });
    }
  }, [location.search, navigate]);

  return <div>Google 로그인 처리 중...</div>;
}
