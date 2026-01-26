/**
 * ============================================
 * SUPABASE CLIENT CONFIGURATION (Beginner-Friendly)
 * ============================================
 *
 * Supabase is a backend-as-a-service platform.
 * It provides:
 * 1. Authentication (signup/login)
 * 2. Database storage (like SQL tables)
 * 3. Realtime updates (like chat or live booking status)
 * 4. Storage (files, images, etc.)
 *
 * This file sets up your Supabase client and manages
 * user sessions so the frontend can communicate
 * securely with the backend.
 */

// ============================================
// CONFIGURATION - REPLACE WITH YOUR VALUES
// ============================================

const SUPABASE_CONFIG = {
  // Your Supabase Project URL (from dashboard)
  SUPABASE_URL: "https://ljbuttyiqhhmuoqffdeh.supabase.co",

  // Your Supabase public anonymous key (safe for frontend)
  SUPABASE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnV0dHlpcWhobXVvcWZmZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODMwMjMsImV4cCI6MjA4NDU1OTAyM30.tcBn92TvDmJgqd9YZNAIwMWf2t2tPpsMX8ObrnN55Z0",

  // LocalStorage key to save session data
  SESSION_KEY: "hotel_auth_session",

  // LocalStorage key to save minimal user info
  USER_KEY: "hotel_user_data",
};

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

/**
 * Initialize Supabase client
 * This object (supabase) will be used to talk to the backend
 * for auth, database, and realtime features.
 */
const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.SUPABASE_URL,
  SUPABASE_CONFIG.SUPABASE_KEY,
  {
    // Auth configuration
    auth: {
      // Refresh user token automatically before it expires
      autoRefresh: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL if redirected after signup/login
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: SUPABASE_CONFIG.SESSION_KEY,
    },

    // Global headers for all requests (optional, helpful for debugging)
    global: {
      headers: {
        "x-application-name": "grand-emily-hotel",
      },
    },

    // Realtime configuration for live updates
    realtime: {
      params: {
        // How many events per second we allow (throttle)
        eventsPerSecond: 10,
      },
    },
  }
);

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * SessionManager handles all login state for users:
 * - Store session info in localStorage
 * - Refresh tokens
 * - Clear session on logout
 */
const SessionManager = {
  /**
   * Get current session from Supabase
   * Session contains:
   * - access_token: used to authenticate requests
   * - refresh_token: used to get a new access_token
   * - user info: id, email, phone, etc.
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  },

  /**
   * Get currently logged-in user
   */
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  /**
   * Returns true if user is authenticated
   */
  async isAuthenticated() {
    const session = await this.getSession();
    return !!session && !!session.access_token;
  },

  /**
   * Store session securely in localStorage
   * This keeps the user logged in across page refreshes
   */
  storeSession(session) {
    try {
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user_id: session.user?.id,
      };
      localStorage.setItem(
        SUPABASE_CONFIG.SESSION_KEY,
        JSON.stringify(sessionData)
      );
      return true;
    } catch (error) {
      console.error("Error storing session:", error);
      return false;
    }
  },

  /**
   * Clear session data on logout
   */
  clearSession() {
    localStorage.removeItem(SUPABASE_CONFIG.SESSION_KEY);
    localStorage.removeItem(SUPABASE_CONFIG.USER_KEY);
  },

  /**
   * Refresh session token if needed
   * Supabase uses short-lived access tokens, so we refresh them periodically
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        this.storeSession(data.session);
      }
      return data.session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  },
};

// ============================================
// AUTH STATE LISTENER
// ============================================

/**
 * Listen for auth state changes (login, logout, token refresh)
 * This keeps the frontend UI in sync with the backend state
 */
function initAuthListener(callback) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event);

    if (session) {
      // Save session locally
      SessionManager.storeSession(session);
    } else {
      // Clear session if user logs out
      SessionManager.clearSession();
    }

    // Optional callback for UI updates
    if (callback) {
      callback(event, session);
    }
  });
}

// ============================================
// EXPORT TO GLOBAL SCOPE
// ============================================

// Makes these available to other scripts
window.SupabaseConfig = SUPABASE_CONFIG;
window.supabase = supabase;
window.SessionManager = SessionManager;
window.initAuthListener = initAuthListener;
