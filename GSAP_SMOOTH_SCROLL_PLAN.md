# GSAP Smooth Scrolling Implementation Plan

## Overview

Add smooth scrolling using Lenis library (free alternative to GSAP ScrollSmoother) that works seamlessly with GSAP ScrollTrigger.

## Files to Modify

### 1. `index.html`

- Add Lenis library import before GSAP scripts
- Initialize Lenis smooth scrolling in script tag

### 2. `scripts/animations.js`

- Add Lenis initialization
- Add GSAP ScrollTrigger refresh on Lenis scroll
- Update smooth scroll section functions

### 3. `styles/global.css`

- Update scroll-behavior for compatibility with Lenis

## Implementation Steps

### Step 1: Import Lenis in index.html

Add this line before GSAP scripts:

```html
<script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>
```

### Step 2: Initialize Lenis

Add initialization code in index.html:

```javascript
// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

// Integrate Lenis with GSAP ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Handle link clicks for smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      lenis.scrollTo(target);
    }
  });
});
```

### Step 3: Update animations.js

- Remove or update existing smooth scroll section functions
- Ensure all ScrollTrigger animations work with Lenis

## Affected Pages

All HTML files should get smooth scrolling:

- index.html
- about.html
- rooms.html
- room-details.html
- booking.html
- contact.html
- dashboard.html
- signup.html
- login.html
- confirmation.html

## Testing Checklist

- [ ] Smooth scrolling works on all pages
- [ ] GSAP ScrollTrigger animations still function correctly
- [ ] Scroll progress bar works with Lenis
- [ ] Mobile touch scrolling is smooth
- [ ] No conflicts with existing CSS scroll-behavior
- [ ] Page navigation links scroll smoothly to sections

## Timeline

- Implementation: 10-15 minutes
- Testing: 5-10 minutes
