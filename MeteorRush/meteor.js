// meteor.js

import { auth, fb_writeRec, db } from '../firebase.mjs';
import {
  ref,
  query,
  orderByChild,
  limitToLast,
  get
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

let canvas, ctx;
let startBtn, instructionsBtn, instructionsModal, closeBtn, startScreen, pauseOverlay, gameOverScreen, gameOverMessage, finalScore;

let gameRunning = false;
let paused = false;
let player;
let obstacles;
let score;
let lives;
let earth;
let startTime;

let currentUser = null;  // Track logged in user persistently

const playerImg = new Image();
const meteorImg = new Image();
const earthImg = new Image();

playerImg.src = 'assets/images/meteor.jpeg';
meteorImg.src = 'assets/images/spacerock.jpeg';
earthImg.src = 'assets/images/earth.jpeg';

// Listen for auth state changes and update currentUser accordingly
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(`✅ User logged in: ${user.displayName || user.email}`);
    currentUser = user;
  } else {
    console.log("❌ User logged out");
    currentUser = null;
  }
});

window.addEventListener('DOMContentLoaded', () => {
  console.log("🌟 DOM fully loaded!");

  // Grab elements
  canvas = document.getElementById('gameCanvas');
  ctx = canvas?.getContext('2d');

  startBtn = document.querySelector('.start-btn');
  instructionsBtn = document.querySelector('.instructions-btn');
  instructionsModal = document.getElementById('instructions-modal');
  closeBtn = document.querySelector('.close-btn');
  startScreen = document.querySelector('.start-screen');
  pauseOverlay = document.querySelector('.pause-overlay');
  gameOverScreen = document.getElementById('game-over-screen');
  gameOverMessage = document.getElementById('game-over-message');
  finalScore = document.getElementById('final-score');

  setupUI();
});

function setupUI() {
  if (startBtn) {
    startBtn.onclick = () => {
      if (!currentUser) {
        alert("⚠️ You need to be logged in to play!");
        return;
      }

      console.log("🚀 Start button clicked!");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.display = 'block';
      startScreen.style.display = 'none';
      gameOverScreen.style.display = 'none';

      initGame();
      loop();
    };
  }

  if (instructionsBtn) {
    instructionsBtn.onclick = () => {
      if (instructionsModal) instructionsModal.style.display = 'flex';
    };
  }

  if (closeBtn) {
    closeBtn.onclick = () => {
      if (instructionsModal) instructionsModal.style.display = 'none';
    };
  }

  document.addEventListener('keydown', e => {
    if (!player) return;
    if (e.key === 'ArrowUp') player.dy = -player.speed;
    if (e.key === 'ArrowDown') player.dy = player.speed;
    if (e.key === 'p' || e.key === 'Escape') togglePause();
  });

  document.addEventListener('keyup', e => {
    if (!player) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
  });
}

function initGame() {
  score = 0;
  lives = 3;
  obstacles = [];
  earth = { show: false, x: canvas.width - 150 };
  player = { x: 50, y: canvas.height / 2, w: 50, h: 50, speed: 5, dy: 0 };
  gameRunning = true;
  paused = false;
  startTime = Date.now();

  if (pauseOverlay) pauseOverlay.style.display = 'none';
  if (gameOverScreen) gameOverScreen.style.display = 'none';
}

function togglePause() {
  if (!gameRunning) return;
  paused = !paused;
  if (pauseOverlay) pauseOverlay.style.display = paused ? 'flex' : 'none';
  if (!paused) loop();
}

function loop() {
  if (!gameRunning || paused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.y += player.dy;
  player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  let time = (Date.now() - startTime) / 1000;
  if (!earth.show && time > 120) earth.show = true;

  if (earth.show) {
    earth.x -= 2;
    ctx.drawImage(earthImg, earth.x, canvas.height / 2 - 60, 120, 120);
    if (earth.x < player.x + player.w) {
      endGame(true);
      return;
    }
  }

  handleObstacles();
  drawText();
  requestAnimationFrame(loop);
}

function handleObstacles() {
  if (Math.random() < 0.02) {
    let size = 30 + Math.random() * 40;
    obstacles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - size),
      w: size,
      h: size,
      speed: 3 + score / 50,
    });
  }

  obstacles = obstacles.filter(rock => {
    rock.x -= rock.speed;
    ctx.drawImage(meteorImg, rock.x, rock.y, rock.w, rock.h);

    let hit =
      player.x < rock.x + rock.w &&
      player.x + player.w > rock.x &&
      player.y < rock.y + rock.h &&
      player.y + player.h > rock.y;

    if (hit) {
      lives--;
      if (lives <= 0) {
        endGame(false);
        return false;
      }
      return false;
    }

    if (rock.x + rock.w > 0) {
      return true;
    } else {
      score++;
      return false;
    }
  });
}

function drawText() {
  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 150, 40);
}

function endGame(won) {
  gameRunning = false;
  paused = false;
  if (canvas) canvas.style.display = 'none';

  if (gameOverMessage) gameOverMessage.textContent = won ? '🌍 You reached Earth!' : '💥 Game Over!';
  if (finalScore) finalScore.textContent = `Your Score: ${score}`;
  if (gameOverScreen) gameOverScreen.style.display = 'block';

  onGameOver(score);
}

export async function saveMeteorRushScore(score) {
  if (!currentUser) {
    alert("⚠️ You need to be logged in to save your score!");
    throw new Error("User not logged in");
  }

  // Append unique user ID snippet to distinguish same display names
  const uidSnippet = currentUser.uid.slice(0, 6);
  const name = `${currentUser.displayName || currentUser.email || "Anonymous"} #${uidSnippet}`;
  const gameName = "MeteorRush";

  try {
    await fb_writeRec(gameName, name, Number(score));
    console.log("✅ Score saved to Firebase!");
  } catch (err) {
    console.error("❌ Error saving score:", err);
    throw err;
  }
}

export async function getMeteorRushLeaderboard() {
  try {
    const scoresRef = ref(db, 'Scores/MeteorRush');
    const scoresQuery = query(scoresRef, orderByChild('score'), limitToLast(10));
    const snapshot = await get(scoresQuery);

    const scores = [];
    snapshot.forEach(childSnap => {
      const val = childSnap.val();
      scores.push({
        name: val.name || "Anonymous",
        score: Number(val.score),
        timestamp: val.timestamp || 0,
      });
    });

    scores.sort((a, b) => b.score - a.score);
    return scores;
  } catch (err) {
    console.error("❌ Error fetching leaderboard:", err);
    return [];
  }
}

export async function onGameOver(finalScore) {
  try {
    await saveMeteorRushScore(finalScore);
    alert("🎉 Score submitted successfully!");
  } catch (err) {
    alert("⚠️ Failed to submit score. Please log in.");
  }
}
