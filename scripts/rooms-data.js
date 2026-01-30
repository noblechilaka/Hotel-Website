/**
 * ROOMS DATA - Centralized Room Configuration
 * All room information is managed here for easy maintenance
 */

const ROOMS_DATA = {
  // Main rooms displayed on rooms.html
  rooms: [
    {
      id: "garden-studio",
      slug: "garden-studio",
      name: "The Garden Studio",
      category: "Garden Sanctuary",
      shortDescription:
        "A serene retreat nestled in our curated gardens, featuring artisanal woodwork from Benin City.",
      fullDescription:
        "A serene retreat nestled in our curated gardens, featuring artisanal woodwork from Benin City. Experience the warmth of Nigerian craftsmanship with in-room private dining and 24/7 uninterrupted power architecture.",
      price: 280000,
      size: 55,
      sizeUnit: "m²",
      bed: "Queen",
      bedLabel: "Bed",
      guests: 2,
      guestsLabel: "Guests",
      image:
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1600",
      gallery: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1400",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400",
      ],
      amenities: [
        "Garden View",
        "In-room Private Dining",
        "24/7 Uninterrupted Power Architecture",
        "Artisanal Woodwork from Benin City",
        "Free WiFi",
        "Air Conditioning",
      ],
      // Sensory Specs - The "Sensory Specs" System
      sensorySpecs: [
        "300-Thread Count Organic Linen",
        "North-Facing Diffused Light",
        "Natural River Stone Basin",
        "Fresh Garden Herbs",
        "Teak Wood Decking",
      ],
      lightOrientation: "North-Facing",
      bedding: "300-Thread Count Organic Linen",
      bath: "Natural River Stone Basin",
      alignment: "left",
      order: 1,
    },
    {
      id: "atlantic-suite",
      slug: "atlantic-suite",
      name: "The Atlantic Suite",
      category: "Ocean View",
      shortDescription:
        "Panoramic Atlantic views with the sophistication of high-end Nigerian hospitality.",
      fullDescription:
        "Panoramic Atlantic views with the sophistication of high-end Nigerian hospitality. The private terrace offers in-room private dining while our 24/7 uninterrupted power architecture ensures your comfort is never compromised.",
      price: 600000,
      size: 75,
      sizeUnit: "m²",
      bed: "King",
      bedLabel: "Bed",
      guests: 2,
      guestsLabel: "Guests",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600",
      gallery: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1400",
      ],
      amenities: [
        "Atlantic Ocean View",
        "Private Terrace",
        "In-room Private Dining",
        "24/7 Uninterrupted Power Architecture",
        "Mini Bar",
        "Free WiFi",
      ],
      // Sensory Specs
      sensorySpecs: [
        "400-Thread Count Egyptian Cotton",
        "East-Facing Morning Light",
        "Hand-Poured Italian Marble Bathtub",
        "Sea Salt Aroma Diffuser",
        "Rainfall Shower Head",
      ],
      lightOrientation: "East-Facing",
      bedding: "400-Thread Count Egyptian Cotton",
      bath: "Hand-Poured Italian Marble Bathtub",
      alignment: "right",
      order: 2,
    },
    {
      id: "presidential-monolith",
      slug: "presidential-monolith",
      name: "The Presidential Monolith",
      category: "Ultimate Luxury",
      shortDescription:
        "The pinnacle of Nigerian excellence, a monolith of luxury and sophistication.",
      fullDescription:
        "The pinnacle of Nigerian excellence, a monolith of luxury and sophistication. This expansive suite features exclusive amenities, dedicated butler service, and breathtaking panoramic views that embody the grandeur of Lagos.",
      price: 1500000,
      size: 180,
      sizeUnit: "m²",
      bed: "King",
      bedLabel: "Bed",
      guests: 4,
      guestsLabel: "Guests",
      image:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600",
      gallery: [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1400",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400",
      ],
      amenities: [
        "Panoramic Lagos Views",
        "Private Pool",
        "Butler Service",
        "In-room Private Dining",
        "24/7 Uninterrupted Power Architecture",
        "Home Theater",
      ],
      // Sensory Specs
      sensorySpecs: [
        "600-Thread Count Italian Silk",
        "Corner Orientation - All Light",
        "Freestanding Soaking Tub",
        "Champagne Cooling Station",
        "Private Meditation Room",
      ],
      lightOrientation: "Corner - All Day Light",
      bedding: "600-Thread Count Italian Silk",
      bath: "Freestanding Soaking Tub",
      alignment: "left",
      order: 3,
    },
  ],

  // Cinematic rooms displayed on index.html (same data, different naming/presentation)
  cinematicRooms: [
    {
      id: "garden-sanctuary",
      slug: "garden-studio",
      displayName: "The Garden Sanctuary",
      cinematicName: "The Garden Sanctuary",
      price: 280000,
      priceDisplay: "₦280,000/night",
      description:
        "North-facing diffused light, artisanal woodwork from Benin City, in-room private dining.",
      image:
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1600",
      order: 1,
    },
    {
      id: "atlantic-monolith",
      slug: "atlantic-suite",
      displayName: "The Atlantic Monolith",
      cinematicName: "The Atlantic Monolith",
      price: 600000,
      priceDisplay: "₦600,000/night",
      description:
        "East-facing morning light, Atlantic ocean views, 24/7 uninterrupted power architecture.",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600",
      order: 2,
    },
    {
      id: "presidential-monolith",
      slug: "presidential-monolith",
      displayName: "The Presidential Monolith",
      cinematicName: "The Presidential Monolith",
      price: 1500000,
      priceDisplay: "₦1,500,000/night",
      description:
        "Corner orientation with all-day light, panoramic Lagos views, ultimate Nigerian luxury.",
      image:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600",
      order: 3,
    },
  ],

  // Related rooms for room-details.html
  relatedRooms: [
    {
      id: "garden-retreat",
      slug: "garden-retreat",
      name: "Garden Retreat",
      category: "Garden Setting",
      price: 320,
      priceDisplay: "$320/night",
      image:
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600",
    },
    {
      id: "presidential-suite",
      slug: "presidential-suite",
      name: "Presidential Suite",
      category: "Ultimate Luxury",
      price: 1200,
      priceDisplay: "$1,200/night",
      image:
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600",
    },
    {
      id: "beach-villa",
      slug: "beach-villa",
      name: "Beach Villa",
      category: "Beachfront",
      price: 850,
      priceDisplay: "$850/night",
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600",
    },
  ],
};

