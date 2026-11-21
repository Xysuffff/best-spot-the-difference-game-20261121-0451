import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_OVER } from './render.js';
import { LEVELS, PALETTES, SCENE_ELEMENTS, BASE_DIFFERENCES, DIFFERENCES_PER_LEVEL, MAX_DIFFERENCES, CANVAS_PADDING } from './config.js';
import { createRandom } from './random.js';

export function stageShot(name, world) {
  const state = world.getState();
  let screen;
  let best = 0;
  
  switch (name) {
    case 'start':
      screen = SCREEN_TITLE;
      // Ensure all required state properties exist
      state.levelConfig = LEVELS[0];
      state.palette = PALETTES[LEVELS[0].palette];
      state.canvasWidth = 500;
      state.canvasHeight = 500;
      state.sceneElements = { left: [], right: [] };
      state.differences = [];
      state.found = [];
      state.hintData = null;
      break;
    case 'play':
      screen = SCREEN_PLAY;
      state.level = 1;
      state.levelConfig = LEVELS[1];
      state.palette = PALETTES[LEVELS[1].palette];
      state.canvasWidth = 500;
      state.canvasHeight = 500;
      
      // Generate a simple scene for the screenshot
      const random = createRandom(1);
      const elements = SCENE_ELEMENTS[LEVELS[1].palette] || SCENE_ELEMENTS.garden;
      const baseElements = [];
      for (const el of elements.slice(0, 5)) {
        const count = el.count[0] + random.nextInt(el.count[1] - el.count[0] + 1);
        for (let i = 0; i < Math.min(count, 4); i++) {
          baseElements.push({
            type: el.type,
            sizeRange: el.size,
            x: random.nextFloat(0.15, 0.85),
            y: random.nextFloat(0.2, 0.8),
            rotation: random.nextFloat(0, Math.PI * 2),
            colorVariation: random.nextFloat(0, 1),
            detailVariant: random.nextInt(3),
          });
        }
      }
      state.sceneElements = { left: baseElements, right: baseElements.map(e => ({ ...e })) };
      
      // Create some differences
      const diffCount = Math.min(BASE_DIFFERENCES + 1 * DIFFERENCES_PER_LEVEL, MAX_DIFFERENCES);
      state.differences = [];
      state.found = [];
      for (let i = 0; i < diffCount; i++) {
        const pos = { x: 0.2 + (i % 3) * 0.25, y: 0.3 + Math.floor(i / 3) * 0.25 };
        state.differences.push({
          id: i,
          type: ['color', 'missing', 'extra', 'size', 'position'][i % 5],
          x: pos.x,
          y: pos.y,
          found: i === 0 || i === 3,
        });
        state.found.push(i === 0 || i === 3);
      }
      state.hintData = { x: 0.5, y: 0.5 };
      break;
    case 'end':
      screen = SCREEN_OVER;
      state.gameComplete = true;
      state.totalTime = 180;
      state.levelConfig = LEVELS[LEVELS.length - 1];
      state.palette = PALETTES[LEVELS[LEVELS.length - 1].palette];
      state.canvasWidth = 500;
      state.canvasHeight = 500;
      state.sceneElements = { left: [], right: [] };
      state.differences = [];
      state.found = [];
      state.hintData = null;
      best = 150;
      break;
    default:
      screen = SCREEN_TITLE;
      state.levelConfig = LEVELS[0];
      state.palette = PALETTES[LEVELS[0].palette];
      state.canvasWidth = 500;
      state.canvasHeight = 500;
      state.sceneElements = { left: [], right: [] };
      state.differences = [];
      state.found = [];
      state.hintData = null;
  }
  
  return { screen, state, best };
}
