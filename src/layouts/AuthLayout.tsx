import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 flex flex-col items-center justify-center relative space-y-8">
      {/* ✅ 공용 배경 비디오 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover filter grayscale"
      >
        <source src="/vid/LoginBackGround.mp4" type="video/mp4" />
      </video>

      {/* ✅ 로그인 및 회원가입 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center space-y-6 w-full">
        {children}
      </div>
    </div>
  );
}
