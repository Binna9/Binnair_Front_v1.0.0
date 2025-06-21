import { Page } from './Page';

export interface RoleResponse {
  roleId: string; // 역할 ID
  roleName: string; // 역할 명
  roleDescription: string; // 역할 설명
}

export interface RoleRequest {
  roleName: string; // 역할 명
  roleDescription: string; // 역할 설명
}

export interface RolePermissionRequest {
  roleId: string;
  permissionName: string;
}

export type PagedRoleResponse = Page<RoleResponse>;
