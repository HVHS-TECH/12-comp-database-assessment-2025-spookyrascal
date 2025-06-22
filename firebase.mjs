// =====================
// 🔥 Firebase Config & Init
// =====================
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

// =====================
// 🔐 Google Login
// =====================
const googleLoginBtn = document.getElementById('google-login-btn');
const loginMessage = document.getElementById('login-message');

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => {
    console.log("[Login] Google login button clicked");
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        console.log("[Login] Login successful:", result.user.displayName || result.user.email);
        loginMessage.textContent = "✅ Logged in as " + (result.user.displayName || result.user.email);
        checkUserRegistration(result.user);
      })
      .catch(error => {
        console.error("[Login] Login error:", error.message);
        loginMessage.textContent = "❌ " + error.message;
      });
  });
}

// =====================
// 🧾 Check Registration
// =====================
function checkUserRegistration(user) {
  console.log("[Check Registration] Checking registration for user:", user.uid);
  const registrationSection = document.getElementById('registration-section');
  const userSection = document.getElementById('user-section');

  db.ref(`Games/${user.uid}`).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        console.log("[Check Registration] User is registered");
        registrationSection.style.display = 'none';
        userSection.style.display = 'block';
        document.getElementById('username').textContent = snapshot.val().selectedGame || user.displayName || user.email;
      } else {
        console.log("[Check Registration] User not registered, showing registration form");
        registrationSection.style.display = 'block';
        userSection.style.display = 'none';
      }
    })
    .catch(err => {
      console.error("[Check Registration] Error checking registration:", err);
    });
}

// =====================
// 📝 Handle Registration Form
// =====================
const registrationForm = document.getElementById('registration-form');
const registrationError = document.getElementById('registration-error');

if (registrationForm) {
  registrationForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log("[Registration] Form submitted");

    const user = auth.currentUser;
    if (!user) {
      console.warn("[Registration] No user logged in");
      registrationError.textContent = "⚠️ Please log in first!";
      return;
    }

    const displayName = document.getElementById('displayName').value.trim();
    const age = document.getElementById('age').value.trim();

    if (!displayName || !age) {
      console.warn("[Registration] Missing fields");
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
        console.log("[Registration] User data saved successfully");
        registrationError.textContent = "";
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        document.getElementById('username').textContent = displayName;
      })
      .catch(err => {
        console.error("[Registration] Error saving user data:", err);
        registrationError.textContent = "❌ Error saving info.";
      });
  });
}

// =====================
// 🚪 Logout
// =====================
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log("[Logout] Logout button clicked");
    auth.signOut()
      .then(() => {
        console.log("[Logout] Logged out successfully");
        loginMessage.textContent = "👋 Logged out successfully!";
        document.getElementById('user-section').style.display = 'none';
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
      })
      .catch(err => {
        console.error("[Logout] Error logging out:", err);
        loginMessage.textContent = "❌ Error logging out.";
      });
  });
}

// =====================
// 🎮 Game Navigation
// =====================
function goToGame(url) {
  console.log("[Game Navigation] Navigating to:", url);
  const user = auth.currentUser;
  if (user) {
    const userData = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
    localStorage.setItem("firebaseUser", JSON.stringify(userData));
  }
  window.location.href = url;
}

// =====================
// 🏆 Leaderboard
// =====================
const leaderboardBtn = document.getElementById("leaderboard-btn");
if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", () => {
    document.getElementById("leaderboard-section").style.display = 'block';
    updateLeaderboard();
  });
}

function hideLeaderboard() {
  document.getElementById("leaderboard-section").style.display = 'none';
}

function updateLeaderboard() {
  const game = document.getElementById("game-select").value;
  const leaderboardBody = document.getElementById("leaderboard-body");
  leaderboardBody.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;

  db.ref(`Scores/${game}`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        leaderboardBody.innerHTML = `<tr><td colspan="3">No scores yet!</td></tr>`;
        return;
      }

      const scores = Object.values(data).map(entry => ({
        name: entry.name || entry.Name || "Anonymous",
        score: Number(entry.score || entry.Score || 0),
      }));

      scores.sort((a, b) => b.score - a.score);

      leaderboardBody.innerHTML = scores.slice(0, 10).map((entry, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td>${entry.name}</td>
          <td style="text-align: right;">${entry.score}</td>
        </tr>
      `).join('');
    })
    .catch(err => {
      console.error("❌ Error loading leaderboard:", err);
      leaderboardBody.innerHTML = `<tr><td colspan="3">Error loading scores</td></tr>`;
    });
}

// =====================
// 🔄 Keep user logged in on page load
// =====================
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("[Auth State] User is logged in:", user.displayName || user.email);
    checkUserRegistration(user);
  } else {
    console.log("[Auth State] No user logged in");
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('registration-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'none';
  }
});

