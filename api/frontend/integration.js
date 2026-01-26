/**
 * HOTEL BOOKING SYSTEM - FRONTEND INTEGRATION
 * Complete JavaScript SDK for Supabase backend integration
 */

class HotelBooking {
  constructor() {
    this.supabase = null;
    this.config = {
      supabaseUrl: "https://your-project.supabase.co",
      supabaseKey: "your-anon-key-here",
    };
  }

  async init() {
    try {
      this.supabase = window.supabase.createClient(
        this.config.supabaseUrl,
        this.config.supabaseKey
      );
      console.log("HotelBooking initialized");
      await this.restoreSession();
    } catch (error) {
      console.error("Failed to initialize:", error);
      throw error;
    }
  }

  async restoreSession() {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      return session?.user || null;
    } catch (error) {
      return null;
    }
  }

  onAuthStateChange() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        window.dispatchEvent(
          new CustomEvent("hotel:login", { detail: { user: session.user } })
        );
      } else if (event === "SIGNED_OUT") {
        window.dispatchEvent(new CustomEvent("hotel:logout", { detail: {} }));
      }
    });
  }
}

// AUTHENTICATION
HotelBooking.prototype.auth = {
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) return { success: false, error: error.message };
      return {
        success: true,
        user: data.user,
        needsVerification: !data.user?.email_confirmed_at,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      return error
        ? { success: false, error: error.message }
        : { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUser() {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      return null;
    }
  },

  async isLoggedIn() {
    try {
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      return false;
    }
  },
};

// ROOMS
HotelBooking.prototype.rooms = {
  async getAll(filters = {}) {
    try {
      if (filters.checkIn && filters.checkOut) {
        const { data, error } = await this.supabase.rpc("get_available_rooms", {
          filter_type: filters.type || null,
          check_in: filters.checkIn.toISOString().split("T")[0],
          check_out: filters.checkOut.toISOString().split("T")[0],
          min_capacity: filters.minCapacity || 1,
        });
        if (error) return await this._getAllDirect(filters);
        return { success: true, data };
      }
      return await this._getAllDirect(filters);
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  async _getAllDirect(filters = {}) {
    try {
      let query = this.supabase
        .from("rooms")
        .select("*")
        .eq("is_available", true);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.minCapacity)
        query = query.gte("capacity", filters.minCapacity);
      query = query.order("price_per_night", { ascending: true });
      const { data, error } = await query;
      return error
        ? { success: false, error: error.message, data: [] }
        : { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  async getById(roomId) {
    try {
      const { data, error } = await this.supabase.rpc("get_room_details", {
        room_uuid: roomId,
      });
      if (error) {
        const { data: directData, error: directError } = await this.supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single();
        return directError
          ? { success: false, error: directError.message }
          : { success: true, data: directData };
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async checkAvailability(roomId, checkIn, checkOut) {
    try {
      const { data } = await this.supabase.rpc("check_room_availability", {
        room_uuid: roomId,
        check_in: checkIn.toISOString().split("T")[0],
        check_out: checkOut.toISOString().split("T")[0],
      });
      return data || false;
    } catch (error) {
      return false;
    }
  },
};

// BOOKINGS
HotelBooking.prototype.bookings = {
  async create(bookingData) {
    try {
      const { data, error } = await this.supabase.rpc("create_booking", {
        room_uuid: bookingData.roomId,
        check_in: bookingData.checkIn.toISOString().split("T")[0],
        check_out: bookingData.checkOut.toISOString().split("T")[0],
        guest_count: bookingData.guests || 2,
        special_req: bookingData.specialRequests || null,
      });
      if (error)
        return { success: false, message: error.message, bookingId: null };
      const result = typeof data === "string" ? JSON.parse(data) : data;
      return result.success
        ? {
            success: true,
            bookingId: result.booking_id,
            message: result.message,
            totalPrice: result.total_price,
          }
        : { success: false, bookingId: null, message: result.message };
    } catch (error) {
      return { success: false, message: error.message, bookingId: null };
    }
  },

  async getAll(statusFilter = null) {
    try {
      const { data, error } = await this.supabase.rpc("get_user_bookings", {
        status_filter: statusFilter || null,
      });
      return error
        ? { success: false, error: error.message, data: [] }
        : { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },

  async cancel(bookingId) {
    try {
      const { data, error } = await this.supabase.rpc("cancel_booking", {
        booking_uuid: bookingId,
      });
      if (error) return { success: false, error: error.message };
      const result = typeof data === "string" ? JSON.parse(data) : data;
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// PAYMENTS
HotelBooking.prototype.payments = {
  async create(paymentData) {
    try {
      const { data, error } = await this.supabase.rpc("create_payment", {
        booking_uuid: paymentData.bookingId,
        amount: paymentData.amount,
        payment_method: paymentData.method || "card",
      });
      if (error)
        return { success: false, error: error.message, paymentId: null };
      const result = typeof data === "string" ? JSON.parse(data) : data;
      return {
        success: result.success,
        paymentId: result.payment_id,
        message: result.message,
      };
    } catch (error) {
      return { success: false, error: error.message, paymentId: null };
    }
  },

  async confirm(paymentId, transactionRef = null) {
    try {
      const { data, error } = await this.supabase.rpc("process_payment", {
        payment_uuid: paymentId,
        transaction_ref: transactionRef,
      });
      if (error) return { success: false, error: error.message };
      const result = typeof data === "string" ? JSON.parse(data) : data;
      return { success: result.success, message: result.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getHistory() {
    try {
      const { data, error } = await this.supabase.rpc("get_user_payments");
      return error
        ? { success: false, error: error.message, data: [] }
        : { success: true, data };
    } catch (error) {
      return { success: false, error: error.message, data: [] };
    }
  },
};

// PROTECTED ROUTES
HotelBooking.prototype.protected = {
  async requireAuth(redirectUrl = "/login.html") {
    const isLoggedIn = await HotelBooking.auth.isLoggedIn();
    if (!isLoggedIn) {
      sessionStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },
};

// AUTO-INITIALIZE
HotelBooking.autoInit = true;
document.addEventListener("DOMContentLoaded", async () => {
  if (HotelBooking.autoInit) {
    await HotelBooking.init();
    HotelBooking.onAuthStateChange();
    window.dispatchEvent(new CustomEvent("hotel:ready"));
  }
});
window.HotelBooking = new HotelBooking();
