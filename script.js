const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBox = document.getElementById('scoreBox');
const resetButton = document.getElementById('resetButton');

// Set up canvas size
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Center dot coordinates
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Minimum Radius for a valid circle (in pixels)
const MIN_RADIUS = 50;  // 0.5 meters = 50 pixels (adjust based on your scale)

// Variables
let isDrawing = false;
let points = [];
let currentPath = [];
let scoreTimer;

// Draw center red dot
function drawCenterDot() {
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
  ctx.fill();
}

// Event Listeners for mouse and touch
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startDrawing(e.touches[0]);
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  draw(e.touches[0]);
});
canvas.addEventListener('touchend', stopDrawing);

// Start drawing
function startDrawing(event) {
  isDrawing = true;
  points = [];
  currentPath = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterDot();
}

// Draw points
function draw(event) {
  if (!isDrawing) return;

  const { x, y } = getMousePosition(event);
  points.push({ x, y });

  // Draw a small point
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, Math.PI * 2);
  ctx.fill();

  currentPath.push({ x, y });

  // Update score dynamically
  if (!scoreTimer) {
    scoreTimer = setTimeout(() => {
      calculateScore();
      scoreTimer = null;
    }, 100); // Calculate every 100ms
  }
}

// Stop drawing
function stopDrawing() {
  isDrawing = false;
  if (!isCenterInsidePath(currentPath)) {
    scoreBox.textContent = 'Score: 0 (Dot not inside circle!)';
    updateGlow(0);
  }
}

// Get mouse/touch position
function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.clientX || event.pageX || event.touches[0].clientX;
  const clientY = event.clientY || event.pageY || event.touches[0].clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

// Check if center dot is inside the drawn path
function isCenterInsidePath(path) {
  ctx.beginPath();
  path.forEach(({ x, y }, index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  return ctx.isPointInPath(centerX, centerY);
}

// Calculate score dynamically
function calculateScore() {
  if (points.length < 5) return;

  let totalRadius = 0, variance = 0;

  points.forEach(({ x, y }) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    totalRadius += radius;
  });

  const avgRadius = totalRadius / points.length;

  // If the average radius is less than 0.5 meters (50 pixels), set the score to 0
  if (avgRadius < MIN_RADIUS) {
    scoreBox.textContent = 'Score: 0 (Too small!)';
    updateGlow(0);
    return;
  }

  // Calculate variance
  points.forEach(({ x, y }) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    variance += Math.abs(radius - avgRadius);
  });

  const score = Math.max(0, 100 - variance / points.length);
  
  // If the center is inside the circle, show the score
  if (isCenterInsidePath(points)) {
    scoreBox.textContent = `Score: ${Math.round(score)}`;
    updateGlow(score);
  } else {
    scoreBox.textContent = `Score: 0 (Dot not inside circle!)`;
    updateGlow(0);
  }
}

// Update glowing effect
function updateGlow(score) {
  const intensity = Math.min(score, 100);
  scoreBox.style.textShadow = `0 0 ${intensity / 5}px rgba(144, 238, 144, 1)`;
}

// Reset game
resetButton.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  scoreBox.textContent = 'Score: 0';
  updateGlow(0);
  points = [];
  currentPath = [];
  drawCenterDot();
});

// Initial render
drawCenterDot();
