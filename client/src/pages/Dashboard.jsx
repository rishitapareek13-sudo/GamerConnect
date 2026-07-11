import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import api from '../api/axios';

function StatCard({ label, value, highlight = false }) {
  return (
    <div className={`clip-hud p-3 font-mono ${highlight ? 'bg-accent text-white' : 'bg-cream text-text-onCream'}`}>
      <div className={`text-[11px] ${highlight ? 'text-white/70' : 'text-text-onCreamMuted'}`}>
        {label}
      </div>
      <div className="text-2xl font-medium mt-1">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
const [loadingSuggestions, setLoadingSuggestions] = useState(true);

useEffect(() => {
  const game = user?.games?.[0]?.name;
  if (!game) {
    setLoadingSuggestions(false);
    return;
  }
  api.get(`/matches?game=${encodeURIComponent(game)}`)
    .then((res) => setSuggestions(res.data.slice(0, 3)))
    .catch(() => setSuggestions([]))
    .finally(() => setLoadingSuggestions(false));
}, [user]);
  const winRate = user?.matchesPlayed
    ? Math.round((user.matchesWon / user.matchesPlayed) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-shell">
      <Navbar />

      <div className="p-6">
        <h1 className="text-text-onDark text-xl font-medium">
          Welcome back, <span className="text-accent">{user?.username}</span>
        </h1>
        <p className="text-text-onDarkMuted text-sm mb-6">Ready to dominate?</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="MATCHES PLAYED" value={user?.matchesPlayed ?? 0} />
          <StatCard label="MATCHES WON" value={user?.matchesWon ?? 0} />
          <StatCard label="WIN RATE" value={`${winRate}%`} highlight />
          <StatCard label="REPUTATION" value={user?.reputation ?? 0} />
        </div>

        <div className="bg-shell-panel clip-hud p-4">
  <p className="text-text-onDark text-sm font-medium mb-3">Suggested players</p>

  {loadingSuggestions && (
    <p className="text-text-onDarkMuted text-sm">Loading...</p>
  )}

  {!loadingSuggestions && !user?.games?.[0]?.name && (
    <p className="text-text-onDarkMuted text-sm">
      Set up your profile to see suggested teammates.
    </p>
  )}

  {!loadingSuggestions && suggestions.length === 0 && user?.games?.[0]?.name && (
    <p className="text-text-onDarkMuted text-sm">No matches found yet.</p>
  )}

  <div className="flex flex-col gap-2">
    {suggestions.map((s) => (
      <div key={s.id} className="flex items-center justify-between bg-cream px-3 py-2 clip-hud">
        <div>
          <span className="text-text-onCream text-xs font-medium">{s.username}</span>
          <span className="text-text-onCreamMuted text-xs font-mono ml-2">
            {s.game.rank} · {s.game.role}
          </span>
        </div>
        <span className="text-accent text-xs font-mono">{s.matchPercent}%</span>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}