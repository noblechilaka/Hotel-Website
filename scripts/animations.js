/**
 * LUXURY HOTEL - GSAP Animations
 * Scroll-based animations and interactions
 */

// ============================================
// GSAP CONFIGURATION
// ============================================

gsap.config({
  autoSleep: 60,
  nullTargetWarn: false,
});

// ============================================
// SCROLL TRIGGER SETUP
// ============================================

if (typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================
// HERO ANIMATIONS - MASKED REVEAL WITH CUSTOM EASING
// ============================================

/**
 * Premium cubic bezier for sophisticated, heavy feel
 * Values: 0.16, 1, 0.3, 1
 */
const premiumEase = "cubic-bezier(0.16, 1, 0.3, 1)";

function initHeroAnimation() {
  const hero = DOM.select(".hero");

  if (!hero) return;

  // Get all animated elements
  const headlineTexts = DOM.selectAll(
    ".hero-headline-text[data-animate='heading']"
  );
  const subtext = DOM.select(".hero-caption p[data-animate='subtext']");
  const bookingBar = DOM.select(".hero-booking-bar[data-animate='booking']");

  // Create main timeline
  const tl = gsap.timeline({
    defaults: { ease: premiumEase },
  });

  // 1. Animate headline words with masked reveal
  if (headlineTexts.length > 0) {
    // Each word slides up from hidden position
    tl.to(
      headlineTexts,
      {
        y: "0%",
        duration: 1.4,
        stagger: 0.12, // Subtle stagger between words
        ease: premiumEase,
      },
      0
    ); // Start at time 0
  }

  // 2. Subtext fade-in (starts after heading begins)
  if (subtext) {
    tl.to(
      subtext,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: premiumEase,
      },
      0.8
    ); // Start at 0.8s (when heading is animating)
  }

  // 3. Booking bar with vertical drift
  if (bookingBar) {
    // Use fromTo to explicitly set initial state including x position
    gsap.fromTo(
      bookingBar,
      {
        opacity: 0,
        y: 30,
        x: "-50%", // Preserve the centered X position from CSS
      },
      {
        opacity: 1,
        y: 0,
        x: "-50%",
        duration: 1.2,
        ease: premiumEase,
      },
      1.0 // Start at 1.0s (after subtext)
    );
  }

  // 4. Parallax effect on scroll
  gsap.to(".hero-bg", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  // 5. Background scale subtle effect
  gsap.fromTo(
    ".hero-bg",
    { scale: 1.05 },
    {
      scale: 1,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    }
  );
}

// ============================================
// TEXT REVEAL ANIMATIONS
// ============================================

function initTextReveals() {
  // Split text into lines/words
  const textElements = DOM.selectAll(".text-reveal");

  textElements.forEach((el) => {
    const html = el.innerHTML;
    el.innerHTML = `<span>${html}</span>`;
  });

  // Animate on scroll
  const reveals = DOM.selectAll(".text-reveal, .reveal-text");

  reveals.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => {
        const spans = el.querySelectorAll("span");
        if (spans.length) {
          gsap.to(spans, {
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: premiumEase,
          });
        } else {
          el.classList.add("active");
        }
      },
    });
  });
}

// ============================================
// IMAGE ANIMATIONS
// ============================================

function initImageAnimations() {
  // Scale reveal animations
  const scaleReveals = DOM.selectAll(".scale-reveal");

  scaleReveals.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      onEnter: () => el.classList.add("active"),
    });
  });

  // Parallax images
  const parallaxImages = DOM.selectAll(".parallax-img, .img-parallax");

  parallaxImages.forEach((img) => {
    const speed = img.dataset.parallaxSpeed || 0.2;

    gsap.to(img, {
      yPercent: 20 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: img.parentElement,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // Image reveal from bottom
  const bottomReveals = DOM.selectAll(".img-reveal-bottom");

  bottomReveals.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      onEnter: () => el.classList.add("active"),
    });
  });
}

// ============================================
// SECTION ANIMATIONS
// ============================================

function initSectionAnimations() {
  // Fade in up
  const fadeUps = DOM.selectAll(".fade-up, .fadeInUp");

  fadeUps.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => el.classList.add("active"),
    });
  });

  // Slide in from left
  const slideLefts = DOM.selectAll(".slide-in-left");

  slideLefts.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => el.classList.add("active"),
    });
  });

  // Slide in from right
  const slideRights = DOM.selectAll(".slide-in-right");

  slideRights.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => el.classList.add("active"),
    });
  });
}

// ============================================
// ROOM CARDS ANIMATION
// ============================================

