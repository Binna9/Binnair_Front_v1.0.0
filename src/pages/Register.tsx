import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegister } from '@/hooks/useRegister';
import AuthLayout from '@/layouts/AuthLayout';

export default function Register() {
  const {
    loginId,
    setLoginId,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    nickName,
    setNickName,
    userName,
    setUserName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    profilePreview,
    profileImage,
    handleImageUpload,
    agreeTerms,
    setAgreeTerms,
    handleRegister,
  } = useRegister();

  return (
    <AuthLayout>
      <Card className="p-8 w-full max-w-md card-login relative z-50 border-none max-h-[90vh] overflow-hidden">
        <CardContent className="overflow-y-auto max-h-[80vh] custom-scroll">
          <h2 className="flex justify-center text-black text-6xl font-bold mt-5 mb-[-50px] kanit">
            BinnAIR
          </h2>
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* ✅ 프로필 이미지 업로드 */}
            <div className="flex flex-col items-center relative">
              <label htmlFor="profileUpload" className="cursor-pointer">
                <div className="mt-20 w-32 h-32 rounded-full shadow-inner border-4 border-gray-300 flex items-center justify-center bg-gradient-to-t from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 transition-all relative">
                  {profileImage ? (
                    <img
                      src={profilePreview}
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
                onChange={handleImageUpload} // ✅ 여기서 handleImageUpload 호출
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
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
                className="bg-white border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* ✅ 약관 동의 */}
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

            {/* ✅ 회원가입 버튼 */}
            <Button type="submit" className="w-full py-3">
              회원가입
            </Button>
          </form>

          {/* ✅ 로그인 페이지로 이동 버튼 */}
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              onClick={() => (window.location.href = '/login')}
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
