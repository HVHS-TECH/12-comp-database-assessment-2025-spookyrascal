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

// Initialize Firebase once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

// --- Save MeteorRush score ---
function saveMeteorRushScore(score) {
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

  // Save score directly under Scores/MeteorRush/
  return db.ref('Scores/MeteorRush').push(scoreData)
    .then(() => console.log("✅ MeteorRush score saved!"))
    .catch(err => console.error("❌ Error saving MeteorRush score:", err));
}

// --- Fetch MeteorRush leaderboard ---
function getMeteorRushLeaderboard(callback) {
  db.ref("Scores/MeteorRush").once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      // Map over all scores directly (flat structure)
      const scores = Object.values(data).map(s => ({
        name: s.name || "Anonymous",
        score: Number(s.score),
        timestamp: s.timestamp
      }));

      // Sort descending by score
      scores.sort((a, b) => b.score - a.score);

      callback(scores);
    })
    .catch(err => {
      console.error("❌ Error loading MeteorRush leaderboard:", err);
      callback([]);
    });
}
