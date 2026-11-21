export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;

export function createInput(canvas) {
  const keys = new Set();
  const actions = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;
  let clickX = 0;
  let clickY = 0;
  let hasClick = false;

  function onKeyDown(e) {
    keys.add(e.code);
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    keys.delete(e.code);
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  function onMouseDown(e) {
    mouseDown = true;
    const rect = canvas.getBoundingClientRect();
    clickX = e.clientX - rect.left;
    clickY = e.clientY - rect.top;
  }

  function onMouseUp(e) {
    if (mouseDown) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - clickX;
      const dy = y - clickY;
      if (dx * dx + dy * dy < 100) {
        hasClick = true;
      }
    }
    mouseDown = false;
  }

  function onTouchStart(e) {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      clickX = e.touches[0].clientX - rect.left;
      clickY = e.touches[0].clientY - rect.top;
      mouseDown = true;
    }
  }

  function onTouchEnd(e) {
    if (mouseDown && e.changedTouches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const x = e.changedTouches[0].clientX - rect.left;
      const y = e.changedTouches[0].clientY - rect.top;
      const dx = x - clickX;
      const dy = y - clickY;
      if (dx * dx + dy * dy < 100) {
        hasClick = true;
      }
    }
    mouseDown = false;
  }

  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);

  canvas.setAttribute('tabindex', '0');

  return {
    direction() {
      let dx = 0, dy = 0;
      if (keys.has('ArrowLeft') || keys.has('KeyA')) dx -= 1;
      if (keys.has('ArrowRight') || keys.has('KeyD')) dx += 1;
      if (keys.has('ArrowUp') || keys.has('KeyW')) dy -= 1;
      if (keys.has('ArrowDown') || keys.has('KeyS')) dy += 1;
      return { x: dx, y: dy };
    },
    takeActions() {
      let a = 0;
      if (keys.has('Space') || keys.has('Enter')) a |= ACTION_CONFIRM;
      if (keys.has('Escape') || keys.has('KeyP')) a |= ACTION_PAUSE;
      if (keys.has('KeyH')) a |= ACTION_HINT;
      if (hasClick) {
        a |= ACTION_CONFIRM;
        hasClick = false;
      }
      return a;
    },
    getMousePos() {
      return { x: mouseX, y: mouseY };
    },
    destroy() {
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    },
  };
}
