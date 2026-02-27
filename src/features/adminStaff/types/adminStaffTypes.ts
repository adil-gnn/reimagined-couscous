export type AdminStaff = {
  id: string;
  display_name: string;
  user_id: string | null;
  is_active: boolean;
  display_order: number;
  service_ids: string[];
};

export type AdminStaffResponse = {
  staff: AdminStaff[];
};

export type UpsertAdminStaffRequest = {
  display_name: string;
  display_order: number;
  service_ids: string[];
};

export type CreateAdminStaffResponse = {
  staff_id: string;
};

export type UpdateAdminStaffResponse = {
  staff_id: string;
};

