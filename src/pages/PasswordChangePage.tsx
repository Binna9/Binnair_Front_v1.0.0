import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/AuthLayout';
import axios from 'axios';

const inputClassName =
  'bg-white border border-gray-300 p-2.5 pl-4 rounded-lg transition-all duration-200 hover:border-green-700 hover:ring-2 hover:ring-green-800/30 hover:shadow-[0_0_0_3px_rgba(21,128,61,0.2)] focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 focus:shadow-[0_0_0_3px_rgba(21,128,61,0.3)]';

export default function PasswordChangePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email,
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
      <div className="w-full flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* 왼쪽: 로고(뒤) + 비밀번호 찾기 폼(앞) - 넓게 */}
        <div className="flex-1 md:flex-[1.05] relative order-2 md:order-1 min-h-0">
          {/* 로고 영역 (폼 뒤에 배치) */}
          <div className="absolute -top-12 -left-20 md:-top-12 md:-left-16 z-0 pointer-events-none">
            <img
              src="/img/binnair_logo_black.png"
              alt="BinnAIR"
              className="h-36 md:h-44 w-auto"
            />
          </div>

          {/* 비밀번호 찾기 폼 영역 (앞에 배치) */}
          <div className="relative z-10 flex-1 flex flex-col justify-center overflow-auto px-6 md:px-8 pt-40 md:pt-52 pb-10 md:pb-12 min-h-0">
            <div className="w-full max-w-[380px] mx-auto">
              {submitted ? (
                <div className="space-y-6">
                  <div className="text-center text-gray-700">
                    <p className="text-sm">
                      비밀번호 재설정 링크를 이메일로 보냈습니다.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      이메일을 확인해주세요.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg"
                  >
                    로그인 화면으로 이동
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClassName}
                  />

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg"
                    disabled={loading}
                  >
                    {loading ? '요청 중...' : '비밀번호 재설정 요청'}
                  </Button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-gray-600">
                Remember your password?{' '}
              </p>
              <div className="flex justify-center mt-3">
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  variant="outline"
                  size="sm"
                  className="text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-green-600 hover:text-green-700"
                >
                  로그인 페이지로 돌아가기
                </Button>
              </div>
              <p className="mt-auto pt-8 pb-2 text-center text-xs text-gray-400">
                © 2025 ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>

        {/* 오른쪽: login_image.jpg 이미지 + 텍스트 오버레이 - 좁게 */}
        <div className="flex-1 md:flex-[0.95] min-h-[200px] md:min-h-0 order-1 md:order-2 flex items-center justify-center p-6 md:p-8 overflow-hidden">
          <div className="relative w-full h-full min-h-[180px] rounded-3xl overflow-hidden shadow-[8px_0_30px_-8px_rgba(0,0,0,0.35),0_20px_40px_-10px_rgba(0,0,0,0.4),0_0_0_1px_rgba(0,0,0,0.06)]">
            <img
              src="/img/login_image.jpg"
              alt="Welcome"
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-3xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                BinnAIR
              </h2>
              <p className="mt-2 text-sm md:text-base text-white/95 font-medium">
                We make comfortable investing for you
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
