// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyB5B5P_sSmNTN7RjkaV-I2TKNUJWj0cF1A",
  authDomain: "comp-2025-carmen-o-grady.firebaseapp.com",
  databaseURL: "https://comp-2025-carmen-o-grady-default-rtdb.firebaseio.com",
  projectId: "comp-2025-carmen-o-grady",
  storageBucket: "comp-2025-carmen-o-grady.appspot.com",
  messagingSenderId: "1046417795904",
  appId: "1:1046417795904:web:25cff308e04c73eb5968a5",
  measurementId: "G-BGRNW3X6K8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Save a score for a game (multiple scores allowed per user)
function writeScore(gameName, score) {
  const user = auth.currentUser;
  if (!user) {
    alert("⚠️ You need to be logged in to save your score!");
    return;
  }

  const scoreData = {
    name: user.displayName || user.email || "Anonymous",
    score: Number(score),
    timestamp: Date.now()
  };

  // Push new score under Scores/{gameName}/{userId}/
  return db.ref(`Scores/${gameName}/${user.uid}`).push(scoreData)
    .then(() => console.log(`✅ Score saved for ${gameName}!`))
    .catch(err => console.error(`❌ Error saving score for ${gameName}:`, err));
}

// Read leaderboard for a game and pass sorted array to callback
function readLeaderboard(gameName, callback) {
  db.ref(`Scores/${gameName}`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        callback([]); // No scores yet
        return;
      }

      const scores = [];

      // Flatten all user scores for the game
      for (const userId in data) {
        const userScores = data[userId];
        for (const scoreId in userScores) {
          const s = userScores[scoreId];
          scores.push({
            name: s.name || "Anonymous",
            score: Number(s.score),
            timestamp: s.timestamp
          });
        }
      }

      // Sort descending by score
      scores.sort((a, b) => b.score - a.score);

      callback(scores);
    })
    .catch(err => {
      console.error("❌ Error loading leaderboard:", err);
      callback([]);
    });
}

