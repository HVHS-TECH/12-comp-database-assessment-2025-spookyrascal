// P5.play: Mio's game project
// Javascript game project
// Written by Mio Hoffman
/*******************************************************/

/*******************************************************/
//Variables
/*******************************************************/
//CONSTANT VARIABLES
const GAMEHEIGHT = 500;
const GAMEWIDTH = 500;

const APPLESIZE = 18;

const CHICKSIZEWIDTH = 20;
const CHICKSIZEHEIGHT = 26;

const DUCKSIZEWIDTH = 22;
const DUCKSIZEHEIGHT = 25;

const CHICKENSIZEWIDTH = 20;
const CHICKENSIZEHEIGHT = 27;

//NORMAL VARIABLES
var PLAYERSIZEWIDTH = 26;
var PLAYERSIZEHEIGHT = 30;

var movementSpeed = 3;

var gameState = "start";

var score = 0;
var appleCount = 0;

var ducks = 0;
var chicks = 0;
var chickens = 0;

var applesForNextChick = 0;
var applesForNextDuck = 0;
var applesForNextChicken = 0;
/*******************************************************/
//preload()
/*******************************************************/
let chickImg;
let duckImg;
let chickenImg;
let appleImg;
let wormRightImg;
let wormLeftImg;
let grassBackgroundImg;

function preload(){
    chickImg = loadImage("Images/chick.png");
    duckImg = loadImage("/Images/duck.png");
    chickenImg = loadImage("/Images/chicken.png");
    appleImg = loadImage("/Images/apple.png");
    wormRightImg = loadImage("/Images/wormRight.png");
    wormLeftImg = loadImage("/Images/wormLeft.png");
    grassBackgroundImg = loadImage("/Images/grass.png");
}

/*******************************************************/
//setup()
/*******************************************************/
function setup(){
    cnv = new Canvas(GAMEWIDTH, GAMEHEIGHT);
    //Makes the canvas pixelated, centered on the screen and the scale is 2 so the canvas is bigger
    displayMode('centered', 'pixelated', 2);

    allSprites.pixelPerfect = true;

    createPlayer();

    //Create the seperate groups
    chickGroup = new Group();
    duckGroup = new Group();
    appleGroup = new Group();
    chickenGroup = new Group();

    cleanupExtraSprites();
}

/*******************************************************/
//draw()
/*******************************************************/
function draw(){
    if (gameState == "start"){
        startScreen();
    }
    else if (gameState == "play"){
        gameLoop();
    }
    else if (gameState == "end"){
        endGame();
    }
}

/*******************************************************/
//startScreen()
/*******************************************************/
function startScreen(){
    //removing the sprites from the start screen
    allSprites.remove();
}

/*******************************************************/
//runGame()
/*******************************************************/
function runGame(){
    //Starts the game and reloads the sprites so that they appear again
    gameState = "play";
    createPlayer();
    walls();

    deleteTitlePage();
}

/*******************************************************/
//deleteTitlePage()
/*******************************************************/
function deleteTitlePage(){
    //Removing html elements of the title page
    //This is so the canvas can be at the top of the page instead of coming after html elements
    title = document.getElementById("title");
    start = document.getElementById("start");
    instructions = document.getElementById("instructions");

    title.remove();
    start.remove();
    instructions.remove();
}

/*******************************************************/
//gameLoop()
/*******************************************************/
function gameLoop(){
    movePlayer();

    //movement of the birds
    chickMovement();
    duckMovement();
    chickenMovement();

    playerCollisions();

    //checking if a duck, chick or chicken is overlapping an apple
    chickAppleCollision(chickGroup, appleGroup);
    duckAppleCollision(duckGroup, appleGroup);
    chickenAppleCollision(chickenGroup, appleGroup);

    background(grassBackgroundImg);

    difficulty();

    groupLengthChecks(chicks, ducks, chickens);

    //Displaying score and apple count
    textSize(20);
    text("Score: " + score, 10, 30);

    textSize(20);
    text("Apples: " + appleCount, 10, 50);
}

/*******************************************************/
//endGame()
/*******************************************************/
function endGame(){
    allSprites.remove();
    background("crimson");

    textSize(40);
    textAlign(CENTER, CENTER);
    text("YOU DIED!", GAMEWIDTH/2, GAMEHEIGHT/2 - 40);
    text("Score: " + score, GAMEWIDTH/2, GAMEHEIGHT/2 + 10);
}

