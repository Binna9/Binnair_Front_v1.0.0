import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';

import AuthLayout from '@/layouts/AuthLayout';

export default function Register() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickName, setNickName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  // 🔹 회원가입 처리
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    console.log({
      loginId,
      password,
      nickName,
      userName,
      email,
      phoneNumber,
      profileImage,
      agreeTerms,
    });

    // 🔹 회원가입 API 연동 가능
  };

  // 🔹 프로필 이미지 업로드
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProfileImage(event.target.files[0]);
    }
  };

  return (
    <AuthLayout>
      <Card className="p-8 w-full max-w-md card-login relative z-50 border-none max-h-[90vh]">
        <CardContent className="overflow-y-auto max-h-[80vh] custom-scroll">
          <h2 className="flex justify-center">
            <img
              src="/img/auth-logo.png"
              className="w-52 h-52 mx-auto mt-[-60px] mb-[-50px] filter brightness-0 grayscale pointer-events-none"
            />
          </h2>
          <form className="space-y-4">
            {/* ✅ 프로필 이미지 업로드 */}
            <div className="flex flex-col items-center relative">
              <label htmlFor="profileUpload" className="cursor-pointer">
                <div className="w-32 h-32 rounded-full shadow-inner border-4 border-gray-300 flex items-center justify-center bg-gradient-to-t from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 transition-all relative">
                  {profileImage ? (
                    <img
                      src={URL.createObjectURL(profileImage)}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 font-semibold">
                      No Image
                    </span>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {/* ✅ 로그인 ID */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                로그인 ID
              </label>
              <Input
                type="text"
                placeholder="아이디 입력"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 사용자 이름 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                사용자 이름
              </label>
              <Input
                type="text"
                placeholder="이름 입력"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 닉네임 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                닉네임
              </label>
              <Input
                type="text"
                placeholder="닉네임 입력"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 이메일 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                이메일
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

            {/* ✅ 핸드폰 번호 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                핸드폰 번호
              </label>
              <Input
                type="tel"
                placeholder="010-xxxx-xxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 비밀번호 입력 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                비밀번호
              </label>
              <Input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 비밀번호 확인 */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                비밀번호 확인
              </label>
              <Input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 약관 동의 체크박스 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
              />
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                서비스 이용 약관에 동의합니다.
              </label>
            </div>

            <Button type="submit" className="w-full py-3">
              회원가입
            </Button>
          </form>

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
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
