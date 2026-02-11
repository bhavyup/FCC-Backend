// ============================================
// API FUNCTIONS
// ============================================

// Create User
document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const resultBox = document.getElementById('user-result');
  
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}`
    });
    
    const data = await response.json();
    resultBox.textContent = JSON.stringify(data, null, 2);
    resultBox.classList.remove('error');
    resultBox.classList.add('show');
    
    // Refresh users list
    fetchUsers();
    
    // Clear form
    document.getElementById('username').value = '';
    
  } catch (error) {
    resultBox.textContent = 'Error: ' + error.message;
    resultBox.classList.add('error', 'show');
  }
});

// Add Exercise
document.getElementById('exercise-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('uid').value;
  const description = document.getElementById('description').value;
  const duration = document.getElementById('duration').value;
  const date = document.getElementById('date').value;
  const resultBox = document.getElementById('exercise-result');
  
  let body = `description=${encodeURIComponent(description)}&duration=${duration}`;
  if (date) body += `&date=${date}`;
  
  try {
    const response = await fetch(`/api/users/${userId}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    });
    
    const data = await response.json();
    resultBox.textContent = JSON.stringify(data, null, 2);
    resultBox.classList.remove('error');
    resultBox.classList.add('show');
    
    // Clear form except userId
    document.getElementById('description').value = '';
    document.getElementById('duration').value = '';
    document.getElementById('date').value = '';
    
  } catch (error) {
    resultBox.textContent = 'Error: ' + error.message;
    resultBox.classList.add('error', 'show');
  }
});

// Get Log
document.getElementById('log-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('log-uid').value;
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const limit = document.getElementById('limit').value;
  const resultBox = document.getElementById('log-result');
  
  let url = `/api/users/${userId}/logs`;
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (limit) params.append('limit', limit);
  if (params.toString()) url += '?' + params.toString();
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    resultBox.textContent = JSON.stringify(data, null, 2);
    resultBox.classList.remove('error');
    resultBox.classList.add('show');
    
  } catch (error) {
    resultBox.textContent = 'Error: ' + error.message;
    resultBox.classList.add('error', 'show');
  }
});

// ============================================
// USERS LIST
// ============================================

async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    const users = await response.json();
    
    const usersList = document.getElementById('users-list');
    
    if (users.length === 0) {
      usersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-slash"></i>
          <p>No users yet</p>
        </div>
      `;
      return;
    }
    
    usersList.innerHTML = users.map(user => `
      <div class="user-item">
        <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
        <div class="user-info">
          <div class="user-name">${user.username}</div>
          <div class="user-id">${user._id}</div>
        </div>
        <button class="copy-id-btn" onclick="copyToClipboard('${user._id}', this)">
          <i class="fas fa-copy"></i> Copy ID
        </button>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

// Copy to clipboard
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.style.background = '#10b981';
    button.style.color = 'white';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 2000);
  });
}

// Refresh button
document.getElementById('refresh-users').addEventListener('click', function() {
  this.style.transform = 'rotate(360deg)';
  fetchUsers();
  setTimeout(() => {
    this.style.transform = '';
  }, 500);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchUsers();
});