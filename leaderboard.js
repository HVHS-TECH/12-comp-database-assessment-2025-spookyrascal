// leaderboard.js
import { fb_writeRec, fb_getTopScores } from './firebase.mjs';
import { signOutUser } from '../firebase.mjs';

// Safely get DOM elements
function getLeaderboardBody() {
  return document.getElementById('leaderboard-body');
}

function getGameSelect() {
  return document.getElementById('game-select');
}

// 🔄 Update leaderboard with current top scores
export async function updateLeaderboard() {
  const leaderboardBody = getLeaderboardBody();
  const gameSelect = getGameSelect();

  if (!leaderboardBody || !gameSelect) {
    console.warn("Leaderboard DOM elements not found.");
    return;
  }

  const gameName = gameSelect.value;

  try {
    const scores = await fb_getTopScores(gameName);
    leaderboardBody.innerHTML = ''; // Clear previous content

    if (!scores.length) {
      leaderboardBody.innerHTML = `<tr><td colspan="3">No scores yet.</td></tr>`;
      return;
    }

    // Use a Map to group scores by display name
    const groupedScores = new Map();

    scores.forEach(entry => {
      const name = entry.name;
      if (!groupedScores.has(name)) {
        groupedScores.set(name, []);
      }
      groupedScores.get(name).push(entry.score);
    });

    // Calculate highest score for each name
    const mergedScores = Array.from(groupedScores.entries()).map(([name, scores]) => ({
      name,
      score: Math.max(...scores)
    }));

    // Sort highest scores descending
    mergedScores.sort((a, b) => b.score - a.score);

    // Populate table
    mergedScores.slice(0, 10).forEach((entry, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(entry.name)}</td>
        <td>${entry.score}</td>
      `;
      leaderboardBody.appendChild(tr);
    });

  } catch (err) {
    console.error("🔥 Error loading leaderboard:", err);
    leaderboardBody.innerHTML = `<tr><td colspan="3">Failed to load scores.</td></tr>`;
  }
}

// 🛡️ Sanitize player name text to avoid HTML injection
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m])
  );
}

// 📝 Submit new score
export async function submitScore(gameName, playerName, playerScore) {
  try {
    await fb_writeRec(gameName, playerName, playerScore);
    console.log(`🎯 Score submitted: ${playerName} - ${playerScore}`);
  } catch (err) {
    console.error("❌ Failed to submit score:", err);
    throw err;
  }
}
