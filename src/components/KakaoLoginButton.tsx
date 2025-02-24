const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function KakaoLoginButton() {
  const handleKakaoLogin = () => {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${encodeURIComponent(
      KAKAO_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      KAKAO_REDIRECT_URI
    )}&response_type=code`;
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="w-80 flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-300 rounded-lg shadow-md py-4 border-none"
    >
      <img src="/img/kakao-logo.png" alt="Kakao" className="h-5 w-5" />
      <span className="font-medium text-black">카카오 계정으로 로그인</span>
    </button>
  );
}
