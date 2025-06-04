// firebase-utils.js (make sure this file is included in both game HTML files)

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
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
