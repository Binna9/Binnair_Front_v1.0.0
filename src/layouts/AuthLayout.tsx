import { ReactNode } from 'react';
import LoginBackground from '@/components/LoginBackground';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 flex flex-col items-center justify-center relative space-y-8">
      {/* ✅ 공용 배경 비디오 */}
      <LoginBackground />

      {/* ✅ 배경 블러 및 그래픽 요소 */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[72vw] h-auto opacity-40 blur-3xl bg-black rounded-full"></div>
        <div className="absolute w-[70vw] h-auto bg-gradient-to-b from-black to-black rounded-full shadow-[0px_20px_50px_rgba(0,0,0,1.0)]"></div>
        <img
          src="/img/auth-logo.png"
          alt="Auth Logo"
          className="w-[70vw] opacity-60 brightness-0 drop-shadow-[10px_10px_50px_rgba(0,0,0,1.0)]"
        />
      </div>

      {/* ✅ 로그인 및 회원가입 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center space-y-6 w-full">
        {children}
      </div>
    </div>
  );
}
