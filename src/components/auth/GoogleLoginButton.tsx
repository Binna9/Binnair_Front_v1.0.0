const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${encodeURIComponent(
      GOOGLE_CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=openid email profile`;
    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-80 flex items-center justify-center space-x-2 bg-white text-gray-700 hover:bg-gray-200 rounded-lg shadow-md py-3 border-none text-sm"
    >
      <img src="/img/google-logo.png" alt="Google" className="h-4 w-4" />
      <span className="font-medium text-xs">구글 계정으로 로그인</span>
    </button>
  );
}
