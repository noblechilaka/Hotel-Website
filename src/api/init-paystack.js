/**
 * INITIALIZE PAYSTACK API
 * Serverless function to initialize Paystack payment
 * Deploy to Vercel as /api/init-paystack.js
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

  if (!body.bookingId) {
    errors.push("Booking ID is required");
  }

  if (!body.email || !isValidEmail(body.email)) {
    errors.push("Valid email is required");
  }

  if (!body.amount || body.amount <= 0) {
    errors.push("Valid amount is required");
  }

  return errors;
}

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================
// GENERATE REFERENCE
// ============================================

function generateReference(prefix = "LH") {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

// ============================================
// INITIALIZE PAYSTACK TRANSACTION
// ============================================

async function initializePaystackTransaction(data) {
  const reference = generateReference("TXN");

  // Build metadata
  const metadata = {
    booking_id: data.bookingId,
    room_name: data.metadata?.room || "Hotel Booking",
    check_in: data.metadata?.checkIn || null,
    check_out: data.metadata?.checkOut || null,
    guests: data.metadata?.guests || 1,
    custom_fields: [
      {
        display_name: "Booking Reference",
        variable_name: "booking_reference",
        value: data.bookingId,
      },
    ],
  };

  const payload = {
    email: data.email,
    amount: Math.round(data.amount * 100), // Convert to kobo
    currency: "NGN",
    reference: reference,
    metadata: metadata,
    channels: ["card", "bank_transfer"],
    callback_url: `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/src/pages/confirmation.html`,
    iftb: false,
  };

  // If using subaccount
  if (process.env.PAYSTACK_SUBACCOUNT) {
    payload.subaccount = process.env.PAYSTACK_SUBACCOUNT;
    payload.bearer = "subaccount";
    payload.split_code = process.env.PAYSTACK_SPLIT_CODE;
  }

  // Make API request to Paystack
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.status) {
    throw new Error(result.message || "Failed to initialize transaction");
  }

  return {
    reference: result.data.reference,
    authorization_url: result.data.authorization_url,
    access_code: result.data.access_code,
  };
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

    // Check if Paystack is configured
    if (PAYSTACK_SECRET_KEY === "YOUR_PAYSTACK_SECRET_KEY") {
      // Demo mode - return mock response
      console.log("Paystack not configured. Demo mode active.");

      return successResponse({
        reference: generateReference("DEMO"),
        authorization_url: `https://checkout.paystack.com/demo-${body.bookingId}`,
        demo: true,
        message: "Demo mode - payment not processed",
      });
    }

    // Initialize Paystack transaction
    const transaction = await initializePaystackTransaction(body);

    return successResponse({
      reference: transaction.reference,
      authorization_url: transaction.authorization_url,
      access_code: transaction.access_code,
    });
  } catch (error) {
    console.error("Paystack initialization error:", error);

    return errorResponse(error.message || "Failed to initialize payment", 500);
  }
};

/*
// VERIFICATION EXAMPLE (for reference):
async function initializePaystackTransaction(data) {
    // ... existing code ...
    
    // Alternative: Use Paystack SDK
    const Paystack = require('paystack-node');
    const paystack = new Paystack(PAYSTACK_SECRET_KEY);
    
    const response = await paystack.transaction.initialize({
        email: data.email,
        amount: data.amount * 100,
        reference: generateReference(),
        metadata: {
            booking_id: data.bookingId
        }
    });
    
    return response;
}
*/
