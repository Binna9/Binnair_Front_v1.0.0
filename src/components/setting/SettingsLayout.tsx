import { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="w-full h-full">
      <div className="container mx-auto flex justify-center py-8">
        <div className="w-full mt-24 max-w-[1400px] relative">
          {/* Glassmorphism Background */}
          <div 
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Header Section */}
            <div className="relative p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">시스템 설정</h1>
                    <p className="mt-2 text-blue-100/90 text-lg">
                      사용자, 역할, 권한, 메뉴를 관리할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-8 pt-6">
              <Tabs defaultValue="users" className="w-full">
                <div className="relative">
                  <TabsList className="w-full h-auto p-2 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                    <div className="grid grid-cols-4 w-full gap-2">
                      <TabsTrigger
                        value="users"
                        className="relative overflow-hidden px-6 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-gray-600 hover:text-indigo-600 hover:bg-white/50 font-medium"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                          <span>사용자 관리</span>
                        </div>
                      </TabsTrigger>
                      
                      <TabsTrigger
                        value="roles"
                        className="relative overflow-hidden px-6 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-gray-600 hover:text-indigo-600 hover:bg-white/50 font-medium"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>역할 관리</span>
                        </div>
                      </TabsTrigger>
                      
                      <TabsTrigger
                        value="permissions"
                        className="relative overflow-hidden px-6 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-gray-600 hover:text-indigo-600 hover:bg-white/50 font-medium"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>권한 관리</span>
                        </div>
                      </TabsTrigger>
                      
                      <TabsTrigger
                        value="menus"
                        className="relative overflow-hidden px-6 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/25 text-gray-600 hover:text-indigo-600 hover:bg-white/50 font-medium"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <span>메뉴 관리</span>
                        </div>
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </div>

                {/* Content Area */}
                <div className="mt-8 p-8 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 min-h-[600px]">
                  <div className="relative">
                    {/* Subtle background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/30 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                      {children}
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>

            {/* Bottom spacing */}
            <div className="h-8"></div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-60 blur-sm animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-pink-400 to-indigo-500 rounded-full opacity-40 blur-sm animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
}