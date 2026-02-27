import { apiDelete, apiGet, apiPatch, apiPost } from '../../../shared/api/apiClient';
import {
  AdminServicesResponse,
  CreateAdminServiceResponse,
  UpdateAdminServiceResponse,
  UpsertAdminServiceRequest,
} from '../types/adminServicesTypes';

export function listAdminServices(): Promise<AdminServicesResponse> {
  return apiGet<AdminServicesResponse>('/api/v1/admin/services');
}

export function createAdminService(body: UpsertAdminServiceRequest): Promise<CreateAdminServiceResponse> {
  return apiPost<CreateAdminServiceResponse>('/api/v1/admin/services', body);
}

export function updateAdminService(
  serviceId: string,
  body: UpsertAdminServiceRequest,
): Promise<UpdateAdminServiceResponse> {
  return apiPatch<UpdateAdminServiceResponse>(`/api/v1/admin/services/${serviceId}`, body);
}

export function archiveAdminService(serviceId: string): Promise<void> {
  return apiDelete(`/api/v1/admin/services/${serviceId}`);
}

