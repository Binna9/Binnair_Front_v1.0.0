import MainLayout from '@/layouts/MainLayout';
import SettingsLayout from '@/layouts/SettingLayout';
import UserManagement from '@/components/setting/UserManagement';
import RoleManagement from '@/components/setting/RoleManagement';
import { TabsContent } from '@/components/ui/tabs';

export default function SettingPage() {
  return (
    <MainLayout>
      <SettingsLayout>
        <TabsContent value="users" className="mt-0">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <RoleManagement />
        </TabsContent>

        <TabsContent value="permissions" className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">권한 목록</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                권한 추가
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">권한 관리 내용</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="menus" className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">메뉴 목록</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                메뉴 추가
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">메뉴 관리 내용</div>
            </div>
          </div>
        </TabsContent>
      </SettingsLayout>
    </MainLayout>
  );
}
