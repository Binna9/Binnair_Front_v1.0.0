import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sun, Moon, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfilePopup from '@/components/UserProfilePopup';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useProfile } from '@/hooks/useProfile';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, handleLogout } = useAuth();

  const {
    user: profileUser,
    updateUser,
    updateAddress,
  } = useProfile(user?.userId || '');

  const { profileImage, uploadProfileImage } = useProfileImage(
    user?.userId || null
  );

  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleMenuClick = (menuName: string) => {
    setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
  };

  return (
    <>
      {/* ✅ 프로필 팝업 */}
      {isProfileOpen && profileUser && (
        <UserProfilePopup
          isOpen={isProfileOpen}
          user={profileUser}
          closePopup={() => setIsProfileOpen(false)}
          updateUser={updateUser}
          uploadProfileImage={uploadProfileImage}
          updateAddress={updateAddress}
          logout={handleLogout}
        />
      )}

      <nav className="fixed top-0 left-0 w-full h-16 bg-gray-800/80 backdrop-blur-md shadow-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center space-x-4">
          <span
            className="text-3xl font-bold text-white cursor-pointer transition-transform duration-200 hover:scale-105 hover:text-gray-300"
            onClick={() => navigate('/')}
          >
            BinnAIR
          </span>

          {/*Search */}
          <div className="absolute left-[400px] w-96 transition-transform duration-200 hover:scale-105">
            <Search className="absolute left-3 top-1.5 text-white w-6 h-6" />
            <Input
              type="text"
              placeholder="Search ..."
              className="pl-12 pr-4 py-2 bg-white/20 text-white/90 placeholder-white/70 rounded-full shadow-lg 
               hover:shadow-lg transition-shadow 
               focus:outline-none focus:ring-0 border-none"
            />
          </div>
        </div>

        <div className="flex space-x-6 ml-[725px]">
          <HamburgerMenu
            menuName="이벤트"
            items={[{ name: '이벤트', id: 'event' }]}
            isOpen={openMenu === '이벤트'}
            onClick={() => handleMenuClick('이벤트')}
            onItemClick={(item) => navigate(`/event?section=${item.id}`)}
          />
          <HamburgerMenu
            menuName="제품"
            items={[{ name: '신제품', id: 'new' }]}
            isOpen={openMenu === '제품'}
            onClick={() => handleMenuClick('제품')}
            onItemClick={(item) => navigate(`/product?section=${item.id}`)}
          />
          <HamburgerMenu
            menuName="장바구니"
            items={[{ name: '장바구니', id: 'cart' }]}
            isOpen={openMenu === '장바구니'}
            onClick={() => handleMenuClick('장바구니')}
            onItemClick={(item) => navigate(`/cart?section=${item.id}`)}
          />
          <HamburgerMenu
            menuName="고객센터"
            onClick={() => navigate('/customer')} // ✅ 클릭하면 /customer 이동
          />
        </div>

        {/* ✅ 로그인 여부에 따른 UI 변경 */}
        <div className="flex space-x-4 ml-8 items-center">
          {user ? (
            <div className="flex items-center space-x-3">
              {/* ✅ 프로필 이미지 클릭 시 팝업 열기 */}
              <img
                src={profileImage || '/default-profile.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white/70 shadow-md cursor-pointer"
                onClick={() => setIsProfileOpen(true)}
              />

              {/* ✅ 사용자명 클릭 시 팝업 열기 */}
              <span
                className="text-xl font-bold text-white underline decoration-white underline-offset-4 cursor-pointer"
                onClick={() => setIsProfileOpen(true)}
              >
                {profileUser?.userName || '사용자'}
              </span>
              <span className="text-sm text-white">님 안녕하세요!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {/* ✅ 로그인 버튼 */}
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
              >
                <LogIn className="text-white w-8 h-8 cursor-pointer" />
                <span className="text-sm text-gray-300">Log In</span>
              </Button>

              {/* ✅ 회원가입 버튼 */}
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

        {/* ✅ 우측 설정 버튼들 */}
        <div className="flex items-center space-x-4 ml-6">
          {/* ✅ 프로필 버튼 */}
          <Button
            variant="ghost"
            className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
            onClick={() => setIsProfileOpen(true)}
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

          {/* ✅ 로그아웃 버튼 */}
          {user && (
            <Button
              variant="ghost"
              className="p-4 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5"
              onClick={handleLogout}
            >
              <LogOut className="text-white w-10 h-10 cursor-pointer" />
              <span className="text-sm text-gray-300">Log Out</span>
            </Button>
          )}
        </div>
      </nav>
    </>
  );
}
