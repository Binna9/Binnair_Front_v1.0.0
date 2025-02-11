import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 🔹 비밀번호 재설정 요청
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email, // 백엔드 API에 전달할 데이터
      });

      if (response.status === 200) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('비밀번호 찾기 요청 실패:', err);
      setError('해당 이메일이 등록되지 않았거나 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[72vw] h-auto opacity-40 blur-3xl bg-black rounded-full"></div>
        <div className="absolute w-[70vw] h-auto bg-gradient-to-b from-black to-black rounded-full shadow-[0px_20px_50px_rgba(0,0,0,1.0)]"></div>
        <img
          src="/img/auth-logo.png"
          alt="Auth Logo"
          className="w-[70vw] opacity-60 brightness-0 drop-shadow-[10px_10px_50px_rgba(0,0,0,1.0)]"
        />
      </div>
      <Card className="p-8 w-full max-w-md card-login relative z-50 border-none">
        <h2 className="flex justify-center">
          <img
            src="/img/auth-logo.png"
            className="w-52 h-52 mx-auto mt-[-60px] mb-[-50px] filter brightness-0 grayscale pointer-events-none"
          />
        </h2>
        {submitted ? (
          <div className="text-center text-white">
            <p>비밀번호 재설정 링크를 이메일로 보냈습니다.</p>
            <p className="text-sm opacity-75">이메일을 확인해주세요.</p>
            <Button onClick={() => navigate('/login')} className="mt-4 w-full">
              로그인 화면으로 이동
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                이메일 주소
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? '요청 중...' : '비밀번호 재설정 요청'}
            </Button>
          </form>
        )}
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1"
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </Card>
    </AuthLayout>
  );
}
