/**
 * Grand Emily Hotel - Enhanced Booking Widget
 * Advanced date & inventory logic, party size management, real-time rate fetching
 * 
 * Features:
 * - Dynamic Minimum Stay (Lagos time 6PM cutoff)
 * - Sequential Locking (departure disabled until arrival)
 * - Real-Time Rate Fetching
 * - Party Size Logic (4+ adults notification, children toggle)
 * - URL Parameter Parsing
 * - 30-Minute Pending Window for Bank Transfer
 */

(function(global) {
  'use strict';

  // Booking Widget Module
  const BookingWidget = {
    // Configuration
    config: {
      atlanticSuiteId: 'atlantic',
      atlanticSuiteUrl: '/rooms.html?suite=atlantic',
      maxAdults: 6,
      maxChildren: 4,
      childrenAgeMax: 17,
      defaultNights: 1,
      pendingMinutes: 30,
      dateFormat: 'd/m/Y', // DD/MM/YYYY for Nigerian standards
      timeFormat: 'H:i',
      enableAnimations: true
    },

    // DOM Elements cache
    elements: {},

    // State
    state: {
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      childrenAges: [],
      rooms: 1,
      rates: null,
      isLoading: false,
      departureEnabled: false
    },

    /**
     * Initialize the booking widget
     */
    init() {
      this._cacheElements();
      this._initState();
      this._initDatePickers();
      this._bindEvents();
      this._loadFromState();
      
      console.log('Booking Widget initialized');
      return this;
    },

    /**
     * Cache DOM elements
     */
    _cacheElements() {
      // Check-in/Check-out fields
      this.elements.checkIn = {
        input: document.getElementById('heroCheckIn') || document.getElementById('checkInDate'),
        value: document.getElementById('heroCheckInValue') || document.getElementById('checkInDateValue'),
        picker: null
      };
      
      this.elements.checkOut = {
        input: document.getElementById('heroCheckOut') || document.getElementById('checkOutDate'),
        value: document.getElementById('heroCheckOutValue') || document.getElementById('checkOutDateValue'),
        picker: null
      };
      
      // Guest selectors
      this.elements.adults = {
        select: document.getElementById('heroGuests') || document.getElementById('adultSelect'),
        display: document.getElementById('heroGuestsValue') || document.getElementById('adultsDisplay'),
        input: document.getElementById('heroAdultsInput')
      };
      
      this.elements.children = {
        toggle: document.getElementById('childrenToggle'),
        count: document.getElementById('childrenCount'),
        ages: document.getElementById('childrenAges'),
        agesInput: document.getElementById('childrenAgesInput')
      };
      
      this.elements.rooms = {
        select: document.getElementById('heroRooms') || document.getElementById('roomsSelect'),
        display: document.getElementById('heroRoomsValue')
      };
      
      // Buttons
      this.elements.submitBtn = document.getElementById('heroBookingForm');
      this.elements.bookNowBtn = document.getElementById('bookNowBtn');
      
      // Price display
      this.elements.priceDisplay = document.getElementById('priceDisplay') || this._createPriceDisplay();
      this.elements.browseBtn = document.getElementById('browseRoomsBtn');
      
      // Notifications
      this.elements.notification = this._createNotificationContainer();
      
      // Summary elements
      this.elements.summary = {
        checkIn: document.getElementById('summaryCheckIn'),
        checkOut: document.getElementById('summaryCheckOut'),
        guests: document.getElementById('summaryGuests'),
        nights: document.getElementById('nightsDisplay'),
        nightsCount: document.getElementById('nightsCount'),
        subtotal: document.getElementById('summarySubtotal'),
        tax: document.getElementById('summaryTax'),
        total: document.getElementById('summaryTotal')
      };
    },

    /**
     * Create notification container
     */
    _createNotificationContainer() {
      const container = document.createElement('div');
      container.className = 'booking-notification';
      container.id = 'bookingNotification';
      container.innerHTML = `
        <div class="notification-content">
          <span class="notification-icon material-symbols-outlined">info</span>
          <span class="notification-message"></span>
          <button class="notification-close" aria-label="Close">×</button>
        </div>
        <div class="notification-action" style="display:none;">
          <button class="btn btn-primary gold btn-sm"></button>
        </div>
      `;
      document.body.appendChild(container);
      
      // Bind close event
      container.querySelector('.notification-close').addEventListener('click', () => {
        this._hideNotification();
      });
      
      return container;
    },

    /**
     * Create price display element
     */
    _createPriceDisplay() {
      const display = document.createElement('div');
      display.className = 'booking-price-display';
      display.id = 'priceDisplay';
      display.innerHTML = `
        <span class="price-label">Starting from</span>
        <span class="price-value">--</span>
        <span class="price-loading" style="display:none;">
          <span class="spinner-small"></span>
        </span>
      `;
      return display;
    },

    /**
     * Initialize state from BookingState
     */
    _initState() {
      if (global.BookingState) {
        const storedState = BookingState.getState();
        this.state = {
          ...this.state,
          checkIn: storedState.checkIn,
          checkOut: storedState.checkOut,
          adults: storedState.adults || 2,
          children: storedState.children || 0,
          childrenAges: storedState.childrenAges || [],
          rooms: storedState.rooms || 1
        };
      }
    },

    /**
     * Save state to BookingState
     */
    _saveState() {
      if (global.BookingState) {
        BookingState.set({
          checkIn: this.state.checkIn,
          checkOut: this.state.checkOut,
          adults: this.state.adults,
          children: this.state.children,
          childrenAges: this.state.childrenAges,
          rooms: this.state.rooms,
          rates: this.state.rates
        });
      }
    },

    /**
     * Initialize date pickers with enhanced logic
     */
    _initDatePickers() {
      if (typeof flatpickr === 'undefined') {
        console.warn('Flatpickr not loaded');
        return;
      }

      const minCheckInDate = BookingAPI.getMinCheckInDate();
      
      // Check-in picker
      if (this.elements.checkIn.input) {
        this.elements.checkIn.picker = flatpickr(this.elements.checkIn.input, {
          minDate: minCheckInDate,
          defaultDate: this.state.checkIn || minCheckInDate,
          dateFormat: this.config.dateFormat,
          altInput: true,
          altFormat: 'j M Y', // Display format
          showMonths: 1,
          static: true,
          disableMobile: false,
          onChange: (selectedDates, dateStr) => {
            this._onCheckInChange(selectedDates[0], dateStr);
          },
          onReady: (selectedDates, dateStr, instance) => {
            this._updateCheckInDisplay(dateStr);
          }
        });
      }
      
      // Check-out picker - initially disabled
      if (this.elements.checkOut.input) {
        const minCheckOut = this.state.checkIn 
          ? this._addDays(this.state.checkIn, 1)
          : this._addDays(minCheckInDate, 1);
        
        this.elements.checkOut.picker = flatpickr(this.elements.checkOut.input, {
          minDate: minCheckOut,
          defaultDate: this.state.checkOut || this._addDays(minCheckOut, this.config.defaultNights),
          dateFormat: this.config.dateFormat,
          altInput: true,
          altFormat: 'j M Y',
          showMonths: 1,
          static: true,
          disableMobile: false,
          onChange: (selectedDates, dateStr) => {
            this._onCheckOutChange(selectedDates[0], dateStr);
          },
          onReady: (selectedDates, dateStr, instance) => {
            this._updateCheckOutDisplay(dateStr);
            if (!this.state.departureEnabled) {
              this._disableDeparture();
            }
          }
        });
        
        // Initially disable departure
        if (!this.state.checkIn) {
          this._disableDeparture();
        }
      }
    },

    /**
     * Disable departure field
     */
    _disableDeparture() {
      if (this.elements.checkOut.picker) {
        this.elements.checkOut.picker.disable();
        this.elements.checkOut.input.disabled = true;
        this.elements.checkOut.input.parentElement?.classList.add('disabled');
      }
      this.state.departureEnabled = false;
    },

    /**
     * Enable departure field
     */
    _enableDeparture() {
      if (this.elements.checkOut.picker) {
        this.elements.checkOut.picker.enable();
        this.elements.checkOut.input.disabled = false;
        this.elements.checkOut.input.parentElement?.classList.remove('disabled');
        
        // Auto-open calendar
        this.elements.checkOut.picker.open();
      }
      this.state.departureEnabled = true;
    },

    /**
     * Handle check-in date change
     */
    _onCheckInChange(date, dateStr) {
      this.state.checkIn = date.toISOString().split('T')[0];
      this._updateCheckInDisplay(dateStr);
      
      // Enable departure
      this._enableDeparture();
      
      // Update check-out min date
      const nextDay = this._addDays(date, 1);
      this.elements.checkOut.picker.set('minDate', nextDay);
      
      // If current check-out is before new min, update it
      const currentCheckOut = this.elements.checkOut.picker.selectedDates[0];
      if (currentCheckOut && currentCheckOut <= date) {
        this.elements.checkOut.picker.setDate(nextDay, true);
        this.state.checkOut = nextDay.toISOString().split('T')[0];
      }
      
      // Trigger rate fetch if check-out is also selected
      if (this.state.checkOut) {
        this._fetchRates();
      }
      
      // Save and update UI
      this._saveState();
      this._updateSummary();
    },

    /**
     * Handle check-out date change
     */
    _onCheckOutChange(date, dateStr) {
      this.state.checkOut = date.toISOString().split('T')[0];
      this._updateCheckOutDisplay(dateStr);
      
      // Validate: check-out must be after check-in
      if (this.state.checkIn) {
        const checkInDate = new Date(this.state.checkIn);
        if (date <= checkInDate) {
          // Auto-correct to next day
          const nextDay = this._addDays(checkInDate, 1);
          this.elements.checkOut.picker.setDate(nextDay, true);
          this.state.checkOut = nextDay.toISOString().split('T')[0];
          this._updateCheckOutDisplay(this._formatDate(nextDay));
        }
      }
      
      // Fetch rates
      this._fetchRates();
      
      // Save and update UI
      this._saveState();
      this._updateSummary();
    },

    /**
     * Update check-in display
     */
    _updateCheckInDisplay(dateStr) {
      if (this.elements.checkIn.value) {
        this.elements.checkIn.value.textContent = dateStr;
      }
    },

    /**
     * Update check-out display
     */
    _updateCheckOutDisplay(dateStr) {
      if (this.elements.checkOut.value) {
        this.elements.checkOut.value.textContent = dateStr;
      }
    },

    /**
     * Add days to a date
     */
    _addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },

    /**
     * Format date for display
     */
    _formatDate(date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    /**
     * Bind event handlers
     */
    _bindEvents() {
      // Adults selector
      if (this.elements.adults.select) {
        this.elements.adults.select.addEventListener('change', (e) => {
          this._onAdultsChange(parseInt(e.target.value) || 2);
        });
      }
      
      // Children toggle
      if (this.elements.children.toggle) {
        this.elements.children.toggle.addEventListener('change', (e) => {
          this._onChildrenToggle(e.target.checked);
        });
      }
      
      // Children count +/- buttons
      const childrenIncrease = document.getElementById('childrenIncrease');
      const childrenDecrease = document.getElementById('childrenDecrease');
      
      if (childrenIncrease) {
        childrenIncrease.addEventListener('click', () => {
          if (this.state.children < this.config.maxChildren) {
            this._onChildrenChange(this.state.children + 1);
          }
        });
      }
      
      if (childrenDecrease) {
        childrenDecrease.addEventListener('click', () => {
          if (this.state.children > 0) {
            this._onChildrenChange(this.state.children - 1);
          }
        });
      }
      
      // Form submission
      if (this.elements.submitBtn) {
        this.elements.submitBtn.addEventListener('submit', (e) => {
          e.preventDefault();
          this._handleSubmit();
        });
      }
    },

    /**
     * Handle adults count change
     */
    _onAdultsChange(count) {
      this.state.adults = Math.min(count, this.config.maxAdults);
      
      // Update display
      if (this.elements.adults.display) {
        this.elements.adults.display.textContent = `${this.state.adults} Adult${this.state.adults > 1 ? 's' : ''}`;
      }
      
      // Check for 4+ adults - show Atlantic Suites suggestion
      if (this.state.adults >= 4) {
        this._showAtlanticSuiteNotification();
      } else {
        this._hideNotification();
      }
      
      this._saveState();
      this._updateSummary();
    },

    /**
     * Handle children toggle
     */
    _onChildrenToggle(enabled) {
      if (enabled) {
        this._showChildrenAgePrompt();
      } else {
        this.state.children = 0;
        this.state.childrenAges = [];
        this._hideNotification();
      }
      this._saveState();
      this._updateSummary();
    },

    /**
     * Handle children count change
     */
    _onChildrenChange(count) {
      this.state.children = count;
      
      // Show/hide age prompt based on count
      if (count > 0) {
        this._showChildrenAgePrompt();
      } else {
        this._hideNotification();
      }
      
      // Update display
      if (this.elements.children.count) {
        this.elements.children.count.textContent = count;
      }
      
      this._saveState();
      this._updateSummary();
    },

    /**
     * Show Atlantic Suites notification
     */
    _showAtlanticSuiteNotification() {
      const message = `For larger parties, our Atlantic Suites offer interconnected sanctuaries. Would you like to view suites only?`;
      this._showNotification(message, 'Atlantic Suites', () => {
        window.location.href = this.config.atlanticSuiteUrl;
      });
    },

    /**
     * Show children age prompt
     */
    _showChildrenAgePrompt() {
      const message = `Please specify the age${this.state.children > 1 ? 's' : ''} of your child${this.state.children > 1 ? 'ren' : ''} for specific amenities or safety requirements.`;
      this._showNotification(message, 'Children\'s Ages', null, true);
    },

    /**
     * Show notification
     */
    _showNotification(message, title = '', actionCallback = null, isInput = false) {
      const container = this.elements.notification;
      const content = container.querySelector('.notification-content');
      const messageEl = container.querySelector('.notification-message');
      const actionEl = container.querySelector('.notification-action');
      
      // Build message HTML
      if (title) {
        messageEl.innerHTML = `<strong>${title}</strong><br/>${message}`;
      } else {
        messageEl.innerHTML = message;
      }
      
      // Handle input mode for children ages
      if (isInput) {
        actionEl.style.display = 'block';
        const btn = actionEl.querySelector('button');
        btn.textContent = 'Confirm Ages';
        btn.onclick = () => this._saveChildrenAges();
      } else if (actionCallback) {
        actionEl.style.display = 'block';
        const btn = actionEl.querySelector('button');
        btn.textContent = 'View Suites';
        btn.onclick = actionCallback;
      } else {
        actionEl.style.display = 'none';
      }
      
      // Show with animation
      container.classList.add('visible');
      
      // Auto-hide after 10 seconds if no action
      if (!actionCallback && !isInput) {
        setTimeout(() => this._hideNotification(), 10000);
      }
    },

    /**
     * Hide notification
     */
    _hideNotification() {
      this.elements.notification.classList.remove('visible');
    },

    /**
     * Save children ages
     */
    _saveChildrenAges() {
      const agesInput = document.getElementById('childrenAgesInput');
      if (agesInput) {
        const ages = agesInput.value
          .split(',')
          .map(a => parseInt(a.trim()))
          .filter(a => !isNaN(a) && a >= 0 && a <= this.config.childrenAgeMax)
          .slice(0, this.state.children);
        
        this.state.childrenAges = ages;
        this._hideNotification();
        this._saveState();
      }
    },

    /**
     * Fetch rates from API
     */
    async _fetchRates() {
      if (!this.state.checkIn || !this.state.checkOut) return;
      
      this.state.isLoading = true;
      this._updatePriceDisplay();
      
      try {
        const rates = await BookingAPI.getRates({
          checkIn: this.state.checkIn,
          checkOut: this.state.checkOut,
          adults: this.state.adults,
          children: this.state.children,
          childrenAges: this.state.childrenAges
        });
        
        this.state.rates = rates.rates;
        this._updatePriceDisplay();
        this._updateSummary();
        this._saveState();
        
      } catch (error) {
        console.error('Failed to fetch rates:', error);
        this._showNotification('Unable to fetch current rates. Please try again.', 'Error');
      } finally {
        this.state.isLoading = false;
        this._updatePriceDisplay();
      }
    },

    /**
     * Update price display
     */
    _updatePriceDisplay() {
      if (!this.elements.priceDisplay) return;
      
      const priceValue = this.elements.priceDisplay.querySelector('.price-value');
      const priceLoading = this.elements.priceDisplay.querySelector('.price-loading');
      
      if (this.state.isLoading) {
        priceValue.style.display = 'none';
        priceLoading.style.display = 'inline';
        return;
      }
      
      priceLoading.style.display = 'none';
      
      if (this.state.rates) {
        priceValue.style.display = 'inline';
        priceValue.textContent = this.state.rates.formattedTotal;
        
        // Update browse button
        if (this.elements.browseBtn) {
          this.elements.browseBtn.textContent = `From ${this.state.rates.formattedTotal}`;
          this.elements.browseBtn.classList.add('has-price');
        }
      } else {
        priceValue.textContent = '--';
        
        if (this.elements.browseBtn) {
          this.elements.browseBtn.textContent = 'BROWSE ROOMS';
          this.elements.browseBtn.classList.remove('has-price');
        }
      }
    },

    /**
     * Update booking summary
     */
    _updateSummary() {
      if (!this.elements.summary) return;
      
      const { checkIn, checkOut, adults, children } = this.state;
      
      // Update date displays
      if (checkIn && this.elements.summary.checkIn) {
        const date = new Date(checkIn + 'T00:00:00');
        this.elements.summary.checkIn.textContent = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (checkOut && this.elements.summary.checkOut) {
        const date = new Date(checkOut + 'T00:00:00');
        this.elements.summary.checkOut.textContent = date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Update guests
      if (this.elements.summary.guests) {
        let guestText = `${adults} Adult${adults > 1 ? 's' : ''}`;
        if (children > 0) {
          guestText += `, ${children} Child${children > 1 ? 'ren' : ''}`;
        }
        this.elements.summary.guests.textContent = guestText;
      }
      
      // Update nights and pricing
      if (this.state.rates) {
        const { nights, subtotal, tax, total, formattedTotal } = this.state.rates;
        
        if (this.elements.summary.nights) {
          this.elements.summary.nights.style.display = 'block';
        }
        
        if (this.elements.summary.nightsCount) {
          this.elements.summary.nightsCount.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
        }
        
        if (this.elements.summary.subtotal) {
          this.elements.summary.subtotal.textContent = `₦${subtotal.toLocaleString()}`;
        }
        
        if (this.elements.summary.tax) {
          this.elements.summary.tax.textContent = `₦${tax.toLocaleString()}`;
        }
        
        if (this.elements.summary.total) {
          this.elements.summary.total.textContent = formattedTotal;
        }
      }
    },

    /**
     * Load state from storage
     */
    _loadFromState() {
      // Update displays with loaded state
      if (this.state.checkIn && this.elements.checkIn.picker) {
        this.elements.checkIn.picker.setDate(this.state.checkIn, false);
        this._updateCheckInDisplay(this.elements.checkIn.picker.formatDate(new Date(this.state.checkIn), 'j M'));
      }
      
      if (this.state.checkOut && this.elements.checkOut.picker) {
        this.elements.checkOut.picker.setDate(this.state.checkOut, false);
        this._updateCheckOutDisplay(this.elements.checkOut.picker.formatDate(new Date(this.state.checkOut), 'j M'));
      }
      
      // Update adults display
      if (this.elements.adults.display) {
        this.elements.adults.display.textContent = `${this.state.adults} Adult${this.state.adults > 1 ? 's' : ''}`;
      }
      
      // Update summary
      this._updateSummary();
      
      // Fetch rates if both dates are set
      if (this.state.checkIn && this.state.checkOut) {
        this._fetchRates();
      }
      
      // Check for 4+ adults
      if (this.state.adults >= 4) {
        this._showAtlanticSuiteNotification();
      }
    },

    /**
     * Handle form submission
     */
    _handleSubmit() {
      // Validate
      if (!this.state.checkIn || !this.state.checkOut) {
        this._showNotification('Please select both check-in and check-out dates.', 'Incomplete Booking');
        return;
      }
      
      if (new Date(this.state.checkOut) <= new Date(this.state.checkIn)) {
        this._showNotification('Check-out must be after check-in.', 'Invalid Dates');
        return;
      }
      
      // Save final state
      this._saveState();
      
      // Navigate to rooms page with params
      const url = BookingState ? BookingState.getRoomsUrl() : `/rooms.html?arrival=${this.state.checkIn}&departure=${this.state.checkOut}&guests=${this.state.adults}`;
      window.location.href = url;
    },

    /**
     * Get current state
     */
    getState() {
      return { ...this.state };
    },

    /**
     * Reset widget
     */
    reset() {
      this.state = {
        checkIn: null,
        checkOut: null,
        adults: 2,
        children: 0,
        childrenAges: [],
        rooms: 1,
        rates: null,
        isLoading: false,
        departureEnabled: false
      };
      
      if (this.elements.checkIn.picker) {
        this.elements.checkIn.picker.clear();
      }
      
      if (this.elements.checkOut.picker) {
        this.elements.checkOut.picker.clear();
        this._disableDeparture();
      }
      
      if (BookingState) {
        BookingState.reset();
      }
      
      this._updateSummary();
      this._updatePriceDisplay();
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BookingWidget.init());
  } else {
    BookingWidget.init();
  }

  // Expose to global scope
  global.BookingWidget = BookingWidget;

})(typeof window !== 'undefined' ? window : this);

