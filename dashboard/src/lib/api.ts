const API_BASE = 'http://localhost:3000';

export interface Client {
  id: string;
  name: string;
  email: string;
  baseUrl: string | null;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  key?: string;
  keyPrefix: string;
  clientId: string;
  isActive: boolean;
  rateLimit: number;
  createdAt: string;
}

export async function getClients(): Promise<Client[]> {
  const res = await fetch(`${API_BASE}/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function createClient(data: { name: string; email: string; baseUrl?: string }): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create client');
  }
  return res.json();
}

export async function createApiKey(clientId: string, rateLimit?: number): Promise<ApiKey> {
  const res = await fetch(`${API_BASE}/clients/${clientId}/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rateLimit }),
  });
  if (!res.ok) throw new Error('Failed to create API key');
  return res.json();
}

export async function getAnalytics(apiKey: string) {
  const res = await fetch(`${API_BASE}/analytics/summary`, {
    headers: { 'X-API-Key': apiKey },
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}
