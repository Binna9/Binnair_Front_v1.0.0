import apiClient from '@/utils/apiClient';
import { RoleResponse, RoleRequest, RolePermissionRequest, PagedRoleResponse } from '@/types/RoleTypes';

// 페이지네이션 파라미터 타입 정의
interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export const roleService = {
  // 역할 전체 조회
  getAllRoles: async (
    pageRequest: PageRequest = {
      page: 0,
      size: 8,
      sort: 'createDatetime',
      direction: 'DESC',
    }
  ): Promise<PagedRoleResponse | null> => {
    try {
      const { page, size, sort, direction } = pageRequest;
      const response = await apiClient.get<PagedRoleResponse>('/roles', {
        params: {
          page,
          size,
          sort: `${sort},${direction}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ 역할 전체 조회 실패:', error);
      return null;
    }
  },

  // 역할 개별 조회
  getRoleById: async (roleId: string): Promise<RoleResponse> => {
    const response = await apiClient.get<RoleResponse>(`/roles/${roleId}`);
    return response.data;
  },

  // 역할 생성
  createRole: async (roleRequest: RoleRequest): Promise<void> => {
    await apiClient.post('/roles', roleRequest);
  },

  // 역할 수정
  updateRole: async (roleId: string, roleRequest: RoleRequest): Promise<void> => {
    await apiClient.put(`/roles/${roleId}`, roleRequest);
  },

  // 역할 삭제
  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(`/roles/${roleId}`);
  },

  // 역할 권한 조회 (단일 역할)
  getRolePermissions: async (roleId: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/roles/permission', {
      params: { roleId },
    });
    return response.data;
  },

  // 역할에 권한 부여 (리스트)
  assignPermissionsToRoles: async (rolePermissionRequests: RolePermissionRequest[]): Promise<void> => {
    await apiClient.post('/roles/assign-permission', rolePermissionRequests);
  },

  // 역할 권한 제거 (리스트)
  removePermissionsFromRoles: async (rolePermissionRequests: RolePermissionRequest[]): Promise<void> => {
    await apiClient.delete(`/roles/remove-permission`, { data: rolePermissionRequests });
  },
};

export default roleService;