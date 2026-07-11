const RANK_ORDER = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal'];

function rankScore(rankA, rankB) {
  const i = RANK_ORDER.indexOf(rankA);
  const j = RANK_ORDER.indexOf(rankB);
  if (i === -1 || j === -1) return { score: 0, max: 40 };

  const distance = Math.abs(i - j);
  // Same rank = full score, each step away loses points
  const score = Math.max(40 - distance * 10, 0);
  return { score, max: 40 };
}

function regionScore(regionA, regionB) {
  if (!regionA || !regionB) return { score: 0, max: 20 };
  const match = regionA.trim().toLowerCase() === regionB.trim().toLowerCase();
  return { score: match ? 20 : 0, max: 20 };
}

function availabilityScore(availA, availB) {
  if (!availA || !availB) return { score: 0, max: 15 };
  const a = availA.toLowerCase();
  const b = availB.toLowerCase();
  if (a === b) return { score: 15, max: 15 };

  // Partial credit if both mention weekday/weekend in common
  const tags = ['weekday', 'weekend', 'daily'];
  const shared = tags.some((t) => a.includes(t) && b.includes(t));
  return { score: shared ? 8 : 3, max: 15 };
}

function roleScore(roleA, roleB) {
  if (!roleA || !roleB) return { score: 0, max: 25 };
  // Different roles = complementary to a team, scores higher
  const complementary = roleA.toLowerCase() !== roleB.toLowerCase();
  return { score: complementary ? 25 : 10, max: 25 };
}

// currentUserGame / otherUserGame are objects like { name, rank, role }
function calculateMatch(currentUserGame, otherUserGame, currentUserRegion, otherUserRegion, currentUserAvail, otherUserAvail) {
  const rank = rankScore(currentUserGame.rank, otherUserGame.rank);
  const region = regionScore(currentUserRegion, otherUserRegion);
  const availability = availabilityScore(currentUserAvail, otherUserAvail);
  const role = roleScore(currentUserGame.role, otherUserGame.role);

  const totalScore = rank.score + region.score + availability.score + role.score;
  const totalMax = rank.max + region.max + availability.max + role.max;
  const percent = Math.round((totalScore / totalMax) * 100);

  return {
    percent,
    breakdown: {
      rank: { ...rank, label: 'Rank fit' },
      region: { ...region, label: 'Region' },
      availability: { ...availability, label: 'Availability' },
      role: { ...role, label: 'Role complement' },
    },
  };
}

module.exports = { calculateMatch, RANK_ORDER };