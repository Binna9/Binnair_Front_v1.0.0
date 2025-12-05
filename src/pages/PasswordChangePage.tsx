import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import axios from 'axios';

export default function PasswordChangePage() {
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
      <Card className="px-5 pt-0 pb-5 w-full max-w-md card-login relative z-50 border-none overflow-visible">
        <div className="flex justify-start -mt-14 -mb-20 mr-6 pointer-events-none">
          <img src="/img/binnair_logo_black.png" alt="BinnAIR" className="h-80 w-auto block leading-none scale-x-150" />
        </div>
        {submitted ? (
          <div className="text-center text-gray-700 relative z-10">
            <p className="text-sm">비밀번호 재설정 링크를 이메일로 보냈습니다.</p>
            <p className="text-xs opacity-75 mt-1">이메일을 확인해주세요.</p>
            <Button onClick={() => navigate('/login')} className="mt-4 w-full py-2 text-sm">
              로그인 화면으로 이동
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                이메일 주소
              </label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <Button type="submit" className="w-full py-2 font-sans text-sm" disabled={loading}>
              {loading ? '요청 중...' : '비밀번호 재설정 요청'}
            </Button>
          </form>
        )}
        <div className="flex justify-center space-x-3 mt-3 relative z-10">
          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            size="sm"
            className="text-xs px-2 py-0.5"
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </Card>
    </AuthLayout>
  );
}
