import crypto from 'crypto';

export function generateApiKey(): string {
  const raw = crypto.randomBytes(32).toString('hex');
  return `apm_${raw}`;
}

export function hashApiKey(rawKey: string): string {
  const pepper = process.env.API_KEY_PEPPER || '';
  return crypto.createHmac('sha256', pepper).update(rawKey).digest('hex');
}

// First 8 chars after the prefix, used for identification without exposing the full key
export function getKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, 12); // "apm_" + 8 hex chars
}
