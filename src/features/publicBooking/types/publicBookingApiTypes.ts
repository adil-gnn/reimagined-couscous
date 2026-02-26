export type GetPublicTenantResponse = {
  tenant: {
    slug: string;
    name: string;
    timezone: string | null;
    status: string;
  };
  policies: Record<string, unknown>;
};

export type PublicService = {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_cents: number;
};

export type ListPublicServicesResponse = {
  services: PublicService[];
};

export type GetPublicSlotsParams = {
  slug: string;
  service_id: string;
  date: string;
  staff_id?: string;
};

export type GetPublicSlotsResponse = {
  date: string;
  service_id: string;
  staff_id: string | null;
  slot_step_minutes: number;
  slots: Array<{
    start_at: string;
  }>;
};

// Contrat POST aligné sur CreatePublicAppointmentRequest (backend Symfony).
export type CreatePublicAppointmentRequestBody = {
  service_id: string;
  start_at: string;
  staff_id?: string;
  customer: {
    phone: string;
    name?: string;
    email?: string;
  };
  note?: string;
};

export type CreatePublicAppointmentResponse = {
  appointment_id: string;
  status: string;
};
