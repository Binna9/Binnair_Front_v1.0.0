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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { userService } from '@/services/UserService';
import { UserResponse } from '@/types/UserTypes';
import { Trash2, UserPlus, UserMinus } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { useProfile } from '@/hooks/user/useUserProfile';
import { roleService } from '@/services/RoleService';
import { RoleResponse } from '@/types/RoleTypes';

export default function UserManagement() {
  const { showConfirm, showToast } = useNotification();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRemoveRoleDialogOpen, setIsRemoveRoleDialogOpen] = useState(false);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [selectedRoleUsers, setSelectedRoleUsers] = useState<string[]>([]);
  const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([]);
  const [selectedRemoveRoleUser, setSelectedRemoveRoleUser] = useState<string | null>(null);
  const [selectedRemoveRoleNames, setSelectedRemoveRoleNames] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [removeUserSearchTerm, setRemoveUserSearchTerm] = useState('');
  const [removeRoleSearchTerm, setRemoveRoleSearchTerm] = useState('');
  const pageSize = 9;

  const { deleteUser } = useProfile(selectedUser?.userId || null);

  // 사용자 목록 조회
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userService.getAllUsers({
        page: currentPage,
        size: pageSize,
        sort: 'createDatetime',
        direction: 'DESC',
      });
      if (response) {
        setUsers(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      showToast('오류', '사용자 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 역할 목록 조회
  const fetchRoles = useCallback(async () => {
    try {
      const response = await roleService.getAllRoles({
        page: 0,
        size: 100,
        sort: 'createDatetime',
        direction: 'DESC',
      });
      if (response) {
        setRoles(response.content);
      }
    } catch (error) {
      console.error('역할 목록 조회 실패:', error);
      showToast('오류', '역할 목록을 불러오는데 실패했습니다.', 'error');
    }
  }, []);

  // 역할 부여 다이얼로그 열기
  const handleRoleDialogOpen = () => {
    setSelectedRoleUsers([]);
    setSelectedRoleNames([]);
    setUserSearchTerm('');
    setRoleSearchTerm('');
    fetchRoles();
    setIsRoleDialogOpen(true);
  };

  // 역할 제거 다이얼로그 열기
  const handleRemoveRoleDialogOpen = () => {
    setSelectedRemoveRoleUser(null);
    setSelectedRemoveRoleNames([]);
    setRemoveUserSearchTerm('');
    setRemoveRoleSearchTerm('');
    fetchRoles();
    setIsRemoveRoleDialogOpen(true);
  };

  // 사용자 선택 토글
  const toggleUserSelection = (userId: string) => {
    setSelectedRoleUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // 역할 선택 토글
  const toggleRoleSelection = (roleName: string) => {
    setSelectedRoleNames((prev) =>
      prev.includes(roleName) ? prev.filter((name) => name !== roleName) : [...prev, roleName]
    );
  };

  // 검색어에 따른 사용자 필터링 (역할 부여 다이얼로그용)
  const filteredRoleUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(userSearchTerm.toLowerCase()) ||
      (user.nickName?.toLowerCase() || '').includes(userSearchTerm.toLowerCase())
  );

  // 검색어에 따른 역할 필터링
  const filteredRoleList = roles.filter(
    (role) =>
      role.roleName.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      (role.roleDescription?.toLowerCase() || '').includes(roleSearchTerm.toLowerCase())
  );

  // 검색어에 따른 사용자 필터링 (역할 제거 다이얼로그용)
  const filteredRemoveRoleUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(removeUserSearchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(removeUserSearchTerm.toLowerCase()) ||
      (user.nickName?.toLowerCase() || '').includes(removeUserSearchTerm.toLowerCase())
  );

  // 검색어에 따른 역할 필터링 (역할 제거 다이얼로그용)
  // 선택한 사용자가 실제로 가지고 있는 역할만 표시
  const filteredRemoveRoleList = (() => {
    if (!selectedRemoveRoleUser) return [];

    // 선택한 사용자가 가진 역할
    const selectedUser = users.find((u) => u.userId === selectedRemoveRoleUser);
    if (!selectedUser?.roles) return [];

    const selectedUserRoles = new Set(selectedUser.roles);

    // 선택한 사용자가 가진 역할만 필터링
    return roles.filter(
      (role) =>
        selectedUserRoles.has(role.roleName) &&
        (role.roleName.toLowerCase().includes(removeRoleSearchTerm.toLowerCase()) ||
          (role.roleDescription?.toLowerCase() || '').includes(removeRoleSearchTerm.toLowerCase()))
    );
  })();

  // 역할 부여 처리
  const handleAssignRole = async () => {
    if (selectedRoleUsers.length === 0 || selectedRoleNames.length === 0) {
      showToast('오류', '사용자와 역할을 선택해주세요.', 'error');
      return;
    }

    const selectedUsersInfo = users
      .filter((u) => selectedRoleUsers.includes(u.userId))
      .map((u) => u.userName)
      .join(', ');
    const roleCount = selectedRoleNames.length;
    const userCount = selectedRoleUsers.length;

    const confirmed = await showConfirm(
      '역할 부여',
      `선택한 ${userCount}명의 사용자에게 ${roleCount}개의 역할을 부여하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      // 모든 사용자와 역할의 조합으로 리스트 생성
      const userRoleRequests = selectedRoleUsers.flatMap((userId) =>
        selectedRoleNames.map((roleName) => ({ userId, roleName }))
      );

      await userService.assignRolesToUsers(userRoleRequests);
      showToast('성공', '역할이 부여되었습니다.', 'success');
      setIsRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('역할 부여 실패:', error);
      showToast('오류', '역할 부여에 실패했습니다.', 'error');
    }
  };

  // 역할 제거 처리
  const handleRemoveRoles = async () => {
    if (!selectedRemoveRoleUser || selectedRemoveRoleNames.length === 0) {
      showToast('오류', '사용자와 역할을 선택해주세요.', 'error');
      return;
    }

    const selectedUser = users.find((u) => u.userId === selectedRemoveRoleUser);
    if (!selectedUser) return;

    const roleCount = selectedRemoveRoleNames.length;

    const confirmed = await showConfirm(
      '역할 제거',
      `${selectedUser.userName}님에서 ${roleCount}개의 역할을 제거하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      // 선택한 사용자와 역할의 조합으로 리스트 생성
      const userRoleRequests = selectedRemoveRoleNames.map((roleName) => ({
        userId: selectedRemoveRoleUser,
        roleName,
      }));

      await userService.removeRolesFromUsers(userRoleRequests);
      showToast('성공', '역할이 제거되었습니다.', 'success');
      setIsRemoveRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('역할 제거 실패:', error);
      showToast('오류', '역할 제거에 실패했습니다.', 'error');
    }
  };

  // 계정 활성화 상태 변경
  const handleActiveChange = async (userId: string, isActive: boolean) => {
    const confirmMessage = isActive
      ? '계정을 활성화하시겠습니까?'
      : '계정을 비활성화하시겠습니까?';

    const confirmed = await showConfirm('계정 상태 변경', confirmMessage);
    if (!confirmed) return;

    try {
      await userService.changeActive(userId, isActive);
      showToast('성공', `계정이 ${isActive ? '활성화' : '비활성화'} 되었습니다.`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('계정 상태 변경 실패:', error);
      showToast('오류', '계정 상태 변경에 실패했습니다.', 'error');
    }
  };

  // 사용자 삭제 다이얼로그 열기
  const handleDeleteClick = (user: UserResponse) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // 사용자 삭제 처리
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser();
      showToast('성공', '삭제가 완료되었습니다.', 'success');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      showToast('오류', '사용자 삭제에 실패했습니다.', 'error');
    }
  };

  // 검색어에 따른 사용자 필터링
  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="사용자 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-xs"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleRoleDialogOpen}
            className="text-xs"
            variant="default"
          >
            <UserPlus className="h-4 w-4 mr-1" />
            역할 부여
          </Button>
          <Button
            onClick={handleRemoveRoleDialogOpen}
            className="text-xs"
            variant="destructive"
          >
            <UserMinus className="h-4 w-4 mr-1" />
            역할 제거
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">이름</TableHead>
              <TableHead className="text-xs">닉네임</TableHead>
              <TableHead className="text-xs">이메일</TableHead>
              <TableHead className="text-xs">전화번호</TableHead>
              <TableHead className="text-xs">역할</TableHead>
              <TableHead className="text-xs">상태</TableHead>
              <TableHead className="text-right text-xs">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-xs">
                  사용자가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="text-xs">{user.userName}</TableCell>
                  <TableCell className="text-xs">{user.nickName || '-'}</TableCell>
                  <TableCell className="text-xs">{user.email || '-'}</TableCell>
                  <TableCell className="text-xs">{user.phoneNumber || '-'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        <>
                          {user.roles.slice(0, 3).map((role) => (
                            <span
                              key={role}
                              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                            >
                              {role}
                            </span>
                          ))}
                          {user.roles.length > 3 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{user.roles.length - 3}개
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RadioGroup
                      value={user.active ? 'active' : 'inactive'}
                      onValueChange={(value) =>
                        handleActiveChange(user.userId, value === 'active')
                      }
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="active"
                          id={`active-${user.userId}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`active-${user.userId}`}
                          className="flex items-center justify-center w-16 h-8 text-xs font-medium rounded-md cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:bg-blue-500 peer-data-[state=checked]:text-white peer-data-[state=checked]:border-blue-500"
                        >
                          활성
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="inactive"
                          id={`inactive-${user.userId}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`inactive-${user.userId}`}
                          className="flex items-center justify-center w-16 h-8 text-xs font-medium rounded-md cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:bg-destructive peer-data-[state=checked]:text-destructive-foreground peer-data-[state=checked]:border-destructive"
                        >
                          비활성
                        </Label>
                      </div>
                    </RadioGroup>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(user)}
                        className="h-7 w-7"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* 사용자 삭제 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">사용자 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xs">정말로 이 사용자를 삭제하시겠습니까?</p>
            <p className="text-xs text-gray-500 mt-2">
              삭제된 사용자는 복구할 수 없습니다.
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

      {/* 역할 부여 다이얼로그 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-sm">사용자 역할 부여</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* 사용자 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '45%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                사용자 선택 ({selectedRoleUsers.length}명 선택됨)
              </Label>
              <Input
                placeholder="사용자 검색 (이름, 이메일, 닉네임)..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {filteredRoleUsers.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredRoleUsers.map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => toggleUserSelection(user.userId)}
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedRoleUsers.includes(user.userId)
                          ? 'bg-blue-100 border-blue-400 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{user.userName}</div>
                          <div className="text-xs text-gray-500">{user.email || '-'}</div>
                          {user.roles && user.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.roles.map((role) => (
                                <span
                                  key={role}
                                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary"
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedRoleUsers.includes(user.userId) && (
                          <div className="ml-2 text-blue-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 역할 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '45%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                역할 선택 ({selectedRoleNames.length}개 선택됨)
              </Label>
              <Input
                placeholder="역할 검색 (역할명, 설명)..."
                value={roleSearchTerm}
                onChange={(e) => setRoleSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {filteredRoleList.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    {roles.length === 0 ? '역할이 없습니다' : '검색 결과가 없습니다'}
                  </div>
                ) : (
                  filteredRoleList.map((role) => (
                    <div
                      key={role.roleId}
                      onClick={() => toggleRoleSelection(role.roleName)}
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedRoleNames.includes(role.roleName)
                          ? 'bg-blue-100 border-blue-400 border-l-4 border-l-blue-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{role.roleName}</div>
                          <div className="text-xs text-gray-500">{role.roleDescription || '-'}</div>
                        </div>
                        {selectedRoleNames.includes(role.roleName) && (
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
              onClick={() => setIsRoleDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={selectedRoleUsers.length === 0 || selectedRoleNames.length === 0}
              className="text-xs"
            >
              역할 부여 ({selectedRoleUsers.length}명 × {selectedRoleNames.length}개)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 제거 다이얼로그 */}
      <Dialog open={isRemoveRoleDialogOpen} onOpenChange={setIsRemoveRoleDialogOpen}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-sm">사용자 역할 제거</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
            {/* 사용자 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '45%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                사용자 선택 {selectedRemoveRoleUser && `(${users.find((u) => u.userId === selectedRemoveRoleUser)?.userName})`}
              </Label>
              <Input
                placeholder="사용자 검색 (이름, 이메일, 닉네임)..."
                value={removeUserSearchTerm}
                onChange={(e) => setRemoveUserSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {filteredRemoveRoleUsers.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  filteredRemoveRoleUsers.map((user) => (
                    <div
                      key={user.userId}
                      onClick={() => {
                        if (selectedRemoveRoleUser === user.userId) {
                          // 같은 사용자를 클릭하면 선택 해제
                          setSelectedRemoveRoleUser(null);
                          setSelectedRemoveRoleNames([]);
                        } else {
                          // 다른 사용자를 선택
                          setSelectedRemoveRoleUser(user.userId);
                          setSelectedRemoveRoleNames([]);
                        }
                      }}
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedRemoveRoleUser === user.userId
                          ? 'bg-red-100 border-red-400 border-l-4 border-l-red-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{user.userName}</div>
                          <div className="text-xs text-gray-500">{user.email || '-'}</div>
                          {user.roles && user.roles.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.roles.slice(0, 3).map((role) => (
                                <span
                                  key={role}
                                  className="px-1.5 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary"
                                >
                                  {role}
                                </span>
                              ))}
                              {user.roles.length > 3 && (
                                <span className="px-1.5 py-0.5 text-[10px] text-gray-500">
                                  +{user.roles.length - 3}개
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedRemoveRoleUser === user.userId && (
                          <div className="ml-2 text-red-600 font-bold">✓</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 역할 선택 */}
            <div className="flex flex-col min-h-0" style={{ height: '45%' }}>
              <Label className="text-xs mb-2 block flex-shrink-0">
                역할 선택 ({selectedRemoveRoleNames.length}개 선택됨)
              </Label>
              <Input
                placeholder="역할 검색 (역할명, 설명)..."
                value={removeRoleSearchTerm}
                onChange={(e) => setRemoveRoleSearchTerm(e.target.value)}
                className="mb-2 text-xs flex-shrink-0"
              />
              <div className="border rounded-lg flex-1 overflow-y-auto min-h-0">
                {!selectedRemoveRoleUser ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    사용자를 먼저 선택해주세요
                  </div>
                ) : filteredRemoveRoleList.length === 0 ? (
                  <div className="p-2 text-xs text-gray-500 text-center">
                    선택한 사용자가 가진 역할이 없거나 검색 결과가 없습니다
                  </div>
                ) : (
                  filteredRemoveRoleList.map((role) => (
                    <div
                      key={role.roleId}
                      onClick={() => {
                        setSelectedRemoveRoleNames((prev) =>
                          prev.includes(role.roleName)
                            ? prev.filter((name) => name !== role.roleName)
                            : [...prev, role.roleName]
                        );
                      }}
                      className={`p-2.5 cursor-pointer transition-all border-b last:border-b-0 ${
                        selectedRemoveRoleNames.includes(role.roleName)
                          ? 'bg-red-100 border-red-400 border-l-4 border-l-red-600'
                          : 'hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{role.roleName}</div>
                          <div className="text-xs text-gray-500">{role.roleDescription || '-'}</div>
                        </div>
                        {selectedRemoveRoleNames.includes(role.roleName) && (
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
              onClick={() => setIsRemoveRoleDialogOpen(false)}
              className="text-xs"
            >
              취소
            </Button>
            <Button
              onClick={handleRemoveRoles}
              disabled={!selectedRemoveRoleUser || selectedRemoveRoleNames.length === 0}
              variant="destructive"
              className="text-xs"
            >
              역할 제거 ({selectedRemoveRoleNames.length}개)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
