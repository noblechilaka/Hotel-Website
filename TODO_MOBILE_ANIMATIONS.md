# Mobile Animation Optimization Plan

## Goal

Disable heavy GSAP animations on mobile devices (< 768px) to improve performance.

## Animations Disabled

1. ✅ Cinematic horizontal scroll rooms section
2. ✅ Discovery parallax animations
3. ✅ Hero parallax effects
4. ✅ Custom cursor effects
5. ✅ Magnetic button effects
6. ✅ Lenis smooth scroll (keep native scroll on mobile)

## Files Modified

1. `scripts/animations.js` - Added mobile detection and wrapped heavy animations
2. `styles/animations.css` - Added mobile CSS overrides

## Implementation Complete

### Changes Made:

**scripts/animations.js:**

- Added `isMobile()` helper function at the top
- Wrapped hero parallax effects in `initHeroAnimation()` with mobile check
- Wrapped `initCinematicRoomsSection()` with early return on mobile
- Wrapped `initDiscoveryParallax()` with early return on mobile
- Wrapped `initCursorEffects()` with early return on mobile
- Wrapped `initMagneticButtons()` with early return on mobile
- Wrapped `initLenisSmoothScroll()` with early return on mobile

**styles/animations.css:**

- Added comprehensive `@media (max-width: 767px)` section with `!important` overrides to:
  - Disable horizontal scroll pinned sections (cinematic rooms)
  - Disable discovery parallax containers
  - Disable hero background parallax
  - Hide custom cursor elements
  - Disable smooth scroll sections
  - Disable page transitions
  - Simplify reveal animations to instant appearance
  - Keep simple fade transitions for basic reveals
  - Disable cinematic image scaling
  - Disable magnetic button effects

## Status: ✅ COMPLETED
