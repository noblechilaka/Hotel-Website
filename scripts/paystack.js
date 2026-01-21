/**
 * LUXURY HOTEL - Paystack Integration
 * Payment processing with Paystack API
 */

// ============================================
// PAYSTACK CONFIGURATION
// ============================================

const PAYSTACK_CONFIG = {
  // REPLACE WITH YOUR PAYSTACK PUBLIC KEY
  PUBLIC_KEY: "YOUR_PAYSTACK_PUBLIC_KEY",

  // Payment methods
  METHODS: {
    CARD: "card",
    BANK_TRANSFER: "bank_transfer",
    BOTH: "both",
  },
};

// ============================================
// PAYMENT STATE
// ============================================

const PaymentState = {
  transactionRef: null,
  bookingId: null,
  amount: 0,
  email: "",
  completed: false,
  initializing: false,
};

// ============================================
// LOAD PAYSTACK SCRIPT
// ============================================

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.head.appendChild(script);
  });
}

// ============================================
// INITIALIZE PAYMENT
// ============================================

async function initPaystackPayment(options) {
  const {
    bookingId,
    email,
    amount,
    currency = "NGN",
    metadata = {},
    onSuccess,
    onCancel,
  } = options;

  // Validate configuration
  if (PAYSTACK_CONFIG.PUBLIC_KEY === "YOUR_PAYSTACK_PUBLIC_KEY") {
    console.warn("Paystack public key not configured. Using demo mode.");
    return handleDemoPayment(bookingId, amount);
  }

  PaymentState.bookingId = bookingId;
  PaymentState.amount = amount;
  PaymentState.email = email;
  PaymentState.initializing = true;

  try {
    // Load Paystack script
    await loadPaystackScript();

    const paystack = window.PaystackPop.setup({
      key: PAYSTACK_CONFIG.PUBLIC_KEY,
      email: email,
      amount: amount * 100, // Paystack uses kobo (smallest currency unit)
      currency: currency,
      ref: generateTransactionRef(),
      metadata: {
        booking_id: bookingId,
        ...metadata,
      },
      channels: [
        PAYSTACK_CONFIG.METHODS.CARD,
        PAYSTACK_CONFIG.METHODS.BANK_TRANSFER,
      ],

      callback: async (response) => {
        PaymentState.transactionRef = response.reference;
        PaymentState.completed = true;

        // Verify payment
        await verifyPayment(response.reference);

        if (onSuccess) {
          onSuccess(response);
        }
      },

      onClose: () => {
        PaymentState.initializing = false;

        if (onCancel) {
          onCancel();
        } else {
          showPaymentMessage("Payment was cancelled", "info");
        }
      },
    });

    paystack.openIframe();
  } catch (error) {
    console.error("Paystack initialization error:", error);

    // Fallback to demo mode
    handleDemoPayment(bookingId, amount);
  }
}

// ============================================
// GENERATE TRANSACTION REFERENCE
// ============================================

function generateTransactionRef() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `LH_${timestamp}_${random}`.toUpperCase();
}

// ============================================
// VERIFY PAYMENT
// ============================================

async function verifyPayment(transactionRef) {
  try {
    const response = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: transactionRef,
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Handle based on payment status
    if (result.data?.status === "success") {
      // Payment successful
      window.location.href = `/src/pages/confirmation.html?booking=${PaymentState.bookingId}&ref=${transactionRef}`;
    } else {
      // Payment failed or pending
      showPaymentMessage(
        "Payment verification failed. Please contact support.",
        "error"
      );
    }

    return result;
  } catch (error) {
    console.error("Payment verification error:", error);

    // In demo mode, redirect to confirmation
    window.location.href = `/src/pages/confirmation.html?booking=${PaymentState.bookingId}&ref=${transactionRef}&demo=true`;
  }
}

// ============================================
// DEMO PAYMENT (FALLBACK)
// ============================================

function handleDemoPayment(bookingId, amount) {
  console.log("Demo payment processing for booking:", bookingId);

  // Simulate payment processing
  const transactionRef = generateTransactionRef();

  showPaymentMessage("Demo mode: Payment successful!", "success");

  // Store demo payment info
  State.setBooking({
    paymentStatus: "paid",
    transactionRef: transactionRef,
    paymentMethod: "demo",
  });

  // Redirect to confirmation page
  setTimeout(() => {
    window.location.href = `/src/pages/confirmation.html?booking=${bookingId}&ref=${transactionRef}&demo=true`;
  }, 2000);
}

// ============================================
// UI HELPERS
// ============================================

function showPaymentMessage(message, type = "info") {
  const container =
    document.getElementById("paymentMessage") ||
    document.getElementById("bookingMessage") ||
    document.body;

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.style.cssText =
    "position: fixed; top: 100px; right: 20px; z-index: 9999; max-width: 400px;";
  alert.innerHTML = message;

  container.appendChild(alert);

  // Auto remove
  setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.transform = "translateX(100px)";
    alert.style.transition = "all 0.3s ease";

    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// ============================================
// DIRECT CARD PAYMENT
// ============================================

async function initDirectCardPayment(options) {
  const { cardNumber, expiryMonth, expiryYear, cvv, amount, email, bookingId } =
    options;

  // Basic validation
  if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
    throw new Error("Please fill in all card details");
  }

  if (cardNumber.length < 13) {
    throw new Error("Invalid card number");
  }

  // In production, use Paystack's direct charge API
  // This is a simplified example for demonstration
  return await initPaystackPayment({
    bookingId,
    email,
    amount,
    onSuccess: (response) => {
      console.log("Payment successful:", response);
    },
    onCancel: () => {
      console.log("Payment cancelled");
    },
  });
}

