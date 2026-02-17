/**
 * PULSE — Frontend Script
 * ECG visualization, signal tracking, terminal aesthetic.
 */

(() => {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  
  const BASE_PATH = '';
  const API_BASE = `${BASE_PATH}/api`;

  // ============================================
  // DOM ELEMENTS
  // ============================================
  
  const userForm = document.getElementById('userForm');
  const exerciseForm = document.getElementById('exerciseForm');
  const logForm = document.getElementById('logForm');
  
  const userResponse = document.getElementById('userResponse');
  const userResponseBody = document.getElementById('userResponseBody');
  const closeUserResponse = document.getElementById('closeUserResponse');
  
  const exerciseResponse = document.getElementById('exerciseResponse');
  const exerciseResponseBody = document.getElementById('exerciseResponseBody');
  const closeExerciseResponse = document.getElementById('closeExerciseResponse');
  
  const logResponse = document.getElementById('logResponse');
  const logResponseBody = document.getElementById('logResponseBody');
  const logCount = document.getElementById('logCount');
  const closeLogResponse = document.getElementById('closeLogResponse');
  
  const signalsGrid = document.getElementById('signalsGrid');
  const refreshSignals = document.getElementById('refreshSignals');

  // ============================================
  // ECG ANIMATION
  // ============================================
  
  function initECG() {
    const canvas = document.getElementById('ecgCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    // ECG data points
    const points = [];
    const maxPoints = Math.ceil(width / 2);
    let x = 0;
    let lastBeat = 0;
    
    // Generate ECG pattern
    function getECGValue(t) {
      // P-QRS-T wave pattern
      const cycle = t % 300;
      if (cycle < 20) return 0.1 * Math.sin(cycle * Math.PI / 10); // P wave
      if (cycle < 40) return 0; // PR segment
      if (cycle < 50) return -0.15; // Q
      if (cycle < 60) return 1.0; // R (peak)
      if (cycle < 70) return -0.3; // S
      if (cycle < 120) return 0; // ST segment
      if (cycle < 160) return 0.2 * Math.sin((cycle - 120) * Math.PI / 40); // T wave
      return 0; // Baseline
    }
    
    function draw() {
      // Fade effect
      ctx.fillStyle = 'rgba(17, 17, 17, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
      ctx.lineWidth = 1;
      
      // Vertical grid
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      // Horizontal grid
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      
      // Center line
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      // Generate new point
      const now = Date.now();
      const value = getECGValue(now);
      const y = height / 2 - value * (height * 0.3);
      
      points.push({ x, y });
      if (points.length > maxPoints) points.shift();
      
      // Draw ECG line
      ctx.strokeStyle = '#00FF41';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00FF41';
      ctx.shadowBlur = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (i === 0) ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      // Draw leading dot
      if (points.length > 0) {
        const last = points[points.length - 1];
        ctx.fillStyle = '#00FF41';
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.shadowColor = '#00FF41';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Advance x
      x += 2;
      if (x > width) {
        x = 0;
        points.length = 0;
      }
      
      requestAnimationFrame(draw);
    }
    
    draw();
  }

  // ============================================
  // SPARKLINE FOR SIGNAL CARDS
  // ============================================
  
  function drawSparkline(canvas, data) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (!data || data.length < 2) {
      // Flat line
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }
    
    const max = Math.max(...data) || 1;
    const min = Math.min(...data) || 0;
    const range = max - min || 1;
    
    ctx.strokeStyle = '#00FF41';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height * 0.8 - height * 0.1;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // ============================================
  // API FUNCTIONS
  // ============================================
  
  async function createUser(username) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username })
    });
    return res.json();
  }
  
  async function addExercise(userId, description, duration, date) {
    const body = new URLSearchParams({
      description,
      duration: String(duration)
    });
    if (date) body.append('date', date);
    
    const res = await fetch(`${API_BASE}/users/${userId}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    return res.json();
  }
  
  async function getLogs(userId, from, to, limit) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (limit) params.append('limit', String(limit));
    
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/users/${userId}/logs${query}`);
    return res.json();
  }
  
  async function getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  }

  // ============================================
  // UI FUNCTIONS
  // ============================================
  
  function showResponse(element, bodyElement, data, isError = false) {
    element.hidden = false;
    element.classList.toggle('error', isError);
    bodyElement.textContent = JSON.stringify(data, null, 2);
  }
  
  function hideResponse(element) {
    element.hidden = true;
  }
  
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const success = document.execCommand('copy');
      document.body.removeChild(ta);
      return success;
    }
  }

  // ============================================
  // RENDER SIGNALS
  // ============================================
  
  async function renderSignals() {
    const users = await getUsers();
    
    if (!users.length || users.error) {
      signalsGrid.innerHTML = `
        <div class="empty-signal">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <p>No active signals detected.</p>
          <p class="empty-hint">Register a signal to begin tracking.</p>
        </div>
      `;
      return;
    }
    
    // Get logs for sparklines
    const signalsWithData = await Promise.all(
      users.map(async (user) => {
        const logs = await getLogs(user._id);
        return { user, logs };
      })
    );
    
    signalsGrid.innerHTML = signalsWithData.map(({ user, logs }, i) => {
      const durations = logs.log?.map(e => e.duration) || [];
      const canvasId = `sparkline-${user._id}`;
      
      return `
        <div class="signal-card" style="animation-delay: ${i * 0.05}s">
          <div class="signal-header">
            <span class="signal-name">${escapeHtml(user.username)}</span>
            <span class="signal-id">${user._id}</span>
          </div>
          <div class="signal-sparkline">
            <canvas id="${canvasId}"></canvas>
          </div>
          <div class="signal-actions">
            <button class="signal-btn use-id" data-id="${user._id}">Use ID</button>
            <button class="signal-btn view-log" data-id="${user._id}">View Log</button>
            <button class="signal-btn copy" data-id="${user._id}" title="Copy ID">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Draw sparklines after DOM update
    setTimeout(() => {
      signalsWithData.forEach(({ user, logs }) => {
        const canvas = document.getElementById(`sparkline-${user._id}`);
        if (canvas) {
          const durations = logs.log?.map(e => e.duration) || [];
          drawSparkline(canvas, durations);
        }
      });
    }, 0);
    
    // Attach handlers
    document.querySelectorAll('.signal-btn.use-id').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        document.getElementById('userId').value = id;
        document.getElementById('logUserId').value = id;
        document.getElementById('userId').focus();
        document.getElementById('userId').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    
    document.querySelectorAll('.signal-btn.view-log').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        document.getElementById('logUserId').value = id;
        const logs = await getLogs(id);
        showResponse(logResponse, logResponseBody, logs);
        logCount.textContent = `${logs.count || 0} beats`;
        logResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
    
    document.querySelectorAll('.signal-btn.copy').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const success = await copyToClipboard(id);
        if (success) {
          const original = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
          btn.style.color = '#00FF41';
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.color = '';
          }, 1500);
        }
      });
    });
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (!username) return;
    
    const data = await createUser(username);
    const isError = !!data.error;
    showResponse(userResponse, userResponseBody, data, isError);
    
    if (!isError) {
      document.getElementById('username').value = '';
      renderSignals();
    }
  });
  
  closeUserResponse.addEventListener('click', () => hideResponse(userResponse));
  
  exerciseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value.trim();
    const description = document.getElementById('description').value.trim();
    const duration = document.getElementById('duration').value;
    const date = document.getElementById('date').value;
    
    if (!userId || !description || !duration) return;
    
    const data = await addExercise(userId, description, duration, date);
    const isError = !!data.error;
    showResponse(exerciseResponse, exerciseResponseBody, data, isError);
    
    if (!isError) {
      document.getElementById('description').value = '';
      document.getElementById('duration').value = '';
      document.getElementById('date').value = '';
      renderSignals();
    }
  });
  
  closeExerciseResponse.addEventListener('click', () => hideResponse(exerciseResponse));
  
  logForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('logUserId').value.trim();
    const from = document.getElementById('fromDate').value;
    const to = document.getElementById('toDate').value;
    const limit = document.getElementById('limit').value;
    
    if (!userId) return;
    
    const data = await getLogs(userId, from, to, limit);
    const isError = !!data.error;
    showResponse(logResponse, logResponseBody, data, isError);
    logCount.textContent = `${data.count || 0} beats`;
  });
  
  closeLogResponse.addEventListener('click', () => hideResponse(logResponse));
  
  refreshSignals.addEventListener('click', () => {
    refreshSignals.classList.add('spinning');
    renderSignals().then(() => {
      setTimeout(() => refreshSignals.classList.remove('spinning'), 500);
    });
  });

  // ============================================
  // INIT
  // ============================================
  
  initECG();
  renderSignals();
  
  // Focus username on load
  document.getElementById('username').focus();
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideResponse(userResponse);
      hideResponse(exerciseResponse);
      hideResponse(logResponse);
    }
  });
})();