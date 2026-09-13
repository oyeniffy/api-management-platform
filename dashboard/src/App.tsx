import { useState, useEffect } from 'react';
import { getClients, createClient, createApiKey, type Client, type ApiKey } from './lib/api';
import './App.css';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createClient({ name, email, baseUrl: baseUrl || undefined });
      setName('');
      setEmail('');
      setBaseUrl('');
      await loadClients();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleGenerateKey(clientId: string) {
    try {
      setGeneratingFor(clientId);
      const key = await createApiKey(clientId);
      setNewKey(key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingFor(null);
    }
  }

  return (
    <div className="app">
      <h1>API Management Platform</h1>
      <p className="subtitle">Developer portal</p>

      {error && <div className="error">{error}</div>}

      {newKey && (
        <div className="key-banner">
          <strong>New API key generated — copy it now, it won't be shown again:</strong>
          <code>{newKey.key}</code>
          <button onClick={() => setNewKey(null)}>Dismiss</button>
        </div>
      )}

      <section className="card">
        <h2>Register a new client</h2>
        <form onSubmit={handleCreateClient}>
          <input
            placeholder="Client name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Backend base URL (optional)"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <button type="submit">Register client</button>
        </form>
      </section>

      <section className="card">
        <h2>Clients</h2>
        {loading && <p>Loading...</p>}
        {!loading && clients.length === 0 && <p>No clients yet.</p>}
        <ul className="client-list">
          {clients.map((client) => (
            <li key={client.id} className="client-item">
              <div>
                <strong>{client.name}</strong>
                <span className="muted"> {client.email}</span>
                <div className="muted small">{client.baseUrl || 'No backend URL set'}</div>
              </div>
              <button
                onClick={() => handleGenerateKey(client.id)}
                disabled={generatingFor === client.id}
              >
                {generatingFor === client.id ? 'Generating...' : 'Generate API key'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