function difficulty(){
    if (appleCount >= (applesForNextChick) * 4){ //Every 4 apples collected, spawn a chick but spawn a chick right at the start
        chicks = chicks + 1;
        applesForNextChick = applesForNextChick + 1;
    }
    if (appleCount >= (applesForNextDuck + 1) * 8){ //Every 8 apples collected, spawn a duck but start when the first four apples are collected
        ducks = ducks + 1;
        applesForNextDuck = applesForNextDuck + 1;
    }
    if (appleCount >= (applesForNextChicken + 1) * 12){ //Every 12 apples collected, spawn a chicken but start when the first five apples are collected
        chickens = chickens + 1;
        applesForNextChicken = applesForNextChicken + 1;
    }
}

function createPlayer(){
    player = new Sprite(GAMEWIDTH/2, GAMEHEIGHT/2, PLAYERSIZEWIDTH, PLAYERSIZEHEIGHT, 'd');
    player.image = wormRightImg;
    player.scale = 1.4;
    player.rotationLock = true;
}


function movePlayer(){
    if (kb.pressing('left')){
        player.vel.x = -movementSpeed;
        player.image = wormLeftImg; //If the player goes left, the sprite image changes to face the left
    }
    else if (kb.pressing('right')) {
        player.vel.x = movementSpeed;
        player.image = wormRightImg; //If the player goes right, the sprite image changes to face the right
    }
    else if (kb.pressing('up')) {
        player.vel.y = -movementSpeed;
    }
    else if (kb.pressing('down')) {
        player.vel.y = movementSpeed;
    }

    if (kb.released('left')) {
        player.vel.x = 0;
    }
    else if (kb.released('right')) {
        player.vel.x = 0;
    }
    else if (kb.released('up')) {
        player.vel.y = 0;
    }
    else if (kb.released('down')){
        player.vel.y = 0;
    }
}

function playerCollisions(){
        //Checking collisions of sprites with the player
        player.overlaps(appleGroup, getApple);
        player.overlaps(chickGroup, chickDeath);
        player.overlaps(duckGroup, duckDeath);
        player.overlaps(chickenGroup, chickenDeath);
}

function createChicks(){
    //THE FOLLOWING CODE WAS GENERATED FROM CHATGPT
    let side = floor(random(4)); // 0 = top, 1 = right, 2 = bottom, 3 = left
    let x, y;

    if (side === 0) { // Top edge
        x = random(0, GAMEWIDTH);
        y = 30;
    } 
    else if (side === 1) { // Right edge
        x = GAMEWIDTH - 30;
        y = random(0, GAMEHEIGHT);
    } 
    else if (side === 2) { // Bottom edge
        x = random(0, GAMEWIDTH);
        y = GAMEHEIGHT - 30;
    } 
    else { // Left edge
        x = 30;
        y = random(0, GAMEHEIGHT);
    }
    //END OF CODE GENERATED BY CHATGPT

    var chick = new Sprite(x, y, CHICKSIZEWIDTH, CHICKSIZEHEIGHT);
    chick.image = chickImg;
    chick.image.offset.y = -11; //This is to align the image with the hitbox
    chick.scale = 1.4;
    chick.rotationLock = true;
    return chick;
}

function chickMovement(){
    //Loop through the chickGroup to make each chick move to the player separately
    for (i = 0; i < chickGroup.length; i++){
        chickGroup[i].moveTo(player, 1.3);
    }
}

function chickDeath(player, _chick){
    if (appleCount >= 2){ //If player has at least two apples, they can defeat a chick
        _chick.remove();
        score++
        appleCount = appleCount - 2; //Minus the amount of apples it took to defeat the chick from appleCount
    }
    else { //If the player doesn't have two apples, the game ends
        gameState = "end";
    }
}

