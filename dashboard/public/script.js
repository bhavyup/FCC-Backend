// ============================================
// PROJECT CONFIGURATION
// ============================================
const PROJECTS = {
  'timestamp': {
    url: 'https://fcc-timestamp-microservice-6b1s.onrender.com',
    healthEndpoint: '/api',
    sourceCode: 'https://github.com/bhavyup/FCC-Backend/tree/main/projects/timestamp-microservice'
  },
  'header-parser': {
    url: 'https://fcc-header-parser-ap2o.onrender.com',
    healthEndpoint: '/api/whoami',
    sourceCode: 'https://github.com/bhavyup/FCC-Backend/tree/main/projects/request-header-parser'
  },
  'url-shortener': {
    url: 'https://fcc-url-shortener-2pdh.onrender.com',
    healthEndpoint: '/api/urls',
    sourceCode: 'https://github.com/bhavyup/FCC-Backend/tree/main/projects/url-shortener'
  },
  'exercise-tracker': {
    url: 'https://fcc-exercise-tracker-rrfr.onrender.com',
    healthEndpoint: '/api/users',
    sourceCode: 'https://github.com/bhavyup/FCC-Backend/tree/main/projects/exercise-tracker'
  },
  'file-metadata': {
    url: 'https://fcc-file-metadata-xvgc.onrender.com',
    healthEndpoint: '/',
    sourceCode: 'https://github.com/bhavyup/FCC-Backend/tree/main/projects/file-metadata'
  }
};

// ============================================
// DOM ELEMENTS
// ============================================
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const navItems = document.querySelectorAll('.nav-item');
const currentPageEl = document.getElementById('current-page');
const statusIndicator = document.querySelector('.status-indicator');
const statusDot = document.querySelector('.status-dot');
const statusText = statusIndicator?.querySelector('span:last-child');

// Track status
let projectStatuses = {};
let liveCount = 0;

// ============================================
// CHECK PROJECT STATUS (Real Health Check)
// ============================================
async function checkProjectStatus(projectId) {
  const project = PROJECTS[projectId];
  if (!project) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(project.url + project.healthEndpoint, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log(`${projectId} is offline:`, error.message);
    return false;
  }
}

// ============================================
// UPDATE STATUS BADGES
// ============================================
function updateStatusBadge(projectId, isLive) {
  // Update in sidebar
  const navBadge = document.querySelector(`[data-section="${projectId}"] .nav-badge`);
  if (navBadge) {
    navBadge.textContent = isLive ? 'Live' : 'Offline';
    navBadge.className = `nav-badge ${isLive ? 'live' : 'offline'}`;
  }

  // Update in project card
  const cardBadge = document.querySelector(`[data-project="${projectId}"] .project-status`);
  if (cardBadge) {
    cardBadge.textContent = isLive ? 'Live' : 'Offline';
    cardBadge.className = `project-status ${isLive ? 'live' : 'offline'}`;
  }
}

// ============================================
// UPDATE GLOBAL STATUS
// ============================================
function updateGlobalStatus() {
  const totalProjects = Object.keys(PROJECTS).length;
  
  if (liveCount === totalProjects) {
    statusDot.className = 'status-dot live';
    statusText.textContent = 'All systems operational';
  } else if (liveCount > 0) {
    statusDot.className = 'status-dot partial';
    statusText.textContent = `${liveCount}/${totalProjects} systems online`;
  } else {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Systems offline';
  }

  // Update deployed count in stats
  const deployedStat = document.querySelector('.stat-card:nth-child(2) .stat-value');
  if (deployedStat) {
    deployedStat.textContent = liveCount;
  }
}

// ============================================
// CHECK ALL PROJECTS
// ============================================
async function checkAllProjects() {
  console.log('🔍 Checking project status...');
  liveCount = 0;

  const checks = Object.keys(PROJECTS).map(async (projectId) => {
    const isLive = await checkProjectStatus(projectId);
    projectStatuses[projectId] = isLive;
    if (isLive) liveCount++;
    updateStatusBadge(projectId, isLive);
    return { projectId, isLive };
  });

  await Promise.all(checks);
  updateGlobalStatus();
  console.log(`✅ Status check complete: ${liveCount}/${Object.keys(PROJECTS).length} online`);
}

// ============================================
// SIDEBAR TOGGLE (Mobile)
// ============================================
menuToggle?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('show');
});

sidebarOverlay?.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
});

// ============================================
// NAVIGATION
// ============================================
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const section = item.dataset.section;
    
    // If it's dashboard, prevent default and show dashboard
    if (section === 'dashboard') {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      currentPageEl.textContent = 'Dashboard';
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('show');
    }
    // Other nav items have href, let them navigate naturally
  });
});

// ============================================
// OPEN PROJECT
// ============================================
function openProject(projectId) {
  const project = PROJECTS[projectId];
  if (project && project.url) {
    window.open(project.url, '_blank');
  }
}

// ============================================
// OPEN SOURCE CODE
// ============================================
function openSourceCode(projectId) {
  const project = PROJECTS[projectId];
  if (project && project.sourceCode) {
    window.open(project.sourceCode, '_blank');
  }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
  }
  
  // Press 'R' to refresh status
  if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
    if (document.activeElement.tagName !== 'INPUT') {
      checkAllProjects();
    }
  }
});

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 API Hub Dashboard loaded');
  
  // Check status on load
  checkAllProjects();
  
  // Re-check every 60 seconds
  setInterval(checkAllProjects, 60000);
});