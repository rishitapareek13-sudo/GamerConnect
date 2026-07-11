import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import TeamChat from '../components/TeamChat';

function GapPanel({ teamId }) {
  const [gaps, setGaps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const fetchGaps = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/teams/${teamId}/gaps`);
      setGaps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGaps();
  }, [teamId]);

  const handleAdd = async (userId) => {
    setAddingId(userId);
    try {
      await api.post(`/teams/${teamId}/add-member`, { userId });
      fetchGaps();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <p className="text-text-onDarkMuted text-sm">Analyzing team...</p>;
  if (!gaps) return null;

  return (
    <div className="bg-shell-panel clip-hud p-4">
      <p className="text-text-onDark text-sm font-medium mb-2">Team gap analysis</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(gaps.roleCounts).map(([role, count]) => (
          <div
            key={role}
            className={`text-[11px] font-mono px-2 py-1 clip-hud ${
              count === 0 ? 'bg-red-500/20 text-red-300' : 'bg-cream text-text-onCream'
            }`}
          >
            {role}: {count}
          </div>
        ))}
      </div>

      {gaps.needed.length > 0 && (
        <p className="text-text-onDarkMuted text-xs mb-3">
          Your team needs: <span className="text-accent font-medium">{gaps.needed.join(', ')}</span>
        </p>
      )}

      <div className="flex flex-col gap-2">
        {gaps.suggestions.length === 0 && (
          <p className="text-text-onDarkMuted text-xs">No matching players found for the missing role right now.</p>
        )}
        {gaps.suggestions.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-shell px-3 py-2">
            <div>
              <span className="text-text-onDark text-xs">{s.username}</span>
              <span className="text-text-onDarkMuted text-xs font-mono ml-2">
                {s.game.role} · {s.game.rank}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent text-xs font-mono">{s.matchPercent}%</span>
              <button
                onClick={() => handleAdd(s.id)}
                disabled={addingId === s.id}
                className="bg-accent text-white text-[11px] px-2 py-1 clip-hud disabled:opacity-60"
              >
                {addingId === s.id ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [game, setGame] = useState('Valorant');
  const [region, setRegion] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teams/my-teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/teams', { name, game, region });
      setShowCreate(false);
      setName('');
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-shell">
      <Navbar />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-text-onDark text-xl font-medium">My Teams</h1>
            <p className="text-text-onDarkMuted text-sm">
              See who's missing from your squad and who fits.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="clip-hud bg-accent text-white text-sm font-medium px-4 py-2"
          >
            + New Team
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="bg-cream clip-hud p-4 mb-6 flex gap-3 items-end flex-wrap">
            <div>
              <label className="text-xs font-mono text-text-onCreamMuted">TEAM NAME</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="block mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-mono text-text-onCreamMuted">GAME</label>
              <input value={game} onChange={(e) => setGame(e.target.value)} required
                className="block mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="text-xs font-mono text-text-onCreamMuted">REGION</label>
              <input value={region} onChange={(e) => setRegion(e.target.value)}
                className="block mt-1 bg-cream-row px-3 py-2 text-text-onCream outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <button type="submit" disabled={creating}
              className="clip-hud bg-accent text-white text-sm font-medium px-4 py-2 disabled:opacity-60">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
        )}

        {loading && <p className="text-text-onDarkMuted text-sm">Loading teams...</p>}
        {!loading && teams.length === 0 && (
          <p className="text-text-onDarkMuted text-sm">You're not part of any team yet — create one above.</p>
        )}

        <div className="flex flex-col gap-4">
          {teams.map((team) => (
            <div key={team._id} className="bg-cream clip-hud p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-text-onCream text-sm font-medium">{team.name}</div>
                  <div className="text-text-onCreamMuted text-xs font-mono">
                    {team.game} · {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === team._id ? null : team._id)}
                  className="text-accent text-sm font-medium"
                >
                  {expandedId === team._id ? 'Hide gaps' : 'View gaps'}
                </button>
              </div>

             {expandedId === team._id && (
                <>
                  <GapPanel teamId={team._id} />
                  <div className="mt-4">
                    <TeamChat teamId={team._id} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}