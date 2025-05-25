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

  // 역할에 권한 부여
  assignPermissionToRole: async (rolePermissionRequest: RolePermissionRequest): Promise<void> => {
    await apiClient.post('/roles/assign-permission', rolePermissionRequest);
  },
};

export default roleService;