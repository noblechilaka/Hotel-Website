/**
 * VERIFY PAYMENT API
 * Serverless function to verify Paystack transaction
 * Deploy to Vercel as /api/verify-payment.js
 */

// ============================================
// CONFIGURATION
// ============================================

const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY || "YOUR_PAYSTACK_SECRET_KEY";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function validateInput(body) {
  const errors = [];

  if (!body.reference) {
    errors.push("Transaction reference is required");
  }

  return errors;
}

// ============================================
// VERIFY TRANSACTION WITH PAYSTACK
// ============================================

async function verifyTransaction(reference) {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const result = await response.json();

  if (!result.status) {
    throw new Error(result.message || "Failed to verify transaction");
  }

  return {
    status: result.data.status,
    reference: result.data.reference,
    amount: result.data.amount / 100, // Convert from kobo
    currency: result.data.currency,
    paid_at: result.data.paid_at,
    customer: result.data.customer,
    metadata: result.data.metadata,
  };
}

// ============================================
// UPDATE BOOKING STATUS
// ============================================

async function updateBookingPaymentStatus(
  bookingId,
  paymentStatus,
  transactionRef
) {
  // In production, update Supabase
  // For demo, return mock response

  const booking = {
    id: bookingId,
    payment_status: paymentStatus,
    transaction_ref: transactionRef,
    updated_at: new Date().toISOString(),
  };

  return { data: booking, error: null };
}

// ============================================
// SEND CONFIRMATION EMAIL
// ============================================

async function sendConfirmationEmail(bookingDetails) {
  // In production, use SendGrid, Resend, or similar
  console.log("Sending confirmation email for booking:", bookingDetails.id);

  return { success: true };
}

// ============================================
// MAIN HANDLER
// ============================================

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);

    // Validate input
    const validationErrors = validateInput(body);
    if (validationErrors.length > 0) {
      return errorResponse(validationErrors.join(", "), 400);
    }

    const { reference } = body;

    // Check if Paystack is configured
    if (PAYSTACK_SECRET_KEY === "YOUR_PAYSTACK_SECRET_KEY") {
      // Demo mode
      console.log(
        "Paystack not configured. Demo mode - simulating verification."
      );

      return successResponse({
        status: "success",
        reference: reference,
        amount: 0,
        message: "Demo mode - payment verified (simulated)",
        demo: true,
      });
    }

    // Verify transaction with Paystack
    const transaction = await verifyTransaction(reference);

    // Extract booking ID from metadata
    const bookingId = transaction.metadata?.booking_id;

    if (!bookingId) {
      throw new Error("Booking ID not found in transaction metadata");
    }

    // Update booking status based on payment result
    let paymentStatus;

    if (transaction.status === "success") {
      paymentStatus = "paid";
    } else if (transaction.status === "pending") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "failed";
    }

    // Update database
    const { error } = await updateBookingPaymentStatus(
      bookingId,
      paymentStatus,
      reference
    );

    if (error) {
      throw new Error("Failed to update booking status");
    }

    // Send confirmation email if payment successful
    if (paymentStatus === "paid") {
      await sendConfirmationEmail({
        id: bookingId,
        reference: reference,
        amount: transaction.amount,
      });
    }

    return successResponse({
      status: transaction.status,
      reference: transaction.reference,
      booking_id: bookingId,
      payment_status: paymentStatus,
      amount: transaction.amount,
      paid_at: transaction.paid_at,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return errorResponse(error.message || "Failed to verify payment", 500);
  }
};

/*
// PRODUCTION DATABASE UPDATE EXAMPLE:
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function updateBookingPaymentStatus(bookingId, paymentStatus, transactionRef) {
    const { data, error } = await supabase
        .from('bookings')
        .update({
            payment_status: paymentStatus,
            transaction_ref: transactionRef,
            updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();
    
    return { data, error };
}

// EMAIL SENDING EXAMPLE (Resend):
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmationEmail(bookingDetails) {
    const { data, error } = await resend.emails.send({
        from: 'bookings@luxuryhotel.com',
        to: bookingDetails.customer_email,
        subject: 'Booking Confirmation - Luxury Hotel',
        html: `
            <h1>Booking Confirmed</h1>
            <p>Thank you for your booking!</p>
            <p>Booking Reference: ${bookingDetails.id}</p>
            <p>Transaction Reference: ${bookingDetails.reference}</p>
        `
    });
    
    return { data, error };
}
*/
