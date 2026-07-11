const ALL_ROLES = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];

// Given a team's current members, figure out which roles are missing or under-represented
function detectGaps(members) {
  const roleCounts = {};
  ALL_ROLES.forEach((r) => (roleCounts[r] = 0));

  members.forEach((m) => {
    if (roleCounts[m.role] !== undefined) {
      roleCounts[m.role]++;
    }
  });

  // Missing roles = 0 count. Under-represented = fewer than others.
  const missing = ALL_ROLES.filter((r) => roleCounts[r] === 0);
  const minCount = Math.min(...Object.values(roleCounts));
  const needed = missing.length > 0 ? missing : ALL_ROLES.filter((r) => roleCounts[r] === minCount);

  return { roleCounts, needed };
}

module.exports = { detectGaps, ALL_ROLES };