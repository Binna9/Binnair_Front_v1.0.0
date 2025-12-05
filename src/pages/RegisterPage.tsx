import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegister } from '@/hooks/user/useRegister';
import AuthLayout from '@/layouts/AuthLayout';

export default function RegisterPage() {
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
    agreeTerms,
    setAgreeTerms,
    handleImageUpload,
    handleRegister,
  } = useRegister();

  return (
    <AuthLayout>
      <Card className="px-5 pt-0 pb-5 w-full max-w-md card-login relative z-50 border-none max-h-[90vh] overflow-visible">
        <CardContent className="overflow-y-auto max-h-[80vh] custom-scroll px-1">
        <div className="flex justify-start -mt-20 -mb-20 mr-6 pointer-events-none">
          <img src="/img/binnair_logo_black.png" alt="BinnAIR" className="h-80 w-auto block leading-none scale-x-150" />
        </div>
          <div className="flex items-center justify-center gap-2 my-2 relative z-10">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h5 className="text-gray-500 text-sm whitespace-nowrap">
              회원가입에 필요한 기본정보를 입력해주세요
            </h5>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>
          <form className="space-y-3 relative z-10" onSubmit={handleRegister}>
            {/* ✅ 프로필 이미지 업로드 */}
            <div className="flex flex-col items-center relative">
              <label htmlFor="profileUpload" className="cursor-pointer">
                <div className="mt-6 w-24 h-24 rounded-full shadow-inner border-2 border-gray-300 flex items-center justify-center bg-gradient-to-t from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 transition-all relative">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 font-semibold text-xs">
                      Upload Image
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                로그인 ID
              </label>
              <Input
                type="text"
                placeholder="아이디 입력"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {/* ✅ 사용자 이름 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                사용자 이름
              </label>
              <Input
                type="text"
                placeholder="이름 입력"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {/* ✅ 닉네임 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                닉네임
              </label>
              <Input
                type="text"
                placeholder="닉네임 입력"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {/* ✅ 이메일 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                이메일
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

            {/* ✅ 핸드폰 번호 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                핸드폰 번호
              </label>
              <Input
                type="tel"
                placeholder="010-xxxx-xxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {/* ✅ 비밀번호 입력 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                비밀번호
              </label>
              <Input
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {/* ✅ 비밀번호 확인 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                비밀번호 확인
              </label>
              <Input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/90 border border-gray-300 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
            </div>

            {/* ✅ 약관 동의 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
              />
              <label htmlFor="agreeTerms" className="text-xs text-gray-700">
                서비스 이용 약관에 동의합니다.
              </label>
            </div>

            {/* ✅ 회원가입 버튼 */}
            <Button type="submit" className="w-full py-2 font-sans text-sm">
              회원가입
            </Button>
          </form>

          {/* ✅ 로그인 페이지로 이동 버튼 */}
          <div className="flex justify-center space-x-3 mt-3">
            <Button
              onClick={() => (window.location.href = '/login')}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-0.5"
            >
              로그인으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
