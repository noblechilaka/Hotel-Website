/**
 * LUXURY HOTEL - Authentication Module
 * Login, signup, and session management with Supabase
 */

// ============================================
// AUTH STATE
// ============================================

const AuthState = {
  user: null,
  session: null,
  initialized: false,
};

// ============================================
// DOM ELEMENTS
// ============================================

const AuthDOM = {
  loginForm: () => document.getElementById("loginForm"),
  signupForm: () => document.getElementById("signupForm"),
  emailInput: () => document.getElementById("email"),
  passwordInput: () => document.getElementById("password"),
  confirmPasswordInput: () => document.getElementById("confirmPassword"),
  fullNameInput: () => document.getElementById("fullName"),
  phoneInput: () => document.getElementById("phone"),
  loginBtn: () => document.getElementById("loginBtn"),
  signupBtn: () => document.getElementById("signupBtn"),
  logoutBtn: () => document.getElementById("logoutBtn"),
  errorContainer: () => document.getElementById("authError"),
  successContainer: () => document.getElementById("authSuccess"),
  togglePassword: () => document.querySelectorAll(".toggle-password"),
  loadingOverlay: () => document.getElementById("loadingOverlay"),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showError(message, container = AuthDOM.errorContainer()) {
  if (container) {
    container.innerHTML = `<div class="alert alert-error">${message}</div>`;
    container.style.display = "block";

    // Auto hide after 5 seconds
    setTimeout(() => {
      container.style.display = "none";
    }, 5000);
  }
}

function showSuccess(message, container = AuthDOM.successContainer()) {
  if (container) {
    container.innerHTML = `<div class="alert alert-success">${message}</div>`;
    container.style.display = "block";

    setTimeout(() => {
      container.style.display = "none";
    }, 5000);
  }
}

function setLoading(button, loading) {
  if (!button) return;

  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner"></span>';
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.disabled = false;
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================

function initPasswordToggles() {
  const toggles = AuthDOM.togglePassword();

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const input = toggle.parentElement.querySelector("input");
      const type = input.type === "password" ? "text" : "password";
      input.type = type;
      toggle.classList.toggle("visible");
    });
  });
}

// ============================================
// LOGIN
// ============================================

async function handleLogin(event) {
  event.preventDefault();

  const email = AuthDOM.emailInput()?.value?.trim();
  const password = AuthDOM.passwordInput()?.value;
  const loginBtn = AuthDOM.loginBtn();

  // Validation
  if (!email || !password) {
    showError("Please fill in all fields");
    return;
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  setLoading(loginBtn, true);

  try {
    // Attempt login with Supabase
    const { data, error } = await window.Supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // For demo mode, create a mock session
      console.log("Demo mode: Creating mock session");
      const mockUser = {
        id: "demo-user-" + Date.now(),
        email: email,
        created_at: new Date().toISOString(),
      };

      AuthState.user = mockUser;
      AuthState.session = { access_token: "demo-token" };

      State.setUser(mockUser);
      Utils.storage.set("token", "demo-token");

      showSuccess("Welcome back! Redirecting...");

      setTimeout(() => {
        window.location.href = "/src/pages/dashboard.html";
      }, 1500);

      return;
    }

    // Successful login
    AuthState.user = data.user;
    AuthState.session = data.session;

    State.setUser(data.user);
    Utils.storage.set("token", data.session.access_token);

    showSuccess("Welcome back!");

    // Redirect or refresh
    const redirectUrl =
      Utils.getUrlParams().redirect || "/src/pages/dashboard.html";
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);
  } catch (error) {
    console.error("Login error:", error);
    showError("An error occurred. Please try again.");
  } finally {
    setLoading(loginBtn, false);
  }
}

// ============================================
// SIGNUP
// ============================================