function initRoomCardsAnimation() {
  const cards = DOM.selectAll(".room-card");

  if (cards.length === 0) return;

  // Stagger animation on scroll
  ScrollTrigger.create({
    trigger: ".rooms-scroll-container, .rooms-grid",
    start: "top 80%",
    onEnter: () => {
      gsap.fromTo(
        cards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        }
      );
    },
  });

  // Horizontal scroll trigger
  const scrollContainer = DOM.select(".rooms-scroll-container");

  if (scrollContainer) {
    gsap.to(scrollContainer, {
      x: () => -(scrollContainer.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: ".featured-rooms",
        start: "top top",
        end: () => "+=" + scrollContainer.scrollWidth,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
  }
}

// ============================================
// MASONRY/GRID ANIMATIONS
// ============================================

function initMasonryAnimation() {
  const items = DOM.selectAll(".experience-item, .masonry-item");

  if (items.length === 0) return;

  ScrollTrigger.create({
    trigger: ".masonry-grid, .experiences-grid",
    start: "top 80%",
    onEnter: () => {
      gsap.fromTo(
        items,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    },
  });
}

// ============================================
// NAVIGATION ANIMATIONS
// ============================================

function initNavAnimations() {
  const header = DOM.select(".header");

  if (!header) return;

  // Hide/show header on scroll
  let lastScrollY = window.scrollY;
  let ticking = false;

  function updateHeader() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  });
}

// ============================================
// BUTTON ANIMATIONS
// ============================================

function initButtonAnimations() {
  // Magnetic effect for buttons
  const magneticButtons = DOM.selectAll(".btn-magnetic");

  magneticButtons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    });
  });

  // Arrow slide effect
  const arrowBtns = DOM.selectAll(".btn-arrow");

  arrowBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn.querySelector("svg"), {
        x: 5,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn.querySelector("svg"), {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
}

// ============================================
// IMAGE HOVER EFFECTS
// ============================================

function initHoverEffects() {
  const hoverCards = DOM.selectAll(".hover-scale, .hover-zoom");

  hoverCards.forEach((card) => {
    const img = card.querySelector("img");

    if (img) {
      card.addEventListener("mouseenter", () => {
        gsap.to(img, {
          scale: 1.08,
          duration: 1.2,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(img, {
          scale: 1,
          duration: 1,
          ease: "power2.out",
        });
      });
    }
  });

  // Overlay reveal
  const overlayCards = DOM.selectAll(".overlay-card");

  overlayCards.forEach((card) => {
    const overlay = card.querySelector(".overlay");

    if (overlay) {
      card.addEventListener("mouseenter", () => {
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      });
    }
  });
}

// ============================================
// SMOOTH SCROLL SECTIONS (LENIS INTEGRATED)
// ============================================

function initSmoothScrollSections() {
  const smoothSections = DOM.selectAll(".smooth-scroll");

  smoothSections.forEach((section) => {
    const container = section.querySelector(".smooth-container");

    if (container) {
      // Horizontal scroll section
      const items = container.querySelectorAll(".scroll-item");

      if (items.length > 0) {
        const totalWidth = items.length * items[0].offsetWidth;

        gsap.to(container, {
          x: () => -(totalWidth - section.offsetWidth),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + totalWidth,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            // Lenis-compatible: update on every scroll frame
            onUpdate: (self) => {
              if (window.lenis) {
                window.lenis.update();
              }
            },
          },
        });
      }
    }
  });
}

// ============================================
// LENIS SMOOTH SCROLL SETUP
// ============================================

function initLenisSmoothScroll() {
  // Check if Lenis is available
  if (typeof Lenis === "undefined") {
    console.warn("Lenis library not loaded, using native smooth scroll");
    return;
  }

  // Initialize Lenis with optimized settings for hotel website
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: "vertical",
    gestureDirection: "vertical",
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    lerp: 0.1,
  });

  // Integrate Lenis with GSAP ScrollTrigger
  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Handle anchor link clicks for smooth scrolling to sections
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        lenis.scrollTo(target, {
          offset: -80, // Account for fixed header
          duration: 1.2,
        });
      }
    });
  });

  // Expose lenis to global scope
  window.lenis = lenis;

  console.log("Lenis smooth scrolling initialized");
}

// ============================================
// COUNTER ANIMATION
// ============================================

function initCounterAnimation() {
  const counters = DOM.selectAll(".stat-number[data-count]");

  counters.forEach((counter) => {
    const target = parseInt(counter.dataset.count);
    const duration = 2;

    ScrollTrigger.create({
      trigger: counter,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.fromTo(
          counter,
          { innerText: 0 },
          {
            innerText: target,
            duration: duration,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function () {
              counter.innerText = Math.ceil(this.targets()[0].innerText);
            },
          }
        );
      },
    });
  });
}

// ============================================
// GALLERY ANIMATIONS
// ============================================

function initGalleryAnimations() {
  const galleryItems = DOM.selectAll(".gallery-item");

  if (galleryItems.length === 0) return;

  ScrollTrigger.create({
    trigger: ".gallery-grid",
    start: "top 80%",
    onEnter: () => {
      gsap.fromTo(
        galleryItems,
        { scale: 0.8, opacity: 0, rotation: 5 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
        }
      );
    },
  });
}

// ============================================
// FORM ANIMATIONS
// ============================================

