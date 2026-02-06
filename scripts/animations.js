/**
 * LUXURY HOTEL - GSAP Animations
 * Editorial Motion System with Emily Ease
 */

// ============================================
// MOBILE DETECTION HELPER
// ============================================

const isMobile = () => window.innerWidth < 768;

// ============================================
// GSAP CONFIGURATION & EMILY EASE
// ============================================

gsap.config({
  autoSleep: 60,
  nullTargetWarn: false,
});

// Emily Ease: The signature easing function
// Values: 0.16, 1, 0.3, 1 - sophisticated, heavy feel
const emilyEase = "cubic-bezier(0.16, 1, 0.3, 1)";

// Premium cubic bezier for sophisticated motion
const premiumEase = emilyEase;

// ============================================
// SCROLL TRIGGER SETUP
// ============================================

if (typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================
// HERO ANIMATIONS - MASKED REVEAL WITH EMILY EASE
// ============================================

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

  // 4. Parallax effect on scroll (disabled on mobile)
  if (!isMobile()) {
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
}

// ============================================
// TEXT REVEAL ANIMATIONS - ENHANCED MOTION SYSTEM
// ============================================

/**
 * "Soft Lift" - Section Titles
 * Mask text line-by-line, slide up while transitioning blur
 */
function initSoftLiftTitles() {
  const titles = DOM.selectAll(".section-title[data-animate='soft-lift']");

  titles.forEach((title) => {
    // Wrap each line in a mask span
    const text = title.textContent.trim();
    const lines = text.split("\n");

    if (lines.length > 1) {
      title.innerHTML = lines
        .map(
          (line) =>
            `<span class="soft-lift-line" style="display: block; overflow: hidden;"><span class="soft-lift-text" style="display: block; filter: blur(0px); transform: translateY(100%);">${line}</span></span>`
        )
        .join("");
    } else {
      // Single line - still wrap for consistency
      title.innerHTML = `<span class="soft-lift-line" style="display: block; overflow: hidden;"><span class="soft-lift-text" style="display: block; filter: blur(0px); transform: translateY(100%);">${text}</span></span>`;
    }

    // Animate with ScrollTrigger
    ScrollTrigger.create({
      trigger: title,
      start: "top 80%",
      onEnter: () => {
        const lines = title.querySelectorAll(".soft-lift-text");
        gsap.to(lines, {
          y: "0%",
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
        });
      },
    });
  });
}

/**
 * Staggered Line Reveal - Body Text
 * Lines fade in with subtle 5px vertical drift
 */
function initStaggeredBodyText() {
  const paragraphs = DOM.selectAll("p[data-animate='staggered']");

  paragraphs.forEach((p) => {
    // Split into lines based on sentence endings
    const text = p.textContent;
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());

    if (sentences.length > 1) {
      p.innerHTML = sentences
        .map(
          (sentence) =>
            `<span class="body-line" style="display: block; opacity: 0; transform: translateY(5px);">${sentence.trim()}</span>`
        )
        .join(" ");

      // Animate with stagger
      ScrollTrigger.create({
        trigger: p,
        start: "top 85%",
        onEnter: () => {
          const lines = p.querySelectorAll(".body-line");
          gsap.to(lines, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          });
        },
      });
    }
  });
}

/**
 * "Inset Scale" - Image Reveals
 * Container has fixed aspect ratio, image scales from 1.15 to 1.0
 */
