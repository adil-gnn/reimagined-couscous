export type AdminRole = 'ADMIN' | 'RECEPTION' | 'STAFF';

export type AdminMeResponse = {
  user: {
    id: string;
    email: string;
    role: AdminRole;
  };
  tenant: {
    id: string;
    slug: string;
  };
};

export type AdminLoginRequest = {
  tenant_slug: string;
  email: string;
  password: string;
};
