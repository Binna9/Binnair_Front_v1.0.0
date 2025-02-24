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
      className="w-80 flex items-center justify-center space-x-3 bg-white text-gray-700 hover:bg-gray-100 rounded-lg shadow-md py-4 border-none"
    >
      <img src="/img/google-logo.png" alt="Google" className="h-5 w-5" />
      <span className="font-medium">구글 계정으로 로그인</span>
    </button>
  );
}
