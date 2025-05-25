import { useState } from 'react';
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

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
            <TableHead>역할명</TableHead>
            <TableHead>설명</TableHead>
            <TableHead>권한</TableHead>
            <TableHead>작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* 역할 목록이 여기에 표시됩니다 */}
        </TableBody>
      </Table>
    </div>
  );
} 