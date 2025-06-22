""// 🎮 Grab everything we need from the page
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.querySelector('.start-btn');
const instructionsBtn = document.querySelector('.instructions-btn');
const instructionsModal = document.getElementById('instructions-modal');
const closeBtn = document.querySelector('.close-btn');
const startScreen = document.querySelector('.start-screen');
const pauseOverlay = document.querySelector('.pause-overlay');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMessage = document.getElementById('game-over-message');
const finalScore = document.getElementById('final-score');

// 🎮 Game state variables
let gameRunning = false;
let paused = false;
let player = { x: 50, y: 100, w: 50, h: 50, speed: 5, dy: 0 };
let obstacles = [];
let score = 0;
let lives = 3;
let earth = { show: false, x: 0 };
let startTime;

// 🖼️ Load images
const playerImg = new Image();
const meteorImg = new Image();
const earthImg = new Image();
playerImg.src = 'assets/images/meteor.jpeg';
meteorImg.src = 'assets/images/spacerock.jpeg';
earthImg.src = 'assets/images/earth.jpeg';

startBtn.onclick = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';

  score = 0;
  lives = 3;
  obstacles = [];
  earth.show = false;
  earth.x = canvas.width - 150;
  player.y = canvas.height / 2;
  gameRunning = true;
  paused = false;
  startTime = Date.now();

  loop();
};

instructionsBtn.onclick = () => instructionsModal.style.display = 'flex';
closeBtn.onclick = () => instructionsModal.style.display = 'none';

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') player.dy = -player.speed;
  if (e.key === 'ArrowDown') player.dy = player.speed;
  if (e.key === 'p' || e.key === 'Escape') togglePause();
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
});

function togglePause() {
  if (!gameRunning) return;
  paused = !paused;
  pauseOverlay.style.display = paused ? 'flex' : 'none';
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
      speed: 3 + score / 50
    });
  }

  obstacles = obstacles.filter(rock => {
    rock.x -= rock.speed;
    ctx.drawImage(meteorImg, rock.x, rock.y, rock.w, rock.h);

    let hit = (
      player.x < rock.x + rock.w &&
      player.x + player.w > rock.x &&
      player.y < rock.y + rock.h &&
      player.y + player.h > rock.y
    );

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
  canvas.style.display = 'none';

  gameOverMessage.textContent = won ? '🌍 You reached Earth!' : '💥 Game Over!';
  finalScore.textContent = `Your Score: ${score}`;
  gameOverScreen.style.display = 'block';
}
