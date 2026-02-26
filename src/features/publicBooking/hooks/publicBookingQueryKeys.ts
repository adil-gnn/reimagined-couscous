// Query keys tenant-aware pour isoler le cache par slug public.
export const publicBookingQueryKeys = {
  tenant: (slug: string) => ['tenant', slug] as const,
  services: (slug: string) => ['services', slug] as const,
  slots: (slug: string, serviceId: string, date: string, staffId?: string) =>
    ['slots', slug, serviceId, date, staffId ?? null] as const,
};
