export const DEFAULT_CORS_ORIGINS = ['http://localhost:5173'];

export function parseCorsOrigins(value: string | undefined): true | string[] {
  const trimmed = value?.trim();

  if (!trimmed) {
    return DEFAULT_CORS_ORIGINS;
  }

  if (trimmed === '*') {
    return true;
  }

  return trimmed
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}
