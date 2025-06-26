/*******************************************************/
// Apple Attack - Mio's P5.play Game Project
// Written by Mio Hoffman
/*******************************************************/
import { Sprite, Group, kb } from "https://p5play.org/v3/p5play.js";
import { fb_writeRec, auth, db } from '../firebase.mjs';

const GAMEHEIGHT = 500;
const GAMEWIDTH = 500;

const APPLESIZE = 18;
const CHICKSIZEWIDTH = 20;
const CHICKSIZEHEIGHT = 26;
const DUCKSIZEWIDTH = 22;
const DUCKSIZEHEIGHT = 25;
const CHICKENSIZEWIDTH = 20;
const CHICKENSIZEHEIGHT = 27;

const PLAYERSIZEWIDTH = 26;
const PLAYERSIZEHEIGHT = 30;
const movementSpeed = 3;

let gameState = "start";
let score = 0;
let appleCount = 0;
let ducks = 0;
let chicks = 0;
let chickens = 0;

let applesForNextChick = 0;
let applesForNextDuck = 0;
let applesForNextChicken = 0;

let chickGroup, duckGroup, chickenGroup, appleGroup;
let allSprites = null;
let player;

let chickImg, duckImg, chickenImg, appleImg, wormRightImg, wormLeftImg, grassBackgroundImg;

function preload() {
  chickImg = loadImage("assets/images/chick.png");
  duckImg = loadImage("assets/images/duck.png");
  chickenImg = loadImage("assets/images/chicken.png");
  appleImg = loadImage("assets/images/apple.png");
  wormRightImg = loadImage("assets/images/wormRight.png");
  wormLeftImg = loadImage("assets/images/wormLeft.png");
  grassBackgroundImg = loadImage("assets/images/grass.png");
}

function setup() {
  createCanvas(GAMEWIDTH, GAMEHEIGHT);
  pixelDensity(1);

  allSprites = new Group();
  chickGroup = new Group();
  duckGroup = new Group();
  appleGroup = new Group();
  chickenGroup = new Group();

  createPlayer();

  const startBtn = document.getElementById('start');
  if (startBtn) startBtn.removeAttribute('disabled');

  startBtn?.addEventListener('click', runGame);
}

function draw() {
  background(grassBackgroundImg);

  if (gameState === "start") {
    startScreen();
  } else if (gameState === "play") {
    gameLoop();
  } else if (gameState === "end") {
    endGame();
  }
}

function startScreen() {
  if (allSprites) allSprites.remove();
  fill("white");
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Welcome to Apple Attack!", width / 2, height / 2 - 20);
  textSize(18);
  text("Press ENTER or START button to play", width / 2, height / 2 + 20);
}

function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    runGame();
  }
}

function runGame() {
  gameState = "play";
  score = 0;
  appleCount = 0;
  ducks = 0;
  chicks = 0;
  chickens = 0;
  applesForNextChick = 0;
  applesForNextDuck = 0;
  applesForNextChicken = 0;

  if (!allSprites) allSprites = new Group();
  allSprites.remove();

  chickGroup = new Group();
  duckGroup = new Group();
  appleGroup = new Group();
  chickenGroup = new Group();

  createPlayer();
  walls();

  for (let i = 0; i < 5; i++) {
    appleGroup.add(createApples());
  }
}

window.runGame = runGame;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start')?.addEventListener('click', runGame);
});

function gameLoop() {
  movePlayer();
  chickMovement();
  duckMovement();
  chickenMovement();
  playerCollisions();
  chickAppleCollision();
  duckAppleCollision();
  chickenAppleCollision();
  difficulty();
  groupLengthChecks(chicks, ducks, chickens);

  fill("white");
  textSize(20);
  text("Score: " + score, 10, 30);
  text("Apples: " + appleCount, 10, 50);

  drawSprites();
}

function endGame() {
  if (allSprites) allSprites.remove();
  background("crimson");
  fill("white");
  textSize(40);
  textAlign(CENTER, CENTER);
  text("YOU DIED!", GAMEWIDTH / 2, GAMEHEIGHT / 2 - 40);
  textSize(28);
  text("Score: " + score, GAMEWIDTH / 2, GAMEHEIGHT / 2 + 10);
  onAppleGameOver(score);
}

function difficulty() {
  if (appleCount >= applesForNextChick * 4) { chicks++; applesForNextChick++; }
  if (appleCount >= (applesForNextDuck + 1) * 8) { ducks++; applesForNextDuck++; }
  if (appleCount >= (applesForNextChicken + 1) * 12) { chickens++; applesForNextChicken++; }
}

function createPlayer() {
  player = new Sprite(GAMEWIDTH / 2, GAMEHEIGHT / 2, PLAYERSIZEWIDTH, PLAYERSIZEHEIGHT);
  player.image = wormRightImg;
  player.scale = 1.4;
  player.rotationLock = true;
  if (allSprites) allSprites.add(player);
}

