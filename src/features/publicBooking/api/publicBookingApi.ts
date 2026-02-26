import { apiGet, apiPost } from '../../../shared/api/apiClient';
import {
  CreatePublicAppointmentRequestBody,
  CreatePublicAppointmentResponse,
  GetPublicSlotsParams,
  GetPublicSlotsResponse,
  GetPublicTenantResponse,
  ListPublicServicesResponse,
} from '../types/publicBookingApiTypes';

export function getPublicTenant(slug: string): Promise<GetPublicTenantResponse> {
  return apiGet<GetPublicTenantResponse>(`/api/v1/public/${slug}`);
}

export function listPublicServices(slug: string): Promise<ListPublicServicesResponse> {
  return apiGet<ListPublicServicesResponse>(`/api/v1/public/${slug}/services`);
}

export function getPublicSlots(params: GetPublicSlotsParams): Promise<GetPublicSlotsResponse> {
  return apiGet<GetPublicSlotsResponse>(`/api/v1/public/${params.slug}/slots`, {
    service_id: params.service_id,
    date: params.date,
    staff_id: params.staff_id,
  });
}

export function createPublicAppointment(args: {
  slug: string;
  idempotencyKey: string;
  body: CreatePublicAppointmentRequestBody;
}): Promise<CreatePublicAppointmentResponse> {
  return apiPost<CreatePublicAppointmentResponse>(`/api/v1/public/${args.slug}/appointments`, args.body, {
    'Idempotency-Key': args.idempotencyKey,
  });
}
