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
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotification } from '@/context/NotificationContext';
import { useProfile } from '@/hooks/user/useUserProfile';

export default function UserManagement() {
  const { showConfirm } = useNotification();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 계정 활성화 상태 변경
  const handleActiveChange = async (userId: string, isActive: boolean) => {
    const confirmMessage = isActive
      ? '계정을 활성화하시겠습니까?'
      : '계정을 비활성화하시겠습니까?';

    const confirmed = await showConfirm('계정 상태 변경', confirmMessage);
    if (!confirmed) return;

    try {
      await userService.changeActive(userId, isActive);
      toast.success(`계정이 ${isActive ? '활성화' : '비활성화'} 되었습니다.`);
      fetchUsers();
    } catch (error) {
      console.error('계정 상태 변경 실패:', error);
      toast.error('계정 상태 변경에 실패했습니다.');
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
      toast.success('삭제가 완료되었습니다.');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      toast.error('사용자 삭제에 실패했습니다.');
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
                      {user.roles?.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                        >
                          {role}
                        </span>
                      ))}
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
    </div>
  );
}