function initInsetScaleImages() {
  const containers = DOM.selectAll(".inset-scale-container");

  containers.forEach((container) => {
    const img = container.querySelector("img");
    if (!img) return;

    // Set initial state
    gsap.set(img, {
      scale: 1.15,
      transformOrigin: "center center",
    });

    // Animate on scroll
    ScrollTrigger.create({
      trigger: container,
      start: "top 70%",
      onEnter: () => {
        gsap.to(img, {
          scale: 1,
          duration: 1.5,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(img, {
          scale: 1.15,
          duration: 0.5,
          ease: "power2.out",
        });
      },
    });
  });
}

/**
 * "Blur-to-Focus" - Perspective Quote Reveal
 * Transitions from blur(20px)/opacity 0 to blur(0)/opacity 1 over 2s
 * Uses Emily Ease for sophisticated motion
 */
function initBlurToFocus() {
  const elements = DOM.selectAll(".blur-to-focus");

  elements.forEach((el) => {
    // Set initial blurred state (already set in CSS, but ensuring JS control)
    gsap.set(el, {
      filter: "blur(20px)",
      opacity: 0,
      transformOrigin: "center center",
    });

    // Animate to focus with Emily Ease
    ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      onEnter: () => {
        gsap.to(el, {
          filter: "blur(0px)",
          opacity: 1,
          duration: 2,
          ease: emilyEase,
          className: "blur-to-focus revealed", // Add revealed class
        });
      },
      onLeaveBack: () => {
        gsap.to(el, {
          filter: "blur(20px)",
          opacity: 0,
          duration: 0.8,
          ease: emilyEase,
        });
      },
    });
  });
}

/**
 * "Scale Zoom" - Image Reveal Animation
 * Uses transform: scale(0.8) → scale(1.0) on the image itself
 * Creates a zoom-in reveal effect with depth
 */
function initScaleZoomReveal() {
  const scaleContainers = DOM.selectAll(".scale-zoom-container");

  scaleContainers.forEach((container) => {
    const image = container.querySelector(".discovery-image");
    if (!image) return;

    // Set initial scale state on the image
    gsap.set(image, {
      scale: 0.8,
      transformOrigin: "center center",
    });

    // Animate to full reveal with Emily Ease
    ScrollTrigger.create({
      trigger: container,
      start: "top 80%",
      onEnter: () => {
        gsap.to(image, {
          scale: 1,
          duration: 2,
          ease: emilyEase,
          className: "scale-zoom-container revealed",
        });
      },
      onLeaveBack: () => {
        gsap.to(image, {
          scale: 0.8,
          duration: 1.5,
          ease: emilyEase,
        });
      },
    });
  });
}

/**
 * Discovery Parallax & Reveal Mask
 * Smooth Image Scrub with Parallax Depth
 *
 * Features:
 * - Parallax: image moves at different speed than scroll (creates depth)
 * - Reveal Mask: image scales down as it enters viewport
 * - Creates "walking through" hotel feeling
 */
function initDiscoveryParallax() {
  // Skip parallax on mobile - too heavy for touch devices
  if (isMobile()) return;

  const parallaxContainers = DOM.selectAll(".discovery-parallax-container");

  parallaxContainers.forEach((container) => {
    const image = container.querySelector(".discovery-parallax-image");
    if (!image) return;

    // Initial state: image is zoomed in and masked
    gsap.set(image, {
      scale: 1.15,
      yPercent: 5,
      transformOrigin: "center center",
    });

    // ============================================
    // REVEAL ANIMATION (Scale down as enters viewport)
    // ============================================

    ScrollTrigger.create({
      trigger: container,
      start: "top 85%",
      onEnter: () => {
        container.classList.add("revealed");
        gsap.to(image, {
          scale: 1,
          yPercent: 0,
          duration: 1.8,
          ease: emilyEase,
        });
      },
      onLeaveBack: () => {
        container.classList.remove("revealed");
        gsap.to(image, {
          scale: 1.15,
          yPercent: 5,
          duration: 1,
          ease: emilyEase,
        });
      },
    });

    // ============================================
    // PARALLAX EFFECT (Image moves slower than scroll)
    // ============================================

    // Parallax creates depth - image appears to be "behind" the viewport
    gsap.to(image, {
      yPercent: -10, // Move image upward as scroll progresses
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  console.log("Discovery Parallax Animation initialized");
}

/**
 * "Magnetic Button" - Cursor-Following Button Effect
 * Button subtly moves toward cursor on hover
 */
function initMagneticButtons() {
  // Skip on mobile - no cursor to follow on touch devices
  if (isMobile()) return;

  const magneticBtns = DOM.selectAll(".room-card .btn-text");

  magneticBtns.forEach((btn) => {
    if (!btn) return;

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.4,
        ease: emilyEase,
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    });
  });
}

/**
 * "Staggered Line Reveal" - CTA Text Animation
 * Lines float in one by one as background transitions
 */
function initCTAStaggeredReveal() {
  const ctaSections = DOM.selectAll(".cta-section");

  ctaSections.forEach((section) => {
    const headingLines = section.querySelectorAll(".cta-heading-line");
    const meta = section.querySelector(".cta-meta");
    const btn = section.querySelector(".cta-cta-btn");

    if (headingLines.length === 0) return;

    // Create timeline for staggered reveal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 60%",
        toggleActions: "play none none reverse",
      },
    });

    // Animate heading lines
    tl.to(headingLines, {
      y: "0%",
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: emilyEase,
    });

    // Animate meta text
    if (meta) {
      tl.to(
        meta,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: emilyEase,
        },
        "-=0.5"
      );
    }

    // Animate button
    if (btn) {
      tl.to(
        btn,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: emilyEase,
        },
        "-=0.3"
      );
    }
  });
}

