import { apiGet, apiPatch, apiPost } from '../../../shared/api/apiClient';
import {
  AdminDayPlanningResponse,
  AdminServicesResponse,
  AdminSlotsResponse,
  CreateAdminAppointmentRequest,
  CreateAdminAppointmentResponse,
  UpdateAdminAppointmentRequest,
  UpdateAdminAppointmentResponse,
  UpdateAdminAppointmentStatusRequest,
  UpdateAdminAppointmentStatusResponse,
} from '../types/adminPlanningTypes';

export function getAdminDayPlanning(date: string): Promise<AdminDayPlanningResponse> {
  return apiGet<AdminDayPlanningResponse>('/api/v1/admin/planning/day', { date });
}

// Réutilisation des endpoints publics côté admin: la disponibilité reste 100% backend.
export function getAdminServices(tenantSlug: string): Promise<AdminServicesResponse> {
  return apiGet<AdminServicesResponse>(`/api/v1/public/${tenantSlug}/services`);
}

export type GetAdminSlotsInput = {
  tenantSlug: string;
  serviceId: string;
  date: string;
  staffId?: string;
};

export function getAdminSlots(input: GetAdminSlotsInput): Promise<AdminSlotsResponse> {
  return apiGet<AdminSlotsResponse>(`/api/v1/public/${input.tenantSlug}/slots`, {
    service_id: input.serviceId,
    date: input.date,
    staff_id: input.staffId,
  });
}

export type CreateAdminAppointmentInput = {
  idempotencyKey: string;
  body: CreateAdminAppointmentRequest;
};

export function createAdminAppointment(input: CreateAdminAppointmentInput): Promise<CreateAdminAppointmentResponse> {
  return apiPost<CreateAdminAppointmentResponse>('/api/v1/admin/appointments', input.body, {
    'Idempotency-Key': input.idempotencyKey,
  });
}

export type UpdateAdminAppointmentStatusInput = {
  appointmentId: string;
  body: UpdateAdminAppointmentStatusRequest;
};

export function updateAdminAppointmentStatus(
  input: UpdateAdminAppointmentStatusInput,
): Promise<UpdateAdminAppointmentStatusResponse> {
  return apiPatch<UpdateAdminAppointmentStatusResponse>(
    `/api/v1/admin/appointments/${input.appointmentId}/status`,
    input.body,
  );
}

export type UpdateAdminAppointmentInput = {
  appointmentId: string;
  body: UpdateAdminAppointmentRequest;
};

export function updateAdminAppointment(input: UpdateAdminAppointmentInput): Promise<UpdateAdminAppointmentResponse> {
  return apiPatch<UpdateAdminAppointmentResponse>(`/api/v1/admin/appointments/${input.appointmentId}`, input.body);
}
