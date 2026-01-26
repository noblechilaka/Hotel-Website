/**
 * ============================================================================
 * SUPABASE FUNCTIONS (RPC) - Database Procedures
 * ============================================================================
 * 
 * These are PostgreSQL functions that can be called from your frontend using
 * Supabase's RPC (Remote Procedure Call) feature.
 * 
 * HOW TO USE:
 * 1. Go to Supabase Dashboard > SQL Editor
 * 2. Copy and paste this entire file
 * 3. Click "Run" to create all functions
 * 
 * FRONTEND USAGE EXAMPLE (JavaScript):
 * 
 * // Call a function with parameters
 * const { data, error } = await supabase.rpc('function_name', {
 *     param1: 'value1',
 *     param2: 'value2'
 * });
 * 
 * ============================================================================
 */


-- ============================================================================
-- SECTION 1: CHECK ROOM AVAILABILITY
-- ============================================================================
/*
 * Check if a room is available for a given date range.
 * 
 * PARAMETERS:
 * - room_uuid: UUID of the room to check
 * - check_in: Start date of the booking (YYYY-MM-DD)
 * - check_out: End date of the booking (YYYY-MM-DD)
 * 
 * RETURNS:
 * - Boolean: true if available, false if booked
 * 
 * LOGIC:
 * A room is available if there are NO overlapping bookings where:
 * - Existing booking starts before the requested check_out
 * - AND Existing booking ends after the requested check_in
 * - AND Existing booking is not cancelled
 */

