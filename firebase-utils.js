// firebase-utils.js (make sure this file is included in both game HTML files)

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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

function writeScore(gameName, score) {
  const user = auth.currentUser;
  if (!user) {
    alert("You need to be logged in to save your score!");
    return;
  }
  const scoreData = {
    userId: user.uid,
    displayName: user.displayName || "Anonymous",
    gameName: gameName,
    score: score,
    timestamp: Date.now(),
  };

  return db.ref('scores').push(scoreData)
    .then(() => console.log("Score saved!"))
    .catch(err => console.error("Error saving score: ", err));
}
