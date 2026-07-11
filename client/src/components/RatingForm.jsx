import { useState } from 'react';
import api from '../api/axios';

export default function RatingForm({ onDone }) {
  const [toUsername, setToUsername] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Simple approach: user pastes teammate's username, we look up their ID via matches wouldn't work here,
  // so instead let's just accept a raw user ID for now (simplest working version)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/reviews', { to: toUserId, rating: Number(rating), comment });
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-cream clip-hud p-3 mb-3 flex flex-col gap-2">
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <input
        placeholder="Teammate's user ID"
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
        required
        className="bg-cream-row px-2 py-1.5 text-xs text-text-onCream outline-none"
      />
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="bg-cream-row px-2 py-1.5 text-xs text-text-onCream outline-none"
      >
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>)}
      </select>
      <input
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="bg-cream-row px-2 py-1.5 text-xs text-text-onCream outline-none"
      />
      <button type="submit" disabled={saving} className="bg-accent text-white text-xs font-medium py-1.5 disabled:opacity-60">
        {saving ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  );
}