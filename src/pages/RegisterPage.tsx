import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useState, useRef, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useRegister } from '@/hooks/user/useRegister';
import AuthLayout from '@/layouts/AuthLayout';
import { useNavigate } from 'react-router-dom';

const inputClassName =
  'bg-white border border-gray-300 p-2.5 pl-4 rounded-lg transition-all duration-200 hover:border-green-700 hover:ring-2 hover:ring-green-800/30 hover:shadow-[0_0_0_3px_rgba(21,128,61,0.2)] focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-green-700 focus:shadow-[0_0_0_3px_rgba(21,128,61,0.3)]';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const fadeThreshold = 120;
    const opacity = Math.max(0, 1 - scrollTop / fadeThreshold);
    setLogoOpacity(opacity);
  }, []);

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
    emailSubscription,
    setEmailSubscription,
    agreeAll,
    agreeServiceTerms,
    agreePrivacyPolicy,
    handleAgreeAllChange,
    handleServiceTermsChange,
    handlePrivacyPolicyChange,
    handleImageUpload,
    handleRegister,
  } = useRegister();

  return (
    <AuthLayout>
      <div className="w-full flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* 왼쪽: 로고(뒤) + 회원가입 폼(앞) - 넓게 */}
        <div className="flex-1 md:flex-[1.05] relative order-2 md:order-1 min-h-0 flex flex-col overflow-hidden py-4">
          {/* 로고 영역 (폼 뒤에 배치, 스크롤 시 페이드아웃) */}
          <div
            className="absolute -top-12 -left-20 md:-top-12 md:-left-16 z-0 pointer-events-none transition-opacity duration-200"
            style={{ opacity: logoOpacity }}
          >
            <img
              src="/img/binnair_logo_black.png"
              alt="BinnAIR"
              className="h-36 md:h-44 w-auto"
            />
          </div>

          {/* 회원가입 폼 영역 (앞에 배치, 스크롤 가능) */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 md:px-8 pt-6 md:pt-12 pb-10 md:pb-12 custom-scroll"
          >
            <div className="w-full max-w-[380px] mx-auto">
              <form onSubmit={handleRegister} className="space-y-5">
                {/* 프로필 이미지 업로드 */}
                <div className="flex flex-col items-center mt-6">
                  <label htmlFor="profileUpload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full shadow-inner border-2 border-gray-300 flex items-center justify-center bg-gradient-to-t from-gray-300 to-gray-100 hover:from-gray-400 hover:to-gray-200 transition-all">
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-gray-500 font-semibold text-xs">
                          Image
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
                  <p className="text-xs text-gray-500 mt-2">프로필 이미지</p>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2 pb-4 -mt-2">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-gray-400 text-sm whitespace-nowrap">
                    회원가입에 필요한 기본정보를 입력해주세요
                  </span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <Input
                  type="text"
                  placeholder="Enter email or Id"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className={inputClassName}
                />

                <Input
                  type="text"
                  placeholder="User name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className={inputClassName}
                />

                <Input
                  type="text"
                  placeholder="Nickname"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  required
                  className={inputClassName}
                />

                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClassName}
                />

                <Input
                  type="tel"
                  placeholder="010-xxxx-xxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className={inputClassName}
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClassName} pr-10`}
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

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`${inputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                    aria-label={
                      showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 이메일 수신동의 */}
                <div className="space-y-1 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        이메일 수신동의
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        BinnAIR에서 주최하는 다양한 이벤트, 정보성 뉴스레터 및
                        광고 수신여부를 설정할 수 있습니다.
                      </p>
                    </div>
                    <Switch
                      checked={emailSubscription}
                      onCheckedChange={setEmailSubscription}
                      className="data-[state=checked]:bg-green-600 shrink-0"
                    />
                  </div>
                </div>

                {/* 약관동의 */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">약관동의</p>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agreeAll"
                      checked={agreeAll}
                      onCheckedChange={handleAgreeAllChange}
                      className="mt-0.5"
                    />
                    <div>
                      <label
                        htmlFor="agreeAll"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        전체동의
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        전체동의를 선택하시면 아래의 모든 약관에 동의하게
                        됩니다.
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="agreeServiceTerms"
                      checked={agreeServiceTerms}
                      onCheckedChange={handleServiceTermsChange}
                    />
                    <label
                      htmlFor="agreeServiceTerms"
                      className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      통합 서비스 이용약관
                    </label>
                    <button
                      type="button"
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      보기
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="agreePrivacyPolicy"
                      checked={agreePrivacyPolicy}
                      onCheckedChange={handlePrivacyPolicyChange}
                    />
                    <label
                      htmlFor="agreePrivacyPolicy"
                      className="text-sm text-gray-700 cursor-pointer flex-1"
                    >
                      개인정보 처리방침
                    </label>
                    <button
                      type="button"
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      보기
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg"
                >
                  회원가입
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
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
