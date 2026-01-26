# Hotel Booking System - Supabase Backend

Complete backend implementation for a hotel booking website using Supabase.

## Project Structure

```
api/
├── database/
│   ├── schema.sql      # Database tables, RLS policies, sample data
│   └── functions.sql   # Supabase Functions (RPC) for business logic
├── frontend/
│   └── integration.js  # JavaScript SDK for frontend integration
└── README.md           # This file
```

## Quick Setup

### Step 1: Create Supabase Project

1. Go to supabase.com and create an account
2. Create a new project
3. Get your project URL and anon key from Settings > API

### Step 2: Run Database Schema

1. In Supabase Dashboard, go to SQL Editor
2. Copy and paste api/database/schema.sql
3. Click Run

### Step 3: Create Database Functions

1. In Supabase Dashboard, go to SQL Editor
2. Copy and paste api/database/functions.sql
3. Click Run

### Step 4: Configure Frontend

Open api/frontend/integration.js and replace:

```javascript
this.config = {
  supabaseUrl: "https://your-project.supabase.co",
  supabaseKey: "your-anon-key-here",
};
```

## API Reference

### Authentication

```javascript
// Sign up
const result = await HotelBooking.auth.signUp(email, password, {
  full_name: "John Doe",
});

// Sign in
const result = await HotelBooking.auth.signIn(email, password);

// Sign out
const result = await HotelBooking.auth.signOut();

// Check if logged in
const isLoggedIn = await HotelBooking.auth.isLoggedIn();

// Get current user
const user = await HotelBooking.auth.getUser();
```

### Rooms

```javascript
// Get all rooms
const result = await HotelBooking.rooms.getAll();

// Filter by type
const result = await HotelBooking.rooms.getAll({ type: "deluxe" });

// Get available rooms for dates
const result = await HotelBooking.rooms.getAll({
  checkIn: new Date("2024-03-15"),
  checkOut: new Date("2024-03-18"),
});

// Get single room
const result = await HotelBooking.rooms.getById(roomId);

// Check availability
const available = await HotelBooking.rooms.checkAvailability(
  roomId,
  checkIn,
  checkOut
);
```

### Bookings

```javascript
// Create booking
const result = await HotelBooking.bookings.create({
  roomId: "room-uuid",
  checkIn: new Date("2024-03-15"),
  checkOut: new Date("2024-03-18"),
  guests: 2,
  specialRequests: "Late check-in please",
});

// Get user's bookings
const result = await HotelBooking.bookings.getAll();

// Cancel booking
const result = await HotelBooking.bookings.cancel(bookingId);
```

### Payments

```javascript
// Create payment record
const result = await HotelBooking.payments.create({
  bookingId: "booking-uuid",
  amount: 449.97,
  method: "card",
});

// Confirm payment
const result = await HotelBooking.payments.confirm(
  paymentId,
  "transaction-ref"
);

// Get payment history
const result = await HotelBooking.payments.getHistory();
```

### Protected Routes

```javascript
await HotelBooking.protected.requireAuth("/login.html");
```

## Complete Booking Flow

```javascript
async function makeBooking(roomId, checkIn, checkOut, guests) {
  // Step 1: Check availability
  const available = await HotelBooking.rooms.checkAvailability(
    roomId,
    checkIn,
    checkOut
  );
  if (!available) throw new Error("Room not available");

  // Step 2: Create booking
  const booking = await HotelBooking.bookings.create({
    roomId,
    checkIn,
    checkOut,
    guests,
  });
  if (!booking.success) throw new Error(booking.message);

  // Step 3: Create payment record
  const payment = await HotelBooking.payments.create({
    bookingId: booking.bookingId,
    amount: booking.totalPrice,
    method: "card",
  });

  // Step 4: Process with payment provider (Paystack/Stripe)
  // Step 5: Confirm payment
  await HotelBooking.payments.confirm(payment.paymentId, providerReference);

  return { bookingId: booking.bookingId, paymentId: payment.paymentId };
}
```

## Database Schema

### users table

- id (UUID, PK) - Linked to auth.users
- email (TEXT, unique)
- phone (TEXT, unique)
- full_name (TEXT)
- avatar_url (TEXT)
- email_confirmed (BOOLEAN)
- phone_confirmed (BOOLEAN)

### rooms table

- id (UUID, PK)
- room_number (TEXT, unique)
- type (TEXT) - standard/deluxe/suite
- price_per_night (NUMERIC)
- capacity (INTEGER)
- amenities (JSONB)
- images (JSONB)
- is_available (BOOLEAN)

### bookings table

- id (UUID, PK)
- user_id (UUID, FK -> users)
- room_id (UUID, FK -> rooms)
- check_in_date (DATE)
- check_out_date (DATE)
- total_price (NUMERIC)
- status (TEXT) - pending/confirmed/cancelled
- guests (INTEGER)

### payments table

- id (UUID, PK)
- booking_id (UUID, FK -> bookings)
- amount (NUMERIC)
- status (TEXT) - pending/paid/failed
- method (TEXT) - card/paypal/bank
- transaction_ref (TEXT)

## Security

RLS policies ensure:

- Users can only view/edit their own profile
- Bookings are only visible to the owner
- Payments are only visible to the payer
- Rooms are publicly readable

## Testing

1. Run SQL files in Supabase SQL Editor
2. Test signup/login with the frontend
3. Create bookings and verify in Supabase Dashboard
4. Test RLS by creating multiple users
