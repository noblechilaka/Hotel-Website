/**
 * Grand Emily Hotel - Countdown Timer Module
 * Handles 30-minute pending window for bank transfer bookings
 */

(function(global) {
  'use strict';

  const CountdownTimer = {
    // Timer configuration
    config: {
      durationMinutes: 30,
      updateInterval: 1000, // 1 second
      warningThreshold: 600, // 10 minutes remaining
      criticalThreshold: 60, // 1 minute remaining
      expiryCallback: null,
      updateCallback: null
    },

    // Timer state
    state: {
      intervalId: null,
      remainingSeconds: 0,
      totalSeconds: 0,
      isRunning: false,
      isExpired: false
    },

    /**
     * Start countdown timer
     * @param {number} minutes - Duration in minutes
     * @param {Object} callbacks - Optional callbacks
     */
    start(minutes = 30, callbacks = {}) {
      this.stop();
      
      const duration = typeof minutes === 'number' ? minutes : this.config.durationMinutes;
      
      this.state.totalSeconds = duration * 60;
      this.state.remainingSeconds = this.state.totalSeconds;
      this.state.isRunning = true;
      this.state.isExpired = false;
      
      // Set callbacks
      if (callbacks.onUpdate) this.config.updateCallback = callbacks.onUpdate;
      if (callbacks.onExpire) this.config.expiryCallback = callbacks.onExpire;
      
      // Start interval
      this.state.intervalId = setInterval(() => {
        this._tick();
      }, this.config.updateInterval);
      
      // Initial update
      this._updateDisplay();
      
      console.log(`Countdown started: ${this._formatTime(this.state.remainingSeconds)}`);
      
      return this;
    },

    /**
     * Start from a specific expiry time
     * @param {string} expiryISO - ISO date string of expiry time
     * @param {Object} callbacks - Optional callbacks
     */
    startFromExpiry(expiryISO, callbacks = {}) {
      const expiry = new Date(expiryISO);
      const now = new Date();
      const remaining = Math.ceil((expiry - now) / 1000);
      
      if (remaining <= 0) {
        this.state.remainingSeconds = 0;
        this.state.isExpired = true;
        this._updateDisplay();
        if (this.config.expiryCallback) {
          this.config.expiryCallback();
        }
        return this;
      }
      
      this.start(remaining / 60, callbacks);
      return this;
    },

    /**
     * Tick function - called every second
     */
    _tick() {
      this.state.remainingSeconds--;
      
      if (this.state.remainingSeconds <= 0) {
        this._expire();
      } else {
        this._updateDisplay();
      }
    },

    /**
     * Update display with current time
     */
    _updateDisplay() {
      const formatted = this._formatTime(this.state.remainingSeconds);
      const status = this._getStatus();
      
      // Update all timer displays on page
      document.querySelectorAll('[data-countdown]').forEach(el => {
        this._updateElement(el, formatted, status);
      });
      
      // Update progress bar if exists
      const progressBar = document.getElementById('countdownProgress');
      if (progressBar) {
        const percent = (this.state.remainingSeconds / this.state.totalSeconds) * 100;
        progressBar.style.width = `${percent}%`;
        
        // Update color based on status
        progressBar.classList.remove('warning', 'critical');
        if (this.state.remainingSeconds <= this.config.criticalThreshold) {
          progressBar.classList.add('critical');
        } else if (this.state.remainingSeconds <= this.config.warningThreshold) {
          progressBar.classList.add('warning');
        }
      }
      
      // Call update callback
      if (this.config.updateCallback) {
        try {
          this.config.updateCallback({
            remaining: this.state.remainingSeconds,
            formatted,
            status,
            percent: (this.state.remainingSeconds / this.state.totalSeconds) * 100
          });
        } catch (e) {
          console.error('Countdown update callback error:', e);
        }
      }
    },

    /**
     * Update individual timer element
     */
    _updateElement(el, formatted, status) {
      const timeDisplay = el.querySelector('.countdown-time');
      const statusDisplay = el.querySelector('.countdown-status');
      
      if (timeDisplay) {
        timeDisplay.textContent = formatted;
      }
      
      if (statusDisplay) {
        statusDisplay.textContent = status;
      }
      
      // Add status class
      el.classList.remove('warning', 'critical', 'expired');
      if (status === 'critical') {
        el.classList.add('critical');
      } else if (status === 'warning') {
        el.classList.add('warning');
      }
    },

    /**
     * Get current status
     */
    _getStatus() {
      if (this.state.remainingSeconds <= this.config.criticalThreshold) {
        return 'critical';
      } else if (this.state.remainingSeconds <= this.config.warningThreshold) {
        return 'warning';
      }
      return 'normal';
    },

    /**
     * Format seconds to MM:SS or HH:MM:SS
     */
    _formatTime(seconds) {
      if (seconds <= 0) return '00:00';
      
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      
      if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    },

    /**
     * Handle timer expiry
     */
    _expire() {
      this.state.isExpired = true;
      this.state.isRunning = false;
      this.stop();
      
      // Update display to show expired state
      document.querySelectorAll('[data-countdown]').forEach(el => {
        el.classList.add('expired');
        const timeDisplay = el.querySelector('.countdown-time');
        if (timeDisplay) {
          timeDisplay.textContent = 'EXPIRED';
        }
      });
      
      // Show expiry message
      this._showExpiryMessage();
      
      // Call expiry callback
      if (this.config.expiryCallback) {
        try {
          this.config.expiryCallback();
        } catch (e) {
          console.error('Countdown expiry callback error:', e);
        }
      }
      
      console.log('Countdown expired');
    },

    /**
     * Show expiry message
     */
    _showExpiryMessage() {
      // Create or update expiry modal
      let modal = document.getElementById('countdownExpiredModal');
      
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'countdownExpiredModal';
        modal.className = 'countdown-modal expired';
        modal.innerHTML = `
          <div class="modal-backdrop"></div>
          <div class="modal-content">
            <div class="modal-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <h2>Time Expired</h2>
            <p>Your pending booking has expired. The room has been released back to inventory.</p>
            <p class="modal-note">We've sent you a reminder via WhatsApp and email.</p>
            <div class="modal-actions">
              <button class="btn btn-primary gold" onclick="window.location.reload()">Start New Booking</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }
      
      // Show modal
      setTimeout(() => modal.classList.add('visible'), 100);
    },

    /**
     * Stop timer
     */
    stop() {
      if (this.state.intervalId) {
        clearInterval(this.state.intervalId);
        this.state.intervalId = null;
      }
      this.state.isRunning = false;
      return this;
    },

    /**
     * Pause timer
     */
    pause() {
      if (this.state.isRunning && this.state.intervalId) {
        clearInterval(this.state.intervalId);
        this.state.intervalId = null;
        this.state.isRunning = false;
      }
      return this;
    },

    /**
     * Resume timer
     */
    resume() {
      if (!this.state.isRunning && this.state.remainingSeconds > 0) {
        this.state.intervalId = setInterval(() => {
          this._tick();
        }, this.config.updateInterval);
        this.state.isRunning = true;
      }
      return this;
    },

    /**
     * Get remaining time in seconds
     */
    getRemainingSeconds() {
      return this.state.remainingSeconds;
    },

    /**
     * Get formatted remaining time
     */
    getFormattedTime() {
      return this._formatTime(this.state.remainingSeconds);
    },

    /**
     * Check if timer is running
     */
    isRunning() {
      return this.state.isRunning;
    },

    /**
     * Check if timer is expired
     */
    isExpired() {
      return this.state.isExpired;
    },

    /**
     * Create timer display element
     */
    createDisplay(options = {}) {
      const container = document.createElement('div');
      container.className = 'countdown-display';
      container.dataset.countdown = '';
      
      const { showLabel = true, showStatus = true, size = 'normal' } = options;
      
      container.innerHTML = `
        <div class="countdown-content">
          ${showLabel ? '<span class="countdown-label">Time remaining</span>' : ''}
          <span class="countdown-time">${this._formatTime(this.state.remainingSeconds)}</span>
          ${showStatus ? '<span class="countdown-status"></span>' : ''}