CREATE OR REPLACE FUNCTION check_room_availability(
    room_uuid UUID,
    check_in DATE,
    check_out DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    -- Check if any non-cancelled booking overlaps with requested dates
    SELECT COUNT(*) = 0 INTO is_available
    FROM public.bookings
    WHERE room_id = room_uuid
      AND status != 'cancelled'
      AND (
          -- Date overlap condition:
          -- Existing booking's check-in is before requested check-out
          (check_in_date < check_out)
          -- AND Existing booking's check-out is after requested check-in
          AND (check_out_date > check_in)
      );
    
    RETURN COALESCE(is_available, true);
END;
$$;


-- Example usage in SQL:
-- SELECT check_room_availability('room-uuid-here', '2024-03-15', '2024-03-18');


-- ============================================================================
-- SECTION 2: GET AVAILABLE ROOMS FOR DATE RANGE
-- ============================================================================
/*
 * Get all rooms that are available for a given date range with optional filters.
 * 
 * PARAMETERS:
 * - filter_type: Room type to filter by (e.g., 'standard', 'deluxe', 'suite')
 *               Use NULL or empty string for all types
 * - check_in: Start date
 * - check_out: End date
 * - min_capacity: Minimum room capacity (default 1)
 * 
 * RETURNS:
 * - Table of available rooms with all their details
 */

CREATE OR REPLACE FUNCTION get_available_rooms(
    filter_type TEXT DEFAULT NULL,
    check_in DATE DEFAULT NULL,
    check_out DATE DEFAULT NULL,
    min_capacity INTEGER DEFAULT 1
)
RETURNS TABLE (
    id UUID,
    room_number TEXT,
    type TEXT,
    price_per_night NUMERIC,
    capacity INTEGER,
    amenities JSONB,
    images JSONB,
    is_available BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.room_number,
        r.type,
        r.price_per_night,
        r.capacity,
        r.amenities,
        r.images,
        r.is_available
    FROM public.rooms r
    WHERE 
        -- Filter by room type if specified
        (filter_type IS NULL OR filter_type = '' OR r.type = filter_type)
        -- Filter by capacity
        AND r.capacity >= min_capacity
        -- Room must be marked as available
        AND r.is_available = true
        -- Check date availability if dates provided
        AND (
            check_in IS NULL 
            OR check_out IS NULL 
            OR check_room_availability(r.id, check_in, check_out) = true
        )
    ORDER BY r.price_per_night ASC;
END;
$$;


-- Example usage in SQL:
-- SELECT * FROM get_available_rooms('deluxe', '2024-03-15', '2024-03-18', 2);


-- ============================================================================
-- SECTION 3: CALCULATE BOOKING TOTAL PRICE
-- ============================================================================
/*
 * Calculate the total price for a booking based on room rate and nights.
 * 
 * PARAMETERS:
 * - room_uuid: UUID of the room
 * - check_in: Arrival date
 * - check_out: Departure date
 * 
 * RETURNS:
 * - NUMERIC: Total price for the stay
 * 
 * NOTE:
 * The number of nights = check_out - check_in
 * Example: Check-in March 15, Check-out March 18 = 3 nights
 */

CREATE OR REPLACE FUNCTION calculate_booking_total(
    room_uuid UUID,
    check_in DATE,
    check_out DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    nights INTEGER;
    price_per_night NUMERIC;
    total NUMERIC;
BEGIN
    -- Calculate number of nights
    nights := check_out - check_in;
    
    -- Ensure at least 1 night
    nights := GREATEST(nights, 1);
    
    -- Get room price
    SELECT price_per_night INTO price_per_night
    FROM public.rooms
    WHERE id = room_uuid;
    
    -- Calculate total
    total := price_per_night * nights;
    
    RETURN total;
END;
$$;


-- Example usage in SQL:
-- SELECT calculate_booking_total('room-uuid', '2024-03-15', '2024-03-18');


-- ============================================================================
-- SECTION 4: CREATE BOOKING (Main Function)
-- ============================================================================
/*
 * Create a new booking only if the room is available.
 * This is the primary function for booking creation.
 * 
 * PARAMETERS:
 * - room_uuid: UUID of the room to book
 * - check_in: Arrival date (YYYY-MM-DD)
 * - check_out: Departure date (YYYY-MM-DD)
 * - guest_count: Number of guests (default 2)
 * - special_req: Optional special requests
 * 
 * RETURNS:
 * - JSON: { success: boolean, booking_id: uuid or null, message: string }
 * 
 * SECURITY:
 * - Uses auth.uid() to get the current logged-in user
 * - Returns error if user is not authenticated
 */

CREATE OR REPLACE FUNCTION create_booking(
    room_uuid UUID,
    check_in DATE,
    check_out DATE,
    guest_count INTEGER DEFAULT 2,
    special_req TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    booking_id UUID;
    total_price NUMERIC;
    room_capacity INTEGER;
    room_not_found BOOLEAN;
    result JSON;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'booking_id', NULL,
            'message', 'You must be logged in to create a booking'
        );
    END IF;
    
    -- Check if room exists and get capacity
    SELECT id, capacity INTO room_not_found, room_capacity
    FROM public.rooms
    WHERE id = room_uuid;
    
    IF room_not_found IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'booking_id', NULL,
            'message', 'Room not found'
        );
    END IF;
    
    -- Check guest count against room capacity
    IF guest_count > room_capacity THEN
        RETURN json_build_object(
            'success', false,
            'booking_id', NULL,
            'message', 'Guest count exceeds room capacity of ' || room_capacity
        );
    END IF;
    
    -- Validate dates
    IF check_out <= check_in THEN
        RETURN json_build_object(
            'success', false,
            'booking_id', NULL,
            'message', 'Check-out date must be after check-in date'
        );
    END IF;
    
    -- Check if room is available for the dates
    IF check_room_availability(room_uuid, check_in, check_out) = false THEN
        RETURN json_build_object(
            'success', false,
            'booking_id', NULL,
            'message', 'Room is not available for the selected dates'
        );
    END IF;
    
    -- Calculate total price
    total_price := calculate_booking_total(room_uuid, check_in, check_out);
    
    -- Create the booking
    INSERT INTO public.bookings (
        user_id,
        room_id,
        check_in_date,
        check_out_date,
        guests,
        special_requests,
        total_price,
        status
    ) VALUES (
        current_user_id,
        room_uuid,
        check_in,
        check_out,
        guest_count,
        special_req,
        total_price,
        'pending'
    )
    RETURNING id INTO booking_id;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'booking_id', booking_id,
        'message', 'Booking created successfully',
        'total_price', total_price
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Handle any errors
    RETURN json_build_object(
        'success', false,
        'booking_id', NULL,
        'message', 'Error creating booking: ' || SQLERRM
    );
END;
$$;


-- Example usage in SQL:
-- SELECT create_booking('room-uuid', '2024-03-15', '2024-03-18', 2, 'Late check-in');

-- Frontend usage:
-- const { data, error } = await supabase.rpc('create_booking', {
--     room_uuid: 'room-id-here',
--     check_in: '2024-03-15',
--     check_out: '2024-03-18',
--     guest_count: 2,
--     special_req: 'Late check-in please'
-- });


-- ============================================================================
-- SECTION 5: UPDATE BOOKING STATUS
-- ============================================================================
/*
 * Update the status of a booking (confirm, cancel, etc.)
 * 
 * PARAMETERS:
 * - booking_uuid: UUID of the booking to update
 * - new_status: New status ('pending', 'confirmed', 'cancelled')
 * 
 * RETURNS:
 * - JSON: { success: boolean, message: string }
 * 
 * VALID STATUS TRANSITIONS:
 * - pending -> confirmed (after payment)
 * - pending -> cancelled (user cancels)
 * - confirmed -> cancelled (with refund policy - not implemented here)
 */

CREATE OR REPLACE FUNCTION update_booking_status(
    booking_uuid UUID,
    new_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    current_status TEXT;
    is_owner BOOLEAN;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check authentication
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You must be logged in to update a booking'
        );
    END IF;
    
    -- Validate status
    IF new_status NOT IN ('pending', 'confirmed', 'cancelled') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid status. Must be: pending, confirmed, or cancelled'
        );
    END IF;
    
    -- Check if booking exists and get current status
    SELECT status INTO current_status
    FROM public.bookings
    WHERE id = booking_uuid;
    
    IF current_status IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Booking not found'
        );
    END IF;
    
    -- Check if user owns this booking
    SELECT true INTO is_owner
    FROM public.bookings
    WHERE id = booking_uuid AND user_id = current_user_id;
    
    IF is_owner IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You do not have permission to update this booking'
        );
    END IF;
    
    -- Validate status transitions
    IF current_status = 'cancelled' THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Cannot update a cancelled booking'
        );
    END IF;
    
    -- If confirming, check it's currently pending
    IF new_status = 'confirmed' AND current_status != 'pending' THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Can only confirm pending bookings'
        );
    END IF;
    
    -- Update the booking status
    UPDATE public.bookings
    SET status = new_status, updated_at = NOW()
    WHERE id = booking_uuid;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Booking status updated to ' || new_status
    );
