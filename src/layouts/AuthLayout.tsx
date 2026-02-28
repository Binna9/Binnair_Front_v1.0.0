import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 flex flex-col items-center justify-center relative space-y-8">
      {/* 배경 이미지 - bg-fixed 제외 (motion.div transform 시 fixed가 blur 유발) */}
      <div
        className="absolute inset-0 bg-cover bg-center before:absolute before:inset-0 before:content-[''] before:bg-black/15 z-0"
        style={{
          backgroundImage: "url('/img/MainBackGround.jpg')",
          backgroundPosition: '100% center',
        }}
      />

      {/* ✅ 흰색 레이아웃 카드 (로그인/회원가입 공통) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-6 overflow-hidden">
        <div className="w-full max-w-[1200px] min-h-[520px] h-[calc(100vh-6rem)] max-h-[calc(100vh-3rem)] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
