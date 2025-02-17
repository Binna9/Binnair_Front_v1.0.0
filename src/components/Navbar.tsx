import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sun, Moon, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { useAuth } from '@/hooks/useAuth'; // ✅ 커스텀 훅 가져오기
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleMenuClick = (menuName: string) => {
    setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800/80 backdrop-blur-md shadow-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-4">
        <span className="text-2xl font-bold text-white">ilpoom</span>

        <div className="absolute left-[450px] w-96">
          <Search className="absolute left-3 top-2.5 text-white w-5 h-5" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-white/20 text-white placeholder-white rounded-full shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      <div className="flex space-x-6 ml-[750px]">
        <HamburgerMenu
          menuName="이벤트"
          items={['할인 이벤트', '기획전', '프로모션']}
          isOpen={openMenu === '이벤트'}
          onClick={() => handleMenuClick('이벤트')}
        />
        <HamburgerMenu
          menuName="제품"
          items={['신제품', '베스트셀러', '카테고리별 보기']}
          isOpen={openMenu === '제품'}
          onClick={() => handleMenuClick('제품')}
        />
        <HamburgerMenu
          menuName="장바구니"
          items={['최근 본 상품', '찜한 상품']}
          isOpen={openMenu === '장바구니'}
          onClick={() => handleMenuClick('장바구니')}
        />
        <HamburgerMenu
          menuName="고객센터"
          items={['FAQ', '문의하기', '1:1 상담']}
          isOpen={openMenu === '고객센터'}
          onClick={() => handleMenuClick('고객센터')}
        />
      </div>

      {/* ✅ 로그인 여부에 따른 UI 변경 */}
      <div className="flex space-x-4 ml-8 items-center">
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-white underline decoration-white underline-offset-4">
              {user.username}
            </span>
            <span className="text-sm text-white">님 안녕하세요!</span>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {/* ✅ 로그인 아이콘 버튼 + 설명 */}
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
            >
              <LogIn className="text-white w-8 h-8 cursor-pointer" />
              <span className="text-sm text-gray-300">Log In</span>
            </Button>

            {/* ✅ 회원가입 아이콘 버튼 + 설명 */}
            <Button
              onClick={() => navigate('/register')}
              variant="ghost"
              className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
            >
              <UserPlus className="text-white w-8 h-8 cursor-pointer" />
              <span className="text-sm text-gray-300">Sign Up</span>
            </Button>
          </div>
        )}
      </div>

      {/* ✅ 우측 사용자 설정, 다크모드, 로그아웃 버튼 */}
      <div className="flex items-center space-x-4 ml-6">
        {/* ✅ 사용자 설정 버튼 */}
        <Button
          variant="ghost"
          className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
        >
          <User className="text-white w-10 h-10 cursor-pointer" />
          <span className="text-sm text-gray-300">Profile</span>
        </Button>

        {/* ✅ 다크모드 버튼 */}
        <Button
          variant="ghost"
          className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <>
              <Moon className="text-white w-10 h-10 cursor-pointer" />
              <span className="text-sm text-gray-300">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="text-white w-10 h-10 cursor-pointer" />
              <span className="text-sm text-gray-300">Light Mode</span>
            </>
          )}
        </Button>

        {/* ✅ 로그아웃 버튼 (아이콘 + 설명 추가) */}
        {user && (
          <Button
            variant="ghost"
            className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
            onClick={logout}
          >
            <LogOut className="text-white w-10 h-10 cursor-pointer" />
            <span className="text-sm text-gray-300">Log Out</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
