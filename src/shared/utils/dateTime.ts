// Date initiale du calendrier (format attendu par input[type="date"]).
export function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Affiche les heures de slots selon la timezone tenant, fallback UTC explicite.
export function formatSlotTime(startAtIso: string, timezone: string): string {
  const slotDate = new Date(startAtIso);

  if (Number.isNaN(slotDate.getTime())) {
    return startAtIso;
  }

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    }).format(slotDate);
  } catch {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(slotDate);
  }
}