/**
 * Background Color Fade Transition
 * Fades from #1A1A1A to #2d3428 (Forest Green) at CTA section
 */
function initCTABackgroundTransition() {
  const ctaSection = DOM.select(".cta-section");

  if (!ctaSection) return;

  ScrollTrigger.create({
    trigger: ctaSection,
    start: "top 70%",
    end: "top 30%",
    scrub: 1,
    onUpdate: (self) => {
      // Interpolate between charcoal and forest green
      const progress = self.progress;

      // Color interpolation: #1A1A1A → #2d3428
      // RGB: 26,26,26 → 45,52,40
      const r = Math.round(26 + (45 - 26) * progress);
      const g = Math.round(26 + (52 - 26) * progress);
      const b = Math.round(26 + (40 - 26) * progress);

      ctaSection.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    },
  });
}

/**
 * Curated Moments Grid - Editorial Interactions
 * Hover: Image zoom + sensory copy reveal + letter-spacing expansion
 */
function initCuratedMomentsGrid() {
  const grid = DOM.select(".curated-moments-grid");
  if (!grid) return;

  const items = grid.querySelectorAll(".curated-item");

  items.forEach((item) => {
    const img = item.querySelector(".curated-image");
    const tagline = item.querySelector(".curated-tagline");
    const sensory = item.querySelector(".curated-sensory");

    if (!img) return;

    // Set initial states
    gsap.set([tagline, sensory], { willChange: "opacity" });

    // Hover enter
    item.addEventListener("mouseenter", () => {
      // Image slow zoom
      gsap.to(img, {
        scale: 1.05,
        duration: 1.2,
        ease: emilyEase,
      });

      // Tagline fades out
      gsap.to(tagline, {
        opacity: 0,
        letterSpacing: "5px",
        duration: 0.6,
        ease: emilyEase,
      });

      // Sensory copy fades in
      if (sensory) {
        gsap.to(sensory, {
          opacity: 1,
          duration: 0.6,
          ease: emilyEase,
        });
      }
    });

    // Hover leave
    item.addEventListener("mouseleave", () => {
      // Image returns to normal
      gsap.to(img, {
        scale: 1,
        duration: 1,
        ease: emilyEase,
      });

      // Tagline fades back in
      gsap.to(tagline, {
        opacity: 0.7,
        letterSpacing: "2px",
        duration: 0.6,
        ease: emilyEase,
      });

      // Sensory copy fades out
      if (sensory) {
        gsap.to(sensory, {
          opacity: 0,
          duration: 0.6,
          ease: emilyEase,
        });
      }
    });
  });
}

/**
 * Enhanced Section Animations
 */
function initEnhancedSectionAnimations() {
  // Enhanced fade up with more subtle motion
  const fadeUps = DOM.selectAll(".fade-up-enhanced");

  fadeUps.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => {
        gsap.fromTo(
          el,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      },
    });
  });

  // Staggered grid items
  const staggerGrids = DOM.selectAll(".stagger-grid");

  staggerGrids.forEach((grid) => {
    const items = grid.children;

    ScrollTrigger.create({
      trigger: grid,
      start: "top 80%",
      onEnter: () => {
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
          }
        );
      },
    });
  });
}