// ============================================
// BANK TRANSFER OPTION
// ============================================

function showBankTransferDetails(bookingId, amount) {
  const container = document.getElementById("bankTransferDetails");

  if (!container) return;

  const transferRef = `LH/BNK/${bookingId.substring(0, 8).toUpperCase()}`;
  const accountNumber = "1234567890"; // Your bank account
  const bankName = "Demo Bank";

  container.innerHTML = `
        <div class="bank-transfer-info">
            <h4 class="section-title" style="font-size: 1.25rem; margin-bottom: 1rem;">Bank Transfer Details</h4>
            
            <div class="transfer-details" style="margin-bottom: 1.5rem;">
                <div class="transfer-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--divider);">
                    <span class="meta-text">Bank Name</span>
                    <span class="body-text">${bankName}</span>
                </div>
                <div class="transfer-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--divider);">
                    <span class="meta-text">Account Number</span>
                    <span class="body-text">${accountNumber}</span>
                </div>
                <div class="transfer-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--divider);">
                    <span class="meta-text">Account Name</span>
                    <span class="body-text">Luxury Hotel NG</span>
                </div>
                <div class="transfer-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--divider);">
                    <span class="meta-text">Transfer Reference</span>
                    <span class="body-text text-gold">${transferRef}</span>
                </div>
                <div class="transfer-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0;">
                    <span class="meta-text">Amount</span>
                    <span class="body-text text-gold" style="font-size: 1.25rem;">${Utils.formatCurrency(
                      amount
                    )}</span>
                </div>
            </div>
            
            <div class="alert alert-info" style="margin-bottom: 1rem;">
                <p style="font-size: 0.875rem;">Please include the transfer reference in your payment description. Your booking will be confirmed once payment is verified.</p>
            </div>
            
            <button class="btn btn-primary gold" onclick="confirmBankTransfer('${bookingId}')" style="width: 100%;">
                I've Made the Transfer
            </button>
        </div>
    `;

  container.style.display = "block";

  // Animate in
  gsap.from(container, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: "power2.out",
  });
}

// ============================================
// CONFIRM BANK TRANSFER
// ============================================

async function confirmBankTransfer(bookingId) {
  const btn = document.querySelector("#bankTransferDetails button");

  if (!btn) return;

  btn.innerHTML = '<span class="spinner"></span> Verifying...';
  btn.disabled = true;

  try {
    // In production, this would verify with your backend
    // For demo, show success

    showPaymentMessage(
      "Transfer confirmation received. Your booking will be confirmed shortly.",
      "success"
    );

    setTimeout(() => {
      window.location.href = `/src/pages/confirmation.html?booking=${bookingId}&method=bank_transfer`;
    }, 2000);
  } catch (error) {
    showPaymentMessage(
      "Verification failed. Please try again or contact support.",
      "error"
    );
    btn.innerHTML = "I've Made the Transfer";
    btn.disabled = false;
  }
}

// ============================================
// PAYMENT METHOD SELECTION
// ============================================

function initPaymentMethodSelector() {
  const methods = document.querySelectorAll(".payment-method");
  const cardForm = document.getElementById("cardPaymentForm");
  const bankTransfer = document.getElementById("bankTransferOption");

  if (!methods.length) return;

  methods.forEach((method) => {
    method.addEventListener("click", () => {
      // Remove active class from all
      methods.forEach((m) => m.classList.remove("active"));

      // Add to selected
      method.classList.add("active");

      // Show/hide forms
      const methodType = method.dataset.method;

      if (cardForm) {
        cardForm.style.display = methodType === "card" ? "block" : "none";
      }

      if (bankTransfer) {
        bankTransfer.style.display =
          methodType === "bank_transfer" ? "block" : "none";
      }
    });
  });
}

// ============================================
// INIT PAYSTACK MODULE
// ============================================

function initPaystackModule() {
  initPaymentMethodSelector();

  // Show bank transfer option if needed
  const bankTransferContainer = document.getElementById("bankTransferDetails");
  if (bankTransferContainer && window.Booking?.state?.bookingId) {
    showBankTransferDetails(
      window.Booking.state.bookingId,
      window.Booking.state.price?.total || 0
    );
  }
}

// ============================================
// AUTO-INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initPaystackModule();
});

// ============================================
// EXPORT
// ============================================

window.PaystackIntegration = {
  init: initPaystackPayment,
  verify: verifyPayment,
  showBankTransfer: showBankTransferDetails,
  confirmBankTransfer,
  config: PAYSTACK_CONFIG,
  state: PaymentState,
};
