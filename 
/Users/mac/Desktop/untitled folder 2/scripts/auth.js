/**
 * ============================================
 * HOTEL AUTHENTICATION MODULE (Beginner-Friendly)
 * ============================================
 *
 * This module handles user authentication for the hotel booking system.
 *
 * Features:
 * - Email + Password signup/login
 * - Phone + OTP login
 * - Persistent sessions (user stays logged in across page reloads)
 * - Secure logout
 * - Password reset
 * - UI updates based on login state
 *
 * Note for beginners:
 * Authentication means confirming the identity of a user.
 * Supabase provides backend services for auth, so we only need to call its functions.
 */

// ============================================
// ERROR MESSAGES
// ============================================

const AUTH_ERRORS = {
  INVALID_PASSWORD:
    "Invalid password. Please check your password and try again.",
  WEAK_PASSWORD:
    "Password must be at least 8 characters, with uppercase, lowercase, and numbers.",
  PASSWORD_MISMATCH: "Passwords do not match.",

  INVALID_EMAIL: "Please enter a valid email address.",
  EMAIL_NOT_FOUND: "No account found with this email address.",
  EMAIL_ALREADY_REGISTERED: "An account with this email already exists.",

  INVALID_PHONE: "Please enter a valid phone number.",
  PHONE_NOT_FOUND: "No account found with this phone number.",
  PHONE_ALREADY_REGISTERED: "An account with this phone already exists.",

  INVALID_OTP: "Invalid verification code. Please check and try again.",
  EXPIRED_OTP: "Verification code has expired. Please request a new one.",
  OTP_REQUIRED: "Please enter the verification code sent to your phone.",

  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  FIELD_REQUIRED: "This field is required.",

  SIGNUP_SUCCESS:
    "Account created successfully! Please check your email to verify.",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out successfully.",
  OTP_SENT: "Verification code sent to your phone.",
  PASSWORD_RESET_SENT: "Password reset instructions sent to your email.",
};

// ============================================
// VALIDATION UTILITIES
// ============================================

const AuthValidator = {
  /**
   * Check if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  /**
   * Check if phone number is valid (basic international format)
   */
  isValidPhone(phone) {
    const cleaned = phone.replace(/[^\d+]/g, ""); // remove unwanted characters
    const phoneRegex = /^\+?[1-9]\d{6,14}$/; // 7-15 digits with optional +
    return phoneRegex.test(cleaned);
  },

  /**
   * Check password strength
   */
  isStrongPassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      valid:
        password.length >= minLength &&
        hasUppercase &&
        hasLowercase &&
        hasNumbers,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecial,
      minLength: password.length >= minLength,
    };
  },

  /**
   * Check if name is valid
   */
  isValidName(name) {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  /**
   * Sanitize input to prevent basic injections
   */
  sanitize(str) {
    return str.trim().replace(/[<>]/g, "");
  },
};

// ============================================
// HOTEL AUTHENTICATION CLASS
// ============================================

