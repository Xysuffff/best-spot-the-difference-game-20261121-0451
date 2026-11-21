import { createRandom } from './random.js';
import { LEVELS, PALETTES, SCENE_ELEMENTS, CANVAS_PADDING, CANVAS_GAP, MIN_CANVAS_SIZE, MAX_CANVAS_SIZE, DIFFERENCE_RADIUS, BASE_DIFFERENCES, DIFFERENCES_PER_LEVEL, MAX_DIFFERENCES, BASE_TIME_SECONDS, TIME_PER_DIFFERENCE } from './config.js';

export const EVENT_FOUND = 1;
export const EVENT_MISTAKE = 2;
export const EVENT_LEVEL_COMPLETE = 4;
export const EVENT_GAME_COMPLETE = 8;
export const EVENT_HINT_USED = 16;
export const EVENT_HIT = 32;
export const EVENT_OVER = 64;

export function createWorld(random) {
  const state = {
    level: 0,
    differences: [],
    found: [],
    mistakes: 0,
    hintsUsed: 0,
    hintsRemaining: 3,
    timeRemaining: 0,
    timeLimit: 0,
    startTime: 0,
    paused: false,
    gameComplete: false,
    canvasWidth: 0,
    canvasHeight: 0,
    leftOffset: 0,
    rightOffset: 0,
    sceneElements: { left: [], right: [] },
    palette: null,
    levelConfig: null,
  };

  function initLevel(levelIndex) {
    state.level = levelIndex;
    state.levelConfig = LEVELS[levelIndex];
    state.palette = PALETTES[state.levelConfig.palette];
    const diffCount = Math.min(BASE_DIFFERENCES + levelIndex * DIFFERENCES_PER_LEVEL, MAX_DIFFERENCES);
    
    state.differences = [];
    state.found = new Array(diffCount).fill(false);
    state.mistakes = 0;
    state.hintsUsed = 0;
    state.hintsRemaining = 3;
    state.timeLimit = BASE_TIME_SECONDS + diffCount * TIME_PER_DIFFERENCE;
    state.timeRemaining = state.timeLimit;
    state.startTime = performance.now();
    state.paused = false;
    state.gameComplete = false;

    generateScene(diffCount);
  }

  function generateScene(diffCount) {
    const levelName = state.levelConfig.palette;
    const elements = SCENE_ELEMENTS[levelName] || SCENE_ELEMENTS.garden;
    const complexity = state.levelConfig.complexity;
    
    const baseElements = [];
    for (const el of elements) {
      const count = el.count[0] + random.nextInt(el.count[1] - el.count[0] + 1);
      for (let i = 0; i < count; i++) {
        baseElements.push({
          type: el.type,
          sizeRange: el.size,
          x: random.nextFloat(0.1, 0.9),
          y: random.nextFloat(0.15, 0.85),
          rotation: random.nextFloat(0, Math.PI * 2),
          colorVariation: random.nextFloat(0, 1),
          detailVariant: random.nextInt(3),
        });
      }
    }

    state.sceneElements.left = baseElements.map(el => ({ ...el }));
    state.sceneElements.right = baseElements.map(el => ({ ...el }));

    const availablePositions = [];
    const margin = 0.12;
    const gridSize = Math.ceil(Math.sqrt(diffCount * 2));
    for (let gx = 0; gx < gridSize; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        const x = margin + (1 - 2 * margin) * (gx + 0.5) / gridSize;
        const y = margin + (1 - 2 * margin) * (gy + 0.5) / gridSize;
        availablePositions.push({ x, y });
      }
    }
    random.shuffle(availablePositions);

    const diffTypes = ['color', 'missing', 'extra', 'size', 'position', 'rotation', 'shape'];
    
    for (let i = 0; i < diffCount && i < availablePositions.length; i++) {
      const pos = availablePositions[i];
      const type = random.choice(diffTypes);
      const elementType = random.choice(elements.filter(e => e.count[1] > 0)).type;
      
      let diff = {
        id: i,
        type,
        elementType,
        x: pos.x,
        y: pos.y,
        found: false,
      };

      switch (type) {
        case 'color':
          diff.originalColor = random.choice(state.palette.accent);
          diff.newColor = random.choice(state.palette.accent.filter(c => c !== diff.originalColor));
          break;
        case 'missing':
          diff.side = random.choice(['left', 'right']);
          break;
        case 'extra':
          diff.side = random.choice(['left', 'right']);
          diff.extraType = random.choice(elements.map(e => e.type).filter(t => t !== elementType));
          break;
        case 'size':
          diff.scale = random.nextFloat(0.5, 0.8);
          diff.side = random.choice(['left', 'right']);
          break;
        case 'position':
          diff.offsetX = random.nextFloat(-0.08, 0.08);
          diff.offsetY = random.nextFloat(-0.08, 0.08);
          diff.side = random.choice(['left', 'right']);
          break;
        case 'rotation':
          diff.rotation = random.nextFloat(-Math.PI / 3, Math.PI / 3);
          diff.side = random.choice(['left', 'right']);
          break;
        case 'shape':
          diff.newType = random.choice(elements.map(e => e.type).filter(t => t !== elementType));
          diff.side = random.choice(['left', 'right']);
          break;
      }
      
      state.differences.push(diff);
    }
  }

  function getCanvasLayout(width, height) {
    const availableWidth = width - 2 * CANVAS_PADDING - CANVAS_GAP;
    const availableHeight = height - 2 * CANVAS_PADDING;
    const canvasSize = Math.min(
      Math.max(MIN_CANVAS_SIZE, Math.floor(availableWidth / 2)),
      Math.max(MIN_CANVAS_SIZE, availableHeight),
      MAX_CANVAS_SIZE
    );
    
    state.canvasWidth = canvasSize;
    state.canvasHeight = canvasSize;
    state.leftOffset = CANVAS_PADDING;
    state.rightOffset = CANVAS_PADDING + canvasSize + CANVAS_GAP;
    
    return { canvasSize, leftOffset: state.leftOffset, rightOffset: state.rightOffset };
  }

  function checkClick(clientX, clientY, width, height) {
    if (state.paused || state.gameComplete) return { hit: false };
    
    const layout = getCanvasLayout(width, height);
    
    let clickedCanvas = null;
    let localX, localY;
    
    if (clientX >= layout.leftOffset && clientX < layout.leftOffset + layout.canvasSize &&
        clientY >= CANVAS_PADDING && clientY < CANVAS_PADDING + layout.canvasSize) {
      clickedCanvas = 'left';
      localX = (clientX - layout.leftOffset) / layout.canvasSize;
      localY = (clientY - CANVAS_PADDING) / layout.canvasSize;
    } else if (clientX >= layout.rightOffset && clientX < layout.rightOffset + layout.canvasSize &&
               clientY >= CANVAS_PADDING && clientY < CANVAS_PADDING + layout.canvasSize) {
      clickedCanvas = 'right';
      localX = (clientX - layout.rightOffset) / layout.canvasSize;
      localY = (clientY - CANVAS_PADDING) / layout.canvasSize;
    } else {
      return { hit: false };
    }

    for (let i = 0; i < state.differences.length; i++) {
      if (state.found[i]) continue;
      const diff = state.differences[i];
      const dx = diff.x - localX;
      const dy = diff.y - localY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radiusNorm = DIFFERENCE_RADIUS / layout.canvasSize;
      
      if (dist <= radiusNorm) {
              state.found[i] = true;
              diff.found = true;
              const allFound = state.found.every(f => f);
              if (allFound) {
                state.paused = true;
                return { hit: true, event: EVENT_FOUND | EVENT_LEVEL_COMPLETE, index: i, x: diff.x, y: diff.y };
              }
              return { hit: true, event: EVENT_FOUND, index: i, x: diff.x, y: diff.y };
            }
    }

    state.mistakes++;
    return { hit: false, event: EVENT_MISTAKE };
  }

  function useHint() {
    if (state.hintsRemaining <= 0 || state.paused || state.gameComplete) return null;
    
    const unfound = state.differences
      .map((d, i) => ({ diff: d, index: i }))
      .filter(({ diff }) => !diff.found);
    
    if (unfound.length === 0) return null;
    
    const hint = random.choice(unfound);
    state.hintsRemaining--;
    state.hintsUsed++;
    
    return { index: hint.index, x: hint.diff.x, y: hint.diff.y, event: EVENT_HINT_USED };
  }

  function nextLevel() {
    if (state.level + 1 >= LEVELS.length) {
      state.gameComplete = true;
      return { event: EVENT_GAME_COMPLETE };
    }
    initLevel(state.level + 1);
    return { event: 0 };
  }

  function restart() {
    initLevel(0);
  }

  function updateTime() {
    if (state.paused || state.gameComplete) return state.timeRemaining;
    const elapsed = (performance.now() - state.startTime) / 1000;
    state.timeRemaining = Math.max(0, state.timeLimit - elapsed);
    if (state.timeRemaining <= 0) {
      state.paused = true;
      state.gameComplete = true;
    }
    return state.timeRemaining;
  }

  function getState() {
    return {
      ...state,
      differences: state.differences.map((d, i) => ({ ...d, found: state.found[i] })),
      foundCount: state.found.filter(f => f).length,
      totalDifferences: state.differences.length,
    };
  }

  initLevel(0);

  return {
    state: getState(),
    reset: restart,
    step: () => { updateTime(); return getState(); },
    checkClick,
    useHint,
    nextLevel,
    getCanvasLayout,
    getState,
  };
}
