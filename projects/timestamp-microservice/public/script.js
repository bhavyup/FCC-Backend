/**
 * Epoch — Client Runtime
 * Analog clock engine, console interface, and real-time data feed.
 */

;(function () {
  'use strict';

  // ───────────────────────────────────────────
  // DOM References
  // ───────────────────────────────────────────
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const hourHand   = $('#hour-hand');
  const minuteHand = $('#minute-hand');
  const secondHand = $('#second-hand');

  const readoutTime = $('#readout-time');
  const readoutDate = $('#readout-date');
  const readoutUnix = $('#readout-unix');
  const readoutUtc  = $('#readout-utc');

  const dateInput     = $('#date-input');
  const runBtn        = $('#run-btn');
  const copyBtn       = $('#copy-btn');
  const consoleOutput = $('#console-output');

  // ───────────────────────────────────────────
  // Generate minute ticks for clock face
  // ───────────────────────────────────────────
  function initMinuteTicks() {
    const g = $('#minute-ticks');
    if (!g) return;
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue; // skip hour markers
      const angle = i * 6;
      const rad = (angle - 90) * (Math.PI / 180);
      const r1 = 90, r2 = 94;
      const x1 = 100 + r1 * Math.cos(rad);
      const y1 = 100 + r1 * Math.sin(rad);
      const x2 = 100 + r2 * Math.cos(rad);
      const y2 = 100 + r2 * Math.sin(rad);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      g.appendChild(line);
    }
  }

  // ───────────────────────────────────────────
  // Analog Clock Engine
  // ───────────────────────────────────────────
  function rotateClock() {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    // Continuous smooth rotation
    const sDeg = (s + ms / 1000) * 6;           // 360/60
    const mDeg = (m + s / 60) * 6;              // 360/60
    const hDeg = (h + m / 60 + s / 3600) * 30;  // 360/12

    if (secondHand) secondHand.style.transform = `rotate(${sDeg}deg)`;
    if (minuteHand) minuteHand.style.transform = `rotate(${mDeg}deg)`;
    if (hourHand)   hourHand.style.transform   = `rotate(${hDeg}deg)`;
  }

  // ───────────────────────────────────────────
  // Digital Readout
  // ───────────────────────────────────────────
  function updateReadout() {
    const now = new Date();

    // Time
    if (readoutTime) {
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      readoutTime.textContent = `${hh}:${mm}:${ss}`;
    }

    // Date
    if (readoutDate) {
      readoutDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    // Unix
    if (readoutUnix) {
      readoutUnix.textContent = now.getTime();
    }

    // UTC
    if (readoutUtc) {
      readoutUtc.textContent = now.toUTCString();
    }
  }

  // ───────────────────────────────────────────
  // Main tick loop (requestAnimationFrame for smooth hands)
  // ───────────────────────────────────────────
  let lastSecond = -1;

  function tick() {
    rotateClock();

    const sec = new Date().getSeconds();
    if (sec !== lastSecond) {
      lastSecond = sec;
      updateReadout();
    }

    requestAnimationFrame(tick);
  }

  // ───────────────────────────────────────────
  // Console — API Tester
  // ───────────────────────────────────────────
  function clearOutput() {
    if (consoleOutput) consoleOutput.innerHTML = '';
  }

  function addLine(text, cls) {
    if (!consoleOutput) return;
    const div = document.createElement('div');
    div.className = `output-line ${cls || ''}`;
    div.textContent = text;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }

  function renderJSON(data) {
    clearOutput();

    const isError = !!data.error;

    // Request URL line
    const value = dateInput ? dateInput.value.trim() : '';
    const endpoint = value ? `/api/${encodeURIComponent(value)}` : '/api';
    addLine(`→ ${window.location.origin}${endpoint}`, 'url');
    addLine('', '');

    // Render each key
    Object.entries(data).forEach(([key, val]) => {
      const valStr = typeof val === 'string' ? `"${val}"` : String(val);
      const cls = isError ? 'error' : (typeof val === 'string' ? 'string' : 'number');

      const div = document.createElement('div');
      div.className = 'output-line';

      const keySpan = document.createElement('span');
      keySpan.className = 'output-line key';
      keySpan.textContent = `  ${key}: `;

      const valSpan = document.createElement('span');
      valSpan.className = `output-line ${cls}`;
      valSpan.textContent = valStr;

      div.appendChild(keySpan);
      div.appendChild(valSpan);
      consoleOutput.appendChild(div);
    });
  }

  async function runQuery() {
    const value = dateInput ? dateInput.value.trim() : '';
    const endpoint = value ? `/api/${encodeURIComponent(value)}` : '/api';

    clearOutput();
    addLine('// Requesting...', 'comment');

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      renderJSON(data);
    } catch (err) {
      clearOutput();
      addLine(`// Error: ${err.message}`, 'error');
    }
  }

  // ───────────────────────────────────────────
  // Copy Endpoint URL
  // ───────────────────────────────────────────
  function copyURL() {
    const value = dateInput ? dateInput.value.trim() : '';
    const endpoint = value ? `/api/${encodeURIComponent(value)}` : '/api';
    const url = `${window.location.origin}${endpoint}`;

    navigator.clipboard.writeText(url).then(() => {
      if (copyBtn) {
        copyBtn.style.color = 'var(--ok)';
        setTimeout(() => { copyBtn.style.color = ''; }, 1500);
      }
    }).catch(() => {});
  }

  // ───────────────────────────────────────────
  // Event Bindings
  // ───────────────────────────────────────────
  if (runBtn)   runBtn.addEventListener('click', runQuery);
  if (copyBtn)  copyBtn.addEventListener('click', copyURL);

  if (dateInput) {
    dateInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runQuery();
    });
  }

  $$('.preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (dateInput) dateInput.value = btn.dataset.value;
      runQuery();
    });
  });

  // ───────────────────────────────────────────
  // Boot
  // ───────────────────────────────────────────
  initMinuteTicks();
  tick();
  runQuery(); // initial fetch

})();
