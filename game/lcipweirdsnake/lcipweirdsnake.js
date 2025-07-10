const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const canvasSize = 400;

let snake = [{ x: 160, y: 200 }];
let direction = "RIGHT";
let score = 0;
let game; // interval game
let isPlaying = false;

let food = {
  x: Math.floor(Math.random() * (canvasSize / box)) * box,
  y: Math.floor(Math.random() * (canvasSize / box)) * box,
};

// === Event keyboard ===
document.addEventListener("keydown", (e) => {
  if (!isPlaying) return;

  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// === Mobile Control ===
function changeDirection(newDir) {
  if (!isPlaying) return;

  if (
    (newDir === "UP" && direction !== "DOWN") ||
    (newDir === "DOWN" && direction !== "UP") ||
    (newDir === "LEFT" && direction !== "RIGHT") ||
    (newDir === "RIGHT" && direction !== "LEFT")
  ) {
    direction = newDir;
  }
}

// === Mulai Game Pertama Kali ===
function startGame() {
  if (isPlaying) return;

  isPlaying = true;
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("restartBtn").style.display = "inline-block";

  game = setInterval(draw, 150);
}

// === Restart ===
function restartGame() {
  clearInterval(game);
  snake = [{ x: 160, y: 200 }];
  direction = "RIGHT";
  score = 0;
  document.getElementById("score").innerText = score;
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };
  game = setInterval(draw, 150);
}

// === Draw Loop ===
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

  // Next head position
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  // Collision detection
  if (
    headX < 0 || headY < 0 ||
    headX >= canvasSize || headY >= canvasSize ||
    collision({ x: headX, y: headY }, snake)
  ) {
    clearInterval(game);
    alert("💀 Game Over! Your score: " + score);
    isPlaying = false;
    document.getElementById("startBtn").style.display = "inline-block";
    document.getElementById("restartBtn").style.display = "none";
    return;
  }

  let newHead = { x: headX, y: headY };

  if (headX === food.x && headY === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = {
      x: Math.floor(Math.random() * (canvasSize / box)) * box,
      y: Math.floor(Math.random() * (canvasSize / box)) * box,
    };
  } else {
    snake.pop();
  }

  snake.unshift(newHead);
}

// === Collision Helper ===
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}