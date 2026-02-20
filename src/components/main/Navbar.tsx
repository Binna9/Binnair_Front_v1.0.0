import { Button } from '@/components/ui/button';
import {
  User,
  BarChart2,
  Activity,
  MonitorPlay,
  History,
  HelpCircle,
  Home,
  Settings,
  Headset,
  Menu as MenuIcon,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import HamburgerMenu from '../ui/HamburgerMenu';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNavigate } from 'react-router-dom';
import UserProfilePopup from '../popup/UserProfilePopup';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu((prev) => {
      const next = prev === menuName ? null : menuName;
      console.log('openMenu:', prev, '->', next);
      return next;
    });
  };

  const closeProfilePopup = () => setIsProfileOpen(false);

  type DashboardMenuItem = { name: string; id: string; icon?: React.ReactNode };
  type DashboardMenuGroup = { id: string; menuName: string; icon: React.ReactNode; items: DashboardMenuItem[] };

  const dashboardMenuGroups: DashboardMenuGroup[] = [
    {
      id: 'execution',
      menuName: '실행 현황',
      icon: <BarChart2 className="w-4 h-4" />,
      items: [
        { name: '전체 실행 현황', id: 'execution-overview' },
        { name: '실행 이력 조회', id: 'execution-history' },
        { name: '실패 작업 모아보기', id: 'execution-failures' },
        { name: '지연 작업 확인', id: 'execution-delayed' },
        { name: '실행 상세 보기', id: 'execution-detail' },
        { name: '실행 로그 조회', id: 'execution-logs' },
      ],
    },
    {
      id: 'data-management',
      menuName: '데이터 관리',
      icon: <Activity className="w-4 h-4" />,
      items: [
        { name: '원천 데이터', id: 'data-raw' },
        { name: '정제 데이터', id: 'data-refined' },
        { name: '집계 데이터', id: 'data-aggregated' },
        { name: '테이블 상세 정보', id: 'data-table-detail' },
        { name: '데이터 적재 이력', id: 'data-load-history' },
        { name: '데이터 버전 이력', id: 'data-version-history' },
      ],
    },
    {
      id: 'data-flow',
      menuName: '데이터 흐름 분석',
      icon: <MonitorPlay className="w-4 h-4" />,
      items: [
        { name: '전체 데이터 흐름도', id: 'flow-overview' },
        { name: '테이블 기준 흐름 조회', id: 'flow-by-table' },
        { name: '컬럼 기준 흐름 조회', id: 'flow-by-column' },
        { name: '영향 받는 데이터 분석', id: 'flow-impact' },
        { name: '실행 기준 흐름 조회', id: 'flow-by-run' },
      ],
    },
    {
      id: 'history-change',
      menuName: '이력 및 변경 관리',
      icon: <History className="w-4 h-4" />,
      items: [
        { name: '스키마 변경 이력', id: 'history-schema' },
        { name: '적재 로직 변경 이력', id: 'history-load-logic' },
        { name: '시스템 설정 변경 이력', id: 'history-system-settings' },
        { name: '이벤트 로그 조회', id: 'history-event-logs' },
        { name: '사용자 작업 이력', id: 'history-user-actions' },
      ],
    },
  ];

  const handleDashboardMenuItemClick = (item: { id: string }) => {
    navigate('/dashboard', { state: { section: item.id } });
  };

  const drawerItems: DashboardMenuItem[] = [
    ...dashboardMenuGroups.flatMap((group) =>
      group.items.map((item) => ({
        id: item.id,
        name: `${group.menuName} - ${item.name}`,
        icon: group.icon,
      }))
    ),
    { id: 'community', name: '커뮤니티', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* ✅ 프로필 팝업 */}
      <UserProfilePopup isOpen={isProfileOpen} closePopup={closeProfilePopup} user={user} />

      <div className="fixed top-0 left-0 w-full z-50">
        <nav className="h-12 bg-zinc-900/90 backdrop-blur-md shadow-md">
          {/* ✅ relative: 가운데 메뉴 absolute 중앙정렬을 위해 필요 */}
          <div className="relative h-full px-3 flex items-center">
          {/* ✅ Left: 로고 + 검색 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* 로고 (반응형 크기 조정) */}
            <button
              type="button"
              onClick={() => navigate('/')}
              aria-label="Go to home"
              className="ml-8 inline-flex items-end select-none cursor-pointer transition-transform duration-200 hover:scale-105 flex-shrink-0"
            >
              <span className="text-white font-semibold text-base sm:text-lg leading-none whitespace-nowrap">
                <span>Q-TRACK</span>
                <span className="ml-0.5 text-[10px] sm:text-[11px] font-medium relative -top-1">TM</span>
                <span className="ml-[1px] text-white/80 text-[10px] sm:text-[11px] font-medium">. Cesco</span>
              </span>
            </button>
          </div>

          {/* ✅ Center (lg+): 메뉴를 화면 중앙에 고정 */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 xl:gap-10">
            {dashboardMenuGroups.map((group, index) => (
              <Fragment key={group.id}>
                {index > 0 && (
                  <span className="select-none text-sm text-white/25" aria-hidden>
                    |
                  </span>
                )}
                <HamburgerMenu
                  menuName={group.menuName}
                  icon={group.icon}
                  items={group.items}
                  isOpen={openMenu === group.id}
                  onClick={() => handleMenuClick(group.id)}
                  onItemClick={handleDashboardMenuItemClick}
                  className="shrink-0"
                />
              </Fragment>
            ))}
            <span className="select-none text-sm text-white/25" aria-hidden>
              |
            </span>
            <HamburgerMenu
              menuName="커뮤니티"
              icon={<Headset className="w-4 h-4" />}
              items={[{ name: '커뮤니티', id: 'community' }]}
              isOpen={openMenu === 'community'}
              onClick={() => handleMenuClick('community')}
              onItemClick={() => navigate('/board')}
              className="shrink-0"
            />
          </div>

          {/* ✅ lg 미만: 단일 메뉴 버튼 (Drawer) - 가운데 정렬 대신 좌측/우측에 두는게 UX 최선 */}
          <div className="flex lg:hidden items-center ml-2">
            <HamburgerMenu
              menuName="Menu"
              icon={<MenuIcon size={16} />}
              items={drawerItems.map((x) => ({ name: x.name, id: x.id, icon: x.icon }))}
              isOpen={openMenu === 'Menu'}
              onClick={() => handleMenuClick('Menu')}
              onItemClick={(item) => {
                if (item.id === 'community') {
                  navigate('/board');
                  return;
                }
                handleDashboardMenuItemClick(item);
              }}
              variant="drawer"
              side="right"
            />
          </div>

          {/* ✅ Right: 계정/액션 (항상 우측 고정) */}
          <div className="ml-auto mr-6 flex items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              className="p-2 hover:bg-gray-700/50"
              onClick={() => navigate('/')}
              aria-label="Home"
            >
              <Home className="text-white w-6 h-6" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="p-2 hover:bg-gray-700/50"
              onClick={() => navigate('/setting')}
              aria-label="Settings"
            >
              <Settings className="text-white w-6 h-6" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="p-2 hover:bg-gray-700/50"
              onClick={() => setIsProfileOpen(true)}
              aria-label="User"
            >
              <User className="text-white w-6 h-6" />
            </Button>
          </div>
        </div>
        </nav>
        <div className="h-[7px] w-full bg-white/90" />
      </div>
    </>
  );
}
