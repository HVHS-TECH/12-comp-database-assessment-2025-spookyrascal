import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  fb_writeRec,
  getUserGameData,
  saveUserGameData,
  signOutUser
} from '../firebase.mjs';

// ---------- UI Helpers ----------
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    const isTarget = section.id === sectionId;
    section.style.display = isTarget ? 'block' : 'none';
    section.classList.toggle('active', isTarget);
  });
}

function activateNavButton(sectionId) {
  document.querySelectorAll('.nav-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.section === sectionId);
  });
}

function updateProfileDisplay(name, email) {
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  if (nameEl) nameEl.textContent = name || 'Anonymous';
  if (emailEl) emailEl.textContent = email || 'Not logged in';
}

// ---------- Auth State Listener ----------
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("[Auth State] Logged in:", user.displayName || user.email);
    checkUserRegistration(user);
  } else {
    console.log("[Auth State] Not logged in");
    showSection('home-section');
    activateNavButton('home-section');
    updateProfileDisplay('Anonymous', 'Not logged in');
  }
});

// ---------- Check User Registration ----------
async function checkUserRegistration(user) {
  const regSection = document.getElementById('registration-section');
  const homeSection = document.getElementById('home-section');

  try {
    const data = await getUserGameData(user.uid);

    if (data && Object.keys(data).length > 0) {
      console.log("[Registration] Already registered");

      if (regSection) regSection.style.display = 'none';
      if (homeSection) homeSection.style.display = 'none';

      showSection('games-section');
      activateNavButton('games-section');

      const first = Object.values(data)[0] || {};
      updateProfileDisplay(first.displayName || user.displayName, user.email);
    } else {
      console.log("[Registration] Not registered");
      showSection('registration-section');
      activateNavButton('registration-section');
    }
  } catch (err) {
    console.error("[Registration] Error:", err);
    showSection('home-section');
    activateNavButton('home-section');
  }
}

// ---------- Registration Form ----------
function setupRegistrationForm() {
  const form = document.getElementById('registration-form');
  const errorEl = document.getElementById('registration-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      if (errorEl) errorEl.textContent = "⚠️ Please log in first!";
      return;
    }

    const displayName = document.getElementById('displayName')?.value.trim();
    const age = document.getElementById('age')?.value.trim();

    if (!displayName || !age) {
      if (errorEl) errorEl.textContent = "⚠️ Please fill all required fields!";
      return;
    }

    try {
      await saveUserGameData(user.uid, {
        displayName,
        email: user.email,
        age: parseInt(age, 10),
        timestamp: Date.now()
      });

      if (errorEl) errorEl.textContent = "";
      showSection('games-section');
      activateNavButton('games-section');
      updateProfileDisplay(displayName, user.email);

      console.log("[Registration] Saved successfully");
    } catch (err) {
      console.error("[Registration] Save error:", err);
      if (errorEl) errorEl.textContent = "❌ Error saving info.";
    }
  });
}

// ---------- Google Login ----------
function setupGoogleLogin() {
  const btn = document.getElementById('google-login-btn');
  const msg = document.getElementById('login-message');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (msg) msg.textContent = `✅ Logged in as ${user.displayName || user.email}`;
      console.log("[Login] User:", user.displayName || user.email);

      await checkUserRegistration(user);
      showSection('games-section');
      activateNavButton('games-section');
    } catch (err) {
      if (msg) msg.textContent = `❌ ${err.message}`;
      console.error("[Login] Error:", err);
    }
  });
}

// ---------- Logout ----------
function setupLogout() {
  const btn = document.getElementById('logout-btn');
  const msg = document.getElementById('login-message');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      if (msg) msg.textContent = "👋 Logged out!";
      showSection('home-section');
      activateNavButton('home-section');
      updateProfileDisplay('Anonymous', 'Not logged in');
      console.log("[Logout] Successful");
    } catch (err) {
      if (msg) msg.textContent = "❌ Logout failed.";
      console.error("[Logout] Error:", err);
    }
  });
}

// ---------- Sidebar Nav ----------
function setupSidebarNav() {
  const buttons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.section;
      sections.forEach(sec => {
        const match = sec.id === target;
        sec.style.display = match ? 'block' : 'none';
        sec.classList.toggle('active', match);
      });
    });
  });
}

// ---------- Game Redirect ----------
function goToGame(path) {
  const user = auth.currentUser;
  if (!user) {
    alert("⚠️ Please log in to play!");
    return;
  }

  const userData = {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous',
    email: user.email,
    photoURL: user.photoURL || ''
  };

  localStorage.setItem("firebaseUser", JSON.stringify(userData));
  window.location.href = path;
}

// ---------- Init ----------
window.addEventListener('DOMContentLoaded', () => {
  setupGoogleLogin();
  setupLogout();
  setupRegistrationForm();
  setupSidebarNav();
});

window.goToGame = goToGame;
