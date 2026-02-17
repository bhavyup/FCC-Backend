/**
 * KINETIC — Exercise Telemetry System
 * Physics-based interactions & Thermal receipt rendering
 */

class KineticApp {
  constructor() {
    this.apiUrl = "";
    this.init();
  }

  init() {
    this.cacheDOM();
    this.bindEvents();
    this.startClock();
    this.fetchUsers();
    this.setupPhysics();
  }

  cacheDOM() {
    // Forms
    this.userForm = document.getElementById("user-form");
    this.exerciseForm = document.getElementById("exercise-form");
    this.logForm = document.getElementById("log-form");

    // Inputs
    this.usernameInput = document.getElementById("username");
    this.exUserIdInput = document.getElementById("ex-user-id");
    this.descriptionInput = document.getElementById("description");
    this.durationInput = document.getElementById("duration");
    this.dateInput = document.getElementById("date");
    this.logUserIdInput = document.getElementById("log-user-id");
    this.fromDateInput = document.getElementById("from-date");
    this.toDateInput = document.getElementById("to-date");
    this.limitInput = document.getElementById("limit");

    // Outputs
    this.userReceipt = document.getElementById("user-receipt");
    this.exerciseReceipt = document.getElementById("exercise-receipt");
    this.logReceipt = document.getElementById("log-receipt");
    this.usersList = document.getElementById("users-list");

    // Buttons
    this.refreshBtn = document.getElementById("refresh-users");
    this.clock = document.getElementById("clock");
  }

