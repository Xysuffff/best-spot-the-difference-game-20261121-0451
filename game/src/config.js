// Game configuration constants
export const CANVAS_PADDING = 24;
export const CANVAS_GAP = 16;
export const MIN_CANVAS_SIZE = 320;
export const MAX_CANVAS_SIZE = 580;

export const DIFFERENCE_RADIUS = 18;
export const DIFFERENCE_MARKER_RADIUS = 22;
export const HINT_RADIUS = 36;

export const BASE_DIFFERENCES = 5;
export const MAX_DIFFERENCES = 10;
export const DIFFERENCES_PER_LEVEL = 1;

export const BASE_TIME_SECONDS = 120;
export const TIME_PER_DIFFERENCE = 15;
export const TIME_WARNING_THRESHOLD = 30;

export const MAX_HINTS = 3;
export const MAX_MISTAKES = 3;

export const LEVELS = [
  { name: "Garden", palette: "garden", baseDifferences: 5, complexity: 1 },
  { name: "Workshop", palette: "workshop", baseDifferences: 6, complexity: 2 },
  { name: "Library", palette: "library", baseDifferences: 7, complexity: 2 },
  { name: "Observatory", palette: "observatory", baseDifferences: 8, complexity: 3 },
  { name: "Conservatory", palette: "conservatory", baseDifferences: 9, complexity: 3 },
  { name: "Atelier", palette: "atelier", baseDifferences: 10, complexity: 4 },
];

export const PALETTES = {
  garden: {
    bg: ["#1a2e1a", "#152515", "#0f1f0f"],
    accent: ["#4ade80", "#22c55e", "#16a34a", "#86efac", "#bbf7d0"],
    secondary: ["#fde047", "#facc15", "#eab308", "#fef08a"],
    detail: ["#ffffff", "#e8f5e9", "#c8e6c9"],
    line: ["#2d4a2d", "#3d5a3d"],
  },
  workshop: {
    bg: ["#2e1a0f", "#25150c", "#1a1008"],
    accent: ["#fb923c", "#f97316", "#ea580c", "#fdba74", "#fed7aa"],
    secondary: ["#60a5fa", "#3b82f6", "#2563eb", "#93c5fd"],
    detail: ["#fff7ed", "#ffedd5", "#fed7aa"],
    line: ["#4a2a1a", "#5a3a2a"],
  },
  library: {
    bg: ["#1a162e", "#151025", "#0f0a1a"],
    accent: ["#a78bfa", "#8b5cf6", "#7c3aed", "#c4b5fd", "#ddd6fe"],
    secondary: ["#fde047", "#facc15", "#eab308", "#fef08a"],
    detail: ["#f3e8ff", "#e9d5ff", "#d8b4fe"],
    line: ["#2a224a", "#3a325a"],
  },
  observatory: {
    bg: ["#0a0f1a", "#081018", "#050810"],
    accent: ["#22d3ee", "#06b6d4", "#0891b2", "#67e8f9", "#a5f3fc"],
    secondary: ["#f472b6", "#ec4899", "#db2777", "#f9a8d4"],
    detail: ["#e0f2fe", "#bae6fd", "#7dd3fc"],
    line: ["#1a2a3a", "#2a3a4a"],
  },
  conservatory: {
    bg: ["#0f2a1a", "#0c2015", "#081510"],
    accent: ["#34d399", "#10b981", "#059669", "#6ee7b7", "#a7f3d0"],
    secondary: ["#fbbf24", "#f59e0b", "#d97706", "#fde68a"],
    detail: ["#ecfdf5", "#d1fae5", "#a7f3d0"],
    line: ["#1a3a2a", "#2a4a3a"],
  },
  atelier: {
    bg: ["#2a1a2e", "#201525", "#150f1a"],
    accent: ["#f472b6", "#ec4899", "#db2777", "#f9a8d4", "#fbcfe8"],
    secondary: ["#60a5fa", "#3b82f6", "#2563eb", "#93c5fd"],
    detail: ["#fdf2f8", "#fce7f3", "#fbcfe8"],
    line: ["#3a223e", "#4a324e"],
  },
};

export const ELEMENT_TYPES = [
  "circle", "rect", "triangle", "star", "flower", "leaf", "gear", "book", "bottle", "candle",
  "frame", "vase", "clock", "globe", "compass", "key", "lantern", "mirror", "potted", "scroll",
];

