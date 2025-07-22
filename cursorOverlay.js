// cursorOverlay.js  ─ runs inside the page, NO imports/exports
(() => {
  const style = document.createElement('style');
  style.textContent = `
    #pw-cursor {
      width: 12px;
      height: 12px;
      border: 2px solid red;
      border-radius: 50%;
      position: fixed;
      z-index: 999999;
      pointer-events: none;
      transition: background 0.1s;
    }`;
  document.head.appendChild(style);

  const dot = document.createElement('div');
  dot.id = 'pw-cursor';
  document.body.appendChild(dot);

  document.addEventListener('mousemove', e => {
    dot.style.transform = `translate(${e.clientX - 6}px,${e.clientY - 6}px)`;
  });
  document.addEventListener('mousedown', () => (dot.style.background = 'red'));
  document.addEventListener('mouseup',   () => (dot.style.background = ''));
})();
