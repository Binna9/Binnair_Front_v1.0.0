import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  LogIn,
  UserPlus,
  HelpCircle,
  Activity,
  MonitorPlay,
  History,
  BarChart2,
} from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from '../ui/HamburgerMenu';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfilePopup from '../popup/UserProfilePopup';
import { useProfile } from '@/hooks/user/useUserProfile';
import { UserUpdateRequest } from '@/types/UserTypes';
import { useTheme } from '@/hooks/theme/useTheme';
import { useUserImage } from '@/hooks/user/useUserImage';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, handleLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { user: profileUser, updateUser } = useProfile(user?.userId || '');
  const { profileImage } = useUserImage();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
          updateUser={(updatedUser) => {
            const userUpdateRequest: UserUpdateRequest = {
              username: updatedUser.username || profileUser.username,
              email: updatedUser.email,
              nickName: updatedUser.nickName,
              phoneNumber: updatedUser.phoneNumber,
            };
            updateUser(user?.userId || '', userUpdateRequest);
          }}
          uploadProfileImage={() => {}}
          logout={handleLogout}
          setProfileImage={() => {}}
        />
      )}

      <nav className="fixed top-0 left-0 w-full h-16 bg-zinc-800/80 backdrop-blur-md shadow-md flex items-center justify-between px-6 z-50">
        {/* 로고 영역 */}
        <div className="flex items-center w-[150px]">
          <span
            className="text-3xl font-bold text-white cursor-pointer transition-transform duration-200 hover:scale-105 hover:text-gray-300"
            onClick={() => navigate('/')}
          >
            BinnAIR
          </span>
        </div>

        {/* 검색 영역 */}
        <div className="flex items-center w-[400px]">
          <div className="relative w-full transition-transform duration-200 hover:scale-105">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-6 h-6" />
            <Input
              type="text"
              placeholder="Search ..."
              className="pl-12 pr-4 py-2 bg-white/20 text-white/90 placeholder-white/70 rounded-full shadow-lg 
               hover:shadow-lg transition-shadow 
               focus:outline-none focus:ring-0 border-none"
            />
          </div>
        </div>

        {/* 메뉴 영역 */}
        <div className="flex justify-between w-[700px] px-4">
          <HamburgerMenu
            menuName="Trade Arena"
            items={[
              {
                name: '실시간 트레이딩',
                id: 'trade-arena',
                icon: <Activity size={16} />,
              },
            ]}
            isOpen={openMenu === '트레이드아레나'}
            onClick={() => handleMenuClick('트레이드아레나')}
            onItemClick={() => navigate(`/trade-arena`)}
            className="w-[100px]"
          />
          <HamburgerMenu
            menuName="AI Monitor"
            items={[
              {
                name: '모델 학습 / 예측 상태',
                id: 'ai-monitor',
                icon: <MonitorPlay size={16} />,
              },
            ]}
            isOpen={openMenu === 'AI 모니터링'}
            onClick={() => handleMenuClick('AI 모니터링')}
            onItemClick={() => navigate(`/ai-monitor`)}
            className="w-[100px]"
          />
          <HamburgerMenu
            menuName="Trade History"
            items={[
              {
                name: '트레이딩 내역 / 기록',
                id: 'trade-history',
                icon: <History size={16} />,
              },
            ]}
            isOpen={openMenu === '트레이드 히스토리'}
            onClick={() => handleMenuClick('트레이드 히스토리')}
            onItemClick={() => navigate(`/trade-history`)}
            className="w-[100px]"
          />
          <HamburgerMenu
            menuName="Dashboard"
            items={[
              {
                name: '대시보드',
                id: 'dashboard',
                icon: <BarChart2 size={16} />,
              },
            ]}
            isOpen={openMenu === '대시보드'}
            onClick={() => handleMenuClick('대시보드')}
            onItemClick={() => navigate(`/dashboard`)}
            className="w-[100px]"
          />
          <HamburgerMenu
            menuName="Customer Service"
            items={[
              {
                name: '고객센터',
                id: 'service',
                icon: <HelpCircle size={16} />,
              },
            ]}
            isOpen={openMenu === '고객센터'}
            onClick={() => handleMenuClick('고객센터')}
            onItemClick={() => navigate(`/board`)}
            className="w-[100px]"
          />
        </div>

        {/* ✅ 로그인 여부에 따른 UI 변경 */}
        <div className="flex items-center w-[300px] ml-20">
          {user ? (
            <div className="flex items-center space-x-2 w-full">
              {/* ✅ 프로필 이미지 클릭 시 팝업 열기 */}
              <img
                src={profileImage || '/default-profile.png'}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-white/70 shadow-md cursor-pointer transition-all duration-200 hover:scale-110"
                onClick={() => setIsProfileOpen(true)}
              />

              {/* ✅ 사용자명 클릭 시 팝업 열기 */}
              <span
                className="text-lg font-bold text-white underline decoration-white underline-offset-4 cursor-pointer truncate max-w-[120px] whitespace-nowrap 
             transition-all duration-200 hover:scale-105"
                onClick={() => setIsProfileOpen(true)}
              >
                {profileUser?.nickName || 'User'}
              </span>
              <span
                className="text-sm text-white whitespace-nowrap 
             transition-all duration-200 hover:scale-105"
              >
                님 안녕하세요!
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              {/* ✅ 로그인 버튼 */}
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[80px]"
              >
                <LogIn className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Log In</span>
              </Button>

              {/* ✅ 회원가입 버튼 */}
              <Button
                onClick={() => navigate('/register')}
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[80px]"
              >
                <UserPlus className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Sign Up</span>
              </Button>
            </div>
          )}
        </div>

        {/* ✅ 우측 설정 버튼들 */}
        <div className="flex items-center justify-between w-[250px] ml-4">
          {/* ✅ 프로필 버튼 */}
          <Button
            variant="ghost"
            className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[80px]"
            onClick={() => setIsProfileOpen(true)}
          >
            <User className="text-white w-6 h-6 cursor-pointer" />
            <span className="text-sm text-gray-300">My Page</span>
          </Button>

          {/* ✅ 다크모드 버튼 */}
          <Button
            variant="ghost"
            className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[80px]"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <>
                <Moon className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Dark</span>
              </>
            ) : (
              <>
                <Sun className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Light</span>
              </>
            )}
          </Button>

          {/* ✅ 로그아웃 버튼 */}
          {user && (
            <Button
              variant="ghost"
              className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[80px]"
              onClick={handleLogout}
            >
              <LogOut className="text-white w-6 h-6 cursor-pointer" />
              <span className="text-sm text-gray-300">Logout</span>
            </Button>
          )}
        </div>
      </nav>
    </>
  );
}