function createDucks(){
    //THE FOLLOWING CODE WAS GENERATED FROM CHATGPT
    let side = floor(random(4)); // 0 = top, 1 = right, 2 = bottom, 3 = left
    let x, y;

    if (side === 0) { // Top edge
        x = random(0, GAMEWIDTH);
        y = 30;
    } 
    else if (side === 1) { // Right edge
        x = GAMEWIDTH - 30;
        y = random(0, GAMEHEIGHT);
    } 
    else if (side === 2) { // Bottom edge
        x = random(0, GAMEWIDTH);
        y = GAMEHEIGHT - 30;
    } 
    else { // Left edge
        x = 30;
        y = random(0, GAMEHEIGHT);
    }
    //END OF CODE GENERATED BY CHATGPT

    var duck = new Sprite(x, y, DUCKSIZEWIDTH, DUCKSIZEHEIGHT);
    duck.image = duckImg;
    duck.image.offset.y = -4;
    duck.image.offset.x = -2;
    duck.scale = 1.5;
    duck.rotationLock = true;
    return duck;
}

function duckMovement(){
    //Loop through the duckGroup to make each duck move separately towards the player
    for (i = 0; i < duckGroup.length; i++){
        duckGroup[i].moveTo(player, 1);
    }
}

function duckDeath(player, _duck){
    if (appleCount >= 3){ //If player has at least 3 apples, they can defeat a duck
        _duck.remove();
        score = score + 2; //Adds 2 points to the score instead of 1
        appleCount = appleCount - 3; //Minus the amount of apples it took to defeat the duck
    }
    else{ //If the player doesn't have three apples, the game ends
        gameState = "end";
    }
}

function createChickens(){
    //THE FOLLOWING CODE WAS GENERATED FROM CHATGPT
    let side = floor(random(4)); // 0 = top, 1 = right, 2 = bottom, 3 = left
    let x, y;

    if (side === 0) { // Top edge
        x = random(0, GAMEWIDTH);
        y = 30;
    } 
    else if (side === 1) { // Right edge
        x = GAMEWIDTH - 30;
        y = random(0, GAMEHEIGHT);
    } 
    else if (side === 2) { // Bottom edge
        x = random(0, GAMEWIDTH);
        y = GAMEHEIGHT - 30;
    } 
    else { // Left edge
        x = 30;
        y = random(0, GAMEHEIGHT);
    }
    //END OF CODE GENERATED BY CHATGPT

    var chicken = new Sprite(x, y, CHICKENSIZEWIDTH, CHICKENSIZEHEIGHT);
    chicken.image = chickenImg;
    chicken.image.offset.y = -11;
    chicken.scale = 1.5;
    chicken.rotationLock = true;
    return chicken;
}

function chickenMovement(){
    //Loop through the chickenGroup to make every chicken move to the player seperately
    for (i = 0; i < chickenGroup.length; i++){
        chickenGroup[i].moveTo(player, 1.3);
    }
}

function chickenDeath(player, _chicken){
    if (appleCount >= 4){ //If player has at least 4 apples, they can defeat a chicken
        _chicken.remove();
        score = score + 3; //Adds 3 points to the score instead of 1
        appleCount = appleCount - 4; //Minus the amount of apples it took to defeat the duck
    }
    else{ //If the player doesn't have at least four apples, the game ends
        gameState = "end";
    }
}

function createApples(){
    var apple = new Sprite(random(0, GAMEHEIGHT), random(0, GAMEHEIGHT), APPLESIZE);
    apple.image = (appleImg);
    apple.image.offset.y = 3;
    apple.scale = 1.2;
    apple.rotationLock = true;
    return apple;
}

function getApple(player, _apple){
    //When a player collides with an apple, the apple count goes up by 1
    _apple.remove();
    appleCount++;
}

// FOLLOWING FUNCTION OF chickAppleCollision WAS GENERATED BY CHATGPT
//This function was created to prevent the chicks from moving apples
function chickAppleCollision() {
    for (let i = 0; i < chickGroup.length; i++) {
        let chick = chickGroup[i];
        let chickOverlapping = false; // Track if any chick is overlapping an apple

        for (let j = 0; j < appleGroup.length; j++) {
            let apple = appleGroup[j];

            if (chick.overlapping(apple)) {
                apple.collider = "none"; // Disable apple collider
                chickOverlapping = true; // Mark this apple as being overlapped
            }
        }

        // Restore collider if no chicks are overlapping the apple
        for (let j = 0; j < appleGroup.length; j++) {
            let apple = appleGroup[j];

            if (!chickOverlapping) { 
                apple.collider = "d"; // Reset to dynamic if no chicks are touching it
            }
        }
    }
}

