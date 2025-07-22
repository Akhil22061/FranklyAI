// tests/credit-card.e2e.ts
import { test, expect } from '@playwright/test';
import path from 'path';

const cursorHelper = path.resolve(__dirname, '../showCursor.js');

test.beforeEach(async ({ page }) => {
  await page.addInitScript({ path: cursorHelper });
});

/* ...the rest of your test steps... */

// showCursor.js  – inject once at test-startup
(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    #pw-cursor {
      width: 12px;
      height: 12px;
      border: 2px solid red;
      border-radius: 50%;
      position: fixed;
      z-index: 999999;           /* above everything */
      pointer-events: none;      /* never blocks clicks */
      transition: background 0.1s;
    }`;
  document.head.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = 'pw-cursor';
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX - 6}px,${e.clientY - 6}px)`;
  });

  document.addEventListener('mousedown', () => (cursor.style.background = 'red'));
  document.addEventListener('mouseup',   () => (cursor.style.background = ''));
})();