END;
$$;


-- ============================================================================
-- SECTION 6: CANCEL BOOKING
-- ============================================================================
/*
 * Cancel a booking. Shorthand for update_booking_status with 'cancelled'.
 * 
 * PARAMETERS:
 * - booking_uuid: UUID of the booking to cancel
 * 
 * RETURNS:
 * - JSON: { success: boolean, message: string }
 */

CREATE OR REPLACE FUNCTION cancel_booking(booking_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
    -- Just call update_booking_status with 'cancelled'
    PERFORM update_booking_status(booking_uuid, 'cancelled');
    
    -- Check if update was successful by checking if it's now cancelled
    IF EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_uuid AND status = 'cancelled') THEN
        RETURN json_build_object(
            'success', true,
            'message', 'Booking cancelled successfully'
        );
    ELSE
        RETURN json_build_object(
            'success', false,
            'message', 'Could not cancel booking'
        );
    END IF;
END;
$$;


-- ============================================================================
-- SECTION 7: CREATE PAYMENT RECORD
-- ============================================================================
/*
 * Create a payment record for a booking.
 * 
 * PARAMETERS:
 * - booking_uuid: UUID of the booking to pay for
 * - amount: Payment amount (should match booking total)
 * - payment_method: Payment method ('card', 'paypal', 'bank')
 * 
 * RETURNS:
 * - JSON: { success: boolean, payment_id: uuid, message: string }
 * 
 * NOTE:
 * This only creates the payment record. Use process_payment()
 * to mark it as paid after successful payment processing.
 */

