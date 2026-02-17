/**
 * Knot — Frontend Script
 * Handles form submission, knot visualization, and interactions.
 */

(() => {
  'use strict';

  // DOM Elements
  const form = document.getElementById('knotForm');
  const urlInput = document.getElementById('urlInput');
  const knotBtn = document.getElementById('knotBtn');
  const resultCard = document.getElementById('resultCard');
  const resultClose = document.getElementById('resultClose');
  const originalUrl = document.getElementById('originalUrl');
  const shortUrl = document.getElementById('shortUrl');
  const copyBtn = document.getElementById('copyBtn');
  const jsonPreview = document.getElementById('jsonPreview');
  const errorCard = document.getElementById('errorCard');
  const errorMessage = document.getElementById('errorMessage');
  const knotsList = document.getElementById('knotsList');
  const spoolCount = document.getElementById('spoolCount');

  const BASE = window.location.origin;

  // State
  let isSubmitting = false;

  // ===== Helpers =====

  function truncate(str, n = 50) {
    return str.length > n ? str.slice(0, n) + '…' : str;
  }

  function formatShortUrl(id) {
    return `${BASE}/api/shorturl/${id}`;
  }

  function setLoading(loading) {
    isSubmitting = loading;
    knotBtn.disabled = loading;
    const btnText = knotBtn.querySelector('.knot-btn-text');
    btnText.textContent = loading ? 'Tying...' : 'Tie Knot';
  }

  function showResult(data) {
    errorCard.hidden = true;
    resultCard.hidden = false;
    
    originalUrl.textContent = truncate(data.original_url, 60);
    shortUrl.href = formatShortUrl(data.short_url);
    shortUrl.textContent = formatShortUrl(data.short_url);
    jsonPreview.textContent = JSON.stringify(data, null, 2);
    
    copyBtn.classList.remove('copied');
    copyBtn.querySelector('.copy-text').textContent = 'Copy';
    
    // Restart timebar animation
    const timebar = document.getElementById('resultTimebar');
    timebar.classList.remove('active');
    void timebar.offsetWidth;  // force reflow to restart animation
    timebar.classList.add('active');

    setTimeout(hideResults, 8000);
    
    // Scroll to result on mobile
    if (window.innerWidth <= 900) {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function showError(msg) {
    resultCard.hidden = true;
    errorCard.hidden = false;
    errorMessage.textContent = msg || 'Please provide a valid http:// or https:// URL';
  }

  function hideResults() {
    resultCard.hidden = true;
    errorCard.hidden = true;
    urlInput.value = '';
    urlInput.focus();
  }

  // ===== Copy Functionality =====

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
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

  copyBtn.addEventListener('click', async () => {
    const url = shortUrl.textContent;
    if (!url) return;
    
    const success = await copyToClipboard(url);
    if (success) {
      copyBtn.classList.add('copied');
      copyBtn.querySelector('.copy-text').textContent = 'Copied!';
      
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.querySelector('.copy-text').textContent = 'Copy';
      }, 2000);
    }
  });

  resultClose.addEventListener('click', hideResults);

  // ===== Form Submission =====

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    const rawUrl = urlInput.value.trim();
    if (!rawUrl) return;
    
    setLoading(true);
    
    try {
      const res = await fetch('/api/shorturl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ url: rawUrl }),
      });
      
      const data = await res.json();
      
      if (data.error) {
        showError(data.error === 'invalid url' 
          ? 'Please provide a valid http:// or https:// URL' 
          : data.error);
      } else {
        showResult(data);
        fetchKnots(); // Refresh the spool
      }
    } catch (err) {
      showError('Network error. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  });

  // ===== Fetch and Render Knots =====

  async function fetchKnots() {
    try {
      const res = await fetch('/api/urls');
      const data = await res.json();
      
      spoolCount.textContent = data.count || 0;
      renderKnots(data.urls || []);
    } catch (err) {
      console.error('Failed to fetch knots:', err);
    }
  }

  function renderKnots(urls) {
    if (!urls.length) {
      knotsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <p class="empty-text">No knots yet.<br>Tie your first thread.</p>
        </div>
      `;
      return;
    }
    
    knotsList.innerHTML = urls.map((item, index) => `
      <div class="knot-item" style="animation-delay: ${index * 0.05}s">
        <div class="knot-node"></div>
        <div class="knot-content">
          <div class="knot-id">Knot #${item.short_url}</div>
          <div class="knot-original" title="${item.original_url}">
            ${truncate(item.original_url, 45)}
          </div>
          <div class="knot-short">
            <a href="${formatShortUrl(item.short_url)}" 
               class="knot-link" 
               target="_blank" 
               rel="noopener">
              ${formatShortUrl(item.short_url)}
            </a>
            <div class="knot-actions">
              <button class="knot-action copy-knot" data-url="${formatShortUrl(item.short_url)}" title="Copy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
              <a href="${formatShortUrl(item.short_url)}" 
                 class="knot-action" 
                 target="_blank" 
                 rel="noopener"
                 title="Visit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Attach copy handlers to knot items
    document.querySelectorAll('.copy-knot').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const url = e.currentTarget.dataset.url;
        const success = await copyToClipboard(url);
        
        if (success) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
          btn.style.color = 'var(--success)';
          
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.color = '';
          }, 1500);
        }
      });
    });
  }

  // ===== Initialization =====

  urlInput.focus();
  fetchKnots();
  
  // Refresh knots every 30 seconds
  setInterval(fetchKnots, 30000);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // ESC to close results
    if (e.key === 'Escape' && !resultCard.hidden) {
      hideResults();
    }
    
    // Cmd/Ctrl + K to focus input
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      urlInput.focus();
      urlInput.select();
    }
  });
})();