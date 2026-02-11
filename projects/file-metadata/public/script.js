// ============================================
// DOM ELEMENTS
// ============================================
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('upfile');
const fileDisplay = document.getElementById('file-display');
const selectedFile = document.getElementById('selected-file');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const removeFileBtn = document.getElementById('remove-file');
const submitBtn = document.getElementById('submit-btn');
const resultSection = document.getElementById('result-section');
const resultName = document.getElementById('result-name');
const resultType = document.getElementById('result-type');
const resultSize = document.getElementById('result-size');
const jsonOutput = document.getElementById('json-output');
const copyJsonBtn = document.getElementById('copy-json');

// ============================================
// FILE INPUT HANDLING
// ============================================

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Handle file selection
fileInput.addEventListener('change', function() {
  if (this.files && this.files[0]) {
    const file = this.files[0];
    
    // Show selected file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // Toggle display
    fileDisplay.style.display = 'none';
    selectedFile.style.display = 'flex';
    
    // Hide previous results
    resultSection.style.display = 'none';
  }
});

// Remove file
removeFileBtn.addEventListener('click', function() {
  fileInput.value = '';
  fileDisplay.style.display = 'block';
  selectedFile.style.display = 'none';
  resultSection.style.display = 'none';
});

// Drag and drop styling
const fileWrapper = document.querySelector('.file-input-wrapper');

['dragenter', 'dragover'].forEach(eventName => {
  fileWrapper.addEventListener(eventName, (e) => {
    e.preventDefault();
    fileWrapper.style.borderColor = '#ec4899';
    fileWrapper.style.background = 'rgba(236, 72, 153, 0.1)';
  });
});

['dragleave', 'drop'].forEach(eventName => {
  fileWrapper.addEventListener(eventName, (e) => {
    e.preventDefault();
    fileWrapper.style.borderColor = '';
    fileWrapper.style.background = '';
  });
});

// ============================================
// FORM SUBMISSION
// ============================================
uploadForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  if (!fileInput.files || !fileInput.files[0]) {
    alert('Please select a file first');
    return;
  }
  
  // Set loading state
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  submitBtn.innerHTML = '<i class="fas fa-spinner"></i><span>Analyzing...</span>';
  
  try {
    const formData = new FormData();
    formData.append('upfile', fileInput.files[0]);
    
    const response = await fetch('/api/fileanalyse', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.error) {
      alert('Error: ' + data.error);
      return;
    }
    
    // Show results
    resultName.textContent = data.name;
    resultType.textContent = data.type;
    resultSize.textContent = data.size.toLocaleString();
    jsonOutput.textContent = JSON.stringify(data, null, 2);
    
    resultSection.style.display = 'block';
    
    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
  } catch (error) {
    console.error('Error:', error);
    alert('Upload failed. Please try again.');
  } finally {
    // Reset button
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.innerHTML = '<i class="fas fa-search"></i><span>Analyze File</span>';
  }
});

// ============================================
// COPY JSON
// ============================================
copyJsonBtn.addEventListener('click', function() {
  const json = jsonOutput.textContent;
  
  navigator.clipboard.writeText(json).then(() => {
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
    this.style.background = '#10b981';
    this.style.color = 'white';
    this.style.borderColor = 'transparent';
    
    setTimeout(() => {
      this.innerHTML = originalText;
      this.style.background = '';
      this.style.color = '';
      this.style.borderColor = '';
    }, 2000);
  });
});