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

// === Wait until the DOM is ready ===
document.addEventListener('DOMContentLoaded', () => {
  // --- Init Firebase ---
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.database();

  // --- Google Login ---
  const googleLoginBtn = document.getElementById('google-login-btn');
  const loginMessage = document.getElementById('login-message');

  if (googleLoginBtn) {
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
  }

  // --- Check Registration ---
  function checkUserRegistration(user) {
    const registrationSection = document.getElementById('registration-section');
    const userSection = document.getElementById('user-section');

    db.ref(`Games/${user.uid}`).once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          registrationSection.style.display = 'none';
          userSection.style.display = 'block';
          document.getElementById('username').textContent =
            snapshot.val().selectedGame || user.displayName || user.email;
        } else {
          registrationSection.style.display = 'block';
          userSection.style.display = 'none';
        }
      });
  }

  // --- Registration Form ---
  const registrationForm = document.getElementById('registration-form');
  const registrationError = document.getElementById('registration-error');

  if (registrationForm) {
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
        displayName: user.displayName,
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
  }

  // --- Logout ---
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut()
        .then(() => {
          loginMessage.textContent = "👋 Logged out successfully!";
          document.getElementById('user-section').style.display = 'none';
          document.getElementById('registration-section').style.display = 'none';
          document.getElementById('login-section').style.display = 'block';
        })
        .catch(err => {
          loginMessage.textContent = "❌ Error logging out.";
          console.error(err);
        });
    });
  }

  // --- Save Score ---
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

    return db.ref(`Scores/${gameName}/${user.uid}`).set(scoreData)
      .then(() => console.log(`✅ Score saved for ${gameName}!`))
      .catch(err => console.error(`❌ Error saving score for ${gameName}:`, err));
  }

  window.onGameOver = function (finalScore) {
    writeScore("AppleAttack", finalScore);
  };

  window.saveScoreAppleAttack = function (score) {
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
  };

  // --- Read All Scores ---
  window.readAllScores = function () {
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

        scoreList.sort((a, b) => b.score - a.score);

        console.log("🏆 Overall leaderboard (all games combined):");
        scoreList.forEach((entry, index) => {
          console.log(`${index + 1}. ${entry.name} - ${entry.score} pts [${entry.game}] at ${entry.time}`);
        });

      })
      .catch(err => console.error("❌ Error reading scores:", err));
  };

  // --- Auth state (keep user logged in) ---
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("[Auth State] Logged in as:", user.displayName || user.email);
      checkUserRegistration(user);
    } else {
      console.log("[Auth State] Not logged in.");
      document.getElementById('login-section').style.display = 'block';
      document.getElementById('registration-section').style.display = 'none';
      document.getElementById('user-section').style.display = 'none';
    }
  });
});