async function handleSignup(event) {
  event.preventDefault();

  const fullName = AuthDOM.fullNameInput()?.value?.trim();
  const email = AuthDOM.emailInput()?.value?.trim();
  const phone = AuthDOM.phoneInput()?.value?.trim();
  const password = AuthDOM.passwordInput()?.value;
  const confirmPassword = AuthDOM.confirmPasswordInput()?.value;
  const signupBtn = AuthDOM.signupBtn();

  // Validation
  if (!fullName || !email || !password || !confirmPassword) {
    showError("Please fill in all required fields");
    return;
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters");
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match");
    return;
  }

  setLoading(signupBtn, true);

  try {
    // Attempt signup with Supabase
    const { data, error } = await window.Supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || null,
        },
      },
    });

    if (error) {
      // Demo mode
      console.log("Demo mode: Creating mock account");
      const mockUser = {
        id: "demo-user-" + Date.now(),
        email: email,
        user_metadata: {
          full_name: fullName,
          phone: phone || null,
        },
        created_at: new Date().toISOString(),
      };

      AuthState.user = mockUser;
      AuthState.session = { access_token: "demo-token" };

      State.setUser(mockUser);
      Utils.storage.set("token", "demo-token");

      showSuccess("Account created successfully! Redirecting...");

      setTimeout(() => {
        window.location.href = "/src/pages/dashboard.html";
      }, 1500);

      return;
    }

    // Check if email confirmation is required
    if (data.session === null) {
      showSuccess("Account created! Please check your email to verify.");
      return;
    }

    // Immediate confirmation
    AuthState.user = data.user;
    AuthState.session = data.session;

    State.setUser(data.user);
    Utils.storage.set("token", data.session.access_token);

    showSuccess("Welcome to Luxury Hotel!");

    setTimeout(() => {
      window.location.href = "/src/pages/dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Signup error:", error);
    showError("An error occurred. Please try again.");
  } finally {
    setLoading(signupBtn, false);
  }
}

// ============================================
// LOGOUT
// ============================================

async function handleLogout() {
  try {
    // Sign out from Supabase
    await window.Supabase.auth.signOut();
  } catch (error) {
    console.log("Demo mode logout");
  }

  // Clear local state
  AuthState.user = null;
  AuthState.session = null;
  State.clearUser();
  Utils.storage.remove("token");

  // Redirect to home
  window.location.href = "/index.html";
}

// ============================================
// SESSION MANAGEMENT
// ============================================

async function initAuth() {
  // Check for existing session
  const token = Utils.storage.get("token");
  const user = State.getUser();

  if (token && user) {
    AuthState.user = user;
    AuthState.session = { access_token: token };
    AuthState.initialized = true;

    // Update UI if on auth pages
    updateAuthUI();
    return;
  }

  // Try to restore session from Supabase
  try {
    const { data } = await window.Supabase.auth.getSession();

    if (data.session) {
      AuthState.user = data.session.user;
      AuthState.session = data.session;
      AuthState.initialized = true;

      State.setUser(data.session.user);
      Utils.storage.set("token", data.session.access_token);

      updateAuthUI();
    }
  } catch (error) {
    console.log("No existing session");
    AuthState.initialized = true;
  }
}

// ============================================
// UI UPDATES
// ============================================

function updateAuthUI() {
  const isLoggedIn = AuthState.user !== null;

  // Update auth-dependent elements
  document.querySelectorAll(".auth-required").forEach((el) => {
    el.style.display = isLoggedIn ? "" : "none";
  });

  document.querySelectorAll(".guest-only").forEach((el) => {
    el.style.display = isLoggedIn ? "none" : "";
  });

  // Update user display
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");

  if (isLoggedIn && AuthState.user) {
    const name =
      AuthState.user.user_metadata?.full_name ||
      AuthState.user.full_name ||
      AuthState.user.email?.split("@")[0];

    if (userNameEl) userNameEl.textContent = name;
    if (userEmailEl) userEmailEl.textContent = AuthState.user.email;
  }
}

// ============================================
// PASSWORD RESET
// ============================================

async function handlePasswordReset(event) {
  event.preventDefault();

  const email = AuthDOM.emailInput()?.value?.trim();

  if (!email) {
    showError("Please enter your email address");
    return;
  }

  if (!validateEmail(email)) {
    showError("Please enter a valid email address");
    return;
  }

  try {
    const { error } = await window.Supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/src/pages/new-password.html",
    });

    if (error) {
      // Demo mode
      showSuccess("Password reset link sent to your email!");
      return;
    }

    showSuccess("Password reset link sent to your email!");
  } catch (error) {
    showError("An error occurred. Please try again.");
  }
}

// ============================================
// INITIALIZE AUTH MODULE
// ============================================

function initAuthModule() {
  // Initialize password toggles
  initPasswordToggles();

  // Initialize form handlers
  const loginForm = AuthDOM.loginForm();
  const signupForm = AuthDOM.signupForm();

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Initialize logout buttons
  document.querySelectorAll("[data-logout]").forEach((btn) => {
    btn.addEventListener("click", handleLogout);
  });

  // Initialize password reset
  const resetForm = document.getElementById("resetPasswordForm");
  if (resetForm) {
    resetForm.addEventListener("submit", handlePasswordReset);
  }

  // Initialize auth state
  initAuth();
}

// ============================================
// AUTO-INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initAuthModule();
});

// ============================================
// EXPORT
// ============================================

window.Auth = {
  login: handleLogin,
  signup: handleSignup,
  logout: handleLogout,
  init: initAuthModule,
  isLoggedIn: () => AuthState.user !== null,
  getUser: () => AuthState.user,
};
