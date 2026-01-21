/**
 * LUXURY HOTEL - Booking Module
 * Room selection, date management, and booking flow
 */

// ============================================
// BOOKING STATE
// ============================================

const BookingState = {
  currentStep: 1,
  totalSteps: 3,
  room: null,
  dates: {
    checkIn: null,
    checkOut: null,
  },
  guests: 1,
  guestDetails: {},
  price: {
    roomRate: 0,
    nights: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  },
};

// ============================================
// ROOM DATA
// ============================================

const roomsData = [
  {
    id: "room-1",
    name: "Ocean View Suite",
    slug: "ocean-view-suite",
    description:
      "A luxurious suite with panoramic ocean views, featuring a private terrace and elegant contemporary design.",
    short_description: "Panoramic ocean views with private terrace",
    price_per_night: 450,
    max_guests: 2,
    size: 65,
    bed_type: "King",
    amenities: [
      "Ocean View",
      "Private Terrace",
      "Mini Bar",
      "Free WiFi",
      "Room Service",
    ],
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200",
    ],
    featured_image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  },
  {
    id: "room-2",
    name: "Garden Retreat",
    slug: "garden-retreat",
    description:
      "Nestled within our lush tropical gardens, this sanctuary offers complete privacy and tranquility.",
    short_description: "Private sanctuary in tropical gardens",
    price_per_night: 320,
    max_guests: 2,
    size: 55,
    bed_type: "Queen",
    amenities: ["Garden View", "Rain Shower", "Private Garden", "Free WiFi"],
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
    ],
    featured_image:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
  },
  {
    id: "room-3",
    name: "Presidential Suite",
    slug: "presidential-suite",
    description:
      "The ultimate in luxury living with expansive space, exclusive amenities, and breathtaking views.",
    short_description: "Ultimate luxury with exclusive amenities",
    price_per_night: 1200,
    max_guests: 4,
    size: 150,
    bed_type: "King",
    amenities: [
      "Panoramic Views",
      "Private Pool",
      "Butler Service",
      "Jacuzzi",
      "Kitchen",
    ],
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
    ],
    featured_image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
  },
  {
    id: "room-4",
    name: "Beach Villa",
    slug: "beach-villa",
    description:
      "Direct beach access with your own private stretch of pristine shoreline and infinity pool.",
    short_description: "Direct beach access with private pool",
    price_per_night: 850,
    max_guests: 6,
    size: 200,
    bed_type: "King + Twins",
    amenities: [
      "Beach Access",
      "Private Pool",
      "Kitchen",
      "Butler Service",
      "Outdoor Lounge",
    ],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    ],
    featured_image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(date) {
  const options = { weekday: "short", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}

function formatShortDate(date) {
  const options = { month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculatePrice(room, nights, guests) {
  const roomRate = room.price_per_night;
  const subtotal = roomRate * nights;
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    roomRate,
    nights,
    subtotal,
    tax,
    total,
  };
}

// ============================================
// DATE PICKER
// ============================================

function initDatePicker() {
  const checkInInput = document.getElementById("checkInDate");
  const checkOutInput = document.getElementById("checkOutDate");
  const nightsDisplay = document.getElementById("nightsCount");
  const datePreview = document.getElementById("datePreview");

  if (!checkInInput || !checkOutInput) return;

  // Set minimum date to today
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  checkInInput.min = todayStr;
  checkOutInput.min = tomorrowStr;

  // Set default values
  if (!checkInInput.value) {
    checkInInput.value = todayStr;
  }
  if (!checkOutInput.value) {
    checkOutInput.value = tomorrowStr;
  }

  // Update on change
  checkInInput.addEventListener("change", () => {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);

    // Ensure checkOut is after checkIn
    if (checkOut <= checkIn) {
      const newCheckOut = new Date(checkIn);
      newCheckOut.setDate(newCheckOut.getDate() + 1);
      checkOutInput.value = newCheckOut.toISOString().split("T")[0];
    }

    checkOutInput.min = checkInInput.value;
    updateDateDisplay();
  });

  checkOutInput.addEventListener("change", updateDateDisplay);

  function updateDateDisplay() {
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;

    if (checkIn && checkOut) {
      const nights = calculateNights(checkIn, checkOut);

      if (nightsDisplay) {
        nightsDisplay.textContent =
          nights + (nights === 1 ? " Night" : " Nights");
      }

      if (datePreview) {
        datePreview.innerHTML = `
                    <span>${formatShortDate(checkIn)}</span>
                    <span class="text-gold">→</span>
                    <span>${formatShortDate(checkOut)}</span>
                `;
      }

      BookingState.dates.checkIn = checkIn;
      BookingState.dates.checkOut = checkOut;
      BookingState.price.nights = nights;

      updatePriceCalculation();
    }
  }

  // Initial display
  updateDateDisplay();
}

// ============================================
// GUEST SELECTOR
// ============================================

function initGuestSelector() {
  const guestInput = document.getElementById("guestCount");
  const guestDisplay = document.getElementById("guestDisplay");
  const decreaseBtn = document.getElementById("guestDecrease");
  const increaseBtn = document.getElementById("guestIncrease");

  if (!guestInput) return;

  const maxGuests = BookingState.room?.max_guests || 6;

  function updateGuests(count) {
    count = Math.max(1, Math.min(count, maxGuests));
    BookingState.guests = count;

    if (guestInput) guestInput.value = count;
    if (guestDisplay) guestDisplay.textContent = count;

    updatePriceCalculation();
  }

  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => {
      updateGuests(BookingState.guests - 1);
    });
  }

  if (increaseBtn) {
    increaseBtn.addEventListener("click", () => {
      updateGuests(BookingState.guests + 1);
    });
  }

  if (guestInput) {
    guestInput.addEventListener("change", (e) => {
      updateGuests(parseInt(e.target.value) || 1);
    });
  }
}