/**
 * Cinematic Horizontal Scroll Rooms Section
 * "The Cinematic Track" - Fluid Displacement Effect
 *
 * Features:
 * - Horizontal scroll pinning with Emily Ease
 * - Parallax layering within each room card
 * - Letter-spacing reveal animation on titles
 * - Staggered fade-in of sensory specs
 * - Custom cursor transformation
 */
function initCinematicRoomsSection() {
  // Skip on mobile - horizontal scroll doesn't work well on touch devices
  if (isMobile()) return;

  const section = DOM.select(".cinematic-rooms-section");
  if (!section) return;

  const trackWrapper = DOM.select(".rooms-track-wrapper");
  const track = DOM.select(".rooms-track");
  const cards = DOM.selectAll(".room-card-cinematic");
  const cursor = DOM.select(".rooms-cursor");

  if (!trackWrapper || !track || cards.length === 0) return;

  // ============================================
  // EMILY EASE CONFIGURATION
  // ============================================
  const emilyEase = "cubic-bezier(0.16, 1, 0.3, 1)";

  // ============================================
  // HORIZONTAL SCROLL PINNING
  // ============================================

  // Calculate total scroll distance
  const getScrollAmount = () => {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    return trackWidth - viewportWidth;
  };

  // Create horizontal scroll tween
  const trackTween = gsap.to(track, {
    x: () => -getScrollAmount(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + getScrollAmount(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Update progress for parallax calculations
        if (window.cinematicRoomsProgress !== undefined) {
          window.cinematicRoomsProgress = self.progress;
        }
      },
    },
  });

  // Store reference for parallax
  window.cinematicRoomsScroll = trackTween;

  // ============================================
  // INTERNAL PARALLAX FOR EACH CARD
  // ============================================

  cards.forEach((card, index) => {
    const imgContainer = card.querySelector(".room-card-image-container");
    const img = card.querySelector(".room-card-image-cinematic");

    if (!img) return;

    // Set initial scale
    gsap.set(img, {
      scale: 1.2,
      transformOrigin: "center center",
    });

    // Parallax effect: image moves opposite to scroll direction
    // This creates the "window" effect where you feel like looking into the room
    ScrollTrigger.create({
      trigger: card,
      start: "left right",
      end: "right left",
      horizontal: true,
      scrub: true,
      onUpdate: (self) => {
        // Calculate parallax offset based on scroll progress
        // Move image slightly in opposite direction for depth effect
        const parallaxAmount = (self.progress - 0.5) * 30; // -15% to +15%
        gsap.to(img, {
          xPercent: parallaxAmount,
          ease: "none",
          overwrite: "auto",
        });
      },
    });

    // Scale animation: returns to normal as card enters viewport
    ScrollTrigger.create({
      trigger: card,
      start: "left 80%",
      end: "left 20%",
      horizontal: true,
      scrub: true,
      onUpdate: (self) => {
        // Scale from 1.2 to 1.0 as card scrolls into view
        const scaleValue = 1.2 - self.progress * 0.2;
        gsap.to(img, {
          scale: scaleValue,
          ease: "none",
          overwrite: "auto",
        });
      },
    });

    // ============================================
    // CARD ACTIVATION & CONTENT REVEAL
    // ============================================

    ScrollTrigger.create({
      trigger: card,
      start: "left 60%",
      end: "left 40%",
      horizontal: true,
      onEnter: () => {
        card.classList.add("active");
      },
      onLeaveBack: () => {
        card.classList.remove("active");
      },
      onEnterBack: () => {
        card.classList.add("active");
      },
    });
  });

  // ============================================
  // CUSTOM CURSOR TRANSFORMATION
  // ============================================

  if (cursor) {
    // Show cursor when entering section
    section.addEventListener("mouseenter", () => {
      cursor.classList.add("visible");
    });

    section.addEventListener("mouseleave", () => {
      cursor.classList.remove("visible");
    });

    // Follow mouse movement within section
    section.addEventListener("mousemove", (e) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Clamp cursor to section bounds with padding
      const padding = 60;
      const clampedX = Math.max(padding, Math.min(x, rect.width - padding));
      const clampedY = Math.max(padding, Math.min(y, rect.height - padding));

      gsap.to(cursor, {
        left: clampedX,
        top: clampedY,
        xPercent: -50,
        yPercent: -50,
        duration: 0.3,
        ease: "power2.out",
      });
    });

    // Cursor click effect
    section.addEventListener("mousedown", () => {
      gsap.to(cursor, {
        scale: 0.9,
        duration: 0.15,
        ease: "power2.out",
      });
    });

    section.addEventListener("mouseup", () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.15,
        ease: "power2.out",
      });
    });
  }

  // ============================================
  // MAGNETIC BUTTON EFFECT
  // ============================================

  const magneticBtns = DOM.selectAll(".book-now-magnetic");

  magneticBtns.forEach((btn) => {
    if (!btn) return;

    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
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

  // ============================================
  // LETTER-SPACING REVEAL ANIMATION
  // Already handled via CSS transitions triggered by .active class
  // Additional GSAP enhancement for smoother timing
  // ============================================

  cards.forEach((card) => {
    const titleTexts = card.querySelectorAll(".title-text");

    // Ensure initial state
    gsap.set(titleTexts, {
      letterSpacing: "-0.02em",
    });

    // Watch for active class changes and animate
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.classList.contains("active")) {
          gsap.to(titleTexts, {
            letterSpacing: "0.02em",
            duration: 0.8,
            stagger: 0.1,
            ease: emilyEase,
          });
        } else {
          gsap.to(titleTexts, {
            letterSpacing: "-0.02em",
            duration: 0.5,
            ease: "power2.out",
          });
        }
      });
    });

    observer.observe(card, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  console.log("Cinematic Rooms Section initialized");
}

