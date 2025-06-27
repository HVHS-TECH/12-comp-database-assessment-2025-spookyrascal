// --- Firebase Core Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
   
// --- Firebase Auth ---
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// --- Firebase Realtime Database ---
import {
  getDatabase,
  ref,
  push,
  set,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  get
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyB5B5P_sSmNTN7RjkaV-I2TKNUJWj0cF1A",
  authDomain: "comp-2025-carmen-o-grady.firebaseapp.com",
  databaseURL: "https://comp-2025-carmen-o-grady-default-rtdb.firebaseio.com",
  projectId: "comp-2025-carmen-o-grady",
  storageBucket: "comp-2025-carmen-o-grady.firebasestorage.app",
  messagingSenderId: "1046417795904",
  appId: "1:1046417795904:web:25cff308e04c73eb5968a5",
  measurementId: "G-BGRNW3X6K8"
};

// --- Initialize Firebase Services ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

// --- Auth: Sign in with Google ---
async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("❌ Google sign-in failed:", error);
    throw error;
  }
}

// ✅ NEW FUNCTION: Sign out user
async function signOutUser() {
  try {
    await signOut(auth);
    console.log("👋 User signed out successfully.");
  } catch (error) {
    console.error("❌ Sign out failed:", error);
    throw error;
  }
}

// --- Score Handling ---
async function fb_writeRec(gameName, playerName, playerScore) {
  const scoresRef = ref(db, `Scores/${gameName}`);
  const newScoreRef = push(scoresRef);
  await set(newScoreRef, {
    name: playerName,
    score: playerScore,
    timestamp: serverTimestamp()
  });
}

async function fb_getTopScores(gameName, limit = 10) {
  const scoresRef = ref(db, `Scores/${gameName}`);
  const scoresQuery = query(scoresRef, orderByChild('score'), limitToLast(limit));
  const snapshot = await get(scoresQuery);

  const scores = [];
  snapshot.forEach(childSnap => {
    const val = childSnap.val();
    scores.push({
      name: val.name || 'Anonymous',
      score: Number(val.score),
      timestamp: val.timestamp || 0
    });
  });

  scores.sort((a, b) => b.score - a.score); // Descending
  return scores;
}

// --- User Profile Handling ---
async function getUserGameData(uid) {
  const userRef = ref(db, `Users/${uid}`);
  const snapshot = await get(userRef);
  return snapshot.exists() ? snapshot.val() : null;
}

async function saveUserGameData(uid, data) {
  const userRef = ref(db, `Users/${uid}`);
  await set(userRef, data);
}

export {
  auth,
  provider,
  db,
  signInWithPopup,
  signInWithGoogle,
  signOutUser,
  signOut,
  fb_writeRec,
  fb_getTopScores,
  getUserGameData,
  saveUserGameData
};
