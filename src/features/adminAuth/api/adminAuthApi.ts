import { apiGet, apiPost } from '../../../shared/api/apiClient';
import { AdminLoginRequest, AdminMeResponse } from '../types/adminAuthTypes';

export function loginAdmin(payload: AdminLoginRequest): Promise<AdminMeResponse> {
  return apiPost<AdminMeResponse>('/api/v1/admin/auth/login', payload);
}

export function getAdminMe(): Promise<AdminMeResponse> {
  return apiGet<AdminMeResponse>('/api/v1/admin/auth/me');
}

export function logoutAdmin(): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/api/v1/admin/auth/logout', {});
}
