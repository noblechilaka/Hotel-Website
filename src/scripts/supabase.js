/**
 * LUXURY HOTEL - Supabase Client
 * Database integration and CRUD operations
 */

// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

// Supabase client instance
let supabaseClient = null;

// ============================================
// INITIALIZE SUPABASE
// ============================================

async function initSupabase() {
  // Check if we're in browser environment
  if (typeof window === "undefined") return null;

  // Dynamically import Supabase only in browser
  if (!supabaseClient && typeof window.supabase !== "undefined") {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  return supabaseClient;
}

// ============================================
// SUPABASE CLIENT CLASS
// ============================================

class SupabaseClient {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return this.client;

    try {
      // Using global Supabase from CDN
      if (window.supabase) {
        this.client = window.supabase.createClient(
          "https://YOUR_PROJECT.supabase.co",
          "YOUR_ANON_KEY"
        );
        this.initialized = true;
        console.log("Supabase initialized successfully");
      }
    } catch (error) {
      console.warn("Supabase initialization deferred (using mock mode)");
    }

    return this.client;
  }

  // ====================
  // USERS TABLE
  // ====================

  async createUser(userData) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("users")
        .insert([
          {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            phone: userData.phone || null,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async getUser(userId) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async updateUser(userId, updates) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // ====================
  // ROOMS TABLE
  // ====================

  async getRooms(filters = {}) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      let query = client.from("rooms").select("*").eq("is_active", true);

      if (filters.guests) {
        query = query.gte("max_guests", filters.guests);
      }

      if (filters.priceMin) {
        query = query.gte("price_per_night", filters.priceMin);
      }

      if (filters.priceMax) {
        query = query.lte("price_per_night", filters.priceMax);
      }

      const { data, error } = await query.order("price_per_night", {
        ascending: true,
      });

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async getRoom(roomId) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .eq("is_active", true)
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async getFeaturedRooms() {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("rooms")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(6);

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // ====================
  // BOOKINGS TABLE
  // ====================

  async createBooking(bookingData) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("bookings")
        .insert([
          {
            user_id: bookingData.userId,
            room_id: bookingData.roomId,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            guests: bookingData.guests,
            total_price: bookingData.totalPrice,
            guest_name: bookingData.guestName,
            guest_email: bookingData.guestEmail,
            guest_phone: bookingData.guestPhone || null,
            special_requests: bookingData.specialRequests || null,
            payment_status: "pending",
            booking_status: "confirmed",
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async getBooking(bookingId) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("bookings")
        .select(
          `
                    *,
                    rooms (
                        name,
                        images,
                        price_per_night
                    )
                `
        )
        .eq("id", bookingId)
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async getUserBookings(userId) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("bookings")
        .select(
          `
                    *,
                    rooms (
                        name,
                        images,
                        price_per_night
                    )
                `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async updateBooking(bookingId, updates) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("bookings")
        .update(updates)
        .eq("id", bookingId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async updatePaymentStatus(bookingId, status, transactionRef = null) {
    const updates = {
      payment_status: status,
      updated_at: new Date().toISOString(),
    };

    if (transactionRef) {
      updates.transaction_ref = transactionRef;
    }

    return await this.updateBooking(bookingId, updates);
  }

  async cancelBooking(bookingId) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      const { data, error } = await client
        .from("bookings")
        .update({
          booking_status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // ====================
  // AVAILABILITY CHECK
  // ====================

  async checkAvailability(roomId, checkIn, checkOut, excludeBookingId = null) {
    const client = await this.init();
    if (!client)
      return { data: null, error: { message: "Supabase not configured" } };

    try {
      // Check for overlapping bookings
      let query = client
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .eq("booking_status", "confirmed")
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`);

      if (excludeBookingId) {
        query = query.neq("id", excludeBookingId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // If no conflicting bookings, room is available
      return { data: { available: data.length === 0 }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // ====================
  // REAL-TIME SUBSCRIPTIONS
  // ====================

  subscribeToBookings(userId, callback) {
    const client = this.init();
    if (!client) return null;

    const subscription = client
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  }
}

// ============================================
// DATABASE MOCK (FOR DEMO/DEVELOPMENT)
// ============================================

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.bookings = new Map();

    // Seed demo data
    this.seedDemoData();
  }

  seedDemoData() {
    // Demo rooms
    const rooms = [
      {
        id: "room-1",
        name: "Ocean View Suite",
        slug: "ocean-view-suite",
        description:
          "A luxurious suite with panoramic ocean views, featuring a private terrace and elegant contemporary design.",
        short_description: "Panoramic ocean views with private terrace",
        price_per_night: 450,
        max_guests: 2,
        size: 65,
        bed_type: "King",
        amenities: [
          "Ocean View",
          "Private Terrace",
          "Mini Bar",
          "Free WiFi",
          "Room Service",
        ],
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200",
        ],
        is_featured: true,
        is_active: true,
      },
      {
        id: "room-2",
        name: "Garden Retreat",
        slug: "garden-retreat",
        description:
          "Nestled within our lush tropical gardens, this sanctuary offers complete privacy and tranquility.",
        short_description: "Private sanctuary in tropical gardens",
        price_per_night: 320,
        max_guests: 2,
        size: 55,
        bed_type: "Queen",
        amenities: [
          "Garden View",
          "Rain Shower",
          "Private Garden",
          "Free WiFi",
        ],
        images: [
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200",
        ],
        is_featured: true,
        is_active: true,
      },
      {
        id: "room-3",
        name: "Presidential Suite",
        slug: "presidential-suite",
        description:
          "The ultimate in luxury living with expansive space, exclusive amenities, and breathtaking views.",
        short_description: "Ultimate luxury with exclusive amenities",
        price_per_night: 1200,
        max_guests: 4,
        size: 150,
        bed_type: "King",
        amenities: [
          "Panoramic Views",
          "Private Pool",
          "Butler Service",
          "Jacuzzi",
          "Kitchen",
        ],
        images: [
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200",
        ],
        is_featured: true,
        is_active: true,
      },
      {
        id: "room-4",
        name: "Beach Villa",
        slug: "beach-villa",
        description:
          "Direct beach access with your own private stretch of pristine shoreline and infinity pool.",
        short_description: "Direct beach access with private pool",
        price_per_night: 850,
        max_guests: 6,
        size: 200,
        bed_type: "King + Twins",
        amenities: [
          "Beach Access",
          "Private Pool",
          "Kitchen",
          "Butler Service",
          "Outdoor Lounge",
        ],
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200",
        ],
        is_featured: true,
        is_active: true,
      },
    ];

    rooms.forEach((room) => this.rooms.set(room.id, room));
  }

  async getRooms(filters = {}) {
    let rooms = Array.from(this.rooms.values()).filter((r) => r.is_active);

    if (filters.guests) {
      rooms = rooms.filter((r) => r.max_guests >= filters.guests);
    }

    return { data: rooms, error: null };
  }

  async getRoom(roomId) {
    const room = this.rooms.get(roomId);
    return { data: room || null, error: null };
  }

  async getFeaturedRooms() {
    const rooms = Array.from(this.rooms.values()).filter(
      (r) => r.is_active && r.is_featured
    );
    return { data: rooms, error: null };
  }

  async createBooking(bookingData) {
    const id = "booking-" + Date.now();
    const booking = {
      id,
      ...bookingData,
      created_at: new Date().toISOString(),
    };
    this.bookings.set(id, booking);
    return { data: booking, error: null };
  }

  async getBooking(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking)
      return { data: null, error: { message: "Booking not found" } };

    const room = this.rooms.get(booking.room_id);
    return { data: { ...booking, rooms: room }, error: null };
  }

  async getUserBookings(userId) {
    const bookings = Array.from(this.bookings.values()).filter(
      (b) => b.user_id === userId
    );

    const bookingsWithRooms = bookings.map((booking) => ({
      ...booking,
      rooms: this.rooms.get(booking.room_id),
    }));

    return { data: bookingsWithRooms, error: null };
  }

  async updatePaymentStatus(bookingId, status, transactionRef = null) {
    const booking = this.bookings.get(bookingId);
    if (!booking)
      return { data: null, error: { message: "Booking not found" } };

    booking.payment_status = status;
    if (transactionRef) booking.transaction_ref = transactionRef;
    this.bookings.set(bookingId, booking);

    return { data: booking, error: null };
  }
}

// Create instance
const db = new MockDatabase();
const supabase = new SupabaseClient();

// ============================================
// EXPORT
// ============================================

window.SupabaseClient = SupabaseClient;
window.Database = db;
window.Supabase = supabase;
