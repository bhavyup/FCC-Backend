// ============================================
// DOM ELEMENTS
// ============================================
const urlForm = document.getElementById('url-form');
const urlInput = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
const resultSection = document.getElementById('result-section');
const resultSuccess = document.getElementById('result-success');
const resultError = document.getElementById('result-error');
const originalUrlDisplay = document.getElementById('original-url-display');
const shortUrlDisplay = document.getElementById('short-url-display');
const shortUrlLink = document.getElementById('short-url-link');
const errorMessage = document.getElementById('error-message');
const jsonResponse = document.getElementById('json-response');
const jsonOutput = document.getElementById('json-output');
const urlsList = document.getElementById('urls-list');
const refreshBtn = document.getElementById('refresh-urls');
const copyShortUrlBtn = document.getElementById('copy-short-url');
const copyJsonBtn = document.getElementById('copy-json');

// ============================================
// FORM SUBMISSION
// ============================================
urlForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = urlInput.value.trim();
  if (!url) return;
  
  // Set loading state
  submitBtn.classList.add('loading');
  submitBtn.innerHTML = '<i class="fas fa-spinner"></i><span>Shortening...</span>';
  
  try {
    // Use URLSearchParams to send as application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('url', url);

    const response = await fetch('/api/shorturl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    const data = await response.json();
    
    // Show result section
    resultSection.style.display = 'block';
    jsonResponse.style.display = 'block';
    
    // Update JSON output
    jsonOutput.textContent = JSON.stringify(data, null, 2);
    
    if (data.error) {
      // Show error
      resultSuccess.style.display = 'none';
      resultError.style.display = 'flex';
      errorMessage.textContent = data.error;
      jsonOutput.style.color = '#ef4444';
    } else {
      // Show success
      resultError.style.display = 'none';
      resultSuccess.style.display = 'flex';
      
      const baseUrl = window.location.origin;
      const fullShortUrl = `${baseUrl}/api/shorturl/${data.short_url}`;
      
      originalUrlDisplay.textContent = data.original_url;
      shortUrlDisplay.textContent = fullShortUrl;
      shortUrlLink.href = fullShortUrl;
      jsonOutput.style.color = '#06b6d4';
      
      // Refresh URLs list
      fetchUrls();
    }
    
  } catch (error) {
    resultSection.style.display = 'block';
    resultSuccess.style.display = 'none';
    resultError.style.display = 'flex';
    errorMessage.textContent = 'Network error. Please try again.';
    
    jsonResponse.style.display = 'block';
    jsonOutput.textContent = `// Error: ${error.message}`;
    jsonOutput.style.color = '#ef4444';
  } finally {
    // Reset button
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = '<i class="fas fa-compress-alt"></i><span>Shorten</span>';
  }
});

// ============================================
// FETCH URLS LIST
// ============================================
async function fetchUrls() {
  try {
    const response = await fetch('/api/urls');
    const urls = await response.json();
    
    if (urls.length === 0) {
      urlsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-link-slash"></i>
          <p>No URLs shortened yet</p>
        </div>
      `;
      return;
    }
    
    // Sort by short_url descending (newest first)
    urls.sort((a, b) => b.short_url - a.short_url);
    
    const baseUrl = window.location.origin;
    
    urlsList.innerHTML = urls.map(url => `
      <div class="url-item">
        <div class="url-number">${url.short_url}</div>
        <div class="url-details">
          <div class="url-original" title="${url.original_url}">${url.original_url}</div>
          <div class="url-short">${baseUrl}/api/shorturl/${url.short_url}</div>
        </div>
        <div class="url-actions">
          <a href="${baseUrl}/api/shorturl/${url.short_url}" target="_blank" class="url-action-btn" title="Open">
            <i class="fas fa-external-link-alt"></i>
          </a>
          <button class="url-action-btn copy-url-btn" data-url="${baseUrl}/api/shorturl/${url.short_url}" title="Copy">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>
    `).join('');
    
    // Add copy event listeners
    document.querySelectorAll('.copy-url-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        copyToClipboard(this.dataset.url, this);
      });
    });
    
  } catch (error) {
    console.error('Error fetching URLs:', error);
  }
}

// ============================================
// COPY FUNCTIONALITY
// ============================================
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Copy short URL button
copyShortUrlBtn.addEventListener('click', function() {
  const url = shortUrlLink.href;
  copyToClipboard(url, this);
});

// Copy JSON button
copyJsonBtn.addEventListener('click', function() {
  const json = jsonOutput.textContent;
  copyToClipboard(json, this);
});

// ============================================
// REFRESH BUTTON
// ============================================
refreshBtn.addEventListener('click', function() {
  this.style.transform = 'rotate(360deg)';
  fetchUrls();
  setTimeout(() => {
    this.style.transform = 'rotate(0deg)';
  }, 500);
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  fetchUrls();
});