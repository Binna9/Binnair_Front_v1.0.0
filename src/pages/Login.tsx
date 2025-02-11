import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { FaApple, FaGithub } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout'; // ✅ 공용 레이아웃 추가

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staySignedIn, setStaySignedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', email, password, staySignedIn);
  };

  return (
    <AuthLayout>
      <Card className="p-8 w-full max-w-md card-login relative z-50 border-none">
        <h2 className="flex justify-center">
          <img
            src="/img/auth-logo.png"
            className="w-52 h-52 mx-auto mt-[-60px] mb-[-60px] filter brightness-0 grayscale pointer-events-none"
          />
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 font-sans font-extrabold">
              로그인 ID
            </label>
            <Input
              type="text"
              placeholder="ID or Phone Number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/90 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 font-sans font-extrabold">
              비밀번호
            </label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/90 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* ✅ Stay Signed In 체크박스 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="staySignedIn"
              checked={staySignedIn}
              onCheckedChange={setStaySignedIn}
            />
            <label htmlFor="staySignedIn" className="text-sm text-gray-700">
              Stay Signed In
            </label>
          </div>
          <Button type="submit" className="w-full py-3 font-sans">
            로그인
          </Button>
        </form>

        {/* 추가된 버튼 영역 */}
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            onClick={() => navigate('/register')}
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1"
          >
            신규 가입
          </Button>
          <Button
            onClick={() => navigate('/forgot-password')}
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1"
          >
            비밀번호 찾기
          </Button>
        </div>
      </Card>

      {/* ✅ SSO 로그인 카드 */}
      <Card className="p-8 w-full max-w-md card-login relative z-10 border-none">
        <div className="flex flex-col items-center space-y-3">
          <Button className="w-80 flex items-center justify-center space-x-3 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-md py-4 border-none">
            <img src="/img/google-logo.png" alt="Google" className="h-5 w-5" />
            <span className="font-medium">구글 계정으로 로그인</span>
          </Button>

          <Button className="w-80 flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-md py-4 border-none">
            <img src="/img/kakao-logo.png" alt="Kakao" className="h-5 w-5" />
            <span className="font-medium text-black">
              카카오톡 계정으로 로그인
            </span>
          </Button>

          <Button className="w-80 flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-400 rounded-lg shadow-md py-4 border-none">
            <SiNaver className="text-white" />
            <span className="font-medium text-white">
              네이버 계정으로 로그인
            </span>
          </Button>

          <Button className="w-80 flex items-center justify-center space-x-3 bg-black hover:bg-gray-900 rounded-lg shadow-md py-3 border-none">
            <FaApple className="text-white" />
            <span className="font-medium text-white">
              Apple 계정으로 로그인
            </span>
          </Button>

          <Button className="w-80 flex items-center justify-center space-x-3 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md py-3 border-none">
            <FaGithub className="text-white" />
            <span className="font-medium text-white">
              Github 계정으로 로그인
            </span>
          </Button>
        </div>
      </Card>
    </AuthLayout>
  );
}
