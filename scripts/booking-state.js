/**
 * Grand Emily Hotel - Booking State Management
 * Global reactive state for booking data across all pages
 */

(function (global) {
  "use strict";

  // Booking State Module
  const BookingState = {
    // State storage
    _state: {
      // Core booking fields
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      childrenAges: [],
      rooms: 1,

      // Selected room
      selectedRoom: null,

      // Guest details
      guestDetails: {
        fullName: "",
        email: "",
        phone: "",
        specialRequests: "",
      },

      // Payment info
      paymentMethod: "card",
      pendingBookingId: null,
      pendingExpiry: null,

      // Rate info
      rates: {
        baseRate: 0,
        total: 0,
        tax: 0,
        nights: 0,
      },

      // Waitlist
      waitlist: {
        active: false,
        roomId: null,
        email: null,
        phone: null,
      },
    },

    // Subscribers for reactive updates
    _subscribers: new Set(),

    /**
     * Initialize state from sessionStorage or URL params
     */
    init() {
      // Try to load from sessionStorage first
      const stored = sessionStorage.getItem("emilyBookingState");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this._state = { ...this._state, ...parsed };
        } catch (e) {
          console.error("Failed to parse stored booking state:", e);
        }
      }

      // Check URL parameters
      this._parseUrlParams();

      // Sync to sessionStorage
      this._persist();

      // Notify subscribers
      this._notify();

      return this._state;
    },

    /**
     * Parse URL parameters and update state
     */
    _parseUrlParams() {
      const params = new URLSearchParams(window.location.search);

      // Check for arrival/departure/guests params
      if (params.has("arrival")) {
        const arrival = params.get("arrival");
        if (this._isValidDate(arrival)) {
          this._state.checkIn = arrival;
        }
      }

      if (params.has("departure")) {
        const departure = params.get("departure");
        if (this._isValidDate(departure)) {
          this._state.checkOut = departure;
        }
      }

      if (params.has("arrival") && params.has("departure")) {
        this._calculateNights();
      }

      if (params.has("guests")) {
        const guests = parseInt(params.get("guests"));
        if (!isNaN(guests) && guests >= 1) {
          this._state.adults = Math.min(guests, 6);
        }
      }

      if (params.has("adults")) {
        const adults = parseInt(params.get("adults"));
        if (!isNaN(adults) && adults >= 1) {
          this._state.adults = Math.min(adults, 6);
        }
      }

      if (params.has("children")) {
        const children = parseInt(params.get("children"));
        if (!isNaN(children) && children >= 0) {
          this._state.children = Math.min(children, 4);
        }
      }
    },

    /**
     * Validate date string format
     */
    _isValidDate(dateStr) {
      if (!dateStr || typeof dateStr !== "string") return false;
      // Check YYYY-MM-DD format
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(dateStr)) return false;
      const date = new Date(dateStr);
      return date instanceof Date && !isNaN(date);
    },

    /**
     * Calculate number of nights
     */
    _calculateNights() {
      if (this._state.checkIn && this._state.checkOut) {
        const checkIn = new Date(this._state.checkIn);
        const checkOut = new Date(this._state.checkOut);
        const diffTime = checkOut - checkIn;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this._state.rates.nights = Math.max(0, diffDays);
      }
    },

    /**
     * Persist state to sessionStorage
     */
    _persist() {
      try {
        sessionStorage.setItem(
          "emilyBookingState",
          JSON.stringify(this._state)
        );
      } catch (e) {
        console.error("Failed to persist booking state:", e);
      }
    },

    /**
     * Notify all subscribers of state change
     */
    _notify() {
      this._subscribers.forEach((callback) => {
        try {
          callback(this._state, this);
        } catch (e) {
          console.error("State subscriber error:", e);
        }
      });
    },

    /**
     * Subscribe to state changes
     */
    subscribe(callback) {
      if (typeof callback === "function") {
        this._subscribers.add(callback);
        // Immediately call with current state
        callback(this._state, this);
      }
      return () => this._subscribers.delete(callback);
    },

    /**
     * Get current state
     */
    getState() {
      return { ...this._state };
    },

    /**
     * Get specific state value
     */
    get(key) {
      if (key && typeof key === "string") {
        const keys = key.split(".");
        let value = this._state;
        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            return undefined;
          }
        }
        return value;
      }
      return undefined;
    },

    /**
     * Set state value(s)
     */
    set(updates) {
      let hasChanges = false;

      for (const [key, value] of Object.entries(updates)) {
        if (this._state.hasOwnProperty(key)) {
          // Handle nested objects (merge instead of replace)
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            typeof this._state[key] === "object"
          ) {
            this._state[key] = { ...this._state[key], ...value };
          } else {
            this._state[key] = value;
          }
          hasChanges = true;
        }
      }

      if (hasChanges) {
        this._persist();
        this._notify();
      }

      return this;
    },

    /**
     * Reset state to defaults
     */
    reset() {
      this._state = {
        checkIn: null,
        checkOut: null,
        adults: 2,
        children: 0,
        childrenAges: [],
        rooms: 1,
        selectedRoom: null,
        guestDetails: {
          fullName: "",
          email: "",
          phone: "",
          specialRequests: "",
        },
        paymentMethod: "card",
        pendingBookingId: null,
        pendingExpiry: null,
        rates: {
          baseRate: 0,
          total: 0,
          tax: 0,
          nights: 0,
        },
        waitlist: {
          active: false,
          roomId: null,
          email: null,
          phone: null,
        },
      };

      this._persist();
      this._notify();

      return this;
    },

    /**
     * Check if minimum required fields are set
     */
    isValid() {
      return !!(
        this._state.checkIn &&
        this._state.checkOut &&
        this._state.adults >= 1 &&
        new Date(this._state.checkOut) > new Date(this._state.checkIn)
      );
    },

    /**
     * Get formatted date for display (DD/MM/YYYY)
     */
    getFormattedDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr + "T00:00:00"); // Force local time
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },

    /**
     * Get ISO date string from user input
     */
    toISODate(dateStr) {
      if (!dateStr) return null;

      // Handle DD/MM/YYYY format
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      return dateStr;
    },

    /**
     * Calculate nights between check-in and check-out
     */
    getNights() {
      return this._state.rates.nights || 0;
    },

    /**
     * Check if pending booking is still valid
     */
    isPendingValid() {
      if (!this._state.pendingExpiry) return false;
      return new Date(this._state.pendingExpiry) > new Date();
    },

    /**
     * Get remaining pending time in seconds
     */
    getPendingSeconds() {
      if (!this._state.pendingExpiry) return 0;
      const remaining = new Date(this._state.pendingExpiry) - new Date();
      return Math.max(0, Math.ceil(remaining / 1000));
    },

    /**
     * Create pending booking (for bank transfer)
     */
    createPendingBooking(bookingId, expiresInMinutes = 30) {
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + expiresInMinutes);

      this.set({
        pendingBookingId: bookingId,
        pendingExpiry: expiry.toISOString(),
      });

      return bookingId;
    },

    /**
     * Clear pending booking
     */
    clearPending() {
      this.set({
        pendingBookingId: null,
        pendingExpiry: null,
      });
    },

    /**
     * Set waitlist info
     */
    setWaitlist(roomId, email, phone) {
      this.set({
        waitlist: {
          active: true,
          roomId,
          email,
          phone,
        },
      });
    },

    /**
     * Clear waitlist
     */
    clearWaitlist() {
      this.set({
        waitlist: {
          active: false,
          roomId: null,
          email: null,
          phone: null,
        },
      });
    },

    /**
     * Get URL query string for current state
     */
    toQueryString() {
      const params = new URLSearchParams();
      if (this._state.checkIn) params.set("arrival", this._state.checkIn);
      if (this._state.checkOut) params.set("departure", this._state.checkOut);
      if (this._state.adults) params.set("adults", this._state.adults);
      if (this._state.children) params.set("children", this._state.children);
      if (this._state.rooms) params.set("rooms", this._state.rooms);
      return params.toString();
    },

    /**
     * Get full URL for rooms page with current booking params
     */
    getRoomsUrl() {
      const query = this.toQueryString();
      return `/rooms.html${query ? "?" + query : ""}`;
    },
  };

  // Initialize on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => BookingState.init());
  } else {
    BookingState.init();
  }

  // Expose to global scope
  global.BookingState = BookingState;
})(typeof window !== "undefined" ? window : this);