CREATE OR REPLACE FUNCTION create_payment(
    booking_uuid UUID,
    amount NUMERIC,
    payment_method TEXT DEFAULT 'card'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    booking_total NUMERIC;
    payment_id UUID;
    is_owner BOOLEAN;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check authentication
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'payment_id', NULL,
            'message', 'You must be logged in to make a payment'
        );
    END IF;
    
    -- Validate payment method
    IF payment_method NOT IN ('card', 'paypal', 'bank') THEN
        RETURN json_build_object(
            'success', false,
            'payment_id', NULL,
            'message', 'Invalid payment method. Use: card, paypal, or bank'
        );
    END IF;
    
    -- Check if booking exists and get total
    SELECT total_price INTO booking_total
    FROM public.bookings
    WHERE id = booking_uuid;
    
    IF booking_total IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'payment_id', NULL,
            'message', 'Booking not found'
        );
    END IF;
    
    -- Check if user owns this booking
    SELECT true INTO is_owner
    FROM public.bookings
    WHERE id = booking_uuid AND user_id = current_user_id;
    
    IF is_owner IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'payment_id', NULL,
            'message', 'You do not have permission to pay for this booking'
        );
    END IF;
    
    -- Verify amount matches booking total
    IF amount != booking_total THEN
        RETURN json_build_object(
            'success', false,
            'payment_id', NULL,
            'message', 'Payment amount must match booking total: ' || booking_total
        );
    END IF;
    
    -- Check if booking is pending
    IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_uuid AND status = 'pending') THEN
        RETURN json_build_object(
            'success', false,
            'payment_id', NULL,
            'message', 'Booking is not pending. Current status: ' || 
                      (SELECT status FROM public.bookings WHERE id = booking_uuid)
        );
    END IF;
    
    -- Create payment record
    INSERT INTO public.payments (booking_id, amount, method, status)
    VALUES (booking_uuid, amount, payment_method, 'pending')
    RETURNING id INTO payment_id;
    
    RETURN json_build_object(
        'success', true,
        'payment_id', payment_id,
        'message', 'Payment record created. Complete payment to confirm booking.',
        'amount', amount
    );
END;
$$;


-- ============================================================================
-- SECTION 8: PROCESS PAYMENT (After Payment Gateway Success)
-- ============================================================================
/*
 * Process a payment: mark as paid and update booking status.
 * Call this after successful payment gateway confirmation.
 * 
 * PARAMETERS:
 * - payment_uuid: UUID of the payment to process
 * - transaction_ref: Optional reference from payment provider
 * 
 * RETURNS:
 * - JSON: { success: boolean, message: string }
 */

