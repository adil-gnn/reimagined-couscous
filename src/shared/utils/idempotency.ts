// Le backend persiste idempotency_key en CHAR(36): on génère une clé <= 36 chars.
export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback UUID-like (36 chars) quand randomUUID n'est pas disponible.
  const s4 = (): string => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
  const s8 = (): string => `${s4()}${s4()}`;

  return `${s8()}-${s4()}-4${s4().slice(1)}-8${s4().slice(1)}-${s8()}${s4()}`;
}
