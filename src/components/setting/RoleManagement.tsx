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
import { RoleResponse } from '@/types/RoleTypes';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotification } from '@/context/NotificationContext';

export default function RoleManagement() {
  const { showConfirm } = useNotification();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    roleName: '',
    roleDescription: '',
  });
  const pageSize = 10;

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
        setRoles(response.content);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error('역할 목록 조회 실패:', error);
      toast.error('역할 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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
        toast.success('역할이 수정되었습니다.');
      } else {
        await roleService.createRole(formData);
        toast.success('역할이 생성되었습니다.');
      }
      setIsFormDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('역할 저장 실패:', error);
      toast.error(`역할 ${action}에 실패했습니다.`);
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
      toast.success('삭제가 완료되었습니다.');
      setIsDeleteDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('역할 삭제 실패:', error);
      toast.error('역할 삭제에 실패했습니다.');
    }
  };

  // 검색어에 따른 역할 필터링
  const filteredRoles = roles.filter((role) =>
    role.roleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="역할 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => handleFormOpen()}>역할 추가</Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>역할 명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="text-center">수정</TableHead>
              <TableHead className="text-center">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  역할이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.roleId}>
                  <TableCell>{role.roleName}</TableCell>
                  <TableCell>{role.roleDescription}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFormOpen(role)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(role)}
                    >
                      <Trash2 className="h-4 w-4" />
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
              className="w-8 h-8 p-0"
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
            <DialogTitle>
              {selectedRole ? '역할 수정' : '역할 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">역할 명</Label>
              <Input
                id="roleName"
                value={formData.roleName}
                onChange={(e) =>
                  setFormData({ ...formData, roleName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleDescription">설명</Label>
              <Input
                id="roleDescription"
                value={formData.roleDescription}
                onChange={(e) =>
                  setFormData({ ...formData, roleDescription: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFormDialogOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handleFormSubmit}>
              {selectedRole ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 삭제 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>정말로 이 역할을 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-2">
              삭제된 역할은 복구할 수 없습니다.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
