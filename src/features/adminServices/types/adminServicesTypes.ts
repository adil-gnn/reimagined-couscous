export type AdminService = {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_cents: number | null;
  is_active: boolean;
  display_order: number;
};

export type AdminServicesResponse = {
  services: AdminService[];
};

export type UpsertAdminServiceRequest = {
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_cents: number | null;
  display_order: number;
};

export type CreateAdminServiceResponse = {
  service_id: string;
};

export type UpdateAdminServiceResponse = {
  service_id: string;
};

