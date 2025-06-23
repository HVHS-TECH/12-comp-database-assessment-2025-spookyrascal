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

// Initialize Firebase (only if not already initialized)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.database();

// --- Save score specifically for AppleAttack ---
function saveAppleAttackScore(score) {
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

  // Save under Scores/AppleAttack/{userId}/
  return db.ref(`Scores/AppleAttack/${user.uid}`).push(scoreData)
    .then(() => console.log("✅ AppleAttack score saved!"))
    .catch(err => console.error("❌ Error saving AppleAttack score:", err));
}

// --- Read AppleAttack leaderboard ---
function getAppleAttackLeaderboard(callback) {
  db.ref("Scores/AppleAttack").once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      const scores = [];

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

      // Sort from highest to lowest
      scores.sort((a, b) => b.score - a.score);
      callback(scores);
    })
    .catch(err => {
      console.error("❌ Error loading AppleAttack leaderboard:", err);
      callback([]);
    });
}
