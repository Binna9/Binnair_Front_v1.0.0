import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { roleService } from '@/services/RoleService';
import { permissionService } from '@/services/PermissionService';
import { RoleResponse } from '@/types/RoleTypes';
import { PermissionResponse } from '@/types/PermissionTypes';
import { Pencil, Trash2, ShieldPlus, ShieldMinus } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export default function RoleManagement() {
  const { showConfirm, showToast } = useNotification();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isRemovePermissionDialogOpen, setIsRemovePermissionDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    roleName: '',
    roleDescription: '',
  });
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [selectedPermissionRoles, setSelectedPermissionRoles] = useState<string[]>([]);
  const [selectedPermissionNames, setSelectedPermissionNames] = useState<string[]>([]);
  const [selectedRemovePermissionRole, setSelectedRemovePermissionRole] = useState<string | null>(null);
  const [selectedRemovePermissionNames, setSelectedRemovePermissionNames] = useState<string[]>([]);
  const [roleSearchForPermission, setRoleSearchForPermission] = useState('');
  const [permissionSearchTerm, setPermissionSearchTerm] = useState('');
  const [removeRoleSearchTerm, setRemoveRoleSearchTerm] = useState('');
  const [removePermissionSearchTerm, setRemovePermissionSearchTerm] = useState('');
  const pageSize = 9;

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await roleService.getAllRoles({
        page: currentPage,
        size: pageSize,
        sort: 'createDatetime',
        direction: 'DESC',
      });
      if (response) {
        // 각 역할의 권한 조회 후 병합
        const rolesWithPermissions = await Promise.all(
          response.content.map(async (role) => {
            try {
              const permissions = await roleService.getRolePermissions(role.roleId);
              return { ...role, permissions };
            } catch (error) {
              console.error('역할 권한 조회 실패:', error);
              return { ...role, permissions: [] };
            }
          })
        );
        setRoles(rolesWithPermissions);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('역할 목록 조회 실패:', error);
      showToast('오류', '역할 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // 권한 목록 조회
  const fetchPermissions = useCallback(async () => {
    try {
      const response = await permissionService.getAllPermissions({
        page: 0,
        size: 100,
        sort: 'createDatetime',
        direction: 'DESC',
      });
      if (response) {
        setPermissions(response.content);
      }
    } catch (error) {
      console.error('권한 목록 조회 실패:', error);
      showToast('오류', '권한 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, []);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      roleName: '',
      roleDescription: '',
    });
    setSelectedRole(null);
  };

  // 역할 생성/수정 다이얼로그 열기
  const handleFormOpen = (role?: RoleResponse) => {
    if (role) {
      setSelectedRole(role);
      setFormData({
        roleName: role.roleName,
        roleDescription: role.roleDescription,
      });
    } else {
      resetForm();
    }
    setIsFormDialogOpen(true);
  };

  // 권한 부여 다이얼로그 열기
  const handlePermissionDialogOpen = () => {
    setSelectedPermissionRoles([]);
    setSelectedPermissionNames([]);
    setRoleSearchForPermission('');
    setPermissionSearchTerm('');
    fetchPermissions();
    setIsPermissionDialogOpen(true);
  };

  // 권한 제거 다이얼로그 열기
  const handleRemovePermissionDialogOpen = () => {
    setSelectedRemovePermissionRole(null);
    setSelectedRemovePermissionNames([]);
    setRemoveRoleSearchTerm('');
    setRemovePermissionSearchTerm('');
    fetchPermissions();
    setIsRemovePermissionDialogOpen(true);
  };

  // 역할 생성/수정 처리
  const handleFormSubmit = async () => {
    const action = selectedRole ? '수정' : '생성';
    const confirmed = await showConfirm(
      `역할 ${action}`,
      `역할을 ${action}하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      if (selectedRole) {
        await roleService.updateRole(selectedRole.roleId, formData);
        showToast('성공', '역할이 수정되었습니다.', 'success');
      } else {
        await roleService.createRole(formData);
        showToast('성공', '역할이 생성되었습니다.', 'success');
      }
      setIsFormDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('역할 저장 실패:', error);
      showToast('오류', `역할 ${action}에 실패했습니다.`, 'error');
    }
  };

  // 역할 삭제 다이얼로그 열기
  const handleDeleteClick = (role: RoleResponse) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  // 역할 삭제 처리
  const handleDeleteSubmit = async () => {
    if (!selectedRole) return;

    const confirmed = await showConfirm(
      '역할 삭제',
      '정말로 이 역할을 삭제하시겠습니까?'
    );
    if (!confirmed) return;

    try {
      await roleService.deleteRole(selectedRole.roleId);
      showToast('성공', '삭제가 완료되었습니다.', 'success');
      setIsDeleteDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('역할 삭제 실패:', error);
      showToast('오류', '역할 삭제에 실패했습니다.', 'error');
    }
  };

  // 검색어에 따른 역할 필터링
  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 권한 부여용 역할 필터링
  const filteredPermissionRoles = roles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(roleSearchForPermission.toLowerCase()) ||
      role.roleDescription.toLowerCase().includes(roleSearchForPermission.toLowerCase())
  );

  // 권한 부여용 권한 필터링
  const filteredPermissionList = permissions.filter(
    (permission) =>
      permission.permissionName.toLowerCase().includes(permissionSearchTerm.toLowerCase()) ||
      permission.permissionDescription.toLowerCase().includes(permissionSearchTerm.toLowerCase())
  );

  // 권한 제거용 역할 필터링
  const filteredRemovePermissionRoles = roles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(removeRoleSearchTerm.toLowerCase()) ||
      role.roleDescription.toLowerCase().includes(removeRoleSearchTerm.toLowerCase())
  );

  // 권한 제거용 권한 필터링: 선택한 역할이 가진 권한만
  const filteredRemovePermissionList = (() => {
    if (!selectedRemovePermissionRole) return [];
    const role = roles.find((r) => r.roleId === selectedRemovePermissionRole);
    if (!role?.permissions || role.permissions.length === 0) return [];

    return permissions.filter(
      (permission) =>
        role.permissions?.includes(permission.permissionName) &&
        (permission.permissionName
          .toLowerCase()
          .includes(removePermissionSearchTerm.toLowerCase()) ||
          (permission.permissionDescription?.toLowerCase() || '').includes(
            removePermissionSearchTerm.toLowerCase()
          ))
    );
  })();

  // 권한 부여 처리
  const handleAssignPermissions = async () => {
    if (selectedPermissionRoles.length === 0 || selectedPermissionNames.length === 0) {
      showToast('오류', '역할과 권한을 선택해주세요.', 'error');
      return;
    }

    const selectedRolesInfo = roles
      .filter((r) => selectedPermissionRoles.includes(r.roleId))
      .map((r) => r.roleName)
      .join(', ');
    const roleCount = selectedPermissionRoles.length;
    const permissionCount = selectedPermissionNames.length;

    const confirmed = await showConfirm(
      '권한 부여',
      `선택한 ${roleCount}개의 역할에 ${permissionCount}개의 권한을 부여하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      const requests = selectedPermissionRoles.flatMap((roleId) =>
        selectedPermissionNames.map((permissionName) => ({
          roleId,
          permissionName,
        }))
      );
      await roleService.assignPermissionsToRoles(requests);
      showToast('성공', '권한이 부여되었습니다.', 'success');
      setIsPermissionDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('권한 부여 실패:', error);
      showToast('오류', '권한 부여에 실패했습니다.', 'error');
    }
  };

  // 권한 제거 처리
  const handleRemovePermissions = async () => {
    if (!selectedRemovePermissionRole || selectedRemovePermissionNames.length === 0) {
      showToast('오류', '역할과 권한을 선택해주세요.', 'error');
      return;
    }

    const role = roles.find((r) => r.roleId === selectedRemovePermissionRole);
    if (!role) return;

    const confirmed = await showConfirm(
      '권한 제거',
      `${role.roleName} 역할에서 ${selectedRemovePermissionNames.length}개의 권한을 제거하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      const requests = selectedRemovePermissionNames.map((permissionName) => ({
        roleId: selectedRemovePermissionRole,
        permissionName,
      }));
      await roleService.removePermissionsFromRoles(requests);
      showToast('성공', '권한이 제거되었습니다.', 'success');
      setIsRemovePermissionDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('권한 제거 실패:', error);
      showToast('오류', '권한 제거에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="역할 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-xs"
        />
        <div className="flex gap-2">
          <Button onClick={handlePermissionDialogOpen} className="text-xs" variant="default">
            <ShieldPlus className="h-4 w-4 mr-1" />
            권한 부여
          </Button>
          <Button onClick={handleRemovePermissionDialogOpen} className="text-xs" variant="destructive">
            <ShieldMinus className="h-4 w-4 mr-1" />
            권한 제거
          </Button>
          <Button onClick={() => handleFormOpen()} className="text-xs">
            역할 추가
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">역할 명</TableHead>
              <TableHead className="text-xs">설명</TableHead>
              <TableHead className="text-xs w-90">권한</TableHead>
              <TableHead className="text-center text-xs">수정</TableHead>
              <TableHead className="text-center text-xs">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-xs">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-xs">
                  역할이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.roleId}>
                  <TableCell className="text-xs">{role.roleName}</TableCell>
                  <TableCell className="text-xs">{role.roleDescription}</TableCell>
                  <TableCell className="w-90">
                    <div className="flex flex-wrap gap-1 max-w-[28rem]">
                      {role.permissions && role.permissions.length > 0 ? (
                        <>
                          {role.permissions.slice(0, 3).map((permission) => (
                            <span
                              key={permission}
                              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                            >
                              {permission}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{role.permissions.length - 3}개
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFormOpen(role)}
                      className="h-7 w-7"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(role)}
                      className="h-7 w-7"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i ? 'default' : 'outline'}
              onClick={() => setCurrentPage(i)}
              className="w-8 h-8 p-0 text-xs"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* 역할 생성/수정 다이얼로그 */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedRole ? '역할 수정' : '역할 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName" className="text-xs">역할 명</Label>
              <Input
                id="roleName"
                value={formData.roleName}
                onChange={(e) =>
                  setFormData({ ...formData, roleName: e.target.value })
                }
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription" className="text-xs">설명</Label>
              <Input
                id="roleDescription"
                value={formData.roleDescription}
                onChange={(e) =>
                  setFormData({ ...formData, roleDescription: e.target.value })
                }
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            <Button onClick={handleFormSubmit} className="text-xs">
              {selectedRole ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 삭제 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">역할 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xs">정말로 이 역할을 삭제하시겠습니까?</p>
            <p className="text-xs text-gray-500 mt-2">
              삭제된 역할은 복구할 수 없습니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit} className="text-xs">
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 부여 다이얼로그 */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-sm">역할에 권한 부여</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* 역할 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '35%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                역할 선택 ({selectedPermissionRoles.length}개 선택됨)
              </Label>
              <Input
                placeholder="역할 검색 (역할명, 설명)..."
                value={roleSearchForPermission}
                onChange={(e) => setRoleSearchForPermission(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {filteredPermissionRoles.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredPermissionRoles.map((role) => (
                    <div
                      key={role.roleId}
                      onClick={() =>
                        setSelectedPermissionRoles((prev) =>
                          prev.includes(role.roleId)
                            ? prev.filter((id) => id !== role.roleId)
                            : [...prev, role.roleId]
                        )
                      }
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedPermissionRoles.includes(role.roleId)
                          ? 'bg-blue-100 border-blue-400 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{role.roleName}</div>
                          <div className="text-xs text-gray-500">{role.roleDescription || '-'}</div>
                          {role.permissions && role.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {role.permissions.slice(0, 3).map((perm) => (
                                <span
                                  key={perm}
                                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary"
                                >
                                  {perm}
                                </span>
                              ))}
                              {role.permissions.length > 3 && (
                                <span className="px-1.5 py-0.5 text-[10px] text-gray-500">
                                  +{role.permissions.length - 3}개
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedPermissionRoles.includes(role.roleId) && (
                          <div className="ml-2 text-blue-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 권한 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '50%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                권한 선택 ({selectedPermissionNames.length}개 선택됨)
              </Label>
              <Input
                placeholder="권한 검색 (권한명, 설명)..."
                value={permissionSearchTerm}
                onChange={(e) => setPermissionSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {filteredPermissionList.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    {permissions.length === 0 ? '권한이 없습니다' : '검색 결과가 없습니다'}
                  </div>
                ) : (
                  filteredPermissionList.map((permission) => (
                    <div
                      key={permission.permissionId}
                      onClick={() =>
                        setSelectedPermissionNames((prev) =>
                          prev.includes(permission.permissionName)
                            ? prev.filter((name) => name !== permission.permissionName)
                            : [...prev, permission.permissionName]
                        )
                      }
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedPermissionNames.includes(permission.permissionName)
                          ? 'bg-blue-100 border-blue-400 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{permission.permissionName}</div>
                          <div className="text-xs text-gray-500">
                            {permission.permissionDescription || '-'}
                          </div>
                        </div>
                        {selectedPermissionNames.includes(permission.permissionName) && (
                          <div className="ml-2 text-blue-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            <Button
              onClick={handleAssignPermissions}
              disabled={selectedPermissionRoles.length === 0 || selectedPermissionNames.length === 0}
              className="text-xs"
            >
              권한 부여 ({selectedPermissionRoles.length}개 × {selectedPermissionNames.length}개)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 제거 다이얼로그 */}
      <Dialog open={isRemovePermissionDialogOpen} onOpenChange={setIsRemovePermissionDialogOpen}>
        <DialogContent className="max-w-xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-sm">역할 권한 제거</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* 역할 선택 (단일) */}
            <div className="flex flex-col min-h-0" style={{ height: '35%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                역할 선택{' '}
                {selectedRemovePermissionRole &&
                  `(${roles.find((r) => r.roleId === selectedRemovePermissionRole)?.roleName})`}
              </Label>
              <Input
                placeholder="역할 검색 (역할명, 설명)..."
                value={removeRoleSearchTerm}
                onChange={(e) => setRemoveRoleSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {filteredRemovePermissionRoles.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredRemovePermissionRoles.map((role) => (
                    <div
                      key={role.roleId}
                      onClick={() => {
                        if (selectedRemovePermissionRole === role.roleId) {
                          setSelectedRemovePermissionRole(null);
                          setSelectedRemovePermissionNames([]);
                        } else {
                          setSelectedRemovePermissionRole(role.roleId);
                          setSelectedRemovePermissionNames([]);
                        }
                      }}
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedRemovePermissionRole === role.roleId
                          ? 'bg-red-100 border-red-400 border-l-4 border-l-red-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{role.roleName}</div>
                          <div className="text-xs text-gray-500">{role.roleDescription || '-'}</div>
                          {role.permissions && role.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {role.permissions.slice(0, 3).map((perm) => (
                                <span
                                  key={perm}
                                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary"
                                >
                                  {perm}
                                </span>
                              ))}
                              {role.permissions.length > 3 && (
                                <span className="px-1.5 py-0.5 text-[10px] text-gray-500">
                                  +{role.permissions.length - 3}개
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedRemovePermissionRole === role.roleId && (
                          <div className="ml-2 text-red-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 권한 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '50%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                권한 선택 ({selectedRemovePermissionNames.length}개 선택됨)
              </Label>
              <Input
                placeholder="권한 검색 (권한명, 설명)..."
                value={removePermissionSearchTerm}
                onChange={(e) => setRemovePermissionSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {!selectedRemovePermissionRole ? (
                  <div className="p-2 text-xs text-gray-500 text-center">역할을 먼저 선택해주세요</div>
                ) : filteredRemovePermissionList.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    선택한 역할에 권한이 없거나 검색 결과가 없습니다
                  </div>
                ) : (
                  filteredRemovePermissionList.map((permission) => (
                    <div
                      key={permission.permissionId}
                      onClick={() =>
                        setSelectedRemovePermissionNames((prev) =>
                          prev.includes(permission.permissionName)
                            ? prev.filter((name) => name !== permission.permissionName)
                            : [...prev, permission.permissionName]
                        )
                      }
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedRemovePermissionNames.includes(permission.permissionName)
                          ? 'bg-red-100 border-red-400 border-l-4 border-l-red-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{permission.permissionName}</div>
                          <div className="text-xs text-gray-500">
                            {permission.permissionDescription || '-'}
                          </div>
                        </div>
                        {selectedRemovePermissionNames.includes(permission.permissionName) && (
                          <div className="ml-2 text-red-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsRemovePermissionDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            <Button
              onClick={handleRemovePermissions}
              disabled={!selectedRemovePermissionRole || selectedRemovePermissionNames.length === 0}
              variant="destructive"
              className="text-xs"
            >
              권한 제거 ({selectedRemovePermissionNames.length}개)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
