export function parseTrustProxy(value: string | undefined): boolean | number | string {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === 'false') {
    return false;
  }

  if (trimmed === 'true') {
    return true;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}
