import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const RANKS = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal'];
const ROLES = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [gameName, setGameName] = useState('Valorant');
  const [rank, setRank] = useState('Gold');
  const [role, setRole] = useState('Duelist');
  const [region, setRegion] = useState('');
  const [availability, setAvailability] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Pre-fill form if user already has saved data
  useEffect(() => {
    if (user?.games?.length > 0) {
      setGameName(user.games[0].name || 'Valorant');
      setRank(user.games[0].rank || 'Gold');
      setRole(user.games[0].role || 'Duelist');
    }
    setRegion(user?.region || '');
    setAvailability(user?.availability || '');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await api.put('/users/me', {
        games: [{ name: gameName, rank, role }],
        region,
        availability,
      });
      setUser(res.data);
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shell">
      <Navbar />

      <div className="p-6 max-w-lg">
        <h1 className="text-text-onDark text-xl font-medium mb-1">Your Profile</h1>
        <p className="text-text-onDarkMuted text-sm mb-6">
          This info is used to find your best teammate matches.
        </p>

        <form onSubmit={handleSave} className="bg-cream clip-hud p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-mono text-text-onCreamMuted">GAME</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-text-onCreamMuted">RANK</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent"
              >
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-text-onCreamMuted">ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-text-onCreamMuted">REGION</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. India, NA, EU"
              className="w-full mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-text-onCreamMuted">AVAILABILITY</label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="e.g. Weekdays 6PM-11PM"
              className="w-full mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clip-hud bg-accent text-white font-medium py-2 mt-2 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>

          {saved && (
            <p className="text-green-700 text-sm text-center">Profile updated!</p>
          )}
        </form>
      </div>
    </div>
  );
}