CREATE OR REPLACE FUNCTION process_payment(
    payment_uuid UUID,
    transaction_ref TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_id UUID;
    booking_uuid UUID;
    is_owner BOOLEAN;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check authentication
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You must be logged in to process payments'
        );
    END IF;
    
    -- Get booking ID from payment
    SELECT booking_id INTO booking_uuid
    FROM public.payments
    WHERE id = payment_uuid;
    
    IF booking_uuid IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Payment not found'
        );
    END IF;
    
    -- Check if user owns the booking
    SELECT true INTO is_owner
    FROM public.bookings
    WHERE id = booking_uuid AND user_id = current_user_id;
    
    IF is_owner IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You do not have permission to process this payment'
        );
    END IF;
    
    -- Check if payment is still pending
    IF NOT EXISTS (
        SELECT 1 FROM public.payments 
        WHERE id = payment_uuid AND status = 'pending'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Payment has already been processed'
        );
    END IF;
    
    -- Update payment status to 'paid'
    UPDATE public.payments
    SET status = 'paid', transaction_ref = transaction_ref, updated_at = NOW()
    WHERE id = payment_uuid;
    
    -- Update booking status to 'confirmed'
    UPDATE public.bookings
    SET status = 'confirmed', updated_at = NOW()
    WHERE id = booking_uuid;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Payment processed successfully. Your booking is confirmed!'
    );
END;
$$;


-- ============================================================================
-- SECTION 9: GET USER'S BOOKINGS
-- ============================================================================
/*
 * Get all bookings for the current logged-in user.
 * Includes room details for each booking.
 * 
 * PARAMETERS:
 * - status_filter: Filter by status ('pending', 'confirmed', 'cancelled')
 *                  Use NULL or empty for all statuses
 * 
 * RETURNS:
 * - Table of bookings with room information
 */

