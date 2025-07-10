const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const canvasSize = 400;

let snake = [{ x: 160, y: 200 }];
let direction = "RIGHT";
let score = 0;
let food = {};
let game;
let started = false;

// Start Button
const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  startGame();
});

function startGame() {
  started = true;
  snake = [{ x: 160, y: 200 }];
  direction = "RIGHT";
  score = 0;
  document.getElementById("score").innerText = score;
  spawnFood();
  if (game) clearInterval(game);
  game = setInterval(draw, 150);
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Mobile swipe controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

canvas.addEventListener("touchmove", (e) => {
  if (!started) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 20 && direction !== "LEFT") direction = "RIGHT";
    else if (deltaX < -20 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (deltaY > 20 && direction !== "UP") direction = "DOWN";
    else if (deltaY < -20 && direction !== "DOWN") direction = "UP";
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#0ea5e9" : "#a5f3fc";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Draw food
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(food.x, food.y, box, box);

  // Move snake
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  // Check collision
  if (
    headX < 0 || headY < 0 ||
    headX >= canvasSize || headY >= canvasSize ||
    collision({ x: headX, y: headY }, snake)
  ) {
    clearInterval(game);
    alert("💀 Game Over! Your score: " + score);
    startBtn.style.display = "block";
    return;
  }

  let newHead = { x: headX, y: headY };

  // Check if food eaten
  if (headX === food.x && headY === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    spawnFood();
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

function restartGame() {
  startGame();
}