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
import { permissionService } from '@/services/PermissionService';
import {
  PermissionResponse,
  PagedPermissionResponse,
} from '@/types/PermissionTypes';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotification } from '@/context/NotificationContext';

export default function PermissionManagement() {
  const { showConfirm } = useNotification();
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPermission, setSelectedPermission] =
    useState<PermissionResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    permissionName: '',
    permissionDescription: '',
  });
  const pageSize = 8;

  // 권한 목록 조회
  const fetchPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = (await permissionService.getAllPermissions({
        page: currentPage,
        size: pageSize,
        sort: 'createDatetime',
        direction: 'DESC',
      })) as PagedPermissionResponse;

      console.log('서버 응답:', response);

      if (response) {
        setPermissions(response.content);
        // page 객체에서 페이지네이션 정보 가져오기
        const { totalPages, totalElements } = response.page;
        setTotalPages(totalPages);

        console.log('페이지네이션 정보:', {
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          content: response.content,
        });
      }
    } catch (error) {
      console.error('권한 목록 조회 실패:', error);
      toast.error('권한 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      permissionName: '',
      permissionDescription: '',
    });
    setSelectedPermission(null);
  };

  // 권한 생성/수정 다이얼로그 열기
  const handleFormOpen = (permission?: PermissionResponse) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormData({
        permissionName: permission.permissionName,
        permissionDescription: permission.permissionDescription,
      });
    } else {
      resetForm();
    }
    setIsFormDialogOpen(true);
  };

  // 권한 생성/수정 처리
  const handleFormSubmit = async () => {
    const action = selectedPermission ? '수정' : '생성';
    const confirmed = await showConfirm(
      `권한 ${action}`,
      `권한을 ${action}하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      if (selectedPermission) {
        await permissionService.updatePermission(
          selectedPermission.permissionId,
          formData
        );
        toast.success('권한이 수정되었습니다.');
      } else {
        await permissionService.createPermission(formData);
        toast.success('권한이 생성되었습니다.');
      }
      setIsFormDialogOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error('권한 저장 실패:', error);
      toast.error(`권한 ${action}에 실패했습니다.`);
    }
  };

  // 권한 삭제 다이얼로그 열기
  const handleDeleteClick = (permission: PermissionResponse) => {
    setSelectedPermission(permission);
    setIsDeleteDialogOpen(true);
  };

  // 권한 삭제 처리
  const handleDeleteSubmit = async () => {
    if (!selectedPermission) return;

    const confirmed = await showConfirm(
      '권한 삭제',
      '정말로 이 권한을 삭제하시겠습니까?'
    );
    if (!confirmed) return;

    try {
      await permissionService.deletePermission(selectedPermission.permissionId);
      toast.success('삭제가 완료되었습니다.');
      setIsDeleteDialogOpen(false);
      fetchPermissions();
    } catch (error) {
      console.error('권한 삭제 실패:', error);
      toast.error('권한 삭제에 실패했습니다.');
    }
  };

  // 검색어에 따른 권한 필터링
  const filteredPermissions = permissions.filter((permission) =>
    permission.permissionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="권한 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => handleFormOpen()}>권한 추가</Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <Table>
          <TableHeader>
            <TableRow key="header">
              <TableHead>권한 명</TableHead>
              <TableHead>설명</TableHead>
              <TableHead className="text-center">수정</TableHead>
              <TableHead className="text-center">삭제</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow key="loading">
                <TableCell colSpan={4} className="text-center">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : filteredPermissions.length === 0 ? (
              <TableRow key="empty">
                <TableCell colSpan={4} className="text-center">
                  권한이 없습니다
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                <TableRow key={`permission-${permission.permissionId}`}>
                  <TableCell>{permission.permissionName}</TableCell>
                  <TableCell>{permission.permissionDescription}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      key={`edit-${permission.permissionId}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleFormOpen(permission)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      key={`delete-${permission.permissionId}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(permission)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 수정 */}
        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              key="prev"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              이전
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={`page-${i}`}
                  variant={currentPage === i ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(i)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              key="next"
              variant="outline"
              onClick={() =>
                setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
              }
              disabled={currentPage === totalPages - 1}
            >
              다음
            </Button>
          </div>
        )}
      </div>

      {/* 권한 생성/수정 다이얼로그 */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? '권한 수정' : '권한 추가'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="permissionName">권한 명</Label>
              <Input
                id="permissionName"
                value={formData.permissionName}
                onChange={(e) =>
                  setFormData({ ...formData, permissionName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permissionDescription">설명</Label>
              <Input
                id="permissionDescription"
                value={formData.permissionDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    permissionDescription: e.target.value,
                  })
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
              {selectedPermission ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 삭제 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>권한 삭제</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>정말로 이 권한을 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-2">
              삭제된 권한은 복구할 수 없습니다.
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
