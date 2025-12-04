import MainLayout from '@/layouts/MainLayout';
import SettingsLayout from '@/layouts/SettingLayout';
import UserManagement from '@/components/setting/UserManagement';
import RoleManagement from '@/components/setting/RoleManagement';
import PermissionManagement from '@/components/setting/PermissionManagement';
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
          <PermissionManagement />
        </TabsContent>
      </SettingsLayout>
    </MainLayout>
  );
}
