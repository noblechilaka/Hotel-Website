/**
 * Grand Emily Hotel - Booking API Integration
 * API layer for availability, rates, and booking operations
 */

(function (global) {
  "use strict";

  // API Configuration
  const API_CONFIG = {
    baseUrl: "/api",
    endpoints: {
      availability: "/availability",
      rates: "/rates",
      booking: "/bookings",
      waitlist: "/waitlist",
      upload: "/upload",
    },
    timeout: 30000, // 30 seconds
    retries: 2,
  };

  // Booking API Module
  const BookingAPI = {
    /**
     * Get current Lagos time
     */
    getLagosTime() {
      // Lagos is GMT+1
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const lagosTime = new Date(utc + 3600000 * 1); // GMT+1
      return {
        date: lagosTime,
        hours: lagosTime.getHours(),
        isPast6PM: lagosTime.getHours() >= 18,
      };
    },

    /**
     * Get minimum check-in date based on Lagos time
     */
    getMinCheckInDate() {
      const lagos = this.getLagosTime();
      if (lagos.isPast6PM) {
        // After 6 PM, minimum is tomorrow
        const tomorrow = new Date(lagos.date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      }
      // Before 6 PM, today is valid
      return lagos.date.toISOString().split("T")[0];
    },

    /**
     * Check room availability
     * @param {Object} params - Check parameters
     * @returns {Promise<Object>} Availability data
     */
    async checkAvailability(params) {
      const { checkIn, checkOut, roomId, guests } = params;

      // Build query string
      const queryParams = new URLSearchParams();
      if (checkIn) queryParams.set("arrival", checkIn);
      if (checkOut) queryParams.set("departure", checkOut);
      if (roomId) queryParams.set("room_id", roomId);
      if (guests) queryParams.set("guests", guests);

      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.availability}?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Availability check failed:", error);
        // Return mock data for demo
        return this._mockAvailability(params);
      }
    },

    /**
     * Get room rates for selected dates
     * @param {Object} params - Rate parameters
     * @returns {Promise<Object>} Rate data
     */
    async getRates(params) {
      const { checkIn, checkOut, roomId, guests, childrenAges } = params;

      const queryParams = new URLSearchParams();
      if (checkIn) queryParams.set("arrival", checkIn);
      if (checkOut) queryParams.set("departure", checkOut);
      if (roomId) queryParams.set("room_id", roomId);
      if (guests) queryParams.set("guests", guests);

      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.rates}?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Rate fetch failed:", error);
        // Return mock data for demo
        return this._mockRates(params);
      }
    },

    /**
     * Create a new booking
     * @param {Object} bookingData - Booking information
     * @returns {Promise<Object>} Created booking
     */
    async createBooking(bookingData) {
      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.booking}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...bookingData,
              status: "pending",
              paymentMethod: bookingData.paymentMethod || "card",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Booking creation failed:", error);
        // Return mock booking for demo
        return this._mockBooking(bookingData);
      }
    },

    /**
     * Update booking status
     * @param {string} bookingId - Booking ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated booking
     */
    async updateBookingStatus(bookingId, status) {
      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.booking}/${bookingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Status update failed:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Submit waitlist request
     * @param {Object} waitlistData - Waitlist information
     * @returns {Promise<Object>} Waitlist submission result
     */
    async submitWaitlist(waitlistData) {
      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.waitlist}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...waitlistData,
              submittedAt: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Waitlist submission failed:", error);
        // Return mock success for demo
        return {
          success: true,
          id: "WL-" + Date.now(),
          message: "You have been added to the waitlist",
        };
      }
    },

    /**
     * Upload proof of payment
     * @param {File} file - Receipt file
     * @param {string} bookingId - Booking ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadReceipt(file, bookingId) {
      // Validate file
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: "Invalid file type. Please upload JPG, PNG, or PDF.",
        };
      }

      if (file.size > maxSize) {
        return {
          success: false,
          error: "File too large. Maximum size is 10MB.",
        };
      }

      const formData = new FormData();
      formData.append("receipt", file);
      formData.append("bookingId", bookingId);

      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.upload}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Upload failed:", error);
        // Return mock success for demo
        return {
          success: true,
          url: URL.createObjectURL(file),
          message: "Receipt uploaded successfully",
        };
      }
    },

    /**
     * Send notification to guest
     * @param {string} type - Notification type (whatsapp, email)
     * @param {Object} data - Notification data
     * @returns {Promise<Object>} Send result
     */
    async sendNotification(type, data) {
      try {
        const response = await fetch("/api/notifications/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, ...data }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Notification send failed:", error);
        return { success: false, error: error.message };
      }
    },

    /**
     * Mock availability data for demo
     */
    _mockAvailability(params) {
      const rooms = [
        { id: "ocean-view", name: "Ocean View Suite", available: true },
        { id: "garden-terrace", name: "Garden Terrace", available: true },
        { id: "atlantic", name: "Atlantic Suite", available: true },
        { id: "presidential", name: "Presidential Suite", available: false },
      ];

      // Mark some rooms unavailable based on check-in
      const checkIn = new Date(params.checkIn);
      const dayOfMonth = checkIn.getDate();

      return {
        success: true,
        available: rooms.map((room) => ({
          ...room,
          available: dayOfMonth % 3 !== 0 || room.id === "atlantic", // Some rooms unavailable
        })),
      };
    },

    /**
     * Mock rates data for demo
     */
    _mockRates(params) {
      const baseRate = 45000; // ₦45,000 base rate
      const nights =
        params.checkIn && params.checkOut
          ? Math.ceil(
              (new Date(params.checkOut) - new Date(params.checkIn)) /
                (1000 * 60 * 60 * 24)
            )
          : 1;

      const subtotal = baseRate * nights;
      const tax = Math.round(subtotal * 0.1); // 10% tax
      const total = subtotal + tax;

      return {
        success: true,
        rates: {
          baseRate,
          perNight: baseRate,
          subtotal,
          tax,
          total,
          nights,
          currency: "NGN",
          formattedTotal: `₦${total.toLocaleString()}`,
        },
      };
    },

    /**
     * Mock booking for demo
     */
    _mockBooking(data) {
      const bookingId = "BK-" + Date.now().toString(36).toUpperCase();

      return {
        success: true,
        booking: {
          id: bookingId,
          ...data,
          status:
            data.paymentMethod === "bank_transfer" ? "pending" : "confirmed",
          createdAt: new Date().toISOString(),
          pendingExpiry:
            data.paymentMethod === "bank_transfer"
              ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
              : null,
        },
      };
    },
  };

  // Expose to global scope
  global.BookingAPI = BookingAPI;
})(typeof window !== "undefined" ? window : this);
