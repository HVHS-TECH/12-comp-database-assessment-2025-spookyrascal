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
      // Show registration if needed
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
        // User info exists, show user section
        registrationSection.style.display = 'none';
        userSection.style.display = 'block';
        document.getElementById('username').textContent = snapshot.val().selectedGame || user.displayName || user.email;
      } else {
        // Show registration form
        registrationSection.style.display = 'block';
        userSection.style.display = 'none';
      }
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

  const gameName = document.getElementById('gameName').value.trim();
  const age = document.getElementById('age').value.trim();

  if (!gameName || !age) {
    registrationError.textContent = "⚠️ Please fill all info fields!";
    return;
  }

  const userData = {
    displayName: user.displayName,
    email: user.email,
    age: parseInt(age, 10),
    selectedGame: gameName,
    timestamp: Date.now()
  };

  db.ref(`Games/${user.uid}`).set(userData)
    .then(() => {
      registrationError.textContent = "";
      document.getElementById('registration-section').style.display = 'none';
      document.getElementById('user-section').style.display = 'block';
      document.getElementById('username').textContent = gameName;
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
      // Reset UI to login screen
      document.getElementById('user-section').style.display = 'none';
      document.getElementById('registration-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'block';
    })
    .catch(err => {
      loginMessage.textContent = "❌ Error logging out.";
      console.error(err);
    });
});

// --- Read all scores from all users ---
function readAllScores() {
  db.ref('Scores').once('value')
    .then(snapshot => {
      const scores = snapshot.val();
      if (!scores) {
        console.log("No scores found!");
        return;
      }

      const scoreList = [];

      for (const userId in scores) {
        const userScores = scores[userId];
        for (const scoreId in userScores) {
          const s = userScores[scoreId];
          scoreList.push({
            name: s.name,
            score: s.score,
            game: s.gameName,
            time: new Date(s.timestamp).toLocaleString()
          });
        }
      }

      scoreList.sort((a, b) => b.score - a.score);

      // You can add leaderboard UI updates here if you want
      console.log(scoreList); // For now just console.log
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
    // Check if user registered their details or show registration form
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

// --- Save a score under Scores/<UID>/ ---
function writeScore(gameName, score) {
  const user = auth.currentUser;
  if (!user) {
    alert("⚠️ You need to be logged in to save your score!");
    return;
  }

  const scoreData = {
    name: user.displayName || "Anonymous",
    score: score,
    gameName: gameName,
    timestamp: Date.now()
  };

  return db.ref(`Scores/${user.uid}`).push(scoreData)
    .then(() => console.log("✅ Score saved!"))
    .catch(err => console.error("❌ Error saving score:", err));
}

// --- Called when a game finishes to save score ---
function onGameOver(finalScore) {
  const gameName = "Meteor Rush";
  writeScore(gameName, finalScore);
}

