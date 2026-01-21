/**
 * LUXURY HOTEL - Main JavaScript
 * Core functionality and utilities
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Supabase Configuration - REPLACE WITH YOUR CREDENTIALS
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_KEY: "YOUR_SUPABASE_ANON_KEY",

  // Paystack Configuration - REPLACE WITH YOUR CREDENTIALS
  PAYSTACK_PUBLIC_KEY: "YOUR_PAYSTACK_PUBLIC_KEY",

  // Animation defaults
  ANIMATION_DURATION: 0.8,
  SCROLL_THRESHOLD: 0.1,

  // API Endpoints
  API: {
    CREATE_BOOKING: "/api/create-booking",
    INIT_PAYSTACK: "/api/init-paystack",
    VERIFY_PAYMENT: "/api/verify-payment",
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
  // Debounce function
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Get element's position relative to viewport
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };
  },

  // Check if element is in viewport
  isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const viewHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const viewWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.bottom >= 0 - rect.height * threshold &&
      rect.right >= 0 - rect.width * threshold &&
      rect.top <= viewHeight + rect.height * threshold &&
      rect.left <= viewWidth + rect.width * threshold
    );
  },

  // Format currency
  formatCurrency(amount, currency = "NGN") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format date
  formatDate(date, format = "long") {
    const options =
      format === "short"
        ? { day: "numeric", month: "short" }
        : { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString("en-NG", options);
  },

  // Calculate nights between two dates
  calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Generate unique ID
  generateId() {
    return "xxxx-xxxx-xxxx".replace(/[x]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  },

  // Parse URL parameters
  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Set URL parameters
  setUrlParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    window.history.pushState({}, "", url);
  },

  // Validate email
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  // Validate phone (Nigerian format)
  isValidPhone(phone) {
    const regex = /^\+?234[789]\d{9}$|^0[789]\d{9}$/;
    return regex.test(phone);
  },

  // Local storage helpers
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      localStorage.removeItem(key);
    },
  },
};

// ============================================
// DOM UTILITIES
// ============================================

const DOM = {
  // Select elements
  select(selector, parent = document) {
    return parent.querySelector(selector);
  },

  selectAll(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  },

  // Create element with attributes
  create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "dataset") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith("on")) {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });

    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    return element;
  },

  // Add class with animation frame
  addClass(element, className) {
    requestAnimationFrame(() => {
      element.classList.add(className);
    });
  },

  // Remove class with animation frame
  removeClass(element, className) {
    requestAnimationFrame(() => {
      element.classList.remove(className);
    });
  },

  // Toggle class
  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  // Smooth scroll to element
  scrollTo(element, offset = 0) {
    const top =
      element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  },

  // Fade out element
  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = "0";
    setTimeout(() => {
      element.style.display = "none";
    }, duration);
  },

  // Fade in element
  fadeIn(element, display = "block", duration = 300) {
    element.style.opacity = "0";
    element.style.display = display;
    element.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => {
      element.style.opacity = "1";
    });
  },
};

// ============================================
// ERROR HANDLING
// ============================================

const ErrorHandler = {
  show(message, type = "error", container = document.body) {
    const alert = DOM.create("div", {
      className: `alert alert-${type}`,
      innerHTML: message,
    });

    container.insertBefore(alert, container.firstChild);

    setTimeout(() => {
      DOM.fadeOut(alert);
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  },

  handle(error, context = "") {
    console.error(`Error ${context}:`, error);
    this.show(
      type === "error"
        ? "An error occurred. Please try again."
        : "Something went wrong.",
      "error"
    );
  },
};

// ============================================
// STATE MANAGEMENT
// ============================================

const State = {
  currentUser: null,
  bookingData: {
    room: null,
    checkIn: null,
    checkOut: null,
    guests: 1,
    guestDetails: {},
    paymentMethod: null,
  },

  setUser(user) {
    this.currentUser = user;
    Utils.storage.set("user", user);
  },

  getUser() {
    if (!this.currentUser) {
      this.currentUser = Utils.storage.get("user", null);
    }
    return this.currentUser;
  },

  clearUser() {
    this.currentUser = null;
    Utils.storage.remove("user");
    Utils.storage.remove("token");
  },

  setBooking(data) {
    this.bookingData = { ...this.bookingData, ...data };
    Utils.storage.set("booking", this.bookingData);
  },

  getBooking() {
    const stored = Utils.storage.get("booking", null);
    if (stored) {
      this.bookingData = { ...this.bookingData, ...stored };
    }
    return this.bookingData;
  },

  clearBooking() {
    this.bookingData = {
      room: null,
      checkIn: null,
      checkOut: null,
      guests: 1,
      guestDetails: {},
      paymentMethod: null,
    };
    Utils.storage.remove("booking");
  },

  isLoggedIn() {
    return !!this.getUser();
  },
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize core modules
  initNavigation();
  initScrollEffects();
  initSmoothScroll();

  // Check authentication state
  if (State.isLoggedIn()) {
    updateAuthUI();
  }
});

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
  const header = DOM.select(".header");
  const menuToggle = DOM.select(".menu-toggle");
  const headerNav = DOM.select(".header-nav");
  const body = document.body;

  if (!header) return;

  // Mobile menu toggle
  if (menuToggle && headerNav) {
    menuToggle.addEventListener("click", () => {
      const isActive = headerNav.classList.contains("active");

      // Toggle nav
      headerNav.classList.toggle("active");
      menuToggle.classList.toggle("active");

      // Create overlay if it doesn't exist
      let overlay = document.querySelector(".nav-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "nav-overlay";
        body.appendChild(overlay);
      }

      if (!isActive) {
        overlay.classList.add("active");
        body.style.overflow = "hidden";
      } else {
        overlay.classList.remove("active");
        body.style.overflow = "";
      }

      // Close on overlay click
      overlay.onclick = () => {
        headerNav.classList.remove("active");
        menuToggle.classList.remove("active");
        overlay.classList.remove("active");
        body.style.overflow = "";
      };
    });

    // Close menu on link click
    DOM.selectAll(".nav-link", headerNav).forEach((link) => {
      link.addEventListener("click", () => {
        const overlay = document.querySelector(".nav-overlay");
        headerNav.classList.remove("active");
        menuToggle.classList.remove("active");
        if (overlay) {
          overlay.classList.remove("active");
        }
        body.style.overflow = "";
      });
    });
  }

  // Dashboard mobile navigation
  initDashboardNavigation();

  // Header scroll effect
  let lastScroll = 0;

  window.addEventListener(
    "scroll",
    Utils.throttle(() => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      lastScroll = currentScroll;
    }, 100)
  );
}

// ============================================
// DASHBOARD NAVIGATION
// ============================================

function initDashboardNavigation() {
  // Check if we're on dashboard page
  const dashboardPage = DOM.select(".dashboard-page");
  const dashboardNav = DOM.select(".dashboard-nav");
  const body = document.body;

  if (!dashboardPage || !dashboardNav) return;

  // Create or get the mobile menu toggle button
  let menuToggle = DOM.select(".dashboard-menu-toggle");

  if (!menuToggle) {
    // Create the toggle button
    menuToggle = document.createElement("button");
    menuToggle.className = "dashboard-menu-toggle";
    menuToggle.id = "dashboardMenuToggle";
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 32 32">
        <path d="M 4 7 L 4 9 L 28 9 L 28 7 L 4 7 z M 4 15 L 4 17 L 28 17 L 28 15 L 4 15 z M 4 23 L 4 25 L 28 25 L 28 23 L 4 23 z"></path>
      </svg>
    `;

    // Insert after the header
    const header = DOM.select(".header");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(menuToggle, header.nextSibling);
    }
  }

  // Toggle dashboard nav
  menuToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isActive = dashboardNav.classList.contains("active");

    // Toggle nav
    dashboardNav.classList.toggle("active");
    menuToggle.classList.toggle("active");

    // Create overlay
    let overlay = document.querySelector(".dashboard-nav-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "dashboard-nav-overlay";
      body.appendChild(overlay);
    }

    if (!isActive) {
      overlay.classList.add("active");
      body.style.overflow = "hidden";
    } else {
      overlay.classList.remove("active");
      body.style.overflow = "";
    }
  });

  // Close on overlay click
  const overlay = document.querySelector(".dashboard-nav-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      dashboardNav.classList.remove("active");
      menuToggle.classList.remove("active");
      overlay.classList.remove("active");
      body.style.overflow = "";
    });
  }

  // Handle link clicks - close nav and scroll
  DOM.selectAll(".dashboard-link", dashboardNav).forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();

        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          // Close nav first
          const overlay = document.querySelector(".dashboard-nav-overlay");
          dashboardNav.classList.remove("active");
          menuToggle.classList.remove("active");
          if (overlay) {
            overlay.classList.remove("active");
          }
          body.style.overflow = "";

          // Update active state
          DOM.selectAll(".dashboard-link", dashboardNav).forEach((l) =>
            l.classList.remove("active")
          );
          link.classList.add("active");

          // Smooth scroll to section
          const headerHeight = DOM.select(".header")?.offsetHeight || 80;
          const targetPosition = targetSection.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dashboardNav.classList.contains("active")) {
      const overlay = document.querySelector(".dashboard-nav-overlay");
      dashboardNav.classList.remove("active");
      menuToggle.classList.remove("active");
      if (overlay) {
        overlay.classList.remove("active");
      }
      body.style.overflow = "";
    }
  });

  // Close on window resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768 && dashboardNav.classList.contains("active")) {
      const overlay = document.querySelector(".dashboard-nav-overlay");
      dashboardNav.classList.remove("active");
      menuToggle.classList.remove("active");
      if (overlay) {
        overlay.classList.remove("active");
      }
      body.style.overflow = "";
    }
  });
}

// Navigation Menu Functionality
(function () {
  const menuToggle = document.getElementById("menuToggle");
  const menuOverlay = document.getElementById("menuOverlay");
  const menuClose = document.getElementById("menuClose");
  const menuLinks = document.querySelectorAll(".menu-link");
  const body = document.body;

  // Open menu
  function openMenu() {
    menuOverlay.classList.add("active");
    body.classList.add("menu-open");
    menuOverlay.setAttribute("aria-hidden", "false");

    // Focus trap - focus first menu link
    setTimeout(() => {
      const firstLink = menuLinks[0];
      if (firstLink) firstLink.focus();
    }, 300);
  }

  // Close menu
  function closeMenu() {
    menuOverlay.classList.remove("active");
    body.classList.remove("menu-open");
    menuOverlay.setAttribute("aria-hidden", "true");
  }

  // Toggle menu
  function toggleMenu() {
    if (menuOverlay.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Event listeners
  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (menuClose) {
    menuClose.addEventListener("click", closeMenu);
  }

  // Close on link click
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on overlay click (but not on panel)
  if (menuOverlay) {
    menuOverlay.addEventListener("click", function (e) {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });
  }

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOverlay.classList.contains("active")) {
      closeMenu();
      if (menuToggle) menuToggle.focus();
    }
  });

  // Close on resize to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1200 && menuOverlay.classList.contains("active")) {
      closeMenu();
    }
  });
})();

// ============================================
// SCROLL EFFECTS
// ============================================

function initScrollEffects() {
  // Scroll progress bar
  const progressBar = DOM.select(".scroll-progress");

  if (progressBar) {
    window.addEventListener(
      "scroll",
      Utils.throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
      }, 50)
    );
  }

  // Initialize scroll animations
  initScrollAnimations();
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
  const animatedElements = DOM.selectAll("[data-animate]");

  if (animatedElements.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: CONFIG.SCROLL_THRESHOLD,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const animation = entry.target.dataset.animate;
        entry.target.classList.add("active");

        // Remove from observer after animation
        if (!entry.target.dataset.persist) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => observer.observe(el));
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
  DOM.selectAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const target = DOM.select(targetId);

      if (target) {
        e.preventDefault();
        DOM.scrollTo(target, 100);
      }
    });
  });
}

// ============================================
// AUTH UI UPDATES
// ============================================

function updateAuthUI() {
  const loggedInLinks = DOM.selectAll(".auth-logged-in");
  const loggedOutLinks = DOM.selectAll(".auth-logged-out");

  if (State.isLoggedIn()) {
    loggedInLinks.forEach((el) => (el.style.display = ""));
    loggedOutLinks.forEach((el) => (el.style.display = "none"));
  } else {
    loggedInLinks.forEach((el) => (el.style.display = "none"));
    loggedOutLinks.forEach((el) => (el.style.display = ""));
  }
}

// ============================================
// EXPORT
// ============================================

window.LuxuryHotel = {
  CONFIG,
  Utils,
  DOM,
  State,
  ErrorHandler,
  initScrollAnimations,
  updateAuthUI,
};
