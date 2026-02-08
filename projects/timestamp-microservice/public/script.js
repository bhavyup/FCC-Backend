// ============================================
// LIVE CLOCK
// ============================================
function updateClock() {
  const now = new Date();
  
  // Time display
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('current-time').textContent = `${hours}:${minutes}:${seconds}`;
  
  // Date display
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
  
  // Unix timestamp
  document.getElementById('current-unix').textContent = now.getTime();
}

// Update clock every second
setInterval(updateClock, 1000);
updateClock(); // Initial call

// ============================================
// API TESTER
// ============================================
const dateInput = document.getElementById('date-input');
const testBtn = document.getElementById('test-btn');
const resultOutput = document.getElementById('result-output');
const endpointDisplay = document.getElementById('endpoint-display');
const resultContainer = document.getElementById('result-container');

async function testAPI(dateValue) {
  const endpoint = dateValue ? `/api/${encodeURIComponent(dateValue)}` : '/api';
  endpointDisplay.textContent = endpoint;
  
  try {
    resultOutput.textContent = '// Loading...';
    resultOutput.style.color = '#94a3b8';
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    // Format JSON nicely
    const formatted = JSON.stringify(data, null, 2);
    resultOutput.textContent = formatted;
    
    // Color based on response
    if (data.error) {
      resultOutput.style.color = '#ef4444';
    } else {
      resultOutput.style.color = '#06b6d4';
    }
    
    // Add animation
    resultContainer.style.animation = 'none';
    resultContainer.offsetHeight; // Trigger reflow
    resultContainer.style.animation = 'fadeIn 0.3s ease';
    
  } catch (error) {
    resultOutput.textContent = `// Error: ${error.message}`;
    resultOutput.style.color = '#ef4444';
  }
}

// Test button click
testBtn.addEventListener('click', () => {
  testAPI(dateInput.value.trim());
});

// Enter key
dateInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    testAPI(dateInput.value.trim());
  }
});

// Quick test buttons
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.value;
    dateInput.value = value;
    testAPI(value);
  });
});

// Initial test on page load
testAPI('');

// Add fadeIn animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);