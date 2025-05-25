const grid = document.getElementById('grid');
const message = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const difficultyLabel = document.getElementById('difficulty-label');
const highScoresList = document.getElementById('highScores');
let minePositions = [];
let score = 0;

function getDifficultyFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('difficulty') || 'easy';
}

function getMineCount(difficulty) {
  switch (difficulty.toLowerCase()) {
    case 'hard': return 5;
    case 'insane': return 7;
    default: return 3;
  }
}

function formatDifficultyText(difficulty, mineCount) {
  const capitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return `Difficulty: ${capitalized} (${mineCount} Bomb${mineCount > 1 ? 's' : ''})`;
}

function generateMines(count) {
  const positions = new Set();
  while (positions.size < count) {
    positions.add(Math.floor(Math.random() * 25));
  }
  return Array.from(positions);
}

function resetGame() {
  grid.innerHTML = '';
  message.textContent = '';
  score = 0;

  const difficulty = getDifficultyFromURL();
  const mineCount = getMineCount(difficulty);

  difficultyLabel.textContent = formatDifficultyText(difficulty, mineCount);
  minePositions = generateMines(mineCount);

  for (let i = 0; i < 25; i++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.dataset.index = i;
    tile.addEventListener('click', handleClick);
    grid.appendChild(tile);
  }
}

function handleClick(event) {
  const tile = event.currentTarget;
  const index = parseInt(tile.dataset.index);

  if (tile.classList.contains('clicked') || tile.classList.contains('mine')) return;

  if (minePositions.includes(index)) {
    tile.classList.add('mine');
    tile.textContent = '💥';
    message.textContent = `Game Over! Score: ${score}`;
    revealAllMines();
    saveScore(score);
  } else {
    tile.classList.add('clicked');
    tile.textContent = '💎';
    score++;
    checkWin();
  }
}

function revealAllMines() {
  document.querySelectorAll('.tile').forEach(tile => {
    const index = parseInt(tile.dataset.index);
    if (minePositions.includes(index)) {
      tile.classList.add('mine');
      tile.textContent = '💥';
    }
    tile.removeEventListener('click', handleClick);
  });
}

function checkWin() {
  const clickedTiles = document.querySelectorAll('.tile.clicked').length;
  if (clickedTiles === 25 - minePositions.length) {
    message.textContent = `You Win! Final Score: ${score}`;
    revealAllMines();
    saveScore(score);
  }
}

function saveScore(score) {
  const difficulty = getDifficultyFromURL();
  const key = `scores-${difficulty}`;
  const existing = JSON.parse(localStorage.getItem(key)) || [];
  existing.push(score); // Don't sort, just push to keep attempt order
  if (existing.length > 10) {
    existing.shift(); // Attempts only
  }
  localStorage.setItem(key, JSON.stringify(existing));
  renderScores();
}

function getOrdinalSuffix(n) {
  if (n % 100 >= 11 && n % 100 <= 13) return n + 'th';
  switch (n % 10) {
    case 1: return n + 'st';
    case 2: return n + 'nd';
    case 3: return n + 'rd';
    default: return n + 'th';
  }
}

function renderScores() {
  const difficulty = getDifficultyFromURL();
  const key = `scores-${difficulty}`;
  const scores = JSON.parse(localStorage.getItem(key)) || [];
  highScoresList.innerHTML = scores
    .map((s, i) => `<li>${getOrdinalSuffix(i + 1)} attempt: ${s}</li>`)
    .join('');
}

function clearScores() {
  const difficulties = ['easy', 'hard', 'insane'];
  difficulties.forEach(difficulty => {
    localStorage.removeItem(`scores-${difficulty}`);
  });
  renderScores();
}

function handleBack() {
  clearScores();
  window.location.href = 'dashboard.html';
}

resetBtn.addEventListener('click', resetGame);
window.onload = () => {
  resetGame();
  renderScores();
};