class HotelAuth {
  constructor() {
    this.supabase = window.supabase;
    this.sessionManager = window.SessionManager;
    this.currentUser = null;
    this.isInitialized = false;
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  /**
   * Initialize auth module on page load
   * Checks if user already has an active session
   */
  async init() {
    if (this.isInitialized) return this.currentUser;

    try {
      // Get existing session from Supabase
      const session = await this.sessionManager.getSession();

      if (session) {
        // If session exists, fetch user info
        const user = await this.sessionManager.getUser();
        if (user) {
          this.currentUser = this.formatUser(user);
          this.updateUIForLoggedInUser();
        }
      }

      // Setup listener for auth state changes (login/logout)
      this.setupAuthListener();

      this.isInitialized = true;
      return this.currentUser;
    } catch (error) {
      console.error("Auth initialization error:", error);
      this.isInitialized = true;
      return null;
    }
  }

  /**
   * Listen for login/logout/refresh events
   * Automatically updates UI and session storage
   */
  setupAuthListener() {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event);

      if (event === "SIGNED_IN" && session) {
        this.currentUser = this.formatUser(session.user);
        this.updateUIForLoggedInUser();
      } else if (event === "SIGNED_OUT") {
        this.currentUser = null;
        this.updateUIForLoggedOutUser();
      } else if (event === "TOKEN_REFRESHED" && session) {
        this.sessionManager.storeSession(session);
      } else if (event === "USER_UPDATED" && session) {
        this.currentUser = this.formatUser(session.user);
      }
    });
  }

  // ========================================
  // EMAIL + PASSWORD SIGNUP
  // ========================================

  async signUpWithEmail(email, password, metadata = {}) {
    try {
      // Validate email
      if (!AuthValidator.isValidEmail(email))
        return { success: false, error: AUTH_ERRORS.INVALID_EMAIL };

      // Validate password
      const passwordCheck = AuthValidator.isStrongPassword(password);
      if (!passwordCheck.valid)
        return { success: false, error: AUTH_ERRORS.WEAK_PASSWORD };

      // Sanitize metadata
      const userMetadata = {
        full_name:
          AuthValidator.sanitize(metadata.fullName) || metadata.name || "",
        phone: metadata.phone || "",
        ...metadata,
      };

      // Supabase signup API
      const { data, error } = await this.supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          data: userMetadata,
          emailRedirectTo: window.location.origin + "/dashboard.html",
        },
      });

      if (error) return this.handleAuthError(error);

      if (data.session === null && data.user) {
        // Email verification required
        return {
          success: true,
          needsVerification: true,
          message: AUTH_ERRORS.SIGNUP_SUCCESS,
          user: this.formatUser(data.user),
        };
      }

      // Success - user is automatically logged in
      this.currentUser = this.formatUser(data.user);
      this.updateUIForLoggedInUser();

      return {
        success: true,
        message: AUTH_ERRORS.SIGNUP_SUCCESS,
        user: this.currentUser,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };
    }
  }

  // ========================================
  // EMAIL + PASSWORD LOGIN
  // ========================================

  async loginWithEmail(email, password) {
    try {
      if (!AuthValidator.isValidEmail(email))
        return { success: false, error: AUTH_ERRORS.INVALID_EMAIL };
      if (!password)
        return { success: false, error: AUTH_ERRORS.FIELD_REQUIRED };

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) return this.handleAuthError(error);
      if (!data.session || !data.user)
        return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };

      this.currentUser = this.formatUser(data.user);
      this.sessionManager.storeSession(data.session);
      this.updateUIForLoggedInUser();

      return {
        success: true,
        message: AUTH_ERRORS.LOGIN_SUCCESS,
        user: this.currentUser,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };
    }
  }

  // ========================================
  // PHONE + OTP LOGIN / SIGNUP
  // ========================================

  async sendPhoneOTP(phone) {
    try {
      if (!AuthValidator.isValidPhone(phone))
        return { success: false, error: AUTH_ERRORS.INVALID_PHONE };

      const formattedPhone = phone.startsWith("+") ? phone : "+" + phone;

      // Send OTP using Supabase
      const { data, error } = await this.supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { shouldCreateUser: true }, // Create user if not exist
      });

      if (error) return this.handleAuthError(error);

      // Save OTP session for verification
      sessionStorage.setItem("otp_phone", formattedPhone);
      sessionStorage.setItem("otp_created_at", Date.now().toString());

      return {
        success: true,
        message: AUTH_ERRORS.OTP_SENT,
        needsVerification: true,
      };
    } catch (error) {
      console.error("Send OTP error:", error);
      return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };
    }
  }

  async verifyPhoneOTP(otp) {
    try {
      const phone = sessionStorage.getItem("otp_phone");
      const createdAt = sessionStorage.getItem("otp_created_at");

      if (!phone)
        return {
          success: false,
          error: "No phone number found. Restart login.",
        };

      const otpAge = Date.now() - parseInt(createdAt || "0");
      if (otpAge > 600000) {
        // 10 minutes
        sessionStorage.removeItem("otp_phone");
        sessionStorage.removeItem("otp_created_at");
        return { success: false, error: AUTH_ERRORS.EXPIRED_OTP };
      }

      const { data, error } = await this.supabase.auth.verifyOtp({
        phone,
        token: otp.trim(),
        type: "sms",
      });

      if (error) return this.handleAuthError(error);

      sessionStorage.removeItem("otp_phone");
      sessionStorage.removeItem("otp_created_at");

      this.currentUser = this.formatUser(data.user);
      this.sessionManager.storeSession(data.session);
      this.updateUIForLoggedInUser();

      return {
        success: true,
        message: AUTH_ERRORS.LOGIN_SUCCESS,
        user: this.currentUser,
      };
    } catch (error) {
      console.error("Verify OTP error:", error);
      return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };
    }
  }

  // ========================================
  // LOGOUT
  // ========================================

  async logout() {
    try {
      await this.supabase.auth.signOut(); // Log out from backend
      this.sessionManager.clearSession(); // Clear frontend session
      this.currentUser = null;

      // Clear OTP/signup session storage
      sessionStorage.removeItem("otp_phone");
      sessionStorage.removeItem("otp_created_at");
      sessionStorage.removeItem("signup_phone");
      sessionStorage.removeItem("signup_name");
      sessionStorage.removeItem("signup_email");

      this.updateUIForLoggedOutUser();

      return { success: true, message: AUTH_ERRORS.LOGOUT_SUCCESS };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };
    }
  }

  // ========================================
  // PASSWORD RESET
  // ========================================

  async resetPassword(email) {
    try {
      if (!AuthValidator.isValidEmail(email))
        return { success: false, error: AUTH_ERRORS.INVALID_EMAIL };

      const { data, error } = await this.supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: window.location.origin + "/reset-password.html" }
      );

      if (error) return this.handleAuthError(error);

      return { success: true, message: AUTH_ERRORS.PASSWORD_RESET_SENT };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: AUTH_ERRORS.UNKNOWN_ERROR };
    }
  }

  // ========================================
  // ERROR HANDLER
  // ========================================

  handleAuthError(error) {
    console.error("Auth error:", error);

    // Map backend errors to user-friendly messages
    if (error.message.includes("Invalid credentials"))
      return { success: false, error: AUTH_ERRORS.INVALID_PASSWORD };
    if (error.message.includes("Email not confirmed"))
      return {
        success: false,
        error: "Verify your email before login",
        needsEmailConfirmation: true,
      };
    if (error.code === "user_already_exists")
      return { success: false, error: AUTH_ERRORS.EMAIL_ALREADY_REGISTERED };
    if (error.code === "phone_number_taken")
      return { success: false, error: AUTH_ERRORS.PHONE_ALREADY_REGISTERED };
    return {
      success: false,
      error: error.message || AUTH_ERRORS.UNKNOWN_ERROR,
    };
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Format user object for consistent access
   */
  formatUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || "",
      phone: user.phone || user.user_metadata?.phone || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar: user.user_metadata?.avatar_url || "",
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at || user.updated_at,
      emailConfirmed: user.email_confirmed_at || false,
      phoneConfirmed: user.phone_confirmed_at || false,
      raw: user,
    };
  }

  /**
   * Update UI elements for logged-in user
   */
  updateUIForLoggedInUser() {
    document
      .querySelectorAll(".auth-logged-in")
      .forEach((el) => (el.style.display = el.dataset.display || ""));
    document
      .querySelectorAll(".auth-logged-out")
      .forEach((el) => (el.style.display = "none"));
    document.querySelectorAll(".user-name-display").forEach((el) => {
      if (this.currentUser?.name) {
        el.textContent = this.currentUser.name;
        el.style.display = "";
      }
    });
    window.dispatchEvent(
      new CustomEvent("auth:login", { detail: { user: this.currentUser } })
    );
  }

  /**
   * Update UI elements for logged-out user
   */
  updateUIForLoggedOutUser() {
    document
      .querySelectorAll(".auth-logged-in")
      .forEach((el) => (el.style.display = "none"));
    document
      .querySelectorAll(".auth-logged-out")
      .forEach((el) => (el.style.display = el.dataset.display || ""));
    document.querySelectorAll(".user-name-display").forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

const hotelAuth = new HotelAuth();

// ============================================
// AUTO-INITIALIZE
// ============================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () =>
    setTimeout(() => hotelAuth.init(), 100)
  );
} else {
  setTimeout(() => hotelAuth.init(), 100);
}

// ============================================
// EXPORT
// ============================================

window.HotelAuth = hotelAuth;
window.AUTH_ERRORS = AUTH_ERRORS;
window.AuthValidator = AuthValidator;