CREATE OR REPLACE FUNCTION get_user_bookings(status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    booking_id UUID,
    check_in DATE,
    check_out DATE,
    guests INTEGER,
    total_price NUMERIC,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    room_id UUID,
    room_number TEXT,
    room_type TEXT,
    room_image TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'You must be logged in to view bookings';
    END IF;
    
    RETURN QUERY
    SELECT 
        b.id AS booking_id,
        b.check_in_date,
        b.check_out_date,
        b.guests,
        b.total_price,
        b.status,
        b.created_at,
        r.id AS room_id,
        r.room_number,
        r.type AS room_type,
        r.images->>[0] AS room_image  -- Get first image from JSONB array
    FROM public.bookings b
    INNER JOIN public.rooms r ON b.room_id = r.id
    WHERE b.user_id = auth.uid()
        AND (status_filter IS NULL OR status_filter = '' OR b.status = status_filter)
    ORDER BY b.created_at DESC;
END;
$$;


-- ============================================================================
-- SECTION 10: GET USER'S PAYMENT HISTORY
-- ============================================================================
/*
 * Get all payments for the current logged-in user.
 * 
 * RETURNS:
 * - Table of payments with booking information
 */

CREATE OR REPLACE FUNCTION get_user_payments()
RETURNS TABLE (
    payment_id UUID,
    amount NUMERIC,
    status TEXT,
    method TEXT,
    transaction_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    booking_id UUID,
    check_in DATE,
    check_out DATE,
    room_number TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check authentication
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'You must be logged in to view payments';
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id AS payment_id,
        p.amount,
        p.status,
        p.method,
        p.transaction_ref,
        p.created_at,
        b.id AS booking_id,
        b.check_in_date,
        b.check_out_date,
        r.room_number
    FROM public.payments p
    INNER JOIN public.bookings b ON p.booking_id = b.id
    INNER JOIN public.rooms r ON b.room_id = r.id
    WHERE b.user_id = auth.uid()
    ORDER BY p.created_at DESC;
END;
$$;


-- ============================================================================
-- SECTION 11: GET SINGLE BOOKING DETAILS
-- ============================================================================
/*
 * Get detailed information about a single booking.
 * 
 * PARAMETERS:
 * - booking_uuid: UUID of the booking
 * 
 * RETURNS:
 * - JSON: Booking details with room and payment info
 */

CREATE OR REPLACE FUNCTION get_booking_details(booking_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'You must be logged in'
        );
    END IF;
    
    -- Get booking with room and payment details
    SELECT json_build_object(
        'success', true,
        'booking', json_build_object(
            'id', b.id,
            'check_in', b.check_in_date,
            'check_out', b.check_out_date,
            'guests', b.guests,
            'total_price', b.total_price,
            'status', b.status,
            'special_requests', b.special_requests,
            'created_at', b.created_at,
            'room', json_build_object(
                'id', r.id,
                'number', r.room_number,
                'type', r.type,
                'amenities', r.amenities,
                'image', r.images->>[0]
            ),
            'payments', (
                SELECT json_agg(json_build_object(
                    'id', p.id,
                    'amount', p.amount,
                    'status', p.status,
                    'method', p.method,
                    'created_at', p.created_at
                ))
                FROM public.payments p
                WHERE p.booking_id = b.id
            )
        )
    ) INTO result
    FROM public.bookings b
    INNER JOIN public.rooms r ON b.room_id = r.id
    WHERE b.id = booking_uuid AND b.user_id = current_user_id;
    
    RETURN COALESCE(result, json_build_object('success', false, 'message', 'Booking not found'));
END;
$$;


-- ============================================================================
-- SECTION 12: GET ROOM DETAILS
-- ============================================================================
/*
 * Get detailed information about a single room.
 * 
 * PARAMETERS:
 * - room_uuid: UUID of the room
 * 
 * RETURNS:
 * - JSON: Room details
 */

CREATE OR REPLACE FUNCTION get_room_details(room_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', r.id,
        'room_number', r.room_number,
        'type', r.type,
        'price_per_night', r.price_per_night,
        'capacity', r.capacity,
        'amenities', r.amenities,
        'images', r.images,
        'is_available', r.is_available
    ) INTO result
    FROM public.rooms r
    WHERE r.id = room_uuid;
    
    RETURN COALESCE(result, json_build_object('error', 'Room not found'));
END;
$$;


-- ============================================================================
-- SECTION 13: HELPER - COUNT ROOMS BY TYPE
-- ============================================================================
/*
 * Get count of available rooms by type.
 * Useful for displaying room availability summary.
 * 
 * RETURNS:
 * - Table with room type and available count
 */

CREATE OR REPLACE FUNCTION get_room_availability_summary()
RETURNS TABLE (
    room_type TEXT,
    total_rooms INTEGER,
    available_rooms INTEGER,
    starting_price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.type,
        COUNT(*) AS total_rooms,
        COUNT(*) FILTER (WHERE r.is_available = true) AS available_rooms,
        MIN(r.price_per_night) AS starting_price
    FROM public.rooms r
    GROUP BY r.type
    ORDER BY MIN(r.price_per_night) ASC;
END;
$$;


-- ============================================================================
-- SECTION 14: CLEANUP - DROP FUNCTIONS
-- ============================================================================
/*
 * Uncomment to remove all custom functions (for testing/reset):
 */

/*
DROP FUNCTION IF EXISTS check_room_availability(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_available_rooms(TEXT, DATE, DATE, INTEGER);
DROP FUNCTION IF EXISTS calculate_booking_total(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS create_booking(UUID, DATE, DATE, INTEGER, TEXT);
DROP FUNCTION IF EXISTS update_booking_status(UUID, TEXT);
DROP FUNCTION IF EXISTS cancel_booking(UUID);
DROP FUNCTION IF EXISTS create_payment(UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS process_payment(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_bookings(TEXT);
DROP FUNCTION IF EXISTS get_user_payments();
DROP FUNCTION IF EXISTS get_booking_details(UUID);
DROP FUNCTION IF EXISTS get_room_details(UUID);
DROP FUNCTION IF EXISTS get_room_availability_summary();
*/


-- ============================================================================
-- END OF FUNCTIONS FILE
-- ============================================================================
/*
 * NEXT STEPS:
 * 1. Run this file in Supabase SQL Editor
 * 2. Test functions with sample data
 * 3. Integrate with frontend using the JavaScript SDK
 * 
 * See integration.js for frontend code examples!
 */