function movePlayer() {
  player.vel.x = 0;
  player.vel.y = 0;

  if (kb.pressing('left')) { player.vel.x = -movementSpeed; player.image = wormLeftImg; }
  if (kb.pressing('right')) { player.vel.x = movementSpeed; player.image = wormRightImg; }
  if (kb.pressing('up')) player.vel.y = -movementSpeed;
  if (kb.pressing('down')) player.vel.y = movementSpeed;
}

function playerCollisions() {
  player.overlaps(appleGroup, getApple);
  player.overlaps(chickGroup, chickDeath);
  player.overlaps(duckGroup, duckDeath);
  player.overlaps(chickenGroup, chickenDeath);
}

function createEnemy(img, width, height, offsetY, offsetX = 0, scale = 1.4) {
  const side = floor(random(4));
  let x, y;
  if (side === 0) { x = random(0, GAMEWIDTH); y = 30; }
  else if (side === 1) { x = GAMEWIDTH - 30; y = random(0, GAMEHEIGHT); }
  else if (side === 2) { x = random(0, GAMEWIDTH); y = GAMEHEIGHT - 30; }
  else { x = 30; y = random(0, GAMEHEIGHT); }

  const sprite = new Sprite(x, y, width, height);
  sprite.image = img;
  sprite.image.offset.y = offsetY;
  sprite.image.offset.x = offsetX;
  sprite.scale = scale;
  sprite.rotationLock = true;
  if (allSprites) allSprites.add(sprite);
  return sprite;
}

function createChicks() { return createEnemy(chickImg, CHICKSIZEWIDTH, CHICKSIZEHEIGHT, -11); }
function createDucks() { return createEnemy(duckImg, DUCKSIZEWIDTH, DUCKSIZEHEIGHT, -4, -2, 1.5); }
function createChickens() { return createEnemy(chickenImg, CHICKENSIZEWIDTH, CHICKENSIZEHEIGHT, -11, 0, 1.5); }

function chickMovement() { chickGroup.forEach(c => c.moveTo(player, 1.3)); }
function duckMovement() { duckGroup.forEach(d => d.moveTo(player, 1)); }
function chickenMovement() { chickenGroup.forEach(c => c.moveTo(player, 1.3)); }

function chickDeath(player, _chick) {
  if (appleCount >= 2) { _chick.remove(); score++; appleCount -= 2; }
  else gameState = "end";
}

function duckDeath(player, _duck) {
  if (appleCount >= 3) { _duck.remove(); score += 2; appleCount -= 3; }
  else gameState = "end";
}

function chickenDeath(player, _chicken) {
  if (appleCount >= 4) { _chicken.remove(); score += 3; appleCount -= 4; }
  else gameState = "end";
}

function createApples() {
  const apple = new Sprite(random(0, GAMEWIDTH), random(0, GAMEHEIGHT), APPLESIZE);
  apple.image = appleImg;
  apple.image.offset.y = 3;
  apple.scale = 1.2;
  apple.rotationLock = true;
  if (allSprites) allSprites.add(apple);
  return apple;
}

function getApple(player, _apple) {
  _apple.remove();
  appleCount++;
}

function appleCollision(group) {
  group.forEach(entity => {
    appleGroup.forEach(apple => {
      apple.collider = entity.overlapping(apple) ? "none" : "d";
    });
  });
}

function chickAppleCollision() { appleCollision(chickGroup); }
function duckAppleCollision() { appleCollision(duckGroup); }
function chickenAppleCollision() { appleCollision(chickenGroup); }

function groupLengthChecks(_chickAmount, _duckAmount, _chickenAmount) {
  while (chickGroup.length < _chickAmount) chickGroup.add(createChicks());
  while (duckGroup.length < _duckAmount) duckGroup.add(createDucks());
  while (chickenGroup.length < _chickenAmount) chickenGroup.add(createChickens());
  while (appleGroup.length < 5) appleGroup.add(createApples());
}

function walls() {
  if (!allSprites) return;
  allSprites.add(new Sprite(0, height / 2, 8, height, 's'));
  allSprites.add(new Sprite(width, height / 2, 8, height, 's'));
  allSprites.add(new Sprite(width / 2, 0, width, 8, 's'));
  allSprites.add(new Sprite(width / 2, height, width, 8, 's'));
}

async function saveAppleAttackScore(score) {
  const user = auth.currentUser;
  if (!user) {
    alert("⚠️ You need to be logged in to save your score!");
    throw new Error("User not logged in");
  }
  const uidSnippet = user.uid.slice(0, 6);
  const name = `${user.displayName || user.email || "Anonymous"} #${uidSnippet}`;
  const gameName = "AppleAttack";

  try {
    await fb_writeRec(gameName, name, Number(score));
    console.log("✅ AppleAttack score saved!");
  } catch (err) {
    console.error("❌ Error saving AppleAttack score:", err);
    throw err;
  }
}

async function onAppleGameOver(finalScore) {
  try {
    await saveAppleAttackScore(finalScore);
    alert("🎯 Score submitted successfully!");
  } catch {
    alert("❌ Could not submit score. Please log in.");
  }
}

export {
  saveAppleAttackScore,
  onAppleGameOver,
};

window.runGame = runGame;
