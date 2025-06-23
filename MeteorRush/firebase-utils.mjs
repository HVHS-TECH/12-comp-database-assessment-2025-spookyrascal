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

// Get references to DOM elements (if they exist)
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginMessage = document.getElementById('login-message');

// Google login handler
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(result => {
        if (loginMessage) {
          loginMessage.textContent = "✅ Logged in as " + (result.user.displayName || result.user.email);
        }
      })
      .catch(error => {
        if (loginMessage) {
          loginMessage.textContent = "❌ " + error.message;
        }
      });
  });
}

// Logout handler
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        if (loginMessage) {
          loginMessage.textContent = "👋 Logged out successfully!";
        }
      })
      .catch(err => {
        if (loginMessage) {
          loginMessage.textContent = "❌ Error logging out.";
        }
        console.error(err);
      });
  });
}

// Save score for a game
function writeScore(gameName, score) {
  const user = auth.currentUser;
  if (!user) {
    alert("⚠️ You need to be logged in to save your score!");
    return;
  }

  const scoreData = {
    name: user.displayName || "Anonymous",
    score: score,
    timestamp: Date.now()
  };

  // Save score under Scores/{gameName}/{userId}
  return db.ref(`Scores/${gameName}/${user.uid}`).set(scoreData)
    .then(() => console.log(`✅ Score saved for ${gameName}!`))
    .catch(err => console.error(`❌ Error saving score for ${gameName}:`, err));
}

// Read leaderboard for a game, with a callback to handle data
function readLeaderboard(gameName, callback) {
  db.ref(`Scores/${gameName}`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        callback([]);
        return;
      }

      const scores = Object.values(data)
        .map(entry => ({
          name: entry.name || "Anonymous",
          score: Number(entry.score),
          timestamp: entry.timestamp
        }))
        .sort((a, b) => b.score - a.score);

      callback(scores);
    })
    .catch(err => {
      console.error("❌ Error loading leaderboard:", err);
      callback([]);
    });
}