  bindEvents() {
    // Form submissions with physics feedback
    this.userForm.addEventListener("submit", (e) => this.handleUserSubmit(e));
    this.exerciseForm.addEventListener("submit", (e) =>
      this.handleExerciseSubmit(e),
    );
    this.logForm.addEventListener("submit", (e) => this.handleLogSubmit(e));

    // Refresh with rotation physics
    this.refreshBtn.addEventListener("click", () => this.fetchUsers());

    // Input focus effects
    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => this.onInputFocus(input));
      input.addEventListener("blur", () => this.onInputBlur(input));
    });
  }

  setupPhysics() {
    // Spring physics for buttons
    const buttons = document.querySelectorAll(".btn-kinetic");
    buttons.forEach((btn) => {
      btn.addEventListener("mousedown", () => {
        btn.style.transform = "scale(0.98)";
      });
      btn.addEventListener("mouseup", () => {
        btn.style.transform = "";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  onInputFocus(input) {
    input.parentElement.style.transform = "translateX(4px)";
    input.parentElement.style.transition =
      "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
  }

  onInputBlur(input) {
    input.parentElement.style.transform = "";
  }

  startClock() {
    const updateClock = () => {
      const now = new Date();
      this.clock.textContent = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  // API Handlers
  async handleUserSubmit(e) {
    e.preventDefault();
    const username = this.usernameInput.value.trim();

    if (!username) return;

    this.showLoading(this.userReceipt);

    try {
      const response = await fetch("api/users", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}`,
      });

      const data = await response.json();

      if (data.error) {
        this.showReceipt(this.userReceipt, data.error, true);
      } else if (data.existing) {
        this.showReceipt(this.userReceipt, this.formatExistingUserReceipt(data));
        this.exUserIdInput.value = data._id;
        this.logUserIdInput.value = data._id;
        setTimeout(() => this.closeReceipt(this.userReceipt), 8000);
      } else {
        this.showReceipt(this.userReceipt, this.formatUserReceipt(data));
        this.usernameInput.value = "";
        this.fetchUsers();

        // Auto-fill user ID in other forms
        this.exUserIdInput.value = data._id;
        this.logUserIdInput.value = data._id;
        setTimeout(() => this.closeReceipt(this.userReceipt), 8000);
      }
    } catch (error) {
      this.showReceipt(
        this.userReceipt,
        `Connection Error: ${error.message}`,
        true,
      );
    }
  }

  async handleExerciseSubmit(e) {
    e.preventDefault();
    const userId = this.exUserIdInput.value.trim();
    const description = this.descriptionInput.value.trim();
    const duration = this.durationInput.value;
    const date = this.dateInput.value;

    if (!userId || !description || !duration) return;

    this.showLoading(this.exerciseReceipt);

    let body = `description=${encodeURIComponent(description)}&duration=${duration}`;
    if (date) body += `&date=${date}`;

    try {
      const response = await fetch(`api/users/${userId}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      });

      const data = await response.json();

      if (data.error) {
        this.showReceipt(this.exerciseReceipt, data.error, true);
      } else {
        this.showReceipt(
          this.exerciseReceipt,
          this.formatExerciseReceipt(data),
        );
        this.descriptionInput.value = "";
        this.durationInput.value = "";
        this.dateInput.value = "";
      }
    } catch (error) {
      this.showReceipt(
        this.exerciseReceipt,
        `Connection Error: ${error.message}`,
        true,
      );
    }
  }

  async handleLogSubmit(e) {
    e.preventDefault();
    const userId = this.logUserIdInput.value.trim();
    const from = this.fromDateInput.value;
    const to = this.toDateInput.value;
    const limit = this.limitInput.value;

    if (!userId) return;

    this.showLoading(this.logReceipt, true);

    let url = `api/users/${userId}/logs`;
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (limit) params.append("limit", limit);
    if (params.toString()) url += "?" + params.toString();

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        this.renderThermalReceipt(data.error, true);
      } else {
        this.renderThermalReceipt(data);
      }
    } catch (error) {
      this.renderThermalReceipt(`Connection Error: ${error.message}`, true);
    }
  }

  async fetchUsers() {
    // Animate refresh button
    this.refreshBtn.style.transform = "rotate(360deg)";
    this.refreshBtn.style.transition =
      "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";

    try {
      const response = await fetch("api/users");
      const users = await response.json();
      this.renderUsers(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      this.usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">!</div>
                    <p>Connection failed</p>
                </div>
            `;
    }

    setTimeout(() => {
      this.refreshBtn.style.transform = "";
    }, 600);
  }

  // Rendering Methods
  renderUsers(users) {
    if (!users || users.length === 0) {
      this.usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">∅</div>
                    <p>No athletes registered</p>
                </div>
            `;
      return;
    }

    this.usersList.innerHTML = users
      .map(
        (user, index) => `
            <div class="user-item" data-id="${user._id}">
                <span class="user-index">${String(index + 1).padStart(2, "0")}</span>
                <div class="user-info">
                    <div class="user-name">${this.escapeHtml(user.username)}</div>
                    <div class="user-id">${user._id}</div>
                </div>
                <div class="user-actions">
                    <button class="action-btn" onclick="app.copyToClipboard('${user._id}')">Copy ID</button>
                    <button class="action-btn" onclick="app.viewLogs('${user._id}')">Logs</button>
                </div>
            </div>
        `,
      )
      .join("");

    // Stagger animation
    const items = this.usersList.querySelectorAll(".user-item");
    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-20px)";
      setTimeout(() => {
        item.style.transition = "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
        item.style.opacity = "1";
        item.style.transform = "";
      }, i * 50);

      // Double-click to fill exercise & log forms with this user's ID
      item.addEventListener("dblclick", () => {
        const uid = item.dataset.id;
        this.exUserIdInput.value = uid;
        this.logUserIdInput.value = uid;

        // Flash feedback
        item.style.borderColor = "var(--alert-orange)";
        item.style.background = "rgba(255, 61, 0, 0.05)";
        setTimeout(() => {
          item.style.borderColor = "";
          item.style.background = "";
        }, 800);
      });
    });
  }

  renderThermalReceipt(data, isError = false) {
    if (isError) {
      this.logReceipt.innerHTML = `
                <div class="receipt-content error">
                    <div class="receipt-header">
                        <div class="receipt-title">Error</div>
                    </div>
                    <div style="color: #c00; padding: 20px 0;">${data}</div>
                </div>
            `;
      return;
    }

    const date = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let logItems = "";
    if (data.log && data.log.length > 0) {
      logItems = data.log
        .map(
          (entry, i) => `
                <div class="log-item" style="animation-delay: ${i * 0.05}s">
                    <div class="log-desc">${this.escapeHtml(entry.description)}</div>
                    <div class="log-meta">
                        <span>${entry.date}</span>
                        <span>${entry.duration} min</span>
                    </div>
                </div>
            `,
        )
        .join("");
    } else {
      logItems =
        '<div style="text-align: center; padding: 20px 0; color: rgba(0,0,0,0.3);">No activities recorded</div>';
    }

    this.logReceipt.innerHTML = `
            <div class="receipt-content">
                <div class="receipt-header">
                    <div class="receipt-title">Activity Log</div>
                    <div class="receipt-meta">${date}</div>
                </div>
                
                <div class="receipt-row">
                    <span class="receipt-label">Athlete</span>
                    <span class="receipt-value">${this.escapeHtml(data.username || "Unknown")}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">ID</span>
                    <span class="receipt-value" style="font-size: 0.625rem;">${data._id}</span>
                </div>
                <div class="receipt-row">
                    <span class="receipt-label">Total Records</span>
                    <span class="receipt-value">${data.count || 0}</span>
                </div>
                
                <div class="receipt-log">
                    ${logItems}
                </div>
                
                <div class="receipt-footer">
                    END OF REPORT
                </div>
            </div>
        `;

    // Animate log items
    const items = this.logReceipt.querySelectorAll(".log-item");
    items.forEach((item, i) => {
      item.style.animation = `receiptPrint 0.3s ease forwards ${i * 0.05}s`;
      item.style.opacity = "0";
    });
  }

  // Utility Methods
  showReceipt(element, content, isError = false) {
    element.innerHTML = content;
    element.className = "receipt-output show" + (isError ? " error" : "");

    // Activate timebar animation if present
    const timebar = element.querySelector('.register-timebar');
    if (timebar) {
      timebar.classList.remove('active');
      void timebar.offsetWidth;
      timebar.classList.add('active');
    }
  }

  closeReceipt(element) {
    element.className = "receipt-output";
    element.innerHTML = "";
  }


  showLoading(element, isLarge = false) {
    if (isLarge) {
      element.innerHTML =
        '<div class="receipt-placeholder"><span class="receipt-icon">◌</span><p>Generating receipt...</p></div>';
    } else {
      element.innerHTML =
        '<div style="padding: 10px; color: rgba(0,0,0,0.5); font-style: italic;">Processing...</div>';
      element.className = "receipt-output show";
    }
  }

  formatUserReceipt(data) {
    return `
            <div class="register-timebar"></div>
            <div style="font-weight: 600; margin-bottom: 8px;">Athlete Registered</div>
            <div style="display: grid; gap: 4px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">Username:</span>
                    <span style="font-weight: 600;">${this.escapeHtml(data.username)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">ID:</span>
                    <span style="font-family: monospace; font-size: 0.625rem;">${data._id}</span>
                </div>
            </div>
        `;
  }

  formatExistingUserReceipt(data) {
    return `
            <div class="register-timebar" style="background: var(--warning);"></div>
            <div style="font-weight: 600; margin-bottom: 8px; color: #b45309;">Username Already Exists</div>
            <div style="display: grid; gap: 4px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">Username:</span>
                    <span style="font-weight: 600;">${this.escapeHtml(data.username)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">ID:</span>
                    <span style="font-family: monospace; font-size: 0.625rem;">${data._id}</span>
                </div>
            </div>
        `;
  }

  formatExerciseReceipt(data) {
    return `
            <div style="font-weight: 600; margin-bottom: 8px;">Activity Logged</div>
            <div style="display: grid; gap: 4px;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">Activity:</span>
                    <span style="font-weight: 600;">${this.escapeHtml(data.description)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">Duration:</span>
                    <span>${data.duration} min</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: rgba(0,0,0,0.5);">Date:</span>
                    <span>${data.date}</span>
                </div>
            </div>
        `;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Visual feedback
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = "Copied!";
      btn.style.borderColor = "var(--success)";
      btn.style.color = "var(--success)";

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.borderColor = "";
        btn.style.color = "";
      }, 2000);
    });
  }

  viewLogs(userId) {
    this.logUserIdInput.value = userId;
    this.logForm.scrollIntoView({ behavior: "smooth" });
    this.logUserIdInput.focus();
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize
const app = new KineticApp();

// Expose for inline handlers
window.app = app;
