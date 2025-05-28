import { useEffect, useState } from 'react';
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
import { roleService } from '@/services/RoleService';
import { RoleResponse } from '@/types/RoleTypes';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleManagement() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 역할 목록 조회
  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await roleService.getAllRoles();
      if (response) {
        setRoles(response.content);
      }
    } catch (error) {
      console.error('역할 목록 조회 실패:', error);
      toast.error('역할 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

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
        <Button>역할 추가</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>역할 ID</TableHead>
            <TableHead>역할 명</TableHead>
            <TableHead>설명</TableHead>
            <TableHead className="text-right">작업</TableHead>
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
                <TableCell>{role.roleId}</TableCell>
                <TableCell>{role.roleName}</TableCell>
                <TableCell>{role.roleDescription}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
