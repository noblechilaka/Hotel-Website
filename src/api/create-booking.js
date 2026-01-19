/**
 * CREATE BOOKING API
 * Serverless function to create a new booking
 * Deploy to Vercel as /api/create-booking.js
 */

// ============================================
// SUPABASE CONFIGURATION (Server-side)
// ============================================

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY || "YOUR_SERVICE_ROLE_KEY";

// ============================================
// RESPONSE HELPERS
// ============================================

function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({ success: true, data }),
  };
}

function errorResponse(message, statusCode = 400) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({ success: false, error: message }),
  };
}

// ============================================
// VALIDATION
// ============================================

function validateBookingInput(body) {
  const errors = [];

  if (!body.roomId) {
    errors.push("Room ID is required");
  }

  if (!body.checkIn) {
    errors.push("Check-in date is required");
  } else if (isNaN(new Date(body.checkIn).getTime())) {
    errors.push("Invalid check-in date");
  }

  if (!body.checkOut) {
    errors.push("Check-out date is required");
  } else if (isNaN(new Date(body.checkOut).getTime())) {
    errors.push("Invalid check-out date");
  }

  if (body.checkIn && body.checkOut) {
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (checkOut <= checkIn) {
      errors.push("Check-out date must be after check-in date");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      errors.push("Check-in date cannot be in the past");
    }
  }

  if (!body.guests || body.guests < 1) {
    errors.push("At least 1 guest is required");
  }

  if (!body.guestName || body.guestName.trim().length < 2) {
    errors.push("Guest name is required");
  }

  if (!body.guestEmail || !isValidEmail(body.guestEmail)) {
    errors.push("Valid guest email is required");
  }

  if (!body.totalPrice || body.totalPrice <= 0) {
    errors.push("Valid total price is required");
  }

  return errors;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================
// DATABASE OPERATION
// ============================================

async function createBookingRecord(bookingData) {
  // In production, use Supabase client
  // For demo, return mock response

  const bookingId = "BK-" + Date.now().toString(36).toUpperCase();

  const booking = {
    id: bookingId,
    user_id: bookingData.userId || "guest",
    room_id: bookingData.roomId,
    check_in: bookingData.checkIn,
    check_out: bookingData.checkOut,
    guests: bookingData.guests,
    total_price: bookingData.totalPrice,
    guest_name: bookingData.guestName,
    guest_email: bookingData.guestEmail,
    guest_phone: bookingData.guestPhone || null,
    special_requests: bookingData.specialRequests || null,
    payment_status: "pending",
    booking_status: "confirmed",
    created_at: new Date().toISOString(),
  };

  return { data: booking, error: null };
}

// ============================================
// MAIN HANDLER
// ============================================

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);

    // Validate input
    const validationErrors = validateBookingInput(body);
    if (validationErrors.length > 0) {
      return errorResponse(validationErrors.join(", "), 400);
    }

    // Create booking
    const { data, error } = await createBookingRecord(body);

    if (error) {
      throw new Error(error.message || "Failed to create booking");
    }

    // Return success response
    return successResponse(
      {
        id: data.id,
        check_in: data.check_in,
        check_out: data.check_out,
        total_price: data.total_price,
        status: data.booking_status,
      },
      201
    );
  } catch (error) {
    console.error("Create booking error:", error);

    // Return error
    return errorResponse(
      error.message || "An error occurred while creating the booking",
      500
    );
  }
};

/*
// PRODUCTION SUPABASE CLIENT USAGE:
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createBookingRecord(bookingData) {
    const { data, error } = await supabase
        .from('bookings')
        .insert([{
            user_id: bookingData.userId || null,
            room_id: bookingData.roomId,
            check_in: bookingData.checkIn,
            check_out: bookingData.checkOut,
            guests: bookingData.guests,
            total_price: bookingData.totalPrice,
            guest_name: bookingData.guestName,
            guest_email: bookingData.guestEmail,
            guest_phone: bookingData.guestPhone || null,
            special_requests: bookingData.specialRequests || null,
            payment_status: 'pending',
            booking_status: 'confirmed'
        }])
        .select()
        .single();
    
    return { data, error };
}
*/
