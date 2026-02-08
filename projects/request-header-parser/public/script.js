// ============================================
// FETCH USER INFO
// ============================================
async function fetchUserInfo() {
  const ipValue = document.getElementById('ip-value');
  const langValue = document.getElementById('lang-value');
  const softwareValue = document.getElementById('software-value');
  const rawJson = document.getElementById('raw-json');
  
  // Set loading state
  ipValue.textContent = 'Loading...';
  langValue.textContent = 'Loading...';
  softwareValue.textContent = 'Loading...';
  rawJson.textContent = '// Fetching data...';
  
  ipValue.classList.add('loading');
  langValue.classList.add('loading');
  softwareValue.classList.add('loading');
  
  try {
    const response = await fetch('/api/whoami');
    const data = await response.json();
    
    // Remove loading state
    ipValue.classList.remove('loading');
    langValue.classList.remove('loading');
    softwareValue.classList.remove('loading');
    
    // Update values with animation
    setTimeout(() => {
      ipValue.textContent = data.ipaddress || 'Unknown';
      ipValue.style.animation = 'fadeIn 0.3s ease';
    }, 100);
    
    setTimeout(() => {
      langValue.textContent = data.language || 'Unknown';
      langValue.style.animation = 'fadeIn 0.3s ease';
    }, 200);
    
    setTimeout(() => {
      softwareValue.textContent = data.software || 'Unknown';
      softwareValue.style.animation = 'fadeIn 0.3s ease';
    }, 300);
    
    // Update raw JSON
    setTimeout(() => {
      rawJson.textContent = JSON.stringify(data, null, 2);
      rawJson.style.animation = 'fadeIn 0.3s ease';
    }, 400);
    
    // Update curl command with current URL
    updateCurlCommand();
    
  } catch (error) {
    ipValue.textContent = 'Error';
    langValue.textContent = 'Error';
    softwareValue.textContent = 'Error';
    rawJson.textContent = `// Error: ${error.message}`;
    
    ipValue.classList.remove('loading');
    langValue.classList.remove('loading');
    softwareValue.classList.remove('loading');
  }
}

// ============================================
// COPY FUNCTIONALITY
// ============================================
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Copy JSON button
document.getElementById('copy-btn').addEventListener('click', function() {
  const json = document.getElementById('raw-json').textContent;
  copyToClipboard(json, this);
});

// Copy curl button
document.getElementById('copy-curl').addEventListener('click', function() {
  const curlCommand = `curl ${window.location.origin}/api/whoami`;
  copyToClipboard(curlCommand, this);
});

// ============================================
// UPDATE CURL COMMAND
// ============================================
function updateCurlCommand() {
  const curlCode = document.getElementById('curl-command');
  curlCode.innerHTML = `curl <span class="url-placeholder">${window.location.origin}</span>/api/whoami`;
}

// ============================================
// REFRESH BUTTON
// ============================================
document.getElementById('refresh-btn').addEventListener('click', function() {
  this.style.transform = 'rotate(360deg)';
  fetchUserInfo();
  
  setTimeout(() => {
    this.style.transform = 'rotate(0deg)';
  }, 500);
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  fetchUserInfo();
  updateCurlCommand();
});