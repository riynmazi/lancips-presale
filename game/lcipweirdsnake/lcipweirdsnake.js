const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const canvasSize = 400;

let snake = [{ x: 160, y: 200 }];
let direction = "RIGHT";
let score = 0;
let food = {
  x: Math.floor(Math.random() * (canvasSize / box)) * box,
  y: Math.floor(Math.random() * (canvasSize / box)) * box,
};

let game = null;
let isGameRunning = false;

// === DRAW FUNCTION ===
function draw() {
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#0ea5e9" : "#a5f3fc";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Food
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(food.x, food.y, box, box);

  // Move
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  if (
    headX < 0 || headY < 0 ||
    headX >= canvasSize || headY >= canvasSize ||
    collision({ x: headX, y: headY }, snake)
  ) {
    clearInterval(game);
    isGameRunning = false;
    showStartButton("💀 Game Over! Score: " + score + "<br>🔁 Play Again");
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

// === COLLISION CHECK ===
function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

// === KEYBOARD CONTROL ===
window.addEventListener("keydown", (e) => {
  if (!isGameRunning) return;
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// === START / RESTART ===
function startGame() {
  snake = [{ x: 160, y: 200 }];
  direction = "RIGHT";
  score = 0;
  document.getElementById("score").innerText = score;
  food = {
    x: Math.floor(Math.random() * (canvasSize / box)) * box,
    y: Math.floor(Math.random() * (canvasSize / box)) * box,
  };
  if (game) clearInterval(game);
  game = setInterval(draw, 150);
  isGameRunning = true;
  document.getElementById("startBtn").style.display = "none";
}

// === SHOW START BUTTON ON TOP ===
function showStartButton(text = "▶️ Start Game") {
  const btn = document.getElementById("startBtn");
  btn.innerHTML = text;
  btn.style.display = "block";
}

function setDirection(dir) {
  if (dir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
  else if (dir === "UP" && direction !== "DOWN") direction = "UP";
  else if (dir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
  else if (dir === "DOWN" && direction !== "UP") direction = "DOWN";
}