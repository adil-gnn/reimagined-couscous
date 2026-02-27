export const adminPlanningQueryKeys = {
  day: (date: string) => ['admin-planning', 'day', date] as const,
  services: (tenantSlug: string) => ['admin-planning', 'services', tenantSlug] as const,
  slots: (tenantSlug: string, serviceId: string, date: string, staffId?: string) =>
    ['admin-planning', 'slots', tenantSlug, serviceId, date, staffId ?? null] as const,
};
