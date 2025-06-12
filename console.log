// --- Google Login ---
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

// --- Check Registration ---
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

// --- Registration Submit ---
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

    const gameName = document.getElementById('gameName').value.trim();
    const age = document.getElementById('age').value.trim();

    if (!gameName || !age) {
      console.warn("[Registration] Missing fields");
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
        console.log("[Registration] User data saved successfully");
        registrationError.textContent = "";
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        document.getElementById('username').textContent = gameName;
      })
      .catch(err => {
        console.error("[Registration] Error saving user data:", err);
        registrationError.textContent = "❌ Error saving info.";
      });
  });
}

// --- Logout ---
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

// --- Game Navigation ---
function goToGame(url) {
  console.log("[Game Navigation] Navigating to:", url);
  window.location.href = url;
}