// ============================================
// PRICE CALCULATION
// ============================================

function updatePriceCalculation() {
  if (!BookingState.room) return;

  const { checkIn, checkOut } = BookingState.dates;
  const { guests } = BookingState;

  if (!checkIn || !checkOut) return;

  const nights = calculateNights(checkIn, checkOut);
  const price = calculatePrice(BookingState.room, nights, guests);

  BookingState.price = price;

  // Update display elements
  const roomRateEl = document.getElementById("roomRate");
  const nightsEl = document.getElementById("nightsCalc");
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("taxAmount");
  const totalEl = document.getElementById("totalAmount");

  if (roomRateEl) roomRateEl.textContent = Utils.formatCurrency(price.roomRate);
  if (nightsEl)
    nightsEl.textContent = `${nights} × ${Utils.formatCurrency(
      price.roomRate
    )}`;
  if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(price.subtotal);
  if (taxEl) taxEl.textContent = Utils.formatCurrency(price.tax);
  if (totalEl) totalEl.textContent = Utils.formatCurrency(price.total);
}

// ============================================
// PROGRESS STEPS
// ============================================

function updateProgressSteps() {
  const steps = document.querySelectorAll(".step");
  const connectors = document.querySelectorAll(".step-connector");

  steps.forEach((step, index) => {
    const stepNum = index + 1;

    step.classList.remove("active", "completed");

    if (stepNum < BookingState.currentStep) {
      step.classList.add("completed");
    } else if (stepNum === BookingState.currentStep) {
      step.classList.add("active");
    }
  });

  connectors.forEach((connector, index) => {
    if (index < BookingState.currentStep - 1) {
      connector.style.background = "var(--gold)";
    } else {
      connector.style.background = "var(--divider)";
    }
  });
}

function goToStep(step) {
  if (step < 1 || step > BookingState.totalSteps) return;

  // Hide current step
  const currentStepEl = document.getElementById(
    `step-${BookingState.currentStep}`
  );
  if (currentStepEl) {
    currentStepEl.style.display = "none";
  }

  // Show new step
  BookingState.currentStep = step;
  const newStepEl = document.getElementById(`step-${step}`);
  if (newStepEl) {
    newStepEl.style.display = "block";
    animateStepIn(newStepEl);
  }

  updateProgressSteps();
}

function animateStepIn(element) {
  gsap.fromTo(
    element,
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
  );
}

// ============================================
// ROOM DISPLAY
// ============================================

function displaySelectedRoom() {
  if (!BookingState.room) {
    // Try to get from URL params
    const params = Utils.getUrlParams();
    if (params.room) {
      BookingState.room =
        roomsData.find((r) => r.slug === params.room) || roomsData[0];
    } else {
      BookingState.room = roomsData[0];
    }
  }

  const room = BookingState.room;
  const roomDisplay = document.getElementById("selectedRoom");
  const roomName = document.getElementById("roomName");
  const roomPrice = document.getElementById("roomPrice");
  const roomImage = document.getElementById("roomImage");

  if (roomDisplay) roomDisplay.style.display = "flex";
  if (roomName) roomName.textContent = room.name;
  if (roomPrice)
    roomPrice.textContent = `${Utils.formatCurrency(
      room.price_per_night
    )} / night`;
  if (roomImage) roomImage.src = room.featured_image;

  // Store in booking state
  State.setBooking({ room });

  // Initialize price calculation
  updatePriceCalculation();
}

// ============================================
// ROOM SELECTION (ROOMS PAGE)
// ============================================

function initRoomCards() {
  const cards = document.querySelectorAll(".room-card-selectable");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const roomId = card.dataset.roomId;
      const room = roomsData.find((r) => r.id === roomId);

      if (room) {
        BookingState.room = room;
        State.setBooking({ room });

        // Update selection UI
        cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        // Update booking widget
        displaySelectedRoom();
      }
    });
  });
}

// ============================================
// VALIDATION
// ============================================

