import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sun, Moon, User } from 'lucide-react';
import { useState } from 'react';
import HamburgerMenu from './HamburgerMenu';

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  // 다크 모드 토글
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    console.log(`🌙 [DarkMode] 다크 모드 상태:`, !darkMode);
  };

  // 햄버거 메뉴 클릭 이벤트
  const handleMenuClick = (clickedMenu: string) => {
    setOpenMenus((prevMenus) => {
      const newMenus = Object.keys(prevMenus).reduce(
        (acc, menu) => ({
          ...acc,
          [menu]: menu === clickedMenu ? !prevMenus[menu] : false,
        }),
        {} as { [key: string]: boolean }
      );

      return newMenus;
    });
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

      {/* 📌 네비게이션 메뉴 */}
      <div className="flex space-x-6 ml-[750px]">
        {[
          { name: '이벤트', items: ['할인 이벤트', '기획전', '프로모션'] },
          { name: '제품', items: ['신제품', '베스트셀러', '카테고리별 보기'] },
          { name: '장바구니', items: ['최근 본 상품', '찜한 상품'] },
          { name: '고객센터', items: ['FAQ', '문의하기', '1:1 상담'] },
        ].map((menu) => (
          <HamburgerMenu
            key={menu.name}
            menuName={menu.name}
            items={menu.items}
            isOpen={openMenus[menu.name] || false}
            onClick={() => handleMenuClick(menu.name)}
          />
        ))}
      </div>

      {/* 📌 로그인 & 회원가입 버튼 */}
      <div className="flex space-x-4 ml-8">
        <Button className="bg-white/90 text-gray-900 px-3 py-1 text-xs hover:bg-gray-300 shadow-md">
          로그인
        </Button>
        <Button className="bg-blue-500/90 text-white px-3 py-1 text-xs hover:bg-blue-600 shadow-md">
          회원가입
        </Button>
      </div>

      {/* 📌 사용자 설정 & 다크모드 버튼 */}
      <div className="flex items-center space-x-4 ml-6">
        <Button variant="ghost" className="p-4 hover:bg-gray-700/50">
          <User className="text-white w-10 h-10 cursor-pointer" />
        </Button>

        <Button
          variant="ghost"
          className="p-4 hover:bg-gray-700/50"
          onClick={toggleDarkMode}
        >
          {darkMode ? (
            <Moon className="text-white w-10 h-10 cursor-pointer" />
          ) : (
            <Sun className="text-white w-10 h-10 cursor-pointer" />
          )}
        </Button>
      </div>
    </nav>
  );
}
