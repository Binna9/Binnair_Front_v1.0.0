// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import { userService } from '@/services/UserService';
// import { UserResponse } from '@/types/UserTypes';
// import { Pencil, Trash2 } from 'lucide-react';

// export default function UserManagement() {
//   const [users, setUsers] = useState<UserResponse[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   // 사용자 목록 조회
//   const fetchUsers = async () => {
//     try {
//       setIsLoading(true);
//       const response = await userService.getAllUsers();
//       if (response) {
//         setUsers(response.content);
//       }
//     } catch (error) {
//       console.error('사용자 목록 조회 실패:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // 검색어에 따른 사용자 필터링
//   const filteredUsers = users.filter(user => 
//     user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <Input
//           placeholder="사용자 검색..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="max-w-sm"
//         />
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button>사용자 추가</Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>새 사용자 추가</DialogTitle>
//             </DialogHeader>
//             {/* 사용자 추가 폼은 추후 구현 */}
//           </DialogContent>
//         </Dialog>
//       </div>
      
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>이름</TableHead>
//             <TableHead>이메일</TableHead>
//             <TableHead>역할</TableHead>
//             <TableHead>상태</TableHead>
//             <TableHead className="text-right">작업</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {isLoading ? (
//             <TableRow>
//               <TableCell colSpan={5} className="text-center">로딩 중...</TableCell>
//             </TableRow>
//           ) : filteredUsers.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={5} className="text-center">사용자가 없습니다</TableCell>
//             </TableRow>
//           ) : (
//             filteredUsers.map((user) => (
//               <TableRow key={user.id}>
//                 <TableCell>{user.name}</TableCell>
//                 <TableCell>{user.email}</TableCell>
//                 <TableCell>{user.role}</TableCell>
//                 <TableCell>{user.status}</TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex justify-end gap-2">
//                     <Button variant="ghost" size="icon">
//                       <Pencil className="h-4 w-4" />
//                     </Button>
//                     <Button variant="ghost" size="icon">
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );
// } 