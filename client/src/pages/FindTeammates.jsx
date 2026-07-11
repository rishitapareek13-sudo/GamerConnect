import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

function ScoreBar({ label, score, max }) {
  const percent = (score / max) * 100;
  return (
    <div className="mb-1.5">
      <div className="flex justify-between text-[10px] font-mono text-text-onCreamMuted mb-0.5">
        <span>{label}</span>
        <span>{score}/{max}</span>
      </div>
      <div className="w-full bg-cream-row h-1.5">
        <div className="bg-accent h-1.5" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function PlayerCard({ player }) {
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(player.requestStatus);

  const handleSendRequest = async () => {
    setSending(true);
    try {
      await api.post('/requests', { to: player.id, game: player.game.name });
      setStatus('pending');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  const buttonLabel = {
    accepted: 'Teammates ✓',
    pending: 'Request Sent',
    rejected: 'Send Request',
  }[status] || 'Send Request';

  const isDisabled = sending || status === 'accepted' || status === 'pending';

  return (
    <div className="bg-cream clip-hud p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-accent-soft border border-accent flex items-center justify-center text-accent text-xs font-mono">
            {player.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-text-onCream text-sm font-medium">{player.username}</div>
            <div className="text-text-onCreamMuted text-xs font-mono">
              {player.game.rank} · {player.game.role}
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-accent font-mono text-sm font-medium"
        >
          {player.matchPercent}%
        </button>
      </div>

      <div className="text-text-onCreamMuted text-xs mb-3">
        {player.region} · {player.availability}
      </div>

      {expanded && (
        <div className="bg-cream-row p-3 mb-3">
          <div className="text-[10px] font-mono text-text-onCreamMuted mb-2">MATCH BREAKDOWN</div>
          {Object.values(player.breakdown).map((b) => (
            <ScoreBar key={b.label} label={b.label} score={b.score} max={b.max} />
          ))}
        </div>
      )}

      <button
        onClick={handleSendRequest}
        disabled={isDisabled}
        className="w-full clip-hud bg-accent text-white text-sm font-medium py-2 disabled:opacity-60"
      >
        {sending ? 'Sending...' : buttonLabel}
      </button>
    </div>
  );
}

export default function FindTeammates() {
  const [game, setGame] = useState('Valorant');
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/matches?game=${encodeURIComponent(game)}`);
      setPlayers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-shell">
      <Navbar />

      <div className="p-6">
        <h1 className="text-text-onDark text-xl font-medium mb-1">Find Teammates</h1>
        <p className="text-text-onDarkMuted text-sm mb-6">
          Click a match % to see exactly why it's a good fit.
        </p>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="bg-shell-panel text-text-onDark px-3 py-2 outline-none clip-hud"
            placeholder="Game name"
          />
          <button
            onClick={fetchMatches}
            className="clip-hud bg-accent text-white px-4 py-2 text-sm font-medium"
          >
            Search
          </button>
        </div>

        {loading && <p className="text-text-onDarkMuted text-sm">Loading matches...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && players.length === 0 && (
          <p className="text-text-onDarkMuted text-sm">
            No matches found — try a different game, or make sure your profile is set up.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
}