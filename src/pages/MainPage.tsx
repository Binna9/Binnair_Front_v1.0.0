import MainBoard from '@/components/mainboard/MainBoard';
import { useMainboardMock } from '@/components/mainboard/useMainboardMock';
import MainLayout from '@/layouts/MainLayout';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NoticeBoard from '@/components/board/NoticeBoard';

export default function MainPage() {
  const navigate = useNavigate();
  const model = useMainboardMock();

  const goDashboard = useCallback(
    (params?: Record<string, string>) => {
      if (!params || Object.keys(params).length === 0) {
        navigate('/dashboard');
        return;
      }
      const sp = new URLSearchParams(params);
      navigate(`/dashboard?${sp.toString()}`);
    },
    [navigate],
  );

  return (
    <MainLayout>
      <NoticeBoard />
      <div className="-m-6 px-4 sm:px-6 pt-28 pb-10 min-h-[calc(100dvh-6rem)] flex justify-center">
        <div className="relative w-full max-w-[1400px]">
          <div
            className="absolute -top-10 left-8 z-0 rounded-t-lg border border-b-0 border-[#a67c52] px-4 py-2.5 shadow-[0_-2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.3)]"
            style={{
              background: 'linear-gradient(180deg, #d4a574 0%, #c4956a 50%, #b8865f 100%)',
            }}
          >
            <span className="text-sm font-semibold text-amber-950/90">Main Board</span>
          </div>
          <div
            className="relative z-10 w-full rounded-lg bg-white min-h-[calc(100dvh-8rem)]"
            style={{
              boxShadow:
                '0 0 20px 10px rgba(0, 0, 0, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div className="p-4 sm:p-6">
              <MainBoard model={model} goDashboard={goDashboard} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}