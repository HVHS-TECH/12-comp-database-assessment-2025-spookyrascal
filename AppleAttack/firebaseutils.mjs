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

// --- Firebase init ---
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- Google Login ---
const googleLoginBtn = document.getElementById('google-login-btn');
const loginMessage = document.getElementById('login-message');

googleLoginBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      loginMessage.textContent = "✅ Logged in as " + (result.user.displayName || result.user.email);
      checkUserRegistration(result.user);
    })
    .catch(error => {
      loginMessage.textContent = "❌ " + error.message;
    });
});

// --- Check if user has registered their details ---
function checkUserRegistration(user) {
  const registrationSection = document.getElementById('registration-section');
  const userSection = document.getElementById('user-section');

  db.ref(`Games/${user.uid}`).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        registrationSection.style.display = 'none';
        userSection.style.display = 'block';
        // Show selectedGame (like "Apple Attack") or fallback to user displayName/email
        document.getElementById('username').textContent = snapshot.val().selectedGame || user.displayName || user.email;
      } else {
        registrationSection.style.display = 'block';
        userSection.style.display = 'none';
      }
    })
    .catch(err => {
      console.error("❌ Error checking registration:", err);
    });
}

// --- Registration form submit ---
const registrationForm = document.getElementById('registration-form');
const registrationError = document.getElementById('registration-error');

registrationForm.addEventListener('submit', e => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    registrationError.textContent = "⚠️ Please log in first!";
    return;
  }

  const displayName = document.getElementById('displayName').value.trim();
  const age = document.getElementById('age').value.trim();

  if (!displayName || !age) {
    registrationError.textContent = "⚠️ Please fill all info fields!";
    return;
  }

  const userData = {
    displayName: user.displayName || displayName,
    email: user.email,
    age: parseInt(age, 10),
    selectedGame: displayName,
    timestamp: Date.now()
  };

  db.ref(`Games/${user.uid}`).set(userData)
    .then(() => {
      registrationError.textContent = "";
      document.getElementById('registration-section').style.display = 'none';
      document.getElementById('user-section').style.display = 'block';
      document.getElementById('username').textContent = displayName;
    })
    .catch(err => {
      console.error("❌ Error saving user data:", err);
      registrationError.textContent = "❌ Error saving info.";
    });
});

// --- Logout ---
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      loginMessage.textContent = "👋 Logged out successfully!";
      document.getElementById('user-section').style.display = 'none';
      document.getElementById('registration-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'block';
      document.getElementById('username').textContent = '';
    })
    .catch(err => {
      loginMessage.textContent = "❌ Error logging out.";
      console.error(err);
    });
});

// --- Read all scores from all games & all users ---
function readAllScores() {
  db.ref('Scores').once('value')
    .then(snapshot => {
      const scoresData = snapshot.val();
      if (!scoresData) {
        console.log("No scores found!");
        return;
      }

      const scoreList = [];

      // Loop through all games (e.g. AppleAttack, MeteorRush)
      for (const gameName in scoresData) {
        const gameScoresByUser = scoresData[gameName];

        // gameScoresByUser is an object with user IDs as keys
        for (const userId in gameScoresByUser) {
          const userScores = gameScoresByUser[userId];
          // userScores is an object of pushed scores with unique IDs
          for (const scoreId in userScores) {
            const s = userScores[scoreId];
            scoreList.push({
              name: s.name,
              score: Number(s.score), // ensure number
              game: gameName,
              time: new Date(s.timestamp).toLocaleString()
            });
          }
        }
      }

      // Sort scores descending
      scoreList.sort((a, b) => b.score - a.score);

      console.log(scoreList); // You can display this in your leaderboard UI
    })
    .catch(err => console.error("❌ Error reading scores:", err));
}

// --- Auth state listener to toggle UI ---
auth.onAuthStateChanged(user => {
  const loginSection = document.getElementById('login-section');
  const userSection = document.getElementById('user-section');
  const registrationSection = document.getElementById('registration-section');
  const usernameSpan = document.getElementById('username');

  if (user) {
    loginSection.style.display = 'none';
    checkUserRegistration(user);
  } else {
    loginSection.style.display = 'block';
    registrationSection.style.display = 'none';
    userSection.style.display = 'none';
    usernameSpan.textContent = '';
  }
});

// --- Navigate to a game page ---
function goToGame(path) {
  window.location.href = path;
}

// --- Save a score for a specific game ---
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

  // Save under Scores/{gameName}/{userId}
  return db.ref(`Scores/${gameName}/${user.uid}`).set(scoreData)
    .then(() => console.log(`✅ Score saved for ${gameName}!`))
    .catch(err => console.error(`❌ Error saving score for ${gameName}:`, err));
}

function onGameOver(finalScore) {
  writeScore("AppleAttack", finalScore);
}

// --- Save specifically for AppleAttack ---
function saveScoreAppleAttack(score) {
  const user = auth.currentUser;
  if (!user) {
    console.warn("❌ No user logged in! Can't save score.");
    return;
  }

  const scoreData = {
    name: user.displayName || user.email || "Unknown Player",
    score: score,
    timestamp: Date.now()
  };

  db.ref(`Scores/AppleAttack/${user.uid}`).set(scoreData)
    .then(() => {
      console.log("✅ AppleAttack score saved:", scoreData);
    })
    .catch(err => {
      console.error("❌ Error saving AppleAttack score:", err);
    });
}

// --- Read ALL scores for ALL games ---
function readAllScores() {
  db.ref('Scores').once('value')
    .then(snapshot => {
      const allScores = snapshot.val();
      if (!allScores) {
        console.log("😶 No scores found! Go get some high scores first!");
        return;
      }

      const scoreList = [];

      for (const gameName in allScores) {
        const gameScores = allScores[gameName];

        console.log(`🎮 === Scores for ${gameName} === 🎮`);

        for (const userId in gameScores) {
          const s = gameScores[userId];
          scoreList.push({
            name: s.name,
            score: Number(s.score),
            game: gameName,
            time: new Date(s.timestamp).toLocaleString()
          });

          console.log(`👾 Player: ${s.name} | Score: ${s.score} | Time: ${new Date(s.timestamp).toLocaleString()}`);
        }

        console.log(`🎉 End of ${gameName} scores\n`);
      }

      // Optional: sort combined leaderboard by score
      scoreList.sort((a, b) => b.score - a.score);

      console.log("🏆 Overall leaderboard (all games combined):");
      scoreList.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.name} - ${entry.score} pts [${entry.game}] at ${entry.time}`);
      });

    })
    .catch(err => console.error("❌ Error reading scores:", err));
}