/**
 * Parallax Image with Reveal
 */
function initParallaxReveal() {
  const parallaxImages = DOM.selectAll(".parallax-reveal");

  parallaxImages.forEach((container) => {
    const img = container.querySelector("img");
    if (!img) return;

    // Initial reveal animation
    gsap.fromTo(
      img,
      { scale: 1.1 },
      {
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // Parallax effect
    gsap.to(img, {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
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
  // Skip on mobile - native scroll is better for touch devices
  if (isMobile()) return;

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
  // Skip on mobile - no cursor on touch devices
  if (isMobile()) return;

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
// ABOUT PAGE SPECIFIC ANIMATIONS
// ============================================

/**
 * Slow-Reveal Image Animation
 * Images expand from a vertical slit to full rectangle (clip-path)
 * Feels like a door opening slowly
 */
function initSlowRevealImages() {
  const slowRevealImages = document.querySelectorAll(".slow-reveal-image");

  slowRevealImages.forEach((img) => {
    ScrollTrigger.create({
      trigger: img,
      start: "top 70%",
      onEnter: () => {
        img.classList.add("revealed");
      },
      onLeaveBack: () => {
        img.classList.remove("revealed");
      },
    });
  });
}

/**
 * Ghost Text Animation
 * Subtle parallax on body text - moves at 0.95x speed
 * Makes text feel like it's floating above the background
 */
function initGhostText() {
  const ghostTextBlocks = document.querySelectorAll(".ghost-text");

  ghostTextBlocks.forEach((block) => {
    const paragraphs = block.querySelectorAll("p");

    paragraphs.forEach((p) => {
      gsap.to(p, {
        y: -15,
        ease: "none",
        scrollTrigger: {
          trigger: block,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.95, // Subtle parallax at 0.95x speed
        },
      });
    });
  });
}

/**
 * Ink Drop Animation for Map Markers
 * Points of interest bloom onto map like ink drops
 */
function initInkDropMarkers() {
  const poiMarkers = document.querySelectorAll(".poi-marker:not(.active)");

  poiMarkers.forEach((marker, index) => {
    ScrollTrigger.create({
      trigger: ".neighborhood-map",
      start: "top 60%",
      onEnter: () => {
        // Stagger the animation
        setTimeout(() => {
          marker.classList.add("active");
        }, index * 200);
      },
    });
  });
}

/**
 * Maker Portrait Hover Animation
 * Title fades out, personal quote fades in on hover
 */
function initMakerCardHovers() {
  const makerCards = document.querySelectorAll(".maker-card");

  makerCards.forEach((card) => {
    const portrait = card.querySelector(".maker-portrait");
    const info = card.querySelector(".maker-info");
    const quote = card.querySelector(".maker-quote");

    if (!portrait || !info || !quote) return;

    card.addEventListener("mouseenter", () => {
      gsap.to(portrait, {
        filter: "grayscale(0%) contrast(1)",
        scale: 1.02,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.to(info, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(quote, {
        opacity: 1,
        duration: 0.4,
        delay: 0.1,
        ease: "power2.out",
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(portrait, {
        filter: "grayscale(100%) contrast(1.1)",
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.to(info, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(quote, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    });
  });
}

/**
 * Section Color Transition
 * Smoothly transitions background color between sections
 */
function initColorTransitions() {
  // Transition from light to dark section
  const colorTransitionTrigger = document.querySelector(".makers-section");
  const narrativeSection = document.querySelector(".narrative-section");

  if (colorTransitionTrigger && narrativeSection) {
    ScrollTrigger.create({
      trigger: colorTransitionTrigger,
      start: "top center",
      end: "center center",
      onEnter: () => {
        gsap.to(narrativeSection, {
          backgroundColor: "#121212", // obsidian-noir
          duration: 1.5,
          onComplete: () => {
            narrativeSection.classList.add("dark-theme");
          },
        });
      },
      onLeaveBack: () => {
        gsap.to(narrativeSection, {
          backgroundColor: "#f2f0ed", // bone-linen
          duration: 1.5,
          onComplete: () => {
            narrativeSection.classList.remove("dark-theme");
          },
        });
      },
    });
  }
}

/**
 * Hero Statement Reveal Animation
 * For about page hero with macro video background
 */
function initHeroStatementAnimation() {
  const heroStatement = document.querySelector(".hero-statement");

  if (heroStatement) {
    gsap.to(heroStatement, {
      opacity: 1,
      y: 0,
      duration: 1.8,
      ease: "power3.out",
      delay: 0.3,
    });
  }

  const scrollIndicator = document.querySelector(".hero-scroll-indicator");
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 1,
      duration: 1,
      delay: 1.5,
    });
  }
}

/**
 * Split Screen Sticky Layout
 * Left side sticky, right side scrolls with parallax
 */
function initSplitScreenLayout() {
  const narrativeSection = document.querySelector(".narrative-section");
  const stickySide = document.querySelector(".narrative-sticky");
  const scrollingSide = document.querySelector(".narrative-scrolling");

  if (narrativeSection && stickySide && scrollingSide) {
    ScrollTrigger.create({
      trigger: narrativeSection,
      start: "top top",
      end: "bottom bottom",
      pin: stickySide,
      scrub: true,
    });

    // Parallax on scrolling content
    gsap.to(scrollingSide, {
      yPercent: -10,
      ease: "none",
      scrollTrigger: {
        trigger: narrativeSection,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}

/**
 * Macro Grid Animation
 * Subtle movement in material close-up grid
 */
function initMacroGridAnimation() {
  const macroCells = document.querySelectorAll(".macro-cell img");

  if (macroCells.length > 0) {
    gsap.fromTo(
      macroCells,
      { scale: 1.3 },
      {
        scale: 1.4,
        duration: 20,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: {
          each: 0.5,
          from: "random",
        },
      }
    );
  }
}

// ============================================
// INITIALIZE ALL ANIMATIONS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initHeroAnimation();
    initSoftLiftTitles();
    initStaggeredBodyText();
    initInsetScaleImages();
    initBlurToFocus();
    initScaleZoomReveal();
    initMagneticButtons();
    initCuratedMomentsGrid();
    initEnhancedSectionAnimations();
    initParallaxReveal();
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

    // New Editorial Animations
    initCTAStaggeredReveal();
    initCTABackgroundTransition();

    // Cinematic Horizontal Scroll Rooms
    initCinematicRoomsSection();

    // Discovery Parallax Animation
    initDiscoveryParallax();

    // About page specific animations
    initSlowRevealImages();
    initGhostText();
    initInkDropMarkers();
    initMakerCardHovers();
    initColorTransitions();
    initHeroStatementAnimation();
    initSplitScreenLayout();
    initMacroGridAnimation();

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
