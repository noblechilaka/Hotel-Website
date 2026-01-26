/**
 * HOTEL AUTHENTICATION - COMPLETE REFERENCE
 * Copy-paste ready examples for all authentication features
 *
 * SETUP: Replace SUPABASE_URL and SUPABASE_KEY with your credentials
 */

// ============================================
// CONFIGURATION (Replace these values)
// ============================================

// Get from: https://supabase.com/dashboard/project/{id}/settings/api
const SUPABASE_URL = "https://ljbuttyiqhhmuoqffdeh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYnV0dHlpcWhobXVvcWZmZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODMwMjMsImV4cCI6MjA4NDU1OTAyM30.tcBn92TvDmJgqd9YZNAIwMWf2t2tPpsMX8ObrnN55Z0";

// ============================================
// INITIALIZATION (Include this in your HTML before other auth scripts)
// ============================================

/*
HTML:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
<script src="/scripts/supabase.js"></script>
<script src="/scripts/auth.js"></script>

JavaScript (runs automatically):
- Supabase client is initialized
- Auth state listener is active
- Session is restored from localStorage
*/

// ============================================
// 1. EMAIL + PASSWORD SIGNUP
// ============================================

async function signupWithEmail() {
  const email = "user@example.com";
  const password = "SecurePass123";
  const metadata = {
    fullName: "John Doe",
    phone: "+2348001234567",
  };

  const result = await window.HotelAuth.signUpWithEmail(
    email,
    password,
    metadata
  );

  if (result.success) {
    if (result.needsVerification) {
      console.log("Check email for verification:", result.message);
    } else {
      console.log("Signed up and logged in:", result.user);
    }
  } else {
    console.error("Signup failed:", result.error);
  }
}

// ============================================
// 2. EMAIL + PASSWORD LOGIN
// ============================================

async function loginWithEmail() {
  const email = "user@example.com";
  const password = "SecurePass123";

  const result = await window.HotelAuth.loginWithEmail(email, password);

  if (result.success) {
    console.log("Logged in successfully:", result.user);
    // Redirect to dashboard or home
    window.location.href = "/dashboard.html";
  } else {
    console.error("Login failed:", result.error);

    // Handle specific errors
    if (result.error.includes("Invalid password")) {
      alert("Wrong password - please try again");
    } else if (result.error.includes("Email not confirmed")) {
      alert("Please verify your email address");
    }
  }
}

// ============================================
// 3. PHONE + OTP LOGIN - Send Code
// ============================================

async function sendPhoneOTP() {
  const phone = "+2348001234567";

  const result = await window.HotelAuth.sendPhoneOTP(phone);

  if (result.success) {
    console.log("OTP sent:", result.message);
    // Show OTP input field
    document.getElementById("otpSection").style.display = "block";
  } else {
    console.error("Failed to send OTP:", result.error);

    if (result.error.includes("Invalid phone")) {
      alert("Please enter a valid phone number with country code");
    }
  }
}

// ============================================
// 4. PHONE + OTP LOGIN - Verify Code
// ============================================

async function verifyPhoneOTP() {
  const otp = "123456"; // 6-digit code from SMS

  const result = await window.HotelAuth.verifyPhoneOTP(otp);

  if (result.success) {
    console.log("Logged in with phone:", result.user);
    window.location.href = "/dashboard.html";
  } else {
    console.error("OTP verification failed:", result.error);

    if (result.error.includes("Invalid OTP")) {
      alert("Wrong code - please check and try again");
    } else if (result.error.includes("Expired")) {
      alert("Code expired - request a new one");
    }
  }
}

// ============================================
// 5. RESEND OTP
// ============================================

async function resendOTP() {
  const result = await window.HotelAuth.sendPhoneOTP(); // Phone from sessionStorage

  if (result.success) {
    alert("New code sent!");
  } else {
    alert("Failed to resend: " + result.error);
  }
}

// ============================================
// 6. GET CURRENT USER (Auto-login on page refresh)
// ============================================

async function getCurrentUser() {
  const user = await window.HotelAuth.getCurrentUser();

  if (user) {
    console.log("Current user:", {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    });
    return user;
  } else {
    console.log("No user logged in");
    return null;
  }
}

// ============================================
// 7. CHECK IF LOGGED IN (Session Restore)
// ============================================

async function checkAuthStatus() {
  const isLoggedIn = await window.HotelAuth.isLoggedIn();

  if (isLoggedIn) {
    // User is already logged in - show dashboard content
    console.log("Session restored - user is logged in");
    showDashboard();
  } else {
    // Show login page
    console.log("Not logged in - redirect to login");
    window.location.href = "/login.html";
  }
}

// ============================================
// 8. LOGOUT (Secure Session Destroy)
// ============================================

async function logout() {
  const result = await window.HotelAuth.logout();

  if (result.success) {
    console.log("Logged out successfully");
    // Clear any cached data
    localStorage.removeItem("hotel_auth_session");
    // Redirect to home
    window.location.href = "/index.html";
  } else {
    console.error("Logout failed:", result.error);
  }
}

// ============================================
// 9. PASSWORD RESET
// ============================================

async function resetPassword(email) {
  const result = await window.HotelAuth.resetPassword(email);

  if (result.success) {
    alert("Password reset email sent - check your inbox");
  } else {
    alert("Failed: " + result.error);
  }
}

// ============================================
// 10. LISTEN FOR AUTH STATE CHANGES
// ============================================

