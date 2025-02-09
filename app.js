const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Load sound effects
const shootSound = new Audio('sounds/shoot.mp3');
const explosionSound = new Audio('sounds/epic-game-music-by-kris-klavenes-3-mins-49771.mp3');
explosionSound.loop = true;
const gameOverSound = new Audio('sounds/negative_beeps-6008.mp3');

// Optional: Set volume (0.0 to 1.0)
shootSound.volume = 1;
explosionSound.volume = 0.01;
gameOverSound.volume = 0.7;



const player = { x: canvas.width / 2, y: canvas.height - 95, width: 70, height: 70 };
const bullets = [];
const asteroids = [];
let gameOver = false;
let score = 0;
let doubleBulletTriggered = false; // Flag to track double bullet shooting
let gameFastMode = false;  // Flag to track fast mode status
let autoShootInterval; // Variable for the shooting interval

// Load player image
const playerImg = new Image();
playerImg.src = 'resources/flight.png';

playerImg.onload = function () {
  console.log("Player image loaded successfully!");

};

function drawPlayer() {

  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  } else {
    console.log("Player image not loaded yet.");
  }
}

function shootBullet() {
  bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10 });
  shootSound.currentTime = 0;
  shootSound.play();
}

function shootBullet2() {
  const bulletWidth = 5;
  const bulletHeight = 10;

  // Bullet on the left side of the player
  bullets.push({
    x: player.x + bulletWidth / 2,  // Align left side bullet near the player's left edge
    y: player.y,
    width: bulletWidth,
    height: bulletHeight
  });

  // Bullet on the right side of the player
  bullets.push({
    x: player.x + player.width - bulletWidth / 2 - 2.5,  // Align right side bullet near the player's right edge
    y: player.y,
    width: bulletWidth,
    height: bulletHeight
  });
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.y -= gameFastMode ? 10 : 5;  // Faster bullet speed in fast mode
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    if (bullet.y < 0) bullets.splice(i, 1);
  }
}

const asteroidImg = new Image();
asteroidImg.src = 'resources/attack.png';

function spawnAsteroid() {
  const size = Math.random() * 50 + 40;
  asteroids.push({ x: Math.random() * canvas.width, y: -size, width: size, height: size });
}

function drawAsteroids() {




  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.y += gameFastMode ? 4 : 2;  // Faster falling speed in fast mode

    if (asteroidImg.complete) {
      ctx.drawImage(asteroidImg, asteroid.x, asteroid.y, asteroid.width, asteroid.height);
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
    }

    if (asteroid.y > canvas.height) asteroids.splice(i, 1);
  }
}

function checkCollisions() {

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];

    if (
      asteroid.x < player.x + player.width &&
      asteroid.x + asteroid.width > player.x &&
      asteroid.y < player.y + player.height &&
      asteroid.y + asteroid.height > player.y
    ) {
      gameOver = true;
    }

    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      if (
        bullet.x < asteroid.x + asteroid.width &&
        bullet.x + bullet.width > asteroid.x &&
        bullet.y < asteroid.y + asteroid.height &&
        bullet.y + bullet.height > asteroid.y
      ) {



        explosionSound.play(); // Play explosion sound


        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        break;
      }
    }
  }
}

function gameLoop() {


  if (gameOver) {
    // Stop all ongoing sounds
    shootSound.pause();
    explosionSound.pause();
    gameOverSound.pause();

    // Reset sounds to the beginning (in case the game restarts)
    shootSound.currentTime = 0;
    explosionSound.currentTime = 0;
    gameOverSound.currentTime = 0;

    // Play the game-over sound once
    gameOverSound.play();
    // Game Over logic
    let rectWidth = 800;  // Width of the rectangle
    let rectHeight = 100; // Height of the rectangle
    const textX = canvas.width / 2; // Center the rectangle horizontally
    const textY = canvas.height / 2; // Center the rectangle vertically

    ctx.fillStyle = 'rgba(145, 52, 137, 0.7)';

    ctx.fillRect(textX - rectWidth / 2, textY - rectHeight / 2, rectWidth, rectHeight);
    ctx.fillStyle = 'white';
    ctx.font = '30px Tahoma';
    ctx.textAlign = 'center';
    ctx.fillText('👽 Game Over! 🚀 Final Score: ' + score, textX, textY);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  drawBullets();
  drawAsteroids();
  checkCollisions();

  ctx.fillStyle = 'white';
  ctx.font = '30px Tahoma';
  ctx.fillText('Score: ' + score, 30, 70);

  const progressBarWidth = 300;
  const progressBarHeight = 20;
  const progressBarX = 30;
  const progressBarY = 90;
  const borderRadius = 10;


  // Draw background with rounded corners
  ctx.fillStyle = 'gray';
  ctx.beginPath();
  ctx.roundRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight, borderRadius);
  ctx.fill();


  const progress = Math.min(score / 100 * progressBarWidth, progressBarWidth);
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.roundRect(progressBarX, progressBarY, progress, progressBarHeight, borderRadius);
  ctx.fill();

  if (progress === progressBarWidth && !doubleBulletTriggered) {
    doubleBulletTriggered = true;
    gameFastMode = true;
    setInterval(spawnAsteroid, 1000);
  }

  if (doubleBulletTriggered && !autoShootInterval) {
    autoShootInterval = setInterval(shootBullet2, 500);
  }

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (e) => {
  player.x = e.clientX - player.width / 2;
});

canvas.addEventListener('click', shootBullet);

setInterval(spawnAsteroid, 1500);

gameLoop();
