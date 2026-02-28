import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FaApple, FaGithub } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import { useAuth } from '@/hooks/auth/useAuth';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { handleLogin } = useAuth();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(loginId, loginPassword);
  };

  return (
    <AuthLayout>
      {/* 왼쪽 로그인 폼 / 오른쪽 이미지 */}
      <div className="w-full flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* 왼쪽: 로고(뒤) + 로그인 폼(앞) - 넓게 */}
        <div className="flex-1 md:flex-[1.05] relative order-2 md:order-1 min-h-0">
          {/* 로고 영역 (폼 뒤에 배치) */}
          <div className="absolute -top-12 -left-20 md:-top-12 md:-left-16 z-0 pointer-events-none">
            <img
              src="/img/binnair_logo_black.png"
              alt="BinnAIR"
              className="h-36 md:h-44 w-auto"
            />
          </div>

          {/* 로그인 폼 영역 (앞에 배치) */}
          <div className="relative z-10 flex-1 flex flex-col justify-center overflow-auto px-6 md:px-8 pt-10 md:pt-20 pb-10 md:pb-12 min-h-0">
          <div className="w-full max-w-[380px] mx-auto">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-5 py-2 overflow-visible bg-gradient-to-r from-gray-700 via-green-600 to-green-500 bg-clip-text text-transparent leading-tight">
            Log In
          </h2>

          <form onSubmit={onSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Enter email or Id"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              className="bg-white border border-gray-300 p-2.5 pl-4 rounded-lg transition-all duration-200 hover:border-green-700 hover:ring-2 hover:ring-green-800/30 hover:shadow-[0_0_0_3px_rgba(21,128,61,0.2)] focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 focus:shadow-[0_0_0_3px_rgba(21,128,61,0.3)]"
            />
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="bg-white border border-gray-300 p-2.5 pl-4 pr-10 rounded-lg transition-all duration-200 hover:border-green-700 hover:ring-2 hover:ring-green-800/30 hover:shadow-[0_0_0_3px_rgba(21,128,61,0.2)] focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 focus:shadow-[0_0_0_3px_rgba(21,128,61,0.3)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="staySignedIn"
                  checked={staySignedIn}
                  onCheckedChange={setStaySignedIn}
                />
                <label htmlFor="staySignedIn" className="text-sm text-gray-600">
                  Stay Signed In
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg">
              Sign in
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <GoogleLoginButton />
           
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                type="button"
                className="flex items-center justify-center space-x-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg py-2 border-none text-sm"
              >
                <img src="/img/kakao-logo.png" alt="Kakao" className="h-4 w-4" />
                <span className="font-medium text-black text-xs">카카오</span>
              </Button>
              <Button
                type="button"
                className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-400 rounded-lg py-2 border-none text-sm"
              >
                <SiNaver className="text-white text-sm" />
                <span className="font-medium text-white text-xs">네이버</span>
              </Button>
              <Button
                type="button"
                className="flex items-center justify-center space-x-2 bg-black hover:bg-gray-900 rounded-lg py-2 border-none text-sm"
              >
                <FaApple className="text-white text-sm" />
                <span className="font-medium text-white text-xs">Apple</span>
              </Button>
              <Button
                type="button"
                className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-lg py-2 border-none text-sm"
              >
                <FaGithub className="text-white text-sm" />
                <span className="font-medium text-white text-xs">Github</span>
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't you have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Sign up
            </button>
          </p>
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
