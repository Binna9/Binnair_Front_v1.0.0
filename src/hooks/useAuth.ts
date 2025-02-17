import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ 페이지 이동용

interface User {
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch('/auth/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ username: data.username });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('❌ [useAuth] API 요청 중 오류 발생:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('❌ [useAuth] 로그아웃 실패:', error);
    }

    localStorage.removeItem('accessToken');
    setUser(null);

    navigate('/auth/login'); // 🚀 리다이렉트
  };

  return { user, logout };
}
