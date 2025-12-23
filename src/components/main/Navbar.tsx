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
  Menu as MenuIcon,
} from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from '../ui/HamburgerMenu';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfilePopup from '../popup/UserProfilePopup';
import { useProfile } from '@/hooks/user/useUserProfile';
import { UserUpdateRequest } from '@/types/UserTypes';
import { useUserImage } from '@/hooks/user/useUserImage';
import ExchangeBar from '../ui/ExchangeBar';
import SearchBar from '../ui/SearchBar';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, handleLogout } = useAuth();
  const { user: profileUser, updateUser } = useProfile(user?.userId || '');
  const { profileImage } = useUserImage();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(true);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  };

  const handleUpdateUser = (updatedUser: UserUpdateRequest) => {
    updateUser(user?.userId || '', updatedUser);
  };

  const closeProfilePopup = () => setIsProfileOpen(false);

  const navItems = [
    { name: '실시간 트레이딩', id: 'trade', icon: <Activity size={14} />, to: '/trade' },
    { name: '모델 학습 / 예측 상태', id: 'ai-monitor', icon: <MonitorPlay size={14} />, to: '/ai-monitor' },
    { name: '트레이딩 내역 / 기록', id: 'history', icon: <History size={14} />, to: '/history' },
    { name: '대시보드', id: 'dashboard', icon: <BarChart2 size={14} />, to: '/dashboard' },
    { name: '고객센터', id: 'service', icon: <HelpCircle size={14} />, to: '/board' },
  ] as const;

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

      <nav className="fixed top-0 left-0 w-full h-12 bg-zinc-900/90 backdrop-blur-md shadow-md z-50">
        {/* ✅ relative: 가운데 메뉴 absolute 중앙정렬을 위해 필요 */}
        <div className="relative h-full px-3 flex items-center">
          {/* ✅ Left: 로고 + 검색 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* 로고 (반응형 크기 조정) */}
            <img
              src="/img/binnair_logo_white.png"
              alt="BinnAIR"
              className="sm:h-24 md:h-28 lg:h-32 xl:h-36 2xl:h-40 w-auto cursor-pointer object-contain transition-transform duration-200 hover:scale-105 flex-shrink-0"
              onClick={() => navigate('/')}
            />
          </div>

          {/* ✅ Center (lg+): 메뉴를 화면 중앙에 고정 */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
            <HamburgerMenu
              menuName="Trade Arena"
              items={[{ name: '실시간 트레이딩', id: 'trade-arena', icon: <Activity size={14} /> }]}
              isOpen={openMenu === 'Trade Arena'}
              onClick={() => handleMenuClick('Trade Arena')}
              onItemClick={() => navigate('/trade')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="AI Monitor"
              items={[{ name: '모델 학습 / 예측 상태', id: 'ai-monitor', icon: <MonitorPlay size={14} /> }]}
              isOpen={openMenu === 'AI Monitor'}
              onClick={() => handleMenuClick('AI Monitor')}
              onItemClick={() => navigate('/ai-monitor')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Trade History"
              items={[{ name: '트레이딩 내역 / 기록', id: 'history', icon: <History size={14} /> }]}
              isOpen={openMenu === 'Trade History'}
              onClick={() => handleMenuClick('Trade History')}
              onItemClick={() => navigate('/history')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Dashboard"
              items={[{ name: '대시보드', id: 'dashboard', icon: <BarChart2 size={14} /> }]}
              isOpen={openMenu === 'Dashboard'}
              onClick={() => handleMenuClick('Dashboard')}
              onItemClick={() => navigate('/dashboard')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Customer Service"
              items={[{ name: '고객센터', id: 'service', icon: <HelpCircle size={14} /> }]}
              isOpen={openMenu === 'Customer Service'}
              onClick={() => handleMenuClick('Customer Service')}
              onItemClick={() => navigate('/board')}
              className="shrink-0"
            />
          </div>

          {/* ✅ lg 미만: 단일 메뉴 버튼 (Drawer) - 가운데 정렬 대신 좌측/우측에 두는게 UX 최선 */}
          <div className="flex lg:hidden items-center ml-2">
            <HamburgerMenu
              menuName="Menu"
              icon={<MenuIcon size={16} />}
              items={navItems.map((x) => ({ name: x.name, id: x.id, icon: x.icon }))}
              isOpen={openMenu === 'Menu'}
              onClick={() => handleMenuClick('Menu')}
              onItemClick={(item) => {
                const target = navItems.find((x) => x.id === item.id);
                if (target) navigate(target.to);
              }}
              variant="drawer"
              side="right"
            />
          </div>

          {/* ✅ Right: 계정/액션 (항상 우측 고정) */}
          <div className="ml-auto mr-4 flex items-center gap-4 flex-shrink-0">
            {user ? (
              <>
                {/* 프로필 카드: sm 이상에서만 */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md py-1 px-2 rounded-lg border border-white/20
                             shadow-[0_4px_16px_0_rgba(255,255,255,0.08)] hover:bg-white/15 transition-all duration-200 max-w-[240px]"
                >
                  <img
                    src={profileImage || '/default-profile.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-white/60 shadow"
                  />
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-bold text-white truncate">
                      {profileUser?.nickName || 'User'}{' '}
                      <span className="text-xs font-normal text-white/80">님</span>
                    </div>
                    <div className="text-[10px] text-white/70 truncate">{profileUser?.email || ''}</div>
                  </div>
                </button>

                {/* md 이상: 액션 버튼 유지 */}
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[60px]"
                    onClick={() => setIsProfileOpen(true)}
                  >
                    <User className="text-white w-5 h-5 cursor-pointer" />
                    <span className="text-xs text-gray-300">My Page</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[60px]"
                    onClick={() => navigate('/setting')}
                  >
                    <Settings className="text-white w-5 h-5 cursor-pointer" />
                    <span className="text-xs text-gray-300">Setting</span>
                  </Button>

                  <Button
                    variant="ghost"
                    className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[60px]"
                    onClick={handleLogout}
                  >
                    <LogOut className="text-white w-5 h-5 cursor-pointer" />
                    <span className="text-xs text-gray-300">Logout</span>
                  </Button>
                </div>

                {/* md 미만: 아이콘 1개로 축약 */}
                <Button
                  variant="ghost"
                  className="p-2 md:hidden hover:bg-gray-700/50"
                  onClick={() => setIsProfileOpen(true)}
                >
                  <User className="text-white w-5 h-5" />
                </Button>
              </>
            ) : (
              <>
                {/* sm 이상: 로그인/회원가입 */}
                <div className="hidden sm:flex items-center justify-center gap-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[60px]"
                  >
                    <LogIn className="text-white w-5 h-5 cursor-pointer" />
                    <span className="text-xs text-gray-300">Log In</span>
                  </Button>

                  <Button
                    onClick={() => navigate('/register')}
                    variant="ghost"
                    className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[60px]"
                  >
                    <UserPlus className="text-white w-5 h-5 cursor-pointer" />
                    <span className="text-xs text-gray-300">Sign Up</span>
                  </Button>
                </div>

                {/* sm 미만: 아이콘 축약 */}
                <div className="flex sm:hidden items-center gap-2">
                  <Button onClick={() => navigate('/login')} variant="ghost" className="p-2 hover:bg-gray-700/50">
                    <LogIn className="text-white w-5 h-5" />
                  </Button>
                  <Button onClick={() => navigate('/register')} variant="ghost" className="p-2 hover:bg-gray-700/50">
                    <UserPlus className="text-white w-5 h-5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      <ExchangeBar />
      <SearchBar isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />
    </>
  );
}