export const DIFFERENCE_TYPES = [
  "color", "missing", "extra", "size", "position", "rotation", "shape",
];

export const SCENE_ELEMENTS = {
  garden: [
    { type: "tree", count: [3, 5], size: [40, 80] },
    { type: "bush", count: [4, 8], size: [20, 40] },
    { type: "flower", count: [6, 12], size: [8, 16] },
    { type: "stone", count: [3, 6], size: [10, 25] },
    { type: "grass-tuft", count: [8, 16], size: [4, 10] },
    { type: "butterfly", count: [1, 3], size: [12, 20] },
    { type: "bird", count: [0, 2], size: [15, 25] },
    { type: "mushroom", count: [1, 3], size: [10, 18] },
    { type: "fallen-leaf", count: [4, 10], size: [6, 12] },
  ],
  workshop: [
    { type: "toolbox", count: [1, 2], size: [30, 50] },
    { type: "gear", count: [4, 8], size: [15, 35] },
    { type: "wrench", count: [2, 4], size: [25, 45] },
    { type: "hammer", count: [1, 2], size: [30, 50] },
    { type: "screw", count: [6, 12], size: [4, 8] },
    { type: "bolt", count: [4, 8], size: [6, 12] },
    { type: "shelf", count: [1, 2], size: [60, 120] },
    { type: "jar", count: [2, 4], size: [15, 30] },
    { type: "blueprint", count: [0, 1], size: [40, 60] },
  ],
  library: [
    { type: "bookshelf", count: [2, 3], size: [80, 140] },
    { type: "book", count: [12, 24], size: [8, 20] },
    { type: "ladder", count: [0, 1], size: [20, 100] },
    { type: "globe", count: [0, 1], size: [25, 40] },
    { type: "candle", count: [2, 4], size: [10, 25] },
    { type: "scroll", count: [1, 3], size: [15, 30] },
    { type: "reading-chair", count: [0, 1], size: [40, 60] },
    { type: "magnifying-glass", count: [0, 1], size: [18, 30] },
    { type: "inkwell", count: [0, 1], size: [12, 18] },
  ],
  observatory: [
    { type: "telescope", count: [1, 1], size: [40, 120] },
    { type: "star-chart", count: [1, 2], size: [30, 50] },
    { type: "compass", count: [1, 1], size: [20, 35] },
    { type: "planet-model", count: [2, 4], size: [15, 40] },
    { type: "hourglass", count: [0, 1], size: [18, 35] },
    { type: "lantern", count: [2, 3], size: [15, 30] },
    { type: "notebook", count: [1, 2], size: [20, 30] },
    { type: "constellation", count: [3, 6], size: [20, 40] },
    { type: "astrolabe", count: [0, 1], size: [25, 45] },
  ],
  conservatory: [
    { type: "large-plant", count: [2, 4], size: [50, 100] },
    { type: "potted-plant", count: [4, 8], size: [25, 50] },
    { type: "hanging-plant", count: [2, 4], size: [30, 60] },
    { type: "vine", count: [3, 6], size: [40, 80] },
    { type: "watering-can", count: [0, 1], size: [20, 35] },
    { type: "flower-pot", count: [3, 6], size: [15, 25] },
    { type: "gardening-tool", count: [1, 2], size: [25, 45] },
    { type: "seed-packet", count: [2, 4], size: [10, 18] },
    { type: "terrarium", count: [0, 1], size: [30, 40] },
  ],
  atelier: [
    { type: "easel", count: [1, 1], size: [40, 100] },
    { type: "canvas", count: [2, 4], size: [30, 50] },
    { type: "paint-tube", count: [6, 12], size: [8, 20] },
    { type: "brush", count: [4, 8], size: [20, 40] },
    { type: "palette", count: [1, 2], size: [25, 35] },
    { type: "statue", count: [1, 2], size: [30, 60] },
    { type: "drape", count: [1, 2], size: [40, 80] },
    { type: "sketch", count: [3, 6], size: [15, 25] },
    { type: "paint-jar", count: [2, 4], size: [12, 22] },
  ],
};

export const STORAGE_KEYS = {
  BEST_TIME: "twin_canvas_best_time",
  TOTAL_HINTS: "twin_canvas_total_hints",
  TOTAL_MISTAKES: "twin_canvas_total_mistakes",
};

export const BEST_KEY = "twin_canvas_best_time";
export const LIVES = 3;
export const STEP = 1 / 60;
