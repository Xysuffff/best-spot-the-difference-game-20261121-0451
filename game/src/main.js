import { BEST_KEY, LIVES, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_HIT, EVENT_OVER, EVENT_FOUND, EVENT_LEVEL_COMPLETE, EVENT_GAME_COMPLETE, EVENT_HINT_USED } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_HINT, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const levelDisplay = document.getElementById('level-display');
const foundCount = document.getElementById('found-count');
const remainingCount = document.getElementById('remaining-count');
const timerEl = document.getElementById('timer');
const hintBtn = document.getElementById('hint-btn');
const hintCount = document.getElementById('hint-count');
const levelComplete = document.getElementById('level-complete');
const lcTime = document.getElementById('lc-time');
const lcHints = document.getElementById('lc-hints');
const lcMistakes = document.getElementById('lc-mistakes');
const nextLevelBtn = document.getElementById('next-level-btn');
const gameOver = document.getElementById('game-over');
const goTotalTime = document.getElementById('go-total-time');
const goTotalHints = document.getElementById('go-total-hints');
const goTotalMistakes = document.getElementById('go-total-mistakes');
const goBestTime = document.getElementById('go-best-time');
const restartBtn = document.getElementById('restart-btn');
const toast = document.getElementById('toast');

const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = 'visible ' + type;
  setTimeout(() => {
    toast.className = '';
  }, 3000);
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(scene.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let totalTime = 0;
  let totalHints = 0;
  let totalMistakes = 0;
  let hintData = null;
  let hintTimeout = null;

  function announce(message) {
    statusEl.textContent = message;
  }

  function updateHUD() {
    const state = world.state;
    levelDisplay.textContent = state.level + 1;
    foundCount.textContent = state.foundCount;
    remainingCount.textContent = state.totalDifferences - state.foundCount;
    const time = Math.max(0, Math.ceil(state.timeRemaining));
    timerEl.textContent = formatTime(time);
    timerEl.classList.toggle('warning', time <= 30);
    hintCount.textContent = state.hintsRemaining;
    hintBtn.disabled = state.hintsRemaining <= 0 || state.paused || state.gameComplete;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    totalTime = 0;
    totalHints = 0;
    totalMistakes = 0;
    announce(`Level ${world.state.level + 1}: ${world.state.levelConfig.name}. Find ${world.state.totalDifferences} differences.`);
    levelComplete.classList.remove('visible');
    gameOver.classList.remove('visible');
    updateHUD();
  }

  function endGame() {
    screen = SCREEN_OVER;
    const state = world.state;
    totalTime = state.totalTime || 0;
    totalHints = state.hintsUsed;
    totalMistakes = state.mistakes;
    if (totalTime > 0 && (best === 0 || totalTime < best)) {
      best = totalTime;
      saveBest(best);
    }
    goTotalTime.textContent = formatTime(totalTime);
    goTotalHints.textContent = totalHints;
    goTotalMistakes.textContent = totalMistakes;
    goBestTime.textContent = best > 0 ? formatTime(best) : '--:--';
    gameOver.classList.add('visible');
    announce(`All levels complete! Total time: ${formatTime(totalTime)}. Best: ${best > 0 ? formatTime(best) : 'N/A'}.`);
  }

  function completeLevel() {
    const state = world.state;
    const levelTime = state.timeLimit - state.timeRemaining;
    totalTime += levelTime;
    totalHints += state.hintsUsed;
    totalMistakes += state.mistakes;
    lcTime.textContent = formatTime(levelTime);
    lcHints.textContent = state.hintsUsed;
    lcMistakes.textContent = state.mistakes;
    levelComplete.classList.add('visible');
    announce(`Level ${state.level + 1} complete! Time: ${formatTime(levelTime)}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    const mousePos = input.getMousePos();
    
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
        startGame();
      } else if (screen === SCREEN_PLAY) {
        const result = world.checkClick(mousePos.x, mousePos.y, canvas.width, canvas.height);
        if (result.hit) {
          if (result.event & EVENT_FOUND) {
            renderer.triggerFoundAnimation(result.index);
            showToast('Difference found!', 'success');
            announce(`Found! ${world.state.foundCount} of ${world.state.totalDifferences}.`);
          }
          if (result.event & EVENT_LEVEL_COMPLETE) {
            completeLevel();
          }
          if (result.event & EVENT_GAME_COMPLETE) {
            endGame();
          }
        } else if (result.event & EVENT_MISTAKE) {
          showToast('Not a difference!', 'error');
          announce(`Mistake! ${world.state.mistakes} mistakes.`);
        }
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const hint = world.useHint();
      if (hint) {
        hintData = { x: hint.x, y: hint.y };
        showToast('Hint activated!', 'hint');
        announce('Hint: look around this area.');
        if (hintTimeout) clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
          hintData = null;
        }, 3000);
        updateHUD();
      }
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, 0, true);
      return;
    }
    const state = world.step(STEP, input.direction(), false);
    updateHUD();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, hintData);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  nextLevelBtn.addEventListener('click', () => {
    const result = world.nextLevel();
    if (result.event & EVENT_GAME_COMPLETE) {
      endGame();
    } else {
      startGame();
    }
  });

  restartBtn.addEventListener('click', () => {
    startGame();
  });

  hintBtn.addEventListener('click', () => {
    if (screen === SCREEN_PLAY) {
      const hint = world.useHint();
      if (hint) {
        hintData = { x: hint.x, y: hint.y };
        showToast('Hint activated!', 'hint');
        announce('Hint: look around this area.');
        if (hintTimeout) clearTimeout(hintTimeout);
        hintTimeout = setTimeout(() => {
          hintData = null;
        }, 3000);
        updateHUD();
      }
    }
  });

  canvas.addEventListener('click', (e) => {
    if (screen === SCREEN_PLAY) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const result = world.checkClick(x, y, canvas.width, canvas.height);
      if (result.hit) {
        if (result.event & EVENT_FOUND) {
          renderer.triggerFoundAnimation(result.index);
          showToast('Difference found!', 'success');
          announce(`Found! ${world.state.foundCount} of ${world.state.totalDifferences}.`);
        }
        if (result.event & EVENT_LEVEL_COMPLETE) {
          completeLevel();
        }
        if (result.event & EVENT_GAME_COMPLETE) {
          endGame();
        }
      } else if (result.event & EVENT_MISTAKE) {
        showToast('Not a difference!', 'error');
        announce(`Mistake! ${world.state.mistakes} mistakes.`);
      }
    }
  });

  announce('Twin Canvas. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