// User logged in
window.addEventListener("auth:login", (event) => {
  const user = event.detail.user;
  console.log("User logged in:", user.email);
  // Update UI - show logged-in state
  updateNavigationForLoggedInUser(user);
});

// User logged out
window.addEventListener("auth:logout", () => {
  console.log("User logged out");
  // Update UI - show logged-out state
  updateNavigationForLoggedOutUser();
});

// ============================================
// ERROR HANDLING EXAMPLES
// ============================================

function handleAuthError(result) {
  if (!result.success) {
    const error = result.error;

    switch (true) {
      case error.includes("Invalid password"):
      case error.includes("Invalid credentials"):
        return { message: "Wrong password", userFriendly: true };

      case error.includes("Email not found"):
      case error.includes("No account"):
        return { message: "No account with this email", userFriendly: true };

      case error.includes("Invalid email"):
        return { message: "Please enter a valid email", userFriendly: true };

      case error.includes("OTP expired"):
        return {
          message: "Code expired - request a new one",
          userFriendly: true,
        };

      case error.includes("Invalid OTP"):
        return { message: "Wrong code - try again", userFriendly: true };

      case error.includes("Network"):
        return {
          message: "Check your internet connection",
          userFriendly: true,
        };

      case error.includes("Too many requests"):
        return {
          message: "Too many attempts - wait a few minutes",
          userFriendly: true,
        };

      default:
        return { message: error, userFriendly: false };
    }
  }
  return null;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

function validateBeforeSubmit() {
  // Email validation
  const isValidEmail = window.AuthValidator.isValidEmail("user@example.com"); // true

  // Phone validation (international format)
  const isValidPhone = window.AuthValidator.isValidPhone("+2348001234567"); // true

  // Password strength
  const passwordCheck = window.AuthValidator.isStrongPassword("SecurePass123");
  // { valid: true, hasUppercase: true, hasLowercase: true, hasNumbers: true, ... }

  if (!passwordCheck.valid) {
    console.log("Password requirements:");
    if (!passwordCheck.minLength) console.log("- At least 8 characters");
    if (!passwordCheck.hasUppercase) console.log("- One uppercase letter");
    if (!passwordCheck.hasLowercase) console.log("- One lowercase letter");
    if (!passwordCheck.hasNumbers) console.log("- One number");
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

async function manualSessionCheck() {
  const session = await window.SessionManager.getSession();

  if (session) {
    const expiresAt = new Date(session.expires_at * 1000);
    console.log("Session expires:", expiresAt.toLocaleString());

    // Check if expired
    if (Date.now() > session.expires_at * 1000) {
      console.log("Session expired - refresh or logout");
      // Attempt refresh
      await window.SessionManager.refreshSession();
    }
  }
}

// ============================================
// AUTO-INITIALIZE EXAMPLE
// ============================================

/*
This runs automatically when the page loads (included in auth.js):

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize auth and restore session
  await window.HotelAuth.init();
  
  // Listen for auth changes
  window.addEventListener('auth:login', handleLogin);
  window.addEventListener('auth:logout', handleLogout);
});
*/

function handleLogin(event) {
  const user = event.detail.user;
  // Update UI elements
  document.getElementById("userGreeting").textContent = `Welcome, ${user.name}`;
  document.getElementById("loginButton").style.display = "none";
  document.getElementById("logoutButton").style.display = "block";
}

function handleLogout() {
  // Reset UI elements
  document.getElementById("userGreeting").textContent = "";
  document.getElementById("loginButton").style.display = "block";
  document.getElementById("logoutButton").style.display = "none";
}

// ============================================
// NAVIGATION EXAMPLE
// ============================================

function updateNavigationForLoggedInUser(user) {
  // Find and update nav links
  const joinUsLink = document.querySelector('a[href="/signup.html"]');
  if (joinUsLink) {
    joinUsLink.textContent = "MY ACCOUNT";
    joinUsLink.href = "/dashboard.html";
    joinUsLink.classList.add("auth-logged-in");
  }

  // Show user name
  const userNameEl = document.getElementById("userDisplayName");
  if (userNameEl && user.name) {
    userNameEl.textContent = user.name;
    userNameEl.style.display = "inline";
  }
}

function updateNavigationForLoggedOutUser() {
  const joinUsLink = document.querySelector('a[href="/dashboard.html"]');
  if (joinUsLink) {
    joinUsLink.textContent = "JOIN US";
    joinUsLink.href = "/signup.html";
    joinUsLink.classList.remove("auth-logged-in");
  }

  const userNameEl = document.getElementById("userDisplayName");
  if (userNameEl) {
    userNameEl.style.display = "none";
  }
}

// ============================================
// PROTECTED ROUTE EXAMPLE
// ============================================

async function protectRoute() {
  // Check auth on page load for protected pages
  const isLoggedIn = await window.HotelAuth.isLoggedIn();

  if (!isLoggedIn) {
    // Save current URL for redirect after login
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    // Redirect to login
    window.location.href = "/login.html";
    return false;
  }

  // Get user for personalization
  const user = await window.HotelAuth.getCurrentUser();
  console.log("Protected page accessed by:", user.email);
  return true;
}

// ============================================
// EXPORT (For module usage)
// ============================================

window.HotelAuthExamples = {
  signupWithEmail,
  loginWithEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  resendOTP,
  getCurrentUser,
  checkAuthStatus,
  logout,
  resetPassword,
  handleAuthError,
  validateBeforeSubmit,
  manualSessionCheck,
  protectRoute,
};
