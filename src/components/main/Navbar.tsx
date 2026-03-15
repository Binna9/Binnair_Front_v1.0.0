import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
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
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from '../ui/HamburgerMenu';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfilePopup from '../popup/UserProfilePopup';
import { useProfile } from '@/hooks/user/useUserProfile';
import { UserUpdateRequest } from '@/types/UserTypes';
import { useUserImage } from '@/hooks/user/useUserImage';
import SearchBar from '../ui/SearchBar';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, handleLogout } = useAuth();
  const { user: profileUser, updateUser } = useProfile(user?.userId || '');
  const { profileImage } = useUserImage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(true);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu((prev) => {
      const next = prev === menuName ? null : menuName;
      console.log('openMenu:', prev, '->', next);
      return next;
    });
  };

  const handleUpdateUser = (updatedUser: UserUpdateRequest) => {
    updateUser(user?.userId || '', updatedUser);
  };

  const closeProfilePopup = () => setIsProfileOpen(false);

  /** 같은 경로면 state로 리마운트 유도, 다르면 navigate (전체 새로고침 시 403 방지) */
  const handleMenuNavigate = (path: string) => {
    if (location.pathname === path) {
      navigate(path, { state: { refresh: Date.now() }, replace: true });
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { name: '실시간 트레이딩', id: 'trade', icon: <Activity size={14} />, to: '/trade' },
    { name: '이상탐지 모니터링', id: 'anomaly-monitor', icon: <MonitorPlay size={14} />, to: '/anomaly-monitor' },
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
          {/* ✅ Left: BinnAIR 텍스트 (메인 이동) */}
          <button
            type="button"
            onClick={() => handleMenuNavigate('/')}
            className="flex items-center gap-2 flex-shrink-0 ml-12 text-white font-semibold text-2xl tracking-tight rounded-md px-2 py-1 transition-all duration-200 hover:opacity-95 hover:scale-105 active:scale-100 group"
          >
            <TrendingUp className="w-6 h-6 text-amber-300/90 group-hover:text-amber-200 group-hover:rotate-12 transition-all duration-200" strokeWidth={2} />
            BinnAIR
          </button>

          {/* ✅ Center (lg+): 메뉴를 화면 중앙에 고정 */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
            <HamburgerMenu
              menuName="Trade Arena"
              items={[{ name: '실시간 트레이딩', id: 'trade-arena', icon: <Activity size={14} /> }]}
              isOpen={openMenu === 'Trade Arena'}
              onClick={() => handleMenuClick('Trade Arena')}
              onItemClick={() => handleMenuNavigate('/trade')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Anomaly Detection"
              items={[{ name: '이상탐지 모니터링', id: 'anomaly-monitor', icon: <MonitorPlay size={14} /> }]}
              isOpen={openMenu === '이상탐지 모니터링'}
              onClick={() => handleMenuClick('이상탐지 모니터링')}
              onItemClick={() => handleMenuNavigate('/anomaly-monitor')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Trade History"
              items={[{ name: '트레이딩 내역 / 기록', id: 'history', icon: <History size={14} /> }]}
              isOpen={openMenu === 'Trade History'}
              onClick={() => handleMenuClick('Trade History')}
              onItemClick={() => handleMenuNavigate('/history')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Dashboard"
              items={[{ name: '대시보드', id: 'dashboard', icon: <BarChart2 size={14} /> }]}
              isOpen={openMenu === 'Dashboard'}
              onClick={() => handleMenuClick('Dashboard')}
              onItemClick={() => handleMenuNavigate('/dashboard')}
              className="shrink-0"
            />
            <HamburgerMenu
              menuName="Customer Service"
              items={[{ name: '고객센터', id: 'service', icon: <HelpCircle size={14} /> }]}
              isOpen={openMenu === 'Customer Service'}
              onClick={() => handleMenuClick('Customer Service')}
              onItemClick={() => handleMenuNavigate('/board')}
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
                if (target) handleMenuNavigate(target.to);
              }}
              variant="drawer"
              side="right"
            />
          </div>

          {/* ✅ Right: 계정/액션 (항상 우측 고정) */}
          <div className="ml-auto mr-4 flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {user ? (
              <>
                {/* 프로필 카드 */}
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  className="group flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md py-1.5 px-2.5 sm:px-3 rounded-xl border border-white/30
                             shadow-[0_4px_20px_0_rgba(255,255,255,0.12)] hover:from-white/25 hover:to-white/15 hover:border-white/50
                             hover:shadow-[0_6px_28px_0_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]
                             transition-all duration-300 ease-out max-w-[200px] sm:max-w-[240px]"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={profileImage || '/default-profile.png'}
                      alt="Profile"
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/70 shadow-lg group-hover:border-white group-hover:shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300"
                    />
                  </div>
                  <div className="min-w-0 text-left hidden sm:block">
                    <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-white">
                      {profileUser?.nickName || 'User'}{' '}
                      <span className="text-[10px] sm:text-xs font-normal text-white/90">님</span>
                    </div>
                    <div className="text-[10px] text-white/75 truncate group-hover:text-white/90 transition-colors">{profileUser?.email || ''}</div>
                  </div>
                </button>

                <Button
                  variant="ghost"
                  className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[50px] sm:w-[60px]"
                  onClick={() => handleMenuNavigate('/setting')}
                >
                  <Settings className="text-white w-5 h-5 cursor-pointer" />
                  <span className="text-xs text-gray-300">Setting</span>
                </Button>

                <Button
                  variant="ghost"
                  className="p-1.5 hover:bg-gray-700/50 flex flex-col items-center gap-y-0.5 w-[50px] sm:w-[60px]"
                  onClick={handleLogout}
                >
                  <LogOut className="text-white w-5 h-5 cursor-pointer" />
                  <span className="text-xs text-gray-300">Logout</span>
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
      {/* 네브바 밑 흰색 그라데이션 라인 */}
      <div
        className="fixed top-12 left-0 w-full h-[8px] z-40 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.15) 80%, transparent 100%)',
        }}
      />
      <SearchBar isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />
    </>
  );
}
