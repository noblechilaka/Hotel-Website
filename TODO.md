# TODO: Make Header "BOOK NOW" Button Handle Bookings

## Status: ✅ Completed

### Changes Made

- [x] Update `public/index.html` - Add ID `bookNowBtn` and click handler
- [x] Update `src/pages/booking.html` - Add ID `bookNowBtn` and click handler

### Implementation Details

**public/index.html:**

- Added `id="bookNowBtn"` to header BOOK NOW button
- Added inline click handler that:
  - Sets default dates (today to tomorrow)
  - Stores booking data in sessionStorage
  - Redirects to booking.html

**src/pages/booking.html:**

- Added `id="bookNowBtn"` to header BOOK NOW button
- Added inline click handler that:
  - Ensures dates are set in sessionStorage
  - Scrolls smoothly to booking form

### Expected Behavior

- Click "BOOK NOW" on home page → Redirects to booking page with dates pre-filled (today/tomorrow, 2 guests)
- Click "BOOK NOW" on booking page → Ensures dates are set and scrolls to booking form