function initFormAnimations() {
  // Floating labels
  const floatLabels = DOM.selectAll(".floating-label input");

  floatLabels.forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        input.parentElement.classList.remove("focused");
      }
    });
  });

  // Input focus effect
  const inputWrappers = DOM.selectAll(".input-wrapper");

  inputWrappers.forEach((wrapper) => {
    const input = wrapper.querySelector("input, textarea, select");

    if (input) {
      input.addEventListener("focus", () => {
        gsap.to(wrapper, {
          scale: 1.02,
          duration: 0.2,
          ease: "power2.out",
        });
      });

      input.addEventListener("blur", () => {
        gsap.to(wrapper, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      });
    }
  });
}

// ============================================
// PROGRESS BAR ANIMATIONS
// ============================================

function initProgressAnimations() {
  const progressBars = DOM.selectAll(".progress-fill");

  progressBars.forEach((bar) => {
    const width = bar.dataset.width || "0%";

    ScrollTrigger.create({
      trigger: bar,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(bar, {
          width: width,
          duration: 1.5,
          ease: "power3.out",
        });
      },
    });
  });
}

// ============================================
// LOADING ANIMATION
// ============================================

function initLoadingAnimation() {
  const loader = DOM.select(".loader");

  if (!loader) return;

  const tl = gsap.timeline({
    onComplete: () => {
      loader.classList.add("hidden");
      document.body.style.overflow = "";
    },
  });

  tl.to(".loader-bar::after", {
    width: "100%",
    duration: 1.5,
    ease: "power2.inOut",
  })
    .to(
      ".loader-logo",
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
      },
      "-=0.5"
    )
    .to(".loader", {
      opacity: 0,
      duration: 0.5,
    });
}

// ============================================
// PAGE TRANSITION
// ============================================

function initPageTransition() {
  const links = DOM.selectAll('a[href^="/"], a[href$=".html"]');

  links.forEach((link) => {
    // Skip anchors and external links
    if (
      link.getAttribute("href").startsWith("#") ||
      link.getAttribute("href").startsWith("http") ||
      link.getAttribute("href").startsWith("mailto:") ||
      link.getAttribute("href").startsWith("tel:")
    ) {
      return;
    }

    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");

      // Skip if modifier keys pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      e.preventDefault();

      // Create transition overlay
      const overlay = DOM.create("div", {
        className: "page-transition-overlay",
        style: `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: var(--bg-dark);
                    z-index: 9999;
                    transform: scaleY(0);
                    transform-origin: bottom;
                `,
      });

      document.body.appendChild(overlay);

      const tl = gsap.timeline({
        onComplete: () => {
          window.location.href = href;
        },
      });

      tl.to(overlay, {
        scaleY: 1,
        duration: 0.4,
        ease: "power2.in",
      });
    });
  });
}

// ============================================
// CURSOR EFFECTS
// ============================================

function initCursorEffects() {
  // Check if device supports hover
  if (window.matchMedia("(hover: none)").matches) return;

  const cursorDot = DOM.select(".cursor-dot");
  const cursorFollower = DOM.select(".cursor-follower");

  if (!cursorDot || !cursorFollower) return;

  // Create cursor elements if not exist
  if (!cursorDot) {
    const dot = DOM.create("div", { className: "cursor-dot" });
    document.body.appendChild(dot);
  }

  if (!cursorFollower) {
    const follower = DOM.create("div", { className: "cursor-follower" });
    document.body.appendChild(follower);
  }

  const dot = DOM.select(".cursor-dot");
  const follower = DOM.select(".cursor-follower");

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  // Animate follower with delay
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.1;
    followerY += (mouseY - followerY) * 0.1;

    follower.style.left = followerX + "px";
    follower.style.top = followerY + "px";

    requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Add hover effect on interactive elements
  const interactiveElements = DOM.selectAll(
    "a, button, .room-card, .experience-item"
  );

  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      follower.classList.add("hover");
    });

    el.addEventListener("mouseleave", () => {
      follower.classList.remove("hover");
    });
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    follower.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    follower.style.opacity = "1";
  });
}

// ============================================
// INITIALIZE ALL ANIMATIONS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initHeroAnimation();
    initTextReveals();
    initImageAnimations();
    initSectionAnimations();
    initRoomCardsAnimation();
    initMasonryAnimation();
    initNavAnimations();
    initButtonAnimations();
    initHoverEffects();
    initSmoothScrollSections();
    initCounterAnimation();
    initGalleryAnimations();
    initFormAnimations();
    initProgressAnimations();
    initLoadingAnimation();
    initPageTransition();
    initCursorEffects();

    // Initialize Lenis smooth scrolling (if not already done in HTML)
    if (typeof Lenis !== "undefined" && !window.lenis) {
      initLenisSmoothScroll();
    }
  }, 50);
});

// ============================================
// GSAP SCROLLTIGGER REFRESH ON RESIZE
// ============================================

let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
});

// ============================================
// EXPORT
// ============================================

window.Animations = {
  initHeroAnimation,
  initTextReveals,
  initImageAnimations,
  initSectionAnimations,
  initRoomCardsAnimation,
  initMasonryAnimation,
};
