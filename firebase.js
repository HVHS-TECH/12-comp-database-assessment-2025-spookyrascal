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
const loginBtn = document.getElementById('google-login-btn');
const loginMsg = document.getElementById('login-message');

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(res => {
        loginMsg.textContent = `✅ Logged in as ${res.user.displayName || res.user.email}`;
        checkUserRegistration(res.user);
      })
      .catch(err => {
        loginMsg.textContent = "❌ " + err.message;
      });
  });
}


// =====================
// 🧾 Check Registration
// =====================
function checkUserRegistration(user) {
  const regSection = document.getElementById('registration-section');
  const userSection = document.getElementById('user-section');

  db.ref(`Games/${user.uid}`).once('value').then(snapshot => {
    if (snapshot.exists()) {
      // ✅ User is registered
      regSection.style.display = 'none';
      userSection.style.display = 'block';
      const gameName = snapshot.val().selectedGame || user.displayName || user.email;
      document.getElementById('username').textContent = gameName;
    } else {
      // ⚠️ User not registered
      regSection.style.display = 'block';
      userSection.style.display = 'none';
    }
  });
}


// =====================
// 📝 Handle Registration Form
// =====================
const regForm = document.getElementById('registration-form');
const regError = document.getElementById('registration-error');

if (regForm) {
  regForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      regError.textContent = "⚠️ Please log in first!";
      return;
    }

    const gameName = document.getElementById('gameName')?.value.trim();
    const age = document.getElementById('age')?.value.trim();

    if (!gameName || !age) {
      regError.textContent = "⚠️ Please fill all info fields!";
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
        regError.textContent = "";
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        document.getElementById('username').textContent = gameName;
      })
      .catch(err => {
        console.error("❌ Error saving user data:", err);
        regError.textContent = "❌ Error saving info.";
      });
  });
}


// =====================
// 🚪 Logout
// =====================
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        loginMsg.textContent = "👋 Logged out successfully!";
        document.getElementById('user-section').style.display = 'none';
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
      })
      .catch(err => {
        loginMsg.textContent = "❌ Error logging out.";
        console.error(err);
      });
  });
}


// =====================
// 🎮 Game Navigation
// =====================
function goToGame(url) {
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
