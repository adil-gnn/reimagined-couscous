import { apiDelete, apiGet, apiPatch, apiPost } from '../../../shared/api/apiClient';
import {
  AdminStaffResponse,
  CreateAdminStaffResponse,
  UpdateAdminStaffResponse,
  UpsertAdminStaffRequest,
} from '../types/adminStaffTypes';

export function listAdminStaff(): Promise<AdminStaffResponse> {
  return apiGet<AdminStaffResponse>('/api/v1/admin/staff');
}

export function createAdminStaff(body: UpsertAdminStaffRequest): Promise<CreateAdminStaffResponse> {
  return apiPost<CreateAdminStaffResponse>('/api/v1/admin/staff', body);
}

export function updateAdminStaff(
  staffId: string,
  body: UpsertAdminStaffRequest,
): Promise<UpdateAdminStaffResponse> {
  return apiPatch<UpdateAdminStaffResponse>(`/api/v1/admin/staff/${staffId}`, body);
}

export function archiveAdminStaff(staffId: string): Promise<void> {
  return apiDelete(`/api/v1/admin/staff/${staffId}`);
}

