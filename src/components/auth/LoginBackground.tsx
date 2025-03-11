import { useEffect, useRef, useState } from 'react';
import { get, set } from 'idb-keyval'; // ✅ IndexedDB 라이브러리 사용

export default function LoginBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null); // ✅ 기존 Blob URL 저장 (재사용 목적)

  useEffect(() => {
    const loadVideo = async () => {
      try {
        // ✅ IndexedDB에서 Blob 가져오기
        let cachedBlob = await get('loginBackgroundBlob');

        if (cachedBlob && cachedBlob instanceof Blob) {
          console.log('✅ IndexedDB에서 Blob 로드됨');
        } else {
          console.log('🔄 비디오 다운로드 중...');
          const response = await fetch('/vid/LoginBackGround.mp4'); // ✅ 네트워크에서 비디오 가져오기
          cachedBlob = await response.blob(); // ✅ Blob 변환

          await set('loginBackgroundBlob', cachedBlob); // ✅ IndexedDB에 Blob 저장
          console.log('✅ IndexedDB에 비디오 저장 완료');
        }

        // ✅ 기존 Blob URL 해제 후 새로운 URL 설정 (중복 요청 방지)
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        const blobUrl = URL.createObjectURL(cachedBlob); // ✅ Blob URL 생성
        blobUrlRef.current = blobUrl;
        setVideoSrc(blobUrl);
      } catch (error) {
        console.error('❌ 비디오 로드 실패:', error);
      }
    };

    loadVideo();

    return () => {
      if (blobUrlRef.current) {
        console.log('🗑️ 기존 Blob URL 해제:', blobUrlRef.current);
        URL.revokeObjectURL(blobUrlRef.current); // ✅ 기존 Blob URL 해제
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="auto" // ✅ 캐싱된 동영상을 빠르게 불러오기
      className="absolute top-0 left-0 w-full h-full object-cover grayscale"
    >
      {videoSrc && <source src={videoSrc} type="video/mp4" />}
    </video>
  );
}
