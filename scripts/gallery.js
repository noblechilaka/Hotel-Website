/**
 * Gallery Page - Editorial Interactions
 * Implements asymmetric grid, sensory filtering, and contextual image expansion
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const EMILY_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const STAGGER_DELAY = 0.08;

  // ============================================
  // DOM ELEMENTS
  // ============================================

  const galleryMosaic = document.getElementById('galleryMosaic');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('galleryModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalImageWrapper = document.getElementById('modalImageWrapper');
  const modalClose = document.getElementById('modalClose');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');

  // ============================================
  // STATE
  // ============================================

  let currentFilter = 'all';
  let currentIndex = 0;
  let filteredItems = [];
  let isAnimating = false;

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Get all visible gallery items based on current filter
   */
  function getVisibleItems() {
    return Array.from(galleryItems).filter(item => {
      if (currentFilter === 'all') return true;
      return item.dataset.category === currentFilter;
    });
  }

  /**
   * Get index of item in filtered array
   */
  function getFilteredIndex(originalIndex) {
    const visible = getVisibleItems();
    return visible.indexOf(galleryItems[originalIndex]);
  }

  /**
   * Get item at filtered index
   */
  function getItemAtFilteredIndex(index) {
    const visible = getVisibleItems();
    return visible[index] || null;
  }

  // ============================================
  // HERO ANIMATIONS
  // ============================================

  function initHeroAnimation() {
    const heroLabel = document.querySelector('.gallery-hero-label');
    const titleLines = document.querySelectorAll('.gallery-title-line span');
    const caption = document.querySelector('.gallery-hero-caption');
    const scrollIndicator = document.querySelector('.gallery-scroll-indicator');

    const tl = gsap.timeline({
      defaults: { ease: EMILY_EASE }
    });

    // Label fade in
    tl.to(heroLabel, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: EMILY_EASE
    }, 0.3);

    // Title lines slide up
    tl.to(titleLines, {
      y: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: EMILY_EASE
    }, 0.5);

    // Caption fade in
    tl.to(caption, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: EMILY_EASE
    }, 1);

    // Scroll indicator fade in
    tl.to(scrollIndicator, {
      opacity: 1,
      duration: 0.8,
      ease: EMILY_EASE
    }, 1.5);

    // Parallax on scroll
    const hero = document.querySelector('.gallery-hero');
    const video = document.querySelector('.gallery-hero-video');

    if (hero && video) {
      gsap.to(video, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  }

  // ============================================
  // GALLERY GRID ANIMATIONS
  // ============================================

  function initGalleryGridAnimation() {
    const items = getVisibleItems();

    items.forEach((item, index) => {
      // Reset animation state
      gsap.set(item, {
        opacity: 0,
        scale: 0.9,
        y: 30
      });

      // Staggered reveal on scroll
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(item, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.2,
            ease: EMILY_EASE,
            delay: index * STAGGER_DELAY * 0.5
          });
        },
        onLeaveBack: () => {
          gsap.to(item, {
            opacity: 0,
            scale: 0.9,
            y: 30,
            duration: 0.5,
            ease: EMILY_EASE
          });
        }
      });
    });

    // Horizontal Drift Parallax
    initHorizontalDrift();
  }

  /**
   * Horizontal Drift Parallax Effect
   * Left images move slower than right images on scroll
   */
  function initHorizontalDrift() {
    const leftItems = [];
    const rightItems = [];

    galleryItems.forEach((item, index) => {
      // Items in left half (columns 1-6) drift left
      // Items in right half (columns 7-12) drift right
      const gridColumn = getComputedStyle(item).gridColumnStart;
      if (gridColumn <= 6) {
        leftItems.push(item);
      } else {
        rightItems.push(item);
      }
    });

    // Parallax for left items (move slower = negative drift)
    if (leftItems.length > 0) {
      gsap.to(leftItems, {
        x: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: galleryMosaic,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Parallax for right items (move faster = positive drift)
    if (rightItems.length > 0) {
      gsap.to(rightItems, {
        x: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: galleryMosaic,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }
  }

  // ============================================
  // FILTER FUNCTIONALITY
  // ============================================

  function initFilters() {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isAnimating) return;
        
        const filter = btn.dataset.filter;
        
        if (filter === currentFilter) return;
        
        currentFilter = filter;
        
        // Update active state
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Animate filter transition
        animateFilterChange();
      });
    });
  }

  function animateFilterChange() {
    isAnimating = true;
    const allItems = Array.from(galleryItems);
    const visibleItems = getVisibleItems();
    const hiddenItems = allItems.filter(item => !visibleItems.includes(item));

    // Fade out hidden items
    if (hiddenItems.length > 0) {
      gsap.to(hiddenItems, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: EMILY_EASE,
        onComplete: () => {
          hiddenItems.forEach(item => {
            item.classList.add('hidden');
            item.classList.remove('fade-out');
          });
        }
      });
    }

    // Show and animate visible items
    visibleItems.forEach((item, index) => {
      item.classList.remove('hidden');
      item.classList.add('fade-out');
      
      // Force reflow
      void item.offsetWidth;
      
      // Fade in with stagger
      gsap.to(item, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: EMILY_EASE,
        delay: index * STAGGER_DELAY * 0.3,
        onComplete: () => {
          item.classList.remove('fade-out');
          item.classList.add('fade-in');
          
          // Remove fade-in class after animation
          setTimeout(() => {
            item.classList.remove('fade-in');
          }, 600);
        }
      });
    });

    // Reset animation lock
    setTimeout(() => {
      isAnimating = false;
    }, 600 + visibleItems.length * STAGGER_DELAY * 300);
  }

  // ============================================
  // FULL-SCREEN IMAGE EXPANSION
  // ============================================

  function initImageExpansion() {
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        openModal(index);
      });
    });

    // Modal navigation
    modalPrev.addEventListener('click', () => navigateImage(-1));
    modalNext.addEventListener('click', () => navigateImage(1));

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Close modal
    modalClose.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-image-container')) {
        closeModal();
      }
    });

    // Mouse parallax on modal image
    initModalParallax();
  }

  function openModal(index) {
    const items = getVisibleItems();
    const item = items[index];
    
    if (!item) return;

    // Update current index
    currentIndex = getFilteredIndex(galleryItems.indexOf(item));
    filteredItems = items;

    // Get image and caption
    const img = item.querySelector('img');
    const caption = item.dataset.caption;

    // Set modal content
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modalCaption.textContent = caption || '';

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Show modal
    modal.classList.add('active');

    // Trigger reflow for animation
    void modal.offsetWidth;

    // Animate image in
    gsap.fromTo(modalImage, 
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: EMILY_EASE, delay: 0.2 }
    );
  }

  function closeModal() {
    // Animate out
    gsap.to(modalImage, {
      scale: 0.95,
      opacity: 0,
      duration: 0.5,
      ease: EMILY_EASE
    });

    gsap.to([modal.querySelector('.modal-caption-container'), modal.querySelector('.modal-close')], {
      opacity: 0,
      duration: 0.4,
      ease: EMILY_EASE,
      onComplete: () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modalImage.src = '';
      }
    });
  }

  function navigateImage(direction) {
    const newIndex = currentIndex + direction;
    
    if (newIndex < 0 || newIndex >= filteredItems.length) return;

    const oldImage = modalImage;
    const oldCaption = modalCaption.textContent;

    // Get new item
    const newItem = filteredItems[newIndex];
    const newImg = newItem.querySelector('img');
    const newCaption = newItem.dataset.caption;

    currentIndex = newIndex;

    // Animate out current
    gsap.to(oldImage, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: EMILY_EASE,
      onComplete: () => {
        // Update content
        oldImage.src = newImg.src;
        oldImage.alt = newImg.alt;
        modalCaption.textContent = newCaption;

        // Animate in new
        gsap.fromTo(oldImage,
          { scale: 1.05, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: EMILY_EASE }
        );
      }
    });

    // Caption transition
    gsap.to(modalCaption, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: EMILY_EASE,
      onComplete: () => {
        gsap.fromTo(modalCaption,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: EMILY_EASE }
        );
      }
    });
  }

  function handleKeyboard(e) {
    if (!modal.classList.contains('active')) return;

    switch(e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        navigateImage(-1);
        break;
      case 'ArrowRight':
        navigateImage(1);
        break;
    }
  }

  // ============================================
  // MOUSE PARALLAX ON EXPANDED IMAGE
  // ============================================

  function initModalParallax() {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
      if (!modal.classList.contains('active')) return;

      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    });

    function animateParallax() {
      if (!modal.classList.contains('active')) return;

      // Smooth interpolation
      currentX += (mouseX - currentX) * 0.05;
      currentY += (mouseY - currentY) * 0.05;

      // Apply transform to image wrapper (creates subtle shift effect)
      const shiftX = currentX * 20;
      const shiftY = currentY * 20;

      gsap.set(modalImageWrapper, {
        x: shiftX,
        y: shiftY
      });

      // Also slightly scale the image in opposite direction for depth
      const scale = 1 + Math.abs(currentX) * 0.02 + Math.abs(currentY) * 0.02;
      gsap.set(modalImage, {
        scale: scale,
        transformOrigin: `${50 + currentX * 10}% ${50 + currentY * 10}%`
      });

      requestAnimationFrame(animateParallax);
    }

    animateParallax();
  }

  // ============================================
  // IMAGE LOADING
  // ============================================

  function initImageLoading() {
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;

      if (img.complete) {
        item.classList.add('loaded');
      } else {
        img.addEventListener('load', () => {
          item.classList.add('loaded');
        });
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Wait for DOM and GSAP
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initGallery);
    } else {
      initGallery();
    }
  }

  function initGallery() {
    // Small delay to ensure all libraries are loaded
    setTimeout(() => {
      initHeroAnimation();
      initGalleryGridAnimation();
      initFilters();
      initImageExpansion();
      initImageLoading();
      
      console.log('Gallery page animations initialized');
    }, 100);
  }

  // Start
  init();

})();