// FOLLOWING FUNCTION OF duckAppleCollision WAS GENERATED BY CHATGPT
//This function was created to prevent the ducks from moving apples
function duckAppleCollision(){
    for (let i = 0; i < duckGroup.length; i++) {
        let duck = duckGroup[i];
        let duckOverlapping = false; // Track if any duck is overlapping an apple

        for (let j = 0; j < appleGroup.length; j++) {
            let apple = appleGroup[j];

            if (duck.overlapping(apple)) {
                apple.collider = "none"; // Disable apple collider
                duckOverlapping = true; // Mark this apple as being overlapped
            }
        }

        // Restore collider if no ducks are overlapping the apple
        for (let j = 0; j < appleGroup.length; j++) {
            let apple = appleGroup[j];

            if (!duckOverlapping) { 
                apple.collider = "d"; // Reset to dynamic if no ducks are touching it
            }
        }
    }
}

// FOLLOWING FUNCTION OF chickenAppleCollision WAS GENERATED BY CHATGPT
//This function was created to prevent the chicken from moving apples
function chickenAppleCollision(){
    for (let i = 0; i < chickenGroup.length; i++) {
        let chicken = chickenGroup[i];
        let chickenOverlapping = false; // Track if any chicken is overlapping an apple

        for (let j = 0; j < appleGroup.length; j++) {
            let apple = appleGroup[j];

            if (chicken.overlapping(apple)) {
                apple.collider = "none"; // Disable apple collider
                chickenOverlapping = true; // Mark this apple as being overlapped
            }
        }

        // Restore collider if no chickens are overlapping the apple
        for (let j = 0; j < appleGroup.length; j++) {
            let apple = appleGroup[j];

            if (!chickenOverlapping) { 
                apple.collider = "d"; // Reset to dynamic if no chickens are touching it
            }
        }
    }
}

//Makes sure sprites reappear
function groupLengthChecks(_chickAmount, _duckAmount, _chickenAmount){
    if (chickGroup.length < _chickAmount){
        chickGroup.add(createChicks());
    }
    if (duckGroup.length < _duckAmount){
        duckGroup.add(createDucks());
    }
    if (chickenGroup.length < _chickenAmount){
        chickenGroup.add(createChickens());
    }
    if (appleGroup.length < 5){
        appleGroup.add(createApples());
    }
}

//This function was created by chatGPT
//This function deletes any extra sprites that are a chick, apple or duck not a part of the groups.
//This was to fix a bug that made extra sprites appear that were not part of a group.
function cleanupExtraSprites(){
    for (let i = 0; i < allSprites.length; i++) {
        let sprite = allSprites[i];
        if (sprite !== player &&  // Don't remove the player
            //If a sprite is not part of either the chickGroup, duckGroup, chickenGroup or appleGroup, remove it.
            !chickGroup.includes(sprite) && 
            !duckGroup.includes(sprite) && 
            !chickenGroup.includes(sprite) &&
            !appleGroup.includes(sprite)) {
            sprite.remove(); 
        }
    }
}

//Wall placement
function walls(){
    wallLH  = new Sprite(0, height/2, 8, height, 's');
    wallRH  = new Sprite(500, height/2, 8, height, 's');
    wallTop = new Sprite(250, 0, width, 8, 's');
    wallBot = new Sprite(250, 500, width, 8, 's');
    wallLH.color = 'brown';
    wallRH.color = 'brown';
    wallTop.color = 'brown';
    wallBot.color = 'brown';
}
//THE FOLLOWING IS GENERATED BY AI 
const auth = firebase.auth();
const db = firebase.database();

auth.onAuthStateChanged(user => {
  if (user) {
    console.log("Logged in as:", user.displayName || user.email);
  } else {
    console.log("Not logged in");
  }
});

function writeScore(gameName, scoreValue) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save a score!");
    return;
  }

  const scoreData = {
    displayName: user.displayName || 'Anonymous',
    gameName: gameName,
    score: scoreValue
  };

  db.ref(`scores/${user.uid}`).set(scoreData)
    .then(() => {
      console.log("Score saved successfully!");
    })
    .catch(error => {
      console.error("Error saving score:", error);
    });
}