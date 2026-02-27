export type AdminPlanningStaff = {
  id: string;
  display_name: string;
};

export type AdminPlanningAppointment = {
  id: string;
  staff_id: string | null;
  service_id: string;
  service_name: string;
  customer_name: string | null;
  customer_phone: string | null;
  start_at: string;
  end_at: string;
  status: string;
};

export type AdminUpdatableStatus = 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED_BY_STAFF';

export type AdminDayPlanningResponse = {
  date: string;
  timezone: string;
  viewer_role: 'ADMIN' | 'RECEPTION' | 'STAFF';
  staff: AdminPlanningStaff[];
  appointments: AdminPlanningAppointment[];
};

export type AdminService = {
  id: string;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_cents: number;
};

export type AdminServicesResponse = {
  services: AdminService[];
};

export type AdminSlotsResponse = {
  date: string;
  service_id: string;
  staff_id: string | null;
  slot_step_minutes: number;
  slots: Array<{
    start_at: string;
  }>;
};

export type CreateAdminAppointmentRequest = {
  service_id: string;
  staff_id?: string;
  start_at: string;
  customer: {
    phone: string;
    name?: string;
  };
  note?: string;
};

export type CreateAdminAppointmentResponse = {
  appointment_id: string;
  status: string;
};

export type UpdateAdminAppointmentStatusRequest = {
  status: AdminUpdatableStatus;
};

export type UpdateAdminAppointmentStatusResponse = {
  appointment_id: string;
  status: string;
};

export type UpdateAdminAppointmentRequest = {
  service_id: string;
  start_at: string;
  staff_id?: string;
};

export type UpdateAdminAppointmentResponse = {
  appointment_id: string;
  status: string;
  service_id: string;
  staff_id: string | null;
  start_at: string;
  end_at: string;
};
