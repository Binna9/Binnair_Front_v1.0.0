import { Page } from './page';

export interface RoleResponse {
  roleId: string; // 역할 ID
  roleName: string; // 역할 명
  roleDescription: string; // 역할 설명
  permissions?: string[]; // 역할이 가진 권한 목록 (선택)
}

export interface RoleRequest {
  roleName: string; // 역할 명
  roleDescription: string; // 역할 설명
}

export interface RolePermissionRequest {
  roleId: string;
  permissionName: string;
}

export interface RolePermissionListRequest {
  rolePermissionRequests: RolePermissionRequest[];
}

export type PagedRoleResponse = Page<RoleResponse>;
