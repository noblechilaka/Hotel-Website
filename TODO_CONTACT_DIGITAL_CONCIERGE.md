# TODO: Contact Page - "The Digital Concierge"

## Project Overview

Transform the Contact page into "The Digital Concierge" - a personal invitation experience with:

1. A dramatic hero section with B&W imagery
2. Innovative inline typography form fields
3. A custom-styled charcoal map with ink-drop pin animations

---

## Phase 1: HTML Structure (contact.html)

### 1.1 Hero Section Redesign

- [ ] Replace existing hero with new "Art of Arrival" hero
- [ ] Use high-contrast B&W image (hotel front desk OR concierge with brass key)
- [ ] Implement copy: "Awaiting Your Arrival. How may we prepare for you?"

### 1.2 Inline Typography Form

- [ ] Create new form structure with inline typography fields
- [ ] Format: "My name is [] and I would like to inquire about [] for my stay on [____]"
- [ ] Add click-triggered underline expansion animation
- [ ] Add hidden native inputs for form functionality

### 1.3 Map Section

- [ ] Create map container with custom styling hook
- [ ] Add Mapbox/Google Maps integration placeholder
- [ ] Add custom styled map CSS (charcoal lines, beige landmasses)
- [ ] Create hotel pin with ink-drop bloom animation

### 1.4 Contact Information Cards

- [ ] Redesign contact info with editorial styling
- [ ] Add subtle animations on scroll

---

## Phase 2: CSS Styling

### 2.1 Hero Section (contact.css)

```css
/* Hero - The Art of Arrival */
.contact-hero-concierge {
  height: 100vh;
  min-height: 700px;
  position: relative;
  overflow: hidden;
  background: var(--obsidian-noir);
}

.hero-concierge-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.4) contrast(1.2) grayscale(100%);
}

.hero-concierge-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--container-padding);
}

.hero-invitation {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 4rem);
  font-style: italic;
  color: var(--optic-white);
  margin-bottom: var(--space-lg);
  opacity: 0;
  transform: translateY(30px);
}
```

### 2.2 Inline Typography Form Fields

```css
/* Invisible Form - Inline Typography Fields */
.inline-typo-form {
  font-family: var(--font-heading);
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-style: italic;
  line-height: 2;
  color: var(--text-dark);
}

.typo-field {
  display: inline;
  position: relative;
  cursor: pointer;
}

.typo-field-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.typo-field-label {
  display: inline;
  border-bottom: 1px solid var(--divider);
  padding-bottom: 0.25rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.typo-field-input:focus + .typo-field-label {
  border-bottom-color: var(--editorial-accent);
}

/* Emily Ease Expansion Animation */
.typo-field-active .typo-field-label {
  border-bottom-width: 2px;
  border-bottom-color: var(--editorial-accent);
}
```

### 2.3 Map Section Styling

```css
/* Map - A Landmark in Charcoal */
.contact-map-section {
  position: relative;
  height: 500px;
  background: var(--bone-linen);
}

.map-container {
  width: 100%;
  height: 100%;
  filter: grayscale(100%) contrast(1.1);
}

/* Ink Drop Pin Animation */
.map-pin {
  width: 40px;
  height: 40px;
  background: var(--editorial-accent);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  animation: inkDropBloom 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes inkDropBloom {
  0% {
    transform: rotate(-45deg) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: rotate(-45deg) scale(1);
    opacity: 1;
  }
}
```

---

## Phase 3: JavaScript Animations

### 3.1 Form Field Animations

```javascript
// Emily Ease: 0.16, 1, 0.3, 1
const emilyEase = "cubic-bezier(0.16, 1, 0.3, 1)";

function initInlineTypographyForm() {
  const fields = document.querySelectorAll(".typo-field");

  fields.forEach((field) => {
    const input = field.querySelector(".typo-field-input");
    const label = field.querySelector(".typo-field-label");

    input.addEventListener("focus", () => {
      field.classList.add("typo-field-active");
      gsap.to(label, {
        borderBottomWidth: "2px",
        borderBottomColor: "var(--editorial-accent)",
        duration: 0.4,
        ease: emilyEase,
      });
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        field.classList.remove("typo-field-active");
        gsap.to(label, {
          borderBottomWidth: "1px",
          borderBottomColor: "var(--divider)",
          duration: 0.4,
          ease: emilyEase,
        });
      }
    });
  });
}
```

### 3.2 Map Pin Ink-Drop Animation

```javascript
function initMapPinAnimation() {
  const hotelPin = document.querySelector(".map-pin");

  if (!hotelPin) return;

  // Staggered bloom animation
  gsap.fromTo(
    hotelPin,
    {
      scale: 0,
      opacity: 1,
    },
    {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      ease: emilyEase,
      delay: 0.5,
    }
  );

  // Ripple effect
  gsap.to(".map-pin::after", {
    scale: 3,
    opacity: 0,
    duration: 1.5,
    ease: emilyEase,
    delay: 0.3,
  });
}
```

---

## Phase 4: Implementation Tasks

### Files to Create/Modify:

1. **contact.html** - Complete redesign

   - New hero section with B&W imagery
   - Inline typography form
   - Custom map section
   - Updated contact info cards

2. **styles/contact.css** - New file for contact-specific styles

   - Hero styling
   - Inline typography form
   - Map section
   - Animations

3. **scripts/animations.js** - Add new functions
   - `initInlineTypographyForm()`
   - `initMapPinAnimation()`
   - `initConciergeHeroAnimation()`

---

## Phase 5: Testing & Refinement

- [ ] Test form field animations on all browsers
- [ ] Verify inline typography form accessibility
- [ ] Test map pin ink-drop animation performance
- [ ] Check mobile responsiveness
- [ ] Verify form submission functionality

---

## Design Specifications Reference

### Color Palette

- **Obsidian Noir**: #121212
- **Bone Linen**: #f2f0ed
- **Editorial Accent**: #8b9a7d
- **Optic White**: #ffffff

### Typography

- **Headings**: Cormorant Garamond
- **Body**: Inter

### Animations

- **Emily Ease**: cubic-bezier(0.16, 1, 0.3, 1)
- **Ink Drop**: bloom outward effect
- **Center Expand**: underline from center

---

## Notes

- Use existing GSAP library for animations
- Maintain Lenis smooth scrolling
- Follow editorial noir design system
- Ensure mobile responsiveness
- Keep accessibility in mind for form fields
