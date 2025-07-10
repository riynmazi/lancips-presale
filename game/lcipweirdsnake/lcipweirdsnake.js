// weirdsnake.js

const canvas = document.getElementById("gameCanvas"); const ctx = canvas.getContext("2d"); const box = 20; const canvasSize = 400;

let snake = [{ x: 160, y: 200 }]; let direction = "RIGHT"; let score = 0; let food = { x: Math.floor(Math.random() * (canvasSize / box)) * box, y: Math.floor(Math.random() * (canvasSize / box)) * box, };

// Event untuk kontrol document.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT"; else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP"; else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT"; else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN"; });

function draw() { ctx.fillStyle = "#111"; ctx.fillRect(0, 0, canvasSize, canvasSize);

for (let i = 0; i < snake.length; i++) { ctx.fillStyle = i === 0 ? "#0ea5e9" : "#a5f3fc"; ctx.fillRect(snake[i].x, snake[i].y, box, box); }

ctx.fillStyle = "#22c55e"; ctx.fillRect(food.x, food.y, box, box);

let headX = snake[0].x; let headY = snake[0].y;

if (direction === "LEFT") headX -= box; if (direction === "RIGHT") headX += box; if (direction === "UP") headY -= box; if (direction === "DOWN") headY += box;

if ( headX < 0 || headY < 0 || headX >= canvasSize || headY >= canvasSize || collision({ x: headX, y: headY }, snake) ) { clearInterval(game); alert("💀 Game Over! Your score: " + score); return; }

let newHead = { x: headX, y: headY };

if (headX === food.x && headY === food.y) { score++; document.getElementById("score").innerText = score; food = { x: Math.floor(Math.random() * (canvasSize / box)) * box, y: Math.floor(Math.random() * (canvasSize / box)) * box, }; } else { snake.pop(); }

snake.unshift(newHead); }

function collision(head, array) { for (let i = 0; i < array.length; i++) { if (head.x === array[i].x && head.y === array[i].y) { return true; } } return false; }

function restartGame() { snake = [{ x: 160, y: 200 }]; direction = "RIGHT"; score = 0; document.getElementById("score").innerText = score; food = { x: Math.floor(Math.random() * (canvasSize / box)) * box, y: Math.floor(Math.random() * (canvasSize / box)) * box, }; clearInterval(game); game = setInterval(draw, 150); }

let game = setInterval(draw, 150);

