import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  User,
  LogOut,
  LogIn,
  UserPlus,
  HelpCircle,
  Activity,
  MonitorPlay,
  History,
  BarChart2,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from '../ui/HamburgerMenu';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfilePopup from '../popup/UserProfilePopup';
import { useProfile } from '@/hooks/user/useUserProfile';
import { UserUpdateRequest } from '@/types/UserTypes';
import { useUserImage } from '@/hooks/user/useUserImage';
import { useNotification } from '@/context/NotificationContext';
import ExchangeBar from '../ui/ExchangeBar';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, handleLogout } = useAuth();
  const { user: profileUser, updateUser } = useProfile(user?.userId || '');
  const { profileImage } = useUserImage();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { showAlert } = useNotification();

  const handleMenuClick = (menuName: string) => {
    if (
      !user &&
      [
        '트레이드아레나',
        'AI 모니터링',
        '트레이드 히스토리',
        '대시보드',
      ].includes(menuName)
    ) {
      showAlert('로그인 필요', '해당 기능을 이용하려면 로그인이 필요합니다.');
      return;
    }
    setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
  };

  const handleUpdateUser = (updatedUser: UserUpdateRequest) => {
    updateUser(user?.userId || '', updatedUser);
  };

  const closeProfilePopup = () => {
    setIsProfileOpen(false);
  };

  return (
    <>
      {/* ✅ 프로필 팝업 */}
      {isProfileOpen && (
        <UserProfilePopup
          isOpen={isProfileOpen}
          closePopup={closeProfilePopup}
          updateUser={handleUpdateUser}
          logout={handleLogout}
        />
      )}

      <nav className="fixed top-0 left-0 w-full h-16 bg-zinc-900/90 backdrop-blur-md shadow-md flex items-center justify-between px-6 z-50">
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
        <div className="flex justify-between w-[700px] px-4 ml-4">
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
            onItemClick={() => navigate(`/trade`)}
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
                id: 'history',
                icon: <History size={16} />,
              },
            ]}
            isOpen={openMenu === '트레이드 히스토리'}
            onClick={() => handleMenuClick('트레이드 히스토리')}
            onItemClick={() => navigate(`/history`)}
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
            <div
              className="flex items-center space-x-3 w-full bg-white/10 backdrop-blur-md py-1.5 px-2 rounded-lg border border-white/20 
            shadow-[0_4px_16px_0_rgba(255,255,255,0.1)] hover:bg-white/15 transition-all duration-300"
            >
              {/* 프로필 이미지 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <img
                  src={profileImage || '/default-profile.png'}
                  alt="Profile"
                  className="relative w-10 h-10 rounded-full border-2 border-white/80 shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 hover:border-purple-400"
                  onClick={() => setIsProfileOpen(true)}
                />
              </div>

              {/* 사용자 정보 */}
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span
                    className="text-base font-bold text-white cursor-pointer truncate max-w-[100px] whitespace-nowrap 
                    transition-all duration-300 hover:text-purple-300 hover:scale-105"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    {profileUser?.nickName || 'User'}
                  </span>
                  <span className="text-sm text-white/90 whitespace-nowrap">
                    님
                  </span>
                </div>
                <div className="text-xs text-white/70">
                  {profileUser?.email || ''}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 w-full">
              {/* ✅ 로그인 버튼 */}
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[70px]"
              >
                <LogIn className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Log In</span>
              </Button>
              {/* ✅ 회원가입 버튼 */}
              <Button
                onClick={() => navigate('/register')}
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[70px]"
              >
                <UserPlus className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Sign Up</span>
              </Button>
            </div>
          )}
        </div>

        {/* ✅ 우측 설정 버튼들 */}
        <div className="flex items-center gap-4 w-[250px] ml-4">
          {user ? (
            <>
              {/* ✅ 프로필 버튼 */}
              <Button
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[70px]"
                onClick={() => setIsProfileOpen(true)}
              >
                <User className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">My Page</span>
              </Button>

              {/* ✅ 설정 버튼 */}
              <Button
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[70px]"
                onClick={() => navigate('/setting')}
              >
                <Settings className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Setting</span>
              </Button>

              {/* ✅ 로그아웃 버튼 */}
              <Button
                variant="ghost"
                className="p-2 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[70px]"
                onClick={handleLogout}
              >
                <LogOut className="text-white w-6 h-6 cursor-pointer" />
                <span className="text-sm text-gray-300">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-start w-full pl-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative px-6 py-2 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
                  <span className="text-lg font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Welcome to BinnAIR !
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <ExchangeBar />
    </>
  );
}