/**
 * Room Manager - Handles room loading and rendering
 */
const RoomManager = {
  /**
   * Get all rooms
   * @param {string} type - Optional filter by type ('rooms' or 'cinematic')
   * @returns {Array} Array of room objects
   */
  getAll(type = "rooms") {
    if (type === "cinematic") {
      return ROOMS_DATA.cinematicRooms;
    }
    return ROOMS_DATA.rooms;
  },

  /**
   * Get room by slug/ID
   * @param {string} slug - Room slug or ID
   * @returns {Object|null} Room object or null if not found
   */
  getBySlug(slug) {
    return (
      ROOMS_DATA.rooms.find((room) => room.slug === slug || room.id === slug) ||
      null
    );
  },

  /**
   * Get related rooms excluding current room
   * @param {string} currentSlug - Current room slug to exclude
   * @returns {Array} Array of related rooms
   */
  getRelated(currentSlug) {
    const current = this.getBySlug(currentSlug);
    if (!current) return ROOMS_DATA.relatedRooms.slice(0, 3);

    return ROOMS_DATA.rooms
      .filter((room) => room.slug !== currentSlug)
      .slice(0, 3);
  },

  /**
   * Get cinematic room data
   * @param {string} cinematicId - Cinematic room ID
   * @returns {Object|null} Cinematic room object
   */
  getCinematicRoom(cinematicId) {
    return (
      ROOMS_DATA.cinematicRooms.find((room) => room.id === cinematicId) || null
    );
  },

  /**
   * Render rooms to a container element
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Rendering options
   */
  renderToContainer(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }

    const rooms = this.getAll(options.type || "rooms");

    container.innerHTML = rooms
      .map((room, index) => {
        if (options.type === "cinematic") {
          return this.renderCinematicRoomCard(room, index);
        }
        return this.renderRoomSection(room, index);
      })
      .join("");

    // Initialize animations if GSAP is available
    if (typeof gsap !== "undefined" && options.animate !== false) {
      this.initRoomAnimations();
    }
  },

  /**
   * Render a single room section - Editorial Scroll Layout
   * "The Private Sanctuaries" - Large-Scale Vertical List with Zigzag Asymmetry
   * @param {Object} room - Room data object
   * @param {number} index - Room index for alternating layout
   * @returns {string} HTML string
   */
  renderRoomSection(room, index = 0) {
    const isLeft = room.alignment === "left";
    const reverseClass = isLeft ? "" : "room-editorial-reverse";

    // Sensory Specs HTML
    const sensorySpecsHTML = room.sensorySpecs
      ? `
        <div class="sensory-specs">
          <span class="sensory-label">Sensory Details</span>
          <ul class="sensory-list">
            ${room.sensorySpecs
              .map(
                (spec) => `
              <li class="sensory-item">${spec}</li>
            `
              )
              .join("")}
          </ul>
        </div>
      `
      : "";

    // Key sensory highlights
    const lightSpec = room.lightOrientation
      ? `<div class="sensory-highlight"><span class="highlight-label">Light</span><span class="highlight-value">${room.lightOrientation}</span></div>`
      : "";
    const beddingSpec = room.bedding
      ? `<div class="sensory-highlight"><span class="highlight-label">Bedding</span><span class="highlight-value">${room.bedding}</span></div>`
      : "";
    const bathSpec = room.bath
      ? `<div class="sensory-highlight"><span class="highlight-label">Bath</span><span class="highlight-value">${room.bath}</span></div>`
      : "";

    return `
      <section class="room-editorial-section ${reverseClass}" data-room-id="${
      room.id
    }" data-index="${index}">
        <div class="room-editorial-grid">
          <div class="room-editorial-image">
            <a href="/room-details.html?room=${
              room.slug
            }" class="room-image-link">
              <img src="${room.image}" alt="${
      room.name
    }" class="room-editorial-img" />
              <div class="room-image-scrim"></div>
            </a>
          </div>
          <div class="room-editorial-content">
            <div class="room-content-inner">
              <span class="room-category">${room.category}</span>
              <h2 class="room-title">${room.name}</h2>
              <p class="room-description">${room.fullDescription}</p>
              
              <div class="room-specs-grid">
                <div class="spec-item">
                  <span class="spec-number">${room.size}</span>
                  <span class="spec-unit">${room.sizeUnit}</span>
                  <span class="spec-label">Space</span>
                </div>
                <div class="spec-item">
                  <span class="spec-number">${room.bed}</span>
                  <span class="spec-label">${room.bedLabel}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-number">${room.guests}</span>
                  <span class="spec-label">${room.guestsLabel}</span>
                </div>
              </div>

              <div class="sensory-highlights">
                ${lightSpec}
                ${beddingSpec}
                ${bathSpec}
              </div>

              ${sensorySpecsHTML}

              <div class="room-cta-row">
                <span class="room-price">From ₦${room.price.toLocaleString()}<span class="price-period">/ night</span></span>
                <a href="/room-details.html?room=${
                  room.slug
                }" class="room-cta-link">
                  <span>View Sanctuary</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * Render a cinematic room card - static version without animations
   * @param {Object} room - Cinematic room data
   * @param {number} index - Room index for alternating offsets
   * @returns {string} HTML string
   */
  renderCinematicRoomCard(room, index = 0) {
    const offsetClass =
      index % 2 === 0 ? "offset-top-left" : "offset-bottom-right";
    const titleLines = room.cinematicName.split(" ");

    return `
      <article class="room-card-cinematic ${offsetClass}" data-room-slug="${
      room.slug
    }">
        <div class="room-card-inner">
          <div class="room-card-image-container">
            <img 
              src="${room.image}" 
              alt="${room.cinematicName}"
              class="room-card-image-cinematic"
            />
            <div class="room-image-overlay"></div>
          </div>
          <div class="room-card-content-cinematic">
            <span class="room-card-price-cinematic">From ${
              room.priceDisplay
            }</span>
            <h3 class="room-title-cinematic">
              <span class="title-mask">
                <span class="title-text">${titleLines[0]}</span>
              </span>
              <span class="title-mask">
                <span class="title-text">${titleLines.slice(1).join(" ")}</span>
              </span>
            </h3>
            <p class="sensory-spec">
              ${room.description
                .split(",")
                .map((line) => `<span class="spec-line">${line.trim()}</span>`)
                .join("")}
            </p>
            <a href="/room-details.html?room=${
              room.slug
            }" class="book-now-magnetic">
              <span class="btn-text-cinematic">View Details</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Render a quiet luxury room card - The Monolith style
   * @param {Object} room - Cinematic room data
   * @param {number} index - Room index for alternating layout
   * @returns {string} HTML string
   */
  renderQuietRoomCard(room, index = 0) {
    return `
      <article class="quiet-room-card" data-room-slug="${room.slug}">
        <div class="quiet-room-image">
          <img 
            src="${room.image}" 
            alt="${room.cinematicName}"
          />
        </div>
        <div class="quiet-room-content">
          <span class="quiet-room-price">From ${room.priceDisplay}</span>
          <h3 class="quiet-room-title">${room.cinematicName}</h3>
          <p class="quiet-room-spec">${room.description}</p>
          <a href="/room-details.html?room=${room.slug}" class="quiet-room-link">
            Explore
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </article>
    `;
  },

  /**
   * Render related rooms section
   * @param {string} currentSlug - Current room slug to exclude
   * @returns {string} HTML string
   */
  renderRelatedRooms(currentSlug) {
    const rooms = this.getRelated(currentSlug);

    return rooms
      .map(
        (room) => `
      <a href="/room-details.html?room=${room.slug}" class="related-room">
        <img
          src="${room.image}"
          alt="${room.name}"
          style="width: 100%; aspect-ratio: 4/3; object-fit: cover; margin-bottom: 1rem;"
        />
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--text-light);">
          ${room.name}
        </h3>
        <span class="meta-text" style="color: var(--gold)">From ₦${room.price.toLocaleString()}/night</span>
      </a>
    `
      )
      .join("");
  },

  /**
   * Render gallery thumbnails for room details page
   * @param {Object} room - Room data object
   * @returns {string} HTML string for gallery thumbnails
   */
  renderGalleryThumbnails(room) {
    if (!room.gallery || room.gallery.length === 0) {
      return '';
    }

    return room.gallery
      .map(
        (image, index) => `
        <button
          class="gallery-thumb ${index === 0 ? 'active' : ''}"
          data-src="${image}"
          data-index="${index}"
          style="overflow: hidden; border-radius: 4px; cursor: pointer;"
          aria-label="View image ${index + 1} of ${room.name}"
        >
          <img
            src="${image.replace('w=1400', 'w=400')}"
            alt="View ${index + 1}"
            style="
              width: 100%;
              aspect-ratio: 4/3;
              object-fit: cover;
              transition: transform 0.3s ease;
            "
          />
        </button>
      `
      )
      .join('');
  },

  /**
   * Render amenities list for room details page
   * @param {Object} room - Room data object
   * @returns {string} HTML string for amenities list
   */
  renderAmenities(room) {
    if (!room.amenities || room.amenities.length === 0) {
      return '';
    }

    return `
      <ul
        class="amenities-list"
        style="
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        "
      >
        ${room.amenities
          .map(
            (amenity) => `
            <li style="display: flex; align-items: center; gap: 0.75rem;">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gold)"
                stroke-width="1.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>${amenity}</span>
            </li>
          `
          )
          .join('')}
      </ul>
    `;
  },

  /**
   * Render sensory specs section for room details page
   * @param {Object} room - Room data object
   * @returns {string} HTML string for sensory specs
   */
  renderSensorySpecs(room) {
    if (!room.sensorySpecs || room.sensorySpecs.length === 0) {
      return '';
    }

    return `
      <div class="sensory-specs-container" style="margin-top: 2rem;">
        <h4 style="font-family: var(--font-body); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--editorial-accent); margin-bottom: 1rem;">
          Sensory Details
        </h4>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${room.sensorySpecs
            .map(
              (spec) => `
              <li style="font-family: var(--font-body); font-size: 0.875rem; color: rgba(255, 255, 255, 0.7); padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                ${spec}
              </li>
            `
            )
            .join('')}
        </ul>
      </div>
    `;
  },

  /**
   * Render enhanced related rooms section with better styling
   * @param {string} currentSlug - Current room slug to exclude
   * @returns {string} HTML string for related rooms
   */
  renderRelatedRoomsEnhanced(currentSlug) {
    const rooms = this.getRelated(currentSlug);

    return rooms
      .map(
        (room) => `
      <a href="/room-details.html?room=${room.slug}" class="related-room-card" style="display: block; text-decoration: none;">
        <div class="related-room-image" style="overflow: hidden; border-radius: 4px; margin-bottom: 1rem; position: relative;">
          <img
            src="${room.image}"
            alt="${room.name}"
            style="width: 100%; aspect-ratio: 4/3; object-fit: cover; transition: transform 0.5s ease;"
          />
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,18,18,0.6), transparent);"></div>
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--text-light); margin-bottom: 0.5rem; transition: color 0.3s ease;">
          ${room.name}
        </h3>
        <span class="meta-text" style="color: var(--gold); font-size: 0.875rem;">From ₦${room.price.toLocaleString()}/night</span>
        <span class="related-room-category" style="display: block; margin-top: 0.25rem; font-family: var(--font-body); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.5);">
          ${room.category || 'Accommodation'}
        </span>
      </a>
    `
      )
      .join('');
  },

  /**
   * Render complete room details page content
   * @param {string} roomSlug - Room slug to render
   * @returns {Object} Object containing all HTML sections for the page
   */
  renderRoomDetailsPage(roomSlug) {
    const room = this.getBySlug(roomSlug);
    
    // Fallback to first room if not found
    const currentRoom = room || this.getBySlug('garden-studio');

    return {
      // Page title
      title: `${currentRoom.name} | EMILY HOTEL`,
      
      // Hero section
      heroCategory: currentRoom.category,
      heroName: currentRoom.name,
      heroImage: currentRoom.image,
      
      // Main content
      roomName: currentRoom.name,
      roomCategory: currentRoom.category,
      roomDescription: currentRoom.fullDescription,
      roomPrice: `₦${currentRoom.price.toLocaleString()}`,
      roomSize: currentRoom.size,
      roomSizeUnit: currentRoom.sizeUnit,
      bedType: currentRoom.bed,
      maxGuests: currentRoom.guests,
      
      // Gallery
      mainImage: currentRoom.gallery?.[0] || currentRoom.image,
      gallery: this.renderGalleryThumbnails(currentRoom),
      
      // Amenities
      amenities: this.renderAmenities(currentRoom),
      
      // Sensory specs
      sensorySpecs: this.renderSensorySpecs(currentRoom),
      
      // Key specs
      lightOrientation: currentRoom.lightOrientation || '',
      bedding: currentRoom.bedding || '',
      bath: currentRoom.bath || '',
      
      // Related rooms
      relatedRooms: this.renderRelatedRoomsEnhanced(currentRoom.slug),
      
      // Raw room data for JS
      rawRoom: currentRoom
    };
  },

  /**
   * Initialize room details page with dynamic content
   * Should be called immediately after RoomManager is defined
   * @param {string} fallbackSlug - Default room slug if none in URL
   * @returns {Object} Rendered room data
   */
  initRoomDetailsPage(fallbackSlug = 'garden-studio') {
    // Get room slug from URL
    const params = new URLSearchParams(window.location.search);
    const roomSlug = params.get('room') || fallbackSlug;
    
    // Render page content
    return this.renderRoomDetailsPage(roomSlug);
  },

  /**
   * Initialize room animations using GSAP
   */
  initRoomAnimations() {
    if (typeof ScrollTrigger === "undefined") return;

    const rooms = document.querySelectorAll(".room-section");

    rooms.forEach((room, index) => {
      const image = room.querySelector(".room-image");
      const info = room.querySelector(".room-info");

      if (image) {
        gsap.fromTo(
          image,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: room,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (info) {
        gsap.fromTo(
          info,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: room,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });
  },

  /**
   * Initialize Editorial Room Animations
   * "The Private Sanctuaries" - Scroll-triggered reveals with parallax
   */
  initEditorialRoomAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.warn("GSAP or ScrollTrigger not available");
      return;
    }

    const sections = document.querySelectorAll(".room-editorial-section");

    if (sections.length === 0) {
      console.log("No editorial room sections found");
      return;
    }

    // Kill any existing scroll triggers for room sections
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger && t.trigger.closest(".room-editorial-section")) {
        t.kill();
      }
    });

    sections.forEach((section, index) => {
      const imageContainer = section.querySelector(".room-editorial-image");
      const image = section.querySelector(".room-editorial-img");
      const contentInner = section.querySelector(".room-content-inner");

      // Image parallax on scroll
      if (image) {
        gsap.set(image, { scale: 1.1 });

        gsap.fromTo(
          image,
          { scale: 1.1 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Content reveal animation
      if (contentInner) {
        gsap.fromTo(
          contentInner,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Add revealed class for CSS transitions
      ScrollTrigger.create({
        trigger: section,
        start: "top 70%",
        onEnter: () => {
          section.classList.add("revealed");
        },
        onLeaveBack: () => {
          section.classList.remove("revealed");
        },
        onEnterBack: () => {
          section.classList.add("revealed");
        },
      });
    });

    console.log(
      "Editorial room animations initialized for",
      sections.length,
      "sections"
    );
  },

  /**
   * Initialize cinematic room animations
   */
  initCinematicAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
      return;

    // Wait for DOM to be fully ready
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll(".room-card-cinematic");
      const track = document.querySelector(".rooms-track");
      const trackWrapper = document.querySelector(".rooms-track-wrapper");
      const section = document.querySelector(".cinematic-rooms-section");

      if (cards.length === 0) {
        // Try again after a short delay if cards aren't rendered yet
        setTimeout(() => {
          this.initCinematicAnimations();
        }, 50);
        return;
      }

      // First, kill any existing scroll triggers for the cinematic section
      // This ensures clean re-initialization
      ScrollTrigger.getAll().forEach((t) => {
        if (
          t.trigger &&
          t.trigger.closest &&
          t.trigger.closest(".cinematic-rooms-section")
        ) {
          t.kill();
        }
      });

      // Set up horizontal scroll pinning
      if (track && trackWrapper && section) {
        const getScrollAmount = () => {
          const trackWidth = track.scrollWidth;
          const viewportWidth = window.innerWidth;
          return trackWidth - viewportWidth;
        };

        // Create horizontal scroll tween
        gsap.to(track, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => "+=" + getScrollAmount(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      }

      // Animate each card's content
      cards.forEach((card, index) => {
        const image = card.querySelector(".room-card-image-container");
        const content = card.querySelector(".room-card-content-cinematic");

        if (image) {
          // Set initial scale
          gsap.set(image.querySelector("img"), { scale: 1.2 });

          gsap.fromTo(
            image.querySelector("img"),
            { scale: 1.2, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "top 30%",
                scrub: true,
              },
            }
          );
        }

        if (content) {
          const titleMasks = content.querySelectorAll(".title-mask");
          const specs = content.querySelectorAll(".sensory-spec .spec-line");
          const button = content.querySelector(".book-now-magnetic");

          // Set initial state for title masks
          gsap.set(titleMasks, { y: "100%" });

          // Animate title masks with scroll trigger
          if (titleMasks.length > 0) {
            gsap.to(titleMasks, {
              y: "0%",
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            });
          }

          // Set initial state for specs
          gsap.set(specs, { y: 20, opacity: 0 });

          // Animate specs
          if (specs.length > 0) {
            gsap.to(specs, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            });
          }

          // Set initial state for button
          gsap.set(button, { y: 20, opacity: 0 });

          // Animate button
          if (button) {
            gsap.to(button, {
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: 0.3,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            });
          }
        }
      });

      console.log("Cinematic room animations initialized");
    });
  },

  /**
   * Initialize quiet luxury room animations
   * "The Monolith" - Subtle Opacity and Depth Reveal
   *
   * Features:
   * - Simple opacity fade with scale 1.02 to 1.0 over 2 seconds
   * - power1.out ease for natural, less digital feel
   * - Trigger: top 80% for "settling" effect as user approaches
   * - Vertical stacking with 30vh padding between items
   */
  initQuietLuxuryAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
      return;

    // Wait for DOM to be fully ready
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll(".quiet-room-card");
      const section = document.querySelector(".quiet-luxury-rooms");
      const header = document.querySelector(".quiet-rooms-header");

      if (cards.length === 0) {
        // Try again after a short delay if cards aren't rendered yet
        setTimeout(() => {
          this.initQuietLuxuryAnimations();
        }, 50);
        return;
      }

      // Kill any existing scroll triggers for the quiet luxury section
      ScrollTrigger.getAll().forEach((t) => {
        if (
          t.trigger &&
          t.trigger.closest &&
          t.trigger.closest(".quiet-luxury-rooms")
        ) {
          t.kill();
        }
      });

      // Animate header on scroll
      if (header && section) {
        ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          onEnter: () => {
            section.classList.add("revealed");
          },
          onLeaveBack: () => {
            section.classList.remove("revealed");
          },
          onEnterBack: () => {
            section.classList.add("revealed");
          },
        });
      }

      // Animate each quiet room card
      cards.forEach((card, index) => {
        const image = card.querySelector(".quiet-room-image");
        const img = card.querySelector(".quiet-room-image img");
        const content = card.querySelector(".quiet-room-content");
        const price = card.querySelector(".quiet-room-price");
        const title = card.querySelector(".quiet-room-title");
        const spec = card.querySelector(".quiet-room-spec");
        const link = card.querySelector(".quiet-room-link");

        // Set initial states for animation
        if (img) {
          // Initial state: scale 1.02, opacity 0
          gsap.set(img, {
            scale: 1.02,
            opacity: 0,
            transformOrigin: "center center",
          });
        }

        if (content) {
          // Content elements start slightly lower and transparent
          gsap.set([price, title, spec, link], {
            y: 10,
            opacity: 0,
          });
        }

        // Create the reveal animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 40%",
            toggleActions: "play none none reverse",
            // Using power1.out for more natural feel
          },
        });

        // Image: fade in while settling from scale 1.02 to 1.0
        if (img) {
          tl.to(
            img,
            {
              scale: 1,
              opacity: 1,
              duration: 2,
              ease: "power1.out",
            },
            0
          );
        }

        // Content: stagger in with subtle timing
        if (price) {
          tl.to(
            price,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power1.out",
            },
            0.3
          );
        }

        if (title) {
          tl.to(
            title,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power1.out",
            },
            0.5
          );
        }

        if (spec) {
          tl.to(
            spec,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power1.out",
            },
            0.7
          );
        }

        if (link) {
          tl.to(
            link,
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power1.out",
            },
            0.9
          );
        }
      });

      console.log("Quiet luxury room animations initialized");
    });
  },
};

