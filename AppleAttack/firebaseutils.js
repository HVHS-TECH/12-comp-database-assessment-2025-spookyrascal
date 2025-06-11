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

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Get references to auth and database services
const auth = firebase.auth();
const db = firebase.database();

// Function to save score under Scores/<UID>/<randomKey>
function writeScore(gameName, score) {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to save your score!");
    return;
  }

  const scoreData = {
    name: user.displayName || "Anonymous",
    score: score,
    gameName: gameName,
    timestamp: Date.now()
  };

  return db.ref('Scores/' + user.uid).push(scoreData)
    .then(() => console.log("Score saved!"))
    .catch(err => console.error("Error saving score: ", err));
}
function writeUserData(user, age = null) {
  if (!user) return;

  const userData = {
    displayName: user.displayName || "Anonymous",
    email: user.email || "unknown",
    age: age || 16,  
    photoURL: user.photoURL || null
  };

  db.ref('Games/' + user.uid).set(userData)
    .then(() => console.log("User data saved!"))
    .catch(err => console.error("Error saving user data: ", err));
}

// Automatically save user info when auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user.uid);
    // Replace null with actual age if you have it saved somewhere
    writeUserData(user, null);
  } else {
    console.log("No user signed in.");
  }
});
