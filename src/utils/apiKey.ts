import crypto from 'crypto';

export function generateApiKey(): string {
  const raw = crypto.randomBytes(32).toString('hex');
  return `apm_${raw}`;
}
