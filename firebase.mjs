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
      .then(result => {
        console.log("[Login] Login successful:", result.user.displayName || result.user.email);
        loginMessage.textContent = "✅ Logged in as " + (result.user.displayName || result.user.email);
        checkUserRegistration(result.user);
        showSection('games-section');
        activateNavButton('games-section');
      })
      .catch(error => {
        console.error("[Login] Login error:", error.message);
        loginMessage.textContent = "❌ " + error.message;
      });
  });
}

// =====================
// 🧾 Check User Registration
// =====================
function checkUserRegistration(user) {
  console.log("[Check Registration] Checking registration for user:", user.uid);
  const registrationSection = document.getElementById('registration-section');
  const homeSection = document.getElementById('home-section');

  db.ref(`Games/${user.uid}`).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        console.log("[Check Registration] User is registered");
        registrationSection.style.display = 'none';
        homeSection.style.display = 'none';
        showSection('games-section');
        activateNavButton('games-section');
        updateProfileDisplay(snapshot.val().selectedGame || user.displayName || "Anonymous", user.email);
      } else {
        console.log("[Check Registration] User not registered, showing registration form");
        registrationSection.style.display = 'block';
        homeSection.style.display = 'none';
        showSection('registration-section');
        activateNavButton('registration-section');
      }
    })
    .catch(err => {
      console.error("[Check Registration] Error:", err);
    });
}

// =====================
// 📝 Registration Form Handler
// =====================
const registrationForm = document.getElementById('registration-form');
const registrationError = document.getElementById('registration-error');

if (registrationForm) {
  registrationForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log("[Registration] Form submitted");

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
        console.log("[Registration] User data saved successfully");
        registrationError.textContent = "";
        showSection('games-section');
        activateNavButton('games-section');
        updateProfileDisplay(displayName, user.email);
      })
      .catch(err => {
        console.error("[Registration] Error saving user data:", err);
        registrationError.textContent = "❌ Error saving info.";
      });
  });
}

// =====================
// 🚪 Logout Handler
// =====================
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log("[Logout] Logout button clicked");
    auth.signOut()
      .then(() => {
        console.log("[Logout] Logged out successfully");
        loginMessage.textContent = "👋 Logged out successfully!";
        showSection('home-section');
        activateNavButton('home-section');
        updateProfileDisplay('Anonymous', 'Not logged in');
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
// 🏆 Leaderboard Update
// =====================
function updateLeaderboard() {
  const game = document.getElementById("game-select").value;
  const leaderboardBody = document.getElementById("leaderboard-body");
  leaderboardBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Loading...</td></tr>`;

  db.ref(`Scores/${game}`).once('value')
    .then(snapshot => {
      const data = snapshot.val();
      if (!data) {
        leaderboardBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No scores yet!</td></tr>`;
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
          <td>${sanitizeHTML(entry.name)}</td>
          <td style="text-align: right;">${entry.score}</td>
        </tr>
      `).join('');
    })
    .catch(err => {
      console.error("❌ Error loading leaderboard:", err);
      leaderboardBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Error loading scores</td></tr>`;
    });
}

// =====================
// 🧩 Helpers
// =====================
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(sec => {
    sec.style.display = (sec.id === sectionId) ? 'block' : 'none';
    sec.classList.toggle('active', sec.id === sectionId);
  });
}

function activateNavButton(sectionId) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
}

function updateProfileDisplay(name, email) {
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = email;
}

function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// =====================
// 🔄 Auth State Persistence
// =====================
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("[Auth State] User logged in:", user.displayName || user.email);
    checkUserRegistration(user);
  } else {
    console.log("[Auth State] No user logged in");
    showSection('home-section');
    activateNavButton('home-section');
    updateProfileDisplay('Anonymous', 'Not logged in');
  }
});

// Attach leaderboard update listener
document.getElementById('game-select').addEventListener('change', updateLeaderboard);

// Optional: Trigger leaderboard update if visible on page load
if (document.querySelector('#leaderboard-section.active')) {
  updateLeaderboard();
}

