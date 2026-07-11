import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function MyRequests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        api.get('/requests/incoming'),
        api.get('/requests/outgoing'),
      ]);
      setIncoming(inc.data);
      setOutgoing(out.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const respond = async (id, status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-shell">
      <Navbar />

      <div className="p-6">
        <h1 className="text-text-onDark text-xl font-medium mb-6">My Requests</h1>

        {loading && <p className="text-text-onDarkMuted text-sm">Loading...</p>}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-text-onDark text-sm font-medium mb-3">Incoming</h2>
            {!loading && incoming.length === 0 && (
              <p className="text-text-onDarkMuted text-sm">No incoming requests.</p>
            )}
            <div className="flex flex-col gap-3">
              {incoming.map((r) => (
                <div key={r._id} className="bg-cream clip-hud p-4">
                  <div className="text-text-onCream text-sm font-medium">{r.from.username}</div>
                  <div className="text-text-onCreamMuted text-xs font-mono mb-3">{r.game}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(r._id, 'accepted')}
                      className="flex-1 clip-hud bg-accent text-white text-xs font-medium py-1.5"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(r._id, 'rejected')}
                      className="flex-1 clip-hud bg-cream-row text-text-onCream text-xs font-medium py-1.5"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-text-onDark text-sm font-medium mb-3">Outgoing</h2>
            {!loading && outgoing.length === 0 && (
              <p className="text-text-onDarkMuted text-sm">No outgoing requests.</p>
            )}
            <div className="flex flex-col gap-3">
              {outgoing.map((r) => (
                <div key={r._id} className="bg-shell-panel clip-hud p-4">
                  <div className="text-text-onDark text-sm font-medium">{r.to.username}</div>
                  <div className="text-text-onDarkMuted text-xs font-mono">{r.game}</div>
                  <div className="text-xs font-mono mt-2 text-accent capitalize">{r.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}