function validateStep1() {
  const checkIn = document.getElementById("checkInDate")?.value;
  const checkOut = document.getElementById("checkOutDate")?.value;
  const guests = document.getElementById("guestCount")?.value;

  if (!checkIn || !checkOut) {
    showError("Please select check-in and check-out dates");
    return false;
  }

  if (!guests || guests < 1) {
    showError("Please select number of guests");
    return false;
  }

  BookingState.dates.checkIn = checkIn;
  BookingState.dates.checkOut = checkOut;
  BookingState.guests = parseInt(guests);

  State.setBooking({
    dates: BookingState.dates,
    guests: BookingState.guests,
  });

  return true;
}

function validateStep2() {
  const fields = ["fullName", "email", "phone"];
  const required = {};

  fields.forEach((field) => {
    const input = document.getElementById(field);
    if (input?.value?.trim()) {
      required[field] = input.value.trim();
    }
  });

  if (!required.fullName) {
    showError("Please enter your full name");
    return false;
  }

  if (!required.email || !Utils.isValidEmail(required.email)) {
    showError("Please enter a valid email address");
    return false;
  }

  if (!required.phone || !Utils.isValidPhone(required.phone)) {
    showError("Please enter a valid phone number");
    return false;
  }

  BookingState.guestDetails = required;

  State.setBooking({
    guestDetails: BookingState.guestDetails,
  });

  return true;
}

function showError(message) {
  const container = document.getElementById("bookingError");
  if (container) {
    container.innerHTML = `<div class="alert alert-error">${message}</div>`;
    container.style.display = "block";

    setTimeout(() => {
      container.style.display = "none";
    }, 5000);
  }
}

// ============================================
// NAVIGATION
// ============================================

function initNavigationButtons() {
  const nextBtn = document.getElementById("nextStep");
  const backBtn = document.getElementById("backStep");
  const submitBtn = document.getElementById("submitBooking");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (BookingState.currentStep === 1 && validateStep1()) {
        goToStep(2);
      } else if (BookingState.currentStep === 2 && validateStep2()) {
        goToStep(3);
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (BookingState.currentStep > 1) {
        goToStep(BookingState.currentStep - 1);
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      initiatePayment();
    });
  }
}

// ============================================
// PAYMENT INITIATION
// ============================================

async function initiatePayment() {
  const submitBtn = document.getElementById("submitBooking");

  if (!submitBtn) return;

  // Show loading state
  submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
  submitBtn.disabled = true;

  try {
    // Create booking via API
    const bookingData = {
      roomId: BookingState.room.id,
      checkIn: BookingState.dates.checkIn,
      checkOut: BookingState.dates.checkOut,
      guests: BookingState.guests,
      guestName: BookingState.guestDetails.fullName,
      guestEmail: BookingState.guestDetails.email,
      guestPhone: BookingState.guestDetails.phone,
      totalPrice: BookingState.price.total,
    };

    const response = await fetch("/api/create-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Store booking ID
    const bookingId = result.data?.id || "demo-booking-" + Date.now();
    State.setBooking({ bookingId });

    // Initialize Paystack payment
    await initPaystackPayment(bookingId);
  } catch (error) {
    console.error("Booking error:", error);

    // For demo, proceed to payment
    showError("Demo mode: Proceeding to payment...");

    setTimeout(async () => {
      await initPaystackPayment("demo-booking-" + Date.now());
    }, 1500);
  } finally {
    submitBtn.innerHTML = "Continue to Payment";
    submitBtn.disabled = false;
  }
}

// ============================================
// PAYSTACK INTEGRATION
// ============================================

async function initPaystackPayment(bookingId) {
  try {
    const response = await fetch("/api/init-paystack", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: bookingId,
        email: BookingState.guestDetails.email,
        amount: BookingState.price.total,
        metadata: {
          bookingId: bookingId,
          room: BookingState.room.name,
        },
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // In demo mode, redirect to confirmation
    if (result.demo) {
      window.location.href = `/src/pages/confirmation.html?booking=${bookingId}`;
      return;
    }

    // Redirect to Paystack checkout
    if (result.data?.authorization_url) {
      window.location.href = result.data.authorization_url;
    }
  } catch (error) {
    console.error("Paystack init error:", error);

    // Demo fallback
    window.location.href = `/src/pages/confirmation.html?booking=${bookingId}`;
  }
}

// ============================================
// INITIALIZE BOOKING MODULE
// ============================================

function initBooking() {
  // Initialize date picker
  initDatePicker();

  // Initialize guest selector
  initGuestSelector();

  // Display selected room
  displaySelectedRoom();

  // Initialize room cards if on rooms page
  initRoomCards();

  // Initialize navigation
  initNavigationButtons();

  // Update progress
  updateProgressSteps();
}

// ============================================
// AUTO-INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Only initialize if on booking-related pages
  const isBookingPage = document.querySelector(
    ".booking-page, .booking-widget, #bookingForm"
  );
  const isRoomPage = document.querySelector(".rooms-page, .room-details-page");

  if (isBookingPage || isRoomPage) {
    initBooking();
  }
});

// ============================================
// EXPORT
// ============================================

window.Booking = {
  state: BookingState,
  rooms: roomsData,
  init: initBooking,
  goToStep,
  validateStep1,
  validateStep2,
  calculatePrice,
  calculateNights,
};