// Nigerian Localization Data Object
const NIGERIAN_LOCALIZATION = {
  currency: {
    symbol: "₦",
    code: "NGN",
    format: "₦1,250,000"
  },
  location: {
    address: "No. 12, Emily Way, Victoria Island, Lagos",
    coordinates: {
      lat: 6.4474,
      lng: 3.4715
    },
    city: "Lagos",
    country: "Nigeria"
  },
  contact: {
    phone: "+234 (0) 1 888 0000",
    email: "reservations@emilyhotels.com",
    phoneDisplay: "+234 (0) 1 888 0000"
  },
  rooms: {
    gardenStudio: {
      name: "The Garden Studio",
      price: "₦280,000",
      priceNumeric: 280000
    },
    atlanticSuite: {
      name: "The Atlantic Suite",
      price: "₦600,000",
      priceNumeric: 600000
    },
    presidentialMonolith: {
      name: "The Presidential Monolith",
      price: "₦1,500,000",
      priceNumeric: 1500000
    }
  },
  features: {
    privateDining: "In-room private dining",
    powerArchitecture: "24/7 Uninterrupted Power Architecture",
    artisanalWoodwork: "Artisanal woodwork from Benin City"
  },
  narrative: {
    about: "Built as a testament to the Nigerian spirit—bold in stature, refined in detail. We are the quiet heart of the city's ambition.",
    hospitality: "Experience the warmth and stature of high-end Nigerian hospitality"
  },
  team: {
    masterChef: "Master Chef",
    artisanalCurator: "Artisanal Curator"
  }
};

// Export for use in other scripts
window.ROOMS_DATA = ROOMS_DATA;
window.RoomManager = RoomManager;
window.NIGERIAN_LOCALIZATION = NIGERIAN_LOCALIZATION;
