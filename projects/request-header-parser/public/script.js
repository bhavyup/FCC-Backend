/**
 * Signal — Request Identity Instrument
 * Client-side: radar animation, identity scan, terminal console.
 */
(function () {
  'use strict';

  // ============================================
  // RADAR ANIMATION
  // ============================================

  const radarInit = () => {
    const ticksGroup = document.getElementById('radarTicks');
    const blipsGroup = document.getElementById('radarBlips');
    if (!ticksGroup || !blipsGroup) return;

    const cx = 150, cy = 150, r = 140;

    // Generate perimeter tick marks (every 6 degrees)
    for (let deg = 0; deg < 360; deg += 6) {
      const rad = (deg * Math.PI) / 180;
      const len = deg % 30 === 0 ? 8 : 4;
      const x1 = cx + (r - len) * Math.sin(rad);
      const y1 = cy - (r - len) * Math.cos(rad);
      const x2 = cx + r * Math.sin(rad);
      const y2 = cy - r * Math.cos(rad);

      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x1);
      tick.setAttribute('y1', y1);
      tick.setAttribute('x2', x2);
      tick.setAttribute('y2', y2);
      ticksGroup.appendChild(tick);
    }

    // Place decorative blips at fixed positions
    const blipPositions = [
      { angle: 42, dist: 85 },
      { angle: 165, dist: 110 },
      { angle: 260, dist: 60 },
    ];

    blipPositions.forEach(({ angle, dist }) => {
      const rad = (angle * Math.PI) / 180;
      const bx = cx + dist * Math.sin(rad);
      const by = cy - dist * Math.cos(rad);

      const blip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      blip.setAttribute('cx', bx);
      blip.setAttribute('cy', by);
      blip.setAttribute('r', '3');
      blip.classList.add('radar-blip');
      blipsGroup.appendChild(blip);
    });
  };

  // ============================================
  // IDENTITY READOUT
  // ============================================

  const fieldIp = document.getElementById('fieldIp');
  const fieldLang = document.getElementById('fieldLang');
  const fieldSoftware = document.getElementById('fieldSoftware');
  const readoutJson = document.getElementById('readoutJson');
  const readoutStatus = document.getElementById('readoutStatus');
  const btnScan = document.getElementById('btnScan');
  const btnCopy = document.getElementById('btnCopy');

  let lastResult = null;

  const setStatus = (state, label) => {
    readoutStatus.className = 'readout-status ' + state;
    readoutStatus.textContent = label;
  };

  const highlightField = (el) => {
    el.classList.add('highlight');
    setTimeout(() => el.classList.remove('highlight'), 1200);
  };

  // Resolve base path from pathname (immune to #hash and ?query)
  const basePath = window.location.pathname.endsWith('/')
    ? 'api'
    : '/api';

  const scanIdentity = async () => {
    setStatus('scanning', 'scanning');
    btnScan.disabled = true;

    try {
      const res = await fetch(`${basePath}/whoami`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      lastResult = data;

      // Populate fields with a staggered reveal
      const fields = [
        { el: fieldIp, val: data.ipaddress || '—' },
        { el: fieldLang, val: data.language || '—' },
        { el: fieldSoftware, val: data.software || '—' },
      ];

      fields.forEach(({ el, val }, i) => {
        setTimeout(() => {
          el.textContent = val;
          highlightField(el);
        }, i * 150);
      });

      // Show formatted JSON
      readoutJson.textContent = JSON.stringify(data, null, 2);

      setTimeout(() => {
        setStatus('active', 'decoded');
        btnCopy.disabled = false;
      }, fields.length * 150);
    } catch (err) {
      setStatus('', 'error');
      readoutJson.textContent = `Error: ${err.message}`;
      fieldIp.textContent = '—';
      fieldLang.textContent = '—';
      fieldSoftware.textContent = '—';
    } finally {
      btnScan.disabled = false;
    }
  };

  btnScan.addEventListener('click', scanIdentity);

  // Copy JSON
  btnCopy.addEventListener('click', () => {
    if (!lastResult) return;
    const text = JSON.stringify(lastResult, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnCopy.textContent;
      btnCopy.textContent = 'Copied';
      btnCopy.classList.add('btn--success');
      setTimeout(() => {
        btnCopy.textContent = originalText;
        btnCopy.classList.remove('btn--success');
      }, 1500);
    });
  });

  // ============================================
  // CONSOLE TESTER
  // ============================================

  const consoleBody = document.getElementById('consoleBody');
  const consoleInput = document.getElementById('consoleInput');
  const btnRun = document.getElementById('btnRun');

  const addConsoleLine = (type, content) => {
    const line = document.createElement('div');

    if (type === 'command') {
      line.className = 'console-line';
      line.innerHTML = `<span class="console-prompt">$</span><span class="console-text">curl <span class="console-url">${escapeHtml(content)}</span></span>`;
    } else if (type === 'output') {
      line.className = 'console-output';
      line.textContent = content;
    } else if (type === 'error') {
      line.className = 'console-output console-error';
      line.textContent = content;
    }

    consoleBody.appendChild(line);
    consoleBody.scrollTop = consoleBody.scrollHeight;
  };

  const runConsoleCommand = async () => {
    const endpoint = consoleInput.value.trim();
    if (!endpoint) return;

    // Resolve relative to pathname, not href (immune to #hash)
    const fetchUrl = endpoint.startsWith('http') || endpoint.startsWith('/')
      ? endpoint
      : `${basePath}/${endpoint.replace(/^\//, '')}`;

    addConsoleLine('command', endpoint);

    try {
      const res = await fetch(fetchUrl);
      const data = await res.json();
      addConsoleLine('output', JSON.stringify(data, null, 2));
    } catch (err) {
      addConsoleLine('error', `Error: ${err.message}`);
    }
  };

  btnRun.addEventListener('click', runConsoleCommand);
  consoleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runConsoleCommand();
  });

  // ============================================
  // UTILITIES
  // ============================================

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // ============================================
  // INIT
  // ============================================

  document.addEventListener('DOMContentLoaded', () => {
    radarInit();
    // Auto-scan on load
    scanIdentity();
  });
})();
