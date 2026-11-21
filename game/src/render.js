import { PALETTES, SCENE_ELEMENTS, DIFFERENCE_RADIUS, DIFFERENCE_MARKER_RADIUS, HINT_RADIUS, CANVAS_PADDING } from './config.js';

export const SCREEN_TITLE = 0;
export const SCREEN_PLAY = 1;
export const SCREEN_PAUSED = 2;
export const SCREEN_OVER = 3;

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let dpr = 1;
  let lastWidth = 0;
  let lastHeight = 0;
  let hintPulse = 0;
  let foundAnimations = [];

  function resize(width, height) {
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lastWidth = width;
    lastHeight = height;
  }

  function lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }

  function drawBackground(width, height, palette) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, palette.bg[0]);
    grad.addColorStop(0.5, palette.bg[1]);
    grad.addColorStop(1, palette.bg[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawPattern(width, height, palette, seed) {
    const rnd = seedRandom(seed);
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = palette.detail[0];
    for (let i = 0; i < 150; i++) {
      const x = rnd() * width;
      const y = rnd() * height;
      const r = rnd() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function seedRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state += 0x6D2B79F5;
      let z = state;
      z = Math.imul(z ^ (z >>> 15), 1 | z);
      z ^= z + Math.imul(z ^ (z >>> 7), 61 | z);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawElement(ctx, el, palette, side, diff = null, isHint = false, hintProgress = 0) {
    const { type, x, y, sizeRange, rotation, colorVariation, detailVariant } = el;
    const [minSize, maxSize] = sizeRange;
    const size = minSize + (maxSize - minSize) * colorVariation;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    let fillColor = palette.accent[Math.floor(colorVariation * (palette.accent.length - 1))];
    let strokeColor = palette.line[0];
    
    if (diff && diff.type === 'color' && diff.side === side) {
      fillColor = diff.newColor;
    }
    if (diff && diff.type === 'size' && diff.side === side) {
      ctx.scale(diff.scale, diff.scale);
    }
    if (diff && diff.type === 'rotation' && diff.side === side) {
      ctx.rotate(diff.rotation);
    }

    switch (type) {
      case 'tree':
        drawTree(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'bush':
        drawBush(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'flower':
        drawFlower(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'stone':
        drawStone(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'grass-tuft':
        drawGrassTuft(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'butterfly':
        drawButterfly(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'bird':
        drawBird(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'mushroom':
        drawMushroom(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'fallen-leaf':
        drawFallenLeaf(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'toolbox':
        drawToolbox(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'gear':
        drawGear(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'wrench':
        drawWrench(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'hammer':
        drawHammer(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'screw':
        drawScrew(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'bolt':
        drawBolt(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'shelf':
        drawShelf(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'jar':
        drawJar(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'blueprint':
        drawBlueprint(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'bookshelf':
        drawBookshelf(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'book':
        drawBook(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'ladder':
        drawLadder(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'globe':
        drawGlobe(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'candle':
        drawCandle(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'scroll':
        drawScroll(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'reading-chair':
        drawReadingChair(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'magnifying-glass':
        drawMagnifyingGlass(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'inkwell':
        drawInkwell(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'telescope':
        drawTelescope(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'star-chart':
        drawStarChart(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'compass':
        drawCompass(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'planet-model':
        drawPlanetModel(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'hourglass':
        drawHourglass(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'lantern':
        drawLantern(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'notebook':
        drawNotebook(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'constellation':
        drawConstellation(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'astrolabe':
        drawAstrolabe(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'large-plant':
        drawLargePlant(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'potted-plant':
        drawPottedPlant(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'hanging-plant':
        drawHangingPlant(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'vine':
        drawVine(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'watering-can':
        drawWateringCan(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'flower-pot':
        drawFlowerPot(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'gardening-tool':
        drawGardeningTool(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'seed-packet':
        drawSeedPacket(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'terrarium':
        drawTerrarium(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'easel':
        drawEasel(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'canvas':
        drawCanvas(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'paint-tube':
        drawPaintTube(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'brush':
        drawBrush(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'palette':
        drawPalette(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'statue':
        drawStatue(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'drape':
        drawDrape(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'sketch':
        drawSketch(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      case 'paint-jar':
        drawPaintJar(ctx, size, fillColor, strokeColor, palette, detailVariant);
        break;
      default:
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    if (isHint) {
      const pulse = Math.sin(hintProgress * Math.PI * 4) * 0.5 + 0.5;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3 + pulse * 2;
      ctx.globalAlpha = 0.6 + pulse * 0.4;
      ctx.beginPath();
      ctx.arc(0, 0, HINT_RADIUS, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawTree(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.1, size * 0.3, size * 0.2, size * 0.7);
    ctx.fillStyle = variant === 0 ? '#2d5a2d' : variant === 1 ? '#3d6a3d' : '#4d7a4d';
    ctx.beginPath();
    if (variant === 0) {
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(-size * 0.6, size * 0.2);
      ctx.lineTo(size * 0.6, size * 0.2);
    } else if (variant === 1) {
      ctx.arc(0, -size * 0.1, size * 0.5, 0, Math.PI * 2);
    } else {
      ctx.arc(0, -size * 0.2, size * 0.4, 0, Math.PI * 2);
      ctx.moveTo(-size * 0.3, size * 0.2);
      ctx.lineTo(0, -size * 0.5);
      ctx.lineTo(size * 0.3, size * 0.2);
    }
    ctx.fill();
  }

  function drawBush(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    const lobes = variant === 0 ? 5 : variant === 1 ? 7 : 9;
    ctx.beginPath();
    for (let i = 0; i < lobes; i++) {
      const angle = (i / lobes) * Math.PI * 2;
      const r = size * (0.4 + 0.3 * Math.sin(angle * 3));
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawFlower(ctx, size, fill, stroke, palette, variant) {
    const petals = variant === 0 ? 5 : variant === 1 ? 6 : 8;
    const petalColor = palette.secondary[Math.min(variant, palette.secondary.length - 1)];
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = petalColor;
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.3, size * 0.15, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStone(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = variant === 0 ? '#5a5a5a' : variant === 1 ? '#6a6a6a' : '#7a7a7a';
    ctx.beginPath();
    const points = variant === 0 ? 6 : variant === 1 ? 8 : 5;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = size * 0.5 * (0.7 + 0.3 * Math.sin(angle * 2));
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawGrassTuft(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = Math.max(1, size * 0.15);
    ctx.lineCap = 'round';
    const blades = variant === 0 ? 3 : variant === 1 ? 4 : 5;
    for (let i = 0; i < blades; i++) {
      const offset = (i - (blades - 1) / 2) * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(offset, size * 0.3);
      ctx.quadraticCurveTo(offset + (Math.random() - 0.5) * size * 0.3, -size * 0.2, offset, -size * 0.4);
      ctx.stroke();
    }
  }

  function drawButterfly(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(-size * 0.25, 0, size * 0.3, size * 0.2, -0.3, 0, Math.PI * 2);
    ctx.ellipse(size * 0.25, 0, size * 0.3, size * 0.2, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-size * 0.05, -size * 0.2, size * 0.1, size * 0.4);
  }

  function drawBird(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, 0);
    ctx.quadraticCurveTo(0, -size * 0.2, size * 0.4, 0);
    ctx.quadraticCurveTo(0, size * 0.1, -size * 0.4, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.1, 0);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.15, size * 0.5, 0);
    ctx.quadraticCurveTo(size * 0.3, size * 0.05, size * 0.1, 0);
    ctx.fill();
  }

  function drawMushroom(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-size * 0.08, 0, size * 0.16, size * 0.5);
    ctx.fillStyle = variant === 0 ? '#e53935' : variant === 1 ? '#fb8c00' : '#fdd835';
    ctx.beginPath();
    if (variant === 0) {
      ctx.arc(0, 0, size * 0.5, Math.PI, 0);
      ctx.lineTo(size * 0.5, 0);
      ctx.lineTo(-size * 0.5, 0);
    } else {
      ctx.ellipse(0, 0, size * 0.55, size * 0.35, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#fff8e1';
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * size * 0.2, Math.sin(angle) * size * 0.15, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFallenLeaf(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = palette.secondary[Math.min(variant, palette.secondary.length - 1)];
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.5, size * 0.25, variant * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.25);
    ctx.lineTo(0, size * 0.25);
    ctx.stroke();
  }

  function drawToolbox(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-size * 0.5, -size * 0.3, size, size * 0.6);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-size * 0.4, -size * 0.4, size * 0.8, size * 0.15);
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size * 0.5, -size * 0.3, size, size * 0.6);
  }

  function drawGear(ctx, size, fill, stroke, palette, variant) {
    const teeth = variant === 0 ? 8 : variant === 1 ? 10 : 12;
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i / (teeth * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? size * 0.5 : size * 0.3;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawWrench(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, 0);
    ctx.quadraticCurveTo(-size * 0.2, -size * 0.3, size * 0.1, -size * 0.2);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.arc(size * 0.3, 0, size * 0.3, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(size * 0.1, size * 0.2);
    ctx.quadraticCurveTo(-size * 0.2, size * 0.3, -size * 0.5, 0);
    ctx.stroke();
  }

  function drawHammer(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-size * 0.15, -size * 0.4, size * 0.3, size * 0.7);
    ctx.fillStyle = fill;
    ctx.fillRect(-size * 0.4, -size * 0.5, size * 0.8, size * 0.3);
  }

  function drawScrew(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.lineTo(0, size * 0.4);
    ctx.moveTo(-size * 0.4, 0);
    ctx.lineTo(size * 0.4, 0);
    ctx.stroke();
  }

  function drawBolt(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    const hexSize = size * 0.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * hexSize;
      const y = Math.sin(angle) * hexSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShelf(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#4a3728';
    ctx.fillRect(-size * 0.5, -size * 0.05, size, size * 0.1);
    ctx.fillRect(-size * 0.5, -size * 0.55, size * 0.1, size * 0.5);
    ctx.fillRect(size * 0.4, -size * 0.55, size * 0.1, size * 0.5);
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 1;
    ctx.strokeRect(-size * 0.5, -size * 0.05, size, size * 0.1);
  }

  function drawJar(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = lerpColor('#888888', fill, 0.3);
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.4);
    ctx.lineTo(-size * 0.25, size * 0.3);
    ctx.quadraticCurveTo(0, size * 0.4, size * 0.25, size * 0.3);
    ctx.lineTo(size * 0.3, -size * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(-size * 0.25, -size * 0.45, size * 0.5, size * 0.1);
  }

  function drawBlueprint(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(-size * 0.5, -size * 0.35, size, size * 0.7);
    ctx.strokeStyle = '#00b4d8';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = -size * 0.3 + i * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(-size * 0.4, y);
      ctx.lineTo(size * 0.4, y + (Math.random() - 0.5) * size * 0.1);
      ctx.stroke();
    }
  }

  function drawBookshelf(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.5, -size * 0.6, size, size * 1.2);
    ctx.strokeStyle = '#2d1810';
    ctx.lineWidth = 2;
    for (let i = 1; i < 5; i++) {
      const y = -size * 0.6 + i * size * 0.24;
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, y);
      ctx.lineTo(size * 0.5, y);
      ctx.stroke();
    }
  }

  function drawBook(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = variant === 0 ? '#b71c1c' : variant === 1 ? '#1a237e' : '#2e7d32';
    ctx.fillRect(-size * 0.4, -size * 0.6, size * 0.8, size * 1.2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `${size * 0.15}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('|', 0, size * 0.05);
  }

  function drawLadder(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.6);
    ctx.lineTo(-size * 0.2, size * 0.6);
    ctx.moveTo(size * 0.2, -size * 0.6);
    ctx.lineTo(size * 0.2, size * 0.6);
    for (let i = 0; i < 6; i++) {
      const y = -size * 0.5 + i * size * 0.2;
      ctx.moveTo(-size * 0.2, y);
      ctx.lineTo(size * 0.2, y);
    }
    ctx.stroke();
  }

  function drawGlobe(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.2, size * 0.5, Math.PI / 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawCandle(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-size * 0.2, -size * 0.6, size * 0.4, size * 1.2);
    ctx.fillStyle = '#ff6b00';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.65, size * 0.15, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.75, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawScroll(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6);
    ctx.fillStyle = '#d4c4a8';
    ctx.beginPath();
    ctx.arc(-size * 0.4, 0, size * 0.25, Math.PI / 2, -Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.4, 0, size * 0.25, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  }

  function drawReadingChair(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.4, -size * 0.2, size * 0.8, size * 0.4);
    ctx.fillRect(-size * 0.4, -size * 0.6, size * 0.8, size * 0.4);
    ctx.fillRect(-size * 0.5, size * 0.2, size * 0.1, size * 0.4);
    ctx.fillRect(size * 0.4, size * 0.2, size * 0.1, size * 0.4);
  }

  function drawMagnifyingGlass(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.35, size * 0.35);
    ctx.lineTo(size * 0.6, size * 0.6);
    ctx.stroke();
  }

  function drawInkwell(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.2, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-size * 0.35, -size * 0.1, size * 0.7, size * 0.3);
    ctx.fillStyle = '#0d0d1a';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.1, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawTelescope(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(-size * 0.15, -size * 0.6, size * 0.3, size * 1.2);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(-size * 0.2, -size * 0.65, size * 0.4, size * 0.15);
    ctx.fillRect(-size * 0.1, size * 0.5, size * 0.2, size * 0.15);
  }

  function drawStarChart(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(-size * 0.5, -size * 0.35, size, size * 0.7);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    const rnd = seedRandom(variant + 100);
    for (let i = 0; i < 12; i++) {
      const x = (rnd() - 0.5) * size * 0.9;
      const y = (rnd() - 0.5) * size * 0.6;
      const r = rnd() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawCompass(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.4);
    ctx.lineTo(-size * 0.08, -size * 0.1);
    ctx.lineTo(size * 0.08, -size * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, size * 0.4);
    ctx.lineTo(-size * 0.08, size * 0.1);
    ctx.lineTo(size * 0.08, size * 0.1);
    ctx.fill();
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.35);
    ctx.lineTo(-size * 0.06, -size * 0.05);
    ctx.lineTo(size * 0.06, -size * 0.05);
    ctx.fill();
  }

  function drawPlanetModel(ctx, size, fill, stroke, palette, variant) {
    const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
    ctx.fillStyle = colors[variant % colors.length];
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawHourglass(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.06;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, -size * 0.45);
    ctx.lineTo(size * 0.35, -size * 0.45);
    ctx.lineTo(size * 0.1, 0);
    ctx.lineTo(-size * 0.1, 0);
    ctx.lineTo(-size * 0.35, -size * 0.45);
    ctx.moveTo(-size * 0.35, size * 0.45);
    ctx.lineTo(size * 0.35, size * 0.45);
    ctx.lineTo(size * 0.1, 0);
    ctx.lineTo(-size * 0.1, 0);
    ctx.lineTo(-size * 0.35, size * 0.45);
    ctx.stroke();
    ctx.fillStyle = '#f5f0e1';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, -size * 0.4);
    ctx.lineTo(0, -size * 0.05);
    ctx.lineTo(size * 0.2, -size * 0.4);
    ctx.lineTo(-size * 0.2, -size * 0.4);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawLantern(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.1, -size * 0.5, size * 0.2, size * 0.6);
    ctx.fillStyle = lerpColor('#fff8e1', fill, 0.5);
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.3);
    ctx.lineTo(-size * 0.2, size * 0.2);
    ctx.lineTo(size * 0.2, size * 0.2);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff6b00';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.05, size * 0.15, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawNotebook(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6);
    ctx.strokeStyle = '#2d1810';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = -size * 0.25 + i * size * 0.1;
      ctx.beginPath();
      ctx.moveTo(-size * 0.35, y);
      ctx.lineTo(size * 0.35, y);
      ctx.stroke();
    }
  }

  function drawConstellation(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = 1.5;
    const rnd = seedRandom(variant + 200);
    const stars = [];
    for (let i = 0; i < 6; i++) {
      stars.push({ x: (rnd() - 0.5) * size * 0.8, y: (rnd() - 0.5) * size * 0.6 });
    }
    for (let i = 0; i < stars.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(stars[i].x, stars[i].y);
      ctx.lineTo(stars[i + 1].x, stars[i + 1].y);
      ctx.stroke();
    }
    ctx.fillStyle = '#fff8e1';
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAstrolabe(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.04;
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.15 * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.15, Math.sin(angle) * size * 0.15);
      ctx.lineTo(Math.cos(angle) * size * 0.45, Math.sin(angle) * size * 0.45);
      ctx.stroke();
    }
  }

  function drawLargePlant(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.08, size * 0.2, size * 0.16, size * 0.6);
    ctx.fillStyle = fill;
    for (let i = 0; i < 5; i++) {
      const y = -size * 0.4 + i * size * 0.15;
      const w = size * (0.3 + 0.2 * Math.sin(i));
      ctx.beginPath();
      ctx.ellipse(0, y, w, size * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPottedPlant(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-size * 0.35, size * 0.1, size * 0.7, size * 0.3);
    ctx.fillRect(-size * 0.4, size * 0.4, size * 0.8, size * 0.1);
    ctx.fillStyle = fill;
    const leaves = variant === 0 ? 4 : variant === 1 ? 5 : 6;
    for (let i = 0; i < leaves; i++) {
      const angle = (i / leaves) * Math.PI * 2 - Math.PI / 2;
      const len = size * 0.4;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.5, -len * 0.2, len, 0);
      ctx.quadraticCurveTo(len * 0.5, len * 0.2, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawHangingPlant(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = '#3d2817';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(0, -size * 0.2);
    ctx.stroke();
    ctx.fillStyle = fill;
    for (let i = 0; i < 4; i++) {
      const y = -size * 0.1 + i * size * 0.15;
      const len = size * (0.3 + 0.1 * Math.sin(i));
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(len, y - size * 0.1, len * 0.8, y + size * 0.1);
      ctx.quadraticCurveTo(0, y + size * 0.2, -len * 0.8, y + size * 0.1);
      ctx.quadraticCurveTo(-len, y - size * 0.1, 0, y);
      ctx.fill();
    }
  }

  function drawVine(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 0.5, -size * 0.4);
    for (let i = 0; i < 5; i++) {
      const x = -size * 0.5 + i * size * 0.25;
      const y = -size * 0.4 + Math.sin(i * 1.5) * size * 0.2;
      ctx.quadraticCurveTo(x + size * 0.125, y - size * 0.15, x + size * 0.25, y);
    }
    ctx.stroke();
    ctx.fillStyle = fill;
    for (let i = 0; i < 6; i++) {
      const x = -size * 0.45 + i * size * 0.2;
      const y = -size * 0.35 + Math.sin(i * 1.5) * size * 0.2;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.12, size * 0.08, Math.sin(i) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawWateringCan(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = fill;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.35, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.35, 0);
    ctx.lineTo(size * 0.6, -size * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, -size * 0.1);
    ctx.lineTo(-size * 0.5, -size * 0.3);
    ctx.stroke();
  }

  function drawFlowerPot(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.1);
    ctx.lineTo(-size * 0.4, size * 0.3);
    ctx.lineTo(size * 0.4, size * 0.3);
    ctx.lineTo(size * 0.3, -size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = fill;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc((i - 1) * size * 0.2, -size * 0.15, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawGardeningTool(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.6);
    ctx.fillStyle = fill;
    if (variant === 0) {
      ctx.fillRect(-size * 0.3, -size * 0.15, size * 0.5, size * 0.1);
    } else {
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(-size * 0.25 + i * size * 0.12, -size * 0.2, size * 0.08, size * 0.15);
      }
    }
  }

  function drawSeedPacket(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 1;
    ctx.strokeRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6);
    ctx.fillStyle = fill;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc((Math.random() - 0.5) * size * 0.5, (Math.random() - 0.5) * size * 0.4, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTerrarium(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, size * 0.3);
    ctx.lineTo(-size * 0.3, -size * 0.4);
    ctx.quadraticCurveTo(0, -size * 0.5, size * 0.3, -size * 0.4);
    ctx.lineTo(size * 0.35, size * 0.3);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = fill;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.25, size * 0.2, size * 0.5, size * 0.1);
  }

  function drawEasel(ctx, size, fill, stroke, palette, variant) {
    ctx.strokeStyle = '#4a3728';
    ctx.lineWidth = size * 0.06;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, size * 0.5);
    ctx.lineTo(0, -size * 0.5);
    ctx.lineTo(size * 0.3, size * 0.5);
    ctx.moveTo(-size * 0.2, size * 0.1);
    ctx.lineTo(size * 0.2, size * 0.1);
    ctx.stroke();
  }

  function drawCanvas(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(-size * 0.4, -size * 0.5, size * 0.8, size * 1.0);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size * 0.4, -size * 0.5, size * 0.8, size * 1.0);
    ctx.fillStyle = variant === 0 ? '#e53935' : variant === 1 ? '#1e88e5' : '#43a047';
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 5; i++) {
      const x = (Math.random() - 0.5) * size * 0.6;
      const y = (Math.random() - 0.5) * size * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPaintTube(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    ctx.fillRect(-size * 0.2, -size * 0.5, size * 0.4, size * 1.0);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(-size * 0.2, -size * 0.5, size * 0.4, size * 0.15);
    ctx.fillStyle = '#999999';
    ctx.beginPath();
    ctx.arc(0, size * 0.5, size * 0.2, 0, Math.PI);
    ctx.fill();
  }

  function drawBrush(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.7);
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(-size * 0.15, -size * 0.5, size * 0.3, size * 0.4);
  }

  function drawPalette(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#3d2817';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.35, 0, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.fillStyle = colors[(variant + i) % colors.length];
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * size * 0.25, Math.sin(angle) * size * 0.25, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStatue(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#bdbdbd';
    ctx.fillRect(-size * 0.2, -size * 0.5, size * 0.4, size * 1.0);
    ctx.fillStyle = '#9e9e9e';
    ctx.beginPath();
    ctx.arc(0, -size * 0.55, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDrape(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, -size * 0.5);
    ctx.quadraticCurveTo(0, -size * 0.3, size * 0.4, -size * 0.5);
    ctx.quadraticCurveTo(0, size * 0.1, size * 0.4, size * 0.5);
    ctx.lineTo(-size * 0.4, size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = lerpColor(fill, '#000000', 0.2);
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = -size * 0.5 + i * size * 0.25;
      ctx.beginPath();
      ctx.moveTo(-size * 0.35, y);
      ctx.quadraticCurveTo(0, y + size * 0.05, size * 0.35, y);
      ctx.stroke();
    }
  }

  function drawSketch(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6);
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    const rnd = seedRandom(variant + 300);
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo((rnd() - 0.5) * size * 0.7, (rnd() - 0.5) * size * 0.5);
      ctx.lineTo((rnd() - 0.5) * size * 0.7, (rnd() - 0.5) * size * 0.5);
      ctx.stroke();
    }
  }

  function drawPaintJar(ctx, size, fill, stroke, palette, variant) {
    ctx.fillStyle = fill;
    ctx.fillRect(-size * 0.25, -size * 0.35, size * 0.5, size * 0.7);
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(-size * 0.25, -size * 0.35, size * 0.5, size * 0.1);
    ctx.strokeStyle = '#999999';
    ctx.lineWidth = 1;
    ctx.strokeRect(-size * 0.25, -size * 0.35, size * 0.5, size * 0.7);
  }

  function drawScene(side, width, height, palette, elements, differences, found, hintData = null) {
    const layout = { leftOffset: CANVAS_PADDING, rightOffset: CANVAS_PADDING + width / 2 + 8 };
    const canvasWidth = width / 2 - 16;
    const offsetX = side === 'left' ? layout.leftOffset : layout.rightOffset;
    const offsetY = CANVAS_PADDING;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(canvasWidth / width, canvasHeight / height);
    
    drawBackground(width, height, palette);
    drawPattern(width, height, palette, side === 'left' ? 12345 : 54321);

    for (const el of elements) {
      let diff = null;
      let isHint = false;
      if (hintData && Math.abs(el.x - hintData.x) < 0.02 && Math.abs(el.y - hintData.y) < 0.02) {
        isHint = true;
      } else {
        for (let i = 0; i < differences.length; i++) {
          if (found[i]) continue;
          const d = differences[i];
          if (d.side === side && Math.abs(d.x - el.x) < 0.05 && Math.abs(d.y - el.y) < 0.05) {
            diff = d;
            break;
          }
        }
      }
      drawElement(ctx, el, palette, side, diff, isHint, hintPulse);
    }

    ctx.restore();
  }

  function drawMarkers(differences, found, layout, canvasSize) {
    for (let i = 0; i < differences.length; i++) {
      if (found[i]) continue;
      const d = differences[i];
      const side = d.type === 'missing' || d.type === 'extra' ? (d.side === 'left' ? 'right' : 'left') : 'both';
      
      const drawMarker = (offsetX) => {
        const x = offsetX + d.x * canvasSize;
        const y = CANVAS_PADDING + d.y * canvasSize;
        ctx.save();
        ctx.translate(x, y);
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2 * pulse;
        ctx.beginPath();
        ctx.arc(0, 0, DIFFERENCE_MARKER_RADIUS * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      };

      if (side === 'both' || side === 'left') {
        drawMarker(layout.leftOffset);
      }
      if (side === 'both' || side === 'right') {
        drawMarker(layout.rightOffset);
      }
    }
  }

  function drawFoundMarkers(differences, found, layout, canvasSize) {
    for (let i = 0; i < differences.length; i++) {
      if (!found[i]) continue;
      const d = differences[i];
      const anim = foundAnimations.find(a => a.index === i);
      const progress = anim ? anim.progress : 1;
      
      const drawMarker = (offsetX) => {
        const x = offsetX + d.x * canvasSize;
        const y = CANVAS_PADDING + d.y * canvasSize;
        ctx.save();
        ctx.translate(x, y);
        const scale = 0.5 + progress * 0.5;
        const alpha = 1 - progress * 0.5;
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3 * scale;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(0, 0, DIFFERENCE_MARKER_RADIUS * 1.5 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      };

      drawMarker(layout.leftOffset);
      drawMarker(layout.rightOffset);
    }
  }

  function drawHintIndicator(hintData, layout, canvasSize) {
    if (!hintData) return;
    const x = layout.leftOffset + hintData.x * canvasSize;
    const y = CANVAS_PADDING + hintData.y * canvasSize;
    ctx.save();
    ctx.translate(x, y);
    const pulse = Math.sin(hintPulse * Math.PI * 4) * 0.5 + 0.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3 + pulse * 2;
    ctx.globalAlpha = 0.6 + pulse * 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, HINT_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawUI(state, layout, canvasSize, width, height) {
    // UI is drawn in HTML, not canvas
  }

  let canvasHeight = 0;

  function draw(state, screen, best, hintData = null) {
      const width = lastWidth;
      const height = lastHeight;
      canvasHeight = height;
    
      if (width !== canvas.width / dpr || height !== canvas.height / dpr) {
        resize(width, height);
      }

      ctx.clearRect(0, 0, width, height);
    
      const layout = { leftOffset: CANVAS_PADDING, rightOffset: CANVAS_PADDING + state.canvasWidth + 8, canvasSize: state.canvasWidth };

      if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED || screen === SCREEN_TITLE || screen === SCREEN_OVER) {
        if (state.levelConfig && state.palette) {
          drawScene('left', width, height, state.palette, state.sceneElements.left, state.differences, state.found, hintData || state.hintData);
          drawScene('right', width, height, state.palette, state.sceneElements.right, state.differences, state.found, hintData || state.hintData);
        
        if (screen === SCREEN_PLAY) {
          drawMarkers(state.differences, state.found, layout, state.canvasWidth);
          drawFoundMarkers(state.differences, state.found, layout, state.canvasWidth);
          drawHintIndicator(state.hintData, layout, state.canvasWidth);
        }
      }
    }

    if (screen === SCREEN_TITLE) {
      drawTitleScreen(width, height, best);
    } else if (screen === SCREEN_PAUSED) {
      drawPauseOverlay(width, height);
    } else if (screen === SCREEN_OVER) {
      drawGameOverOverlay(width, height, state, best);
    }

    hintPulse += 1 / 60;
    if (hintPulse > 1) hintPulse = 0;

    foundAnimations = foundAnimations.filter(a => {
      a.progress += 1 / 30;
      return a.progress < 1;
    });
  }

  function drawTitleScreen(width, height, best) {
    ctx.fillStyle = 'rgba(10,12,16,0.9)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#e8e8e8';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Twin Canvas', width / 2, height / 2 - 60);
    ctx.font = '20px system-ui';
    ctx.fillStyle = '#8b93a3';
    ctx.fillText('Spot the Difference', width / 2, height / 2 - 20);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText('Press Space or Click to Start', width / 2, height / 2 + 40);
    if (best > 0) {
      ctx.fillStyle = '#4ade80';
      ctx.font = '16px system-ui';
      ctx.fillText(`Best Time: ${formatTime(best)}`, width / 2, height / 2 + 80);
    }
  }

  function drawPauseOverlay(width, height) {
    ctx.fillStyle = 'rgba(10,12,16,0.85)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#e8e8e8';
    ctx.font = 'bold 32px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', width / 2, height / 2);
    ctx.font = '16px system-ui';
    ctx.fillStyle = '#8b93a3';
    ctx.fillText('Press Space or P to Resume', width / 2, height / 2 + 40);
  }

  function drawGameOverOverlay(width, height, state, best) {
    ctx.fillStyle = 'rgba(10,12,16,0.95)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 48px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Game Complete!', width / 2, height / 2 - 60);
    ctx.fillStyle = '#e8e8e8';
    ctx.font = '20px system-ui';
    ctx.fillText(`Total Time: ${formatTime(state.totalTime)}`, width / 2, height / 2);
    ctx.fillText(`Best Time: ${best > 0 ? formatTime(best) : '--:--'}`, width / 2, height / 2 + 40);
    ctx.fillStyle = '#8b93a3';
    ctx.font = '16px system-ui';
    ctx.fillText('Press Space to Play Again', width / 2, height / 2 + 100);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function triggerFoundAnimation(index) {
    foundAnimations.push({ index, progress: 0 });
  }

  return { draw, resize, triggerFoundAnimation };
}
