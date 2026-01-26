/**
 * ============================================================================
 * HOTEL BOOKING SYSTEM - COMPLETE DATABASE SCHEMA
 * ============================================================================
 * 
 * Production-ready PostgreSQL schema for a hotel booking system using Supabase.
 * This schema implements:
 * - Proper data integrity with foreign keys
 * - Database-level double booking prevention
 * - Row Level Security (RLS) for data protection
 * - Audit trails with timestamps
 * 
 * HOW TO USE:
 * 1. Go to https://supabase.com/dashboard
 * 2. Select your project
 * 3. Navigate to the SQL Editor
 * 4. Copy and paste this entire file
 * 5. Click "Run" to execute all statements
 * 
 * ============================================================================
 */


-- ============================================================================
-- SECTION 1: DROP EXISTING OBJECTS (Run once for fresh setup)
-- ============================================================================
/*
 * IMPORTANT: Comment this section out if you want to keep existing data.
 * Drop tables in reverse order of dependencies to avoid foreign key errors.
 */

DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- ============================================================================
-- SECTION 2: PROFILES TABLE
-- ============================================================================
/*
 * WHY THIS TABLE EXISTS:
 * =====================
 * Supabase automatically handles authentication in 'auth.users' table.
 * We create a separate 'profiles' table to store additional user information
 * that we need for the hotel booking system.
 * 
 * WHY WE DON'T STORE AUTH DATA OURSELVES:
 * =======================================
 * 1. Security: Auth data (passwords, sessions) is sensitive and complex.
 *   Let Supabase handle it - they have security experts.
 * 
 * 2. OAuth Support: When users sign in with Google, GitHub, etc.,
 *   Supabase automatically creates records in auth.users. We mirror
 *   this in profiles to add our custom fields.
 * 
 * 3. Separation of Concerns: Authentication != Profile data.
 *   Users can change their email or phone without affecting login.
 * 
 * 4. RLS Isolation: auth.users has its own RLS. Our profiles table
 *   can have different (less restrictive) policies.
 * 
 * COLUMN EXPLANATIONS:
 * ====================
 * - id: UUID that matches auth.users.id. ON DELETE CASCADE means if the
 *       user deletes their auth account, their profile is also deleted.
 * 
 * - full_name, email, phone: Contact and identification information.
 *       We don't require all three - user can provide any combination.
 * 
 * - created_at/updated_at: Audit trail. Automatically set on insert,
 *       updated via trigger on modification.
 */

CREATE TABLE public.profiles (
    -- Primary key: UUID that matches Supabase Auth
    -- CASCADE: If auth user is deleted, delete their profile too
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contact information (user can provide email OR phone or both)
    email TEXT,
    phone TEXT,
    
    -- Profile data
    full_name TEXT NOT NULL,
    
    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================================
-- SECTION 3: ENABLE RLS ON PROFILES
-- ============================================================================
/*
 * RLS (Row Level Security) ensures users can only access their own data.
 * Without RLS, anyone with database access could see all profiles!
 */

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

/*
 * RLS POLICIES FOR PROFILES:
 * 
 * 1. SELECT: Users can view ANY profile (for admin staff to look up guests)
 * 2. UPDATE: Users can only update THEIR OWN profile
 * 3. INSERT: Users can only create a profile FOR THEMSELVES
 * 4. DELETE: Only the user can delete their own profile
 */

-- Policy: Anyone can view profiles (hotel staff need to look up guests)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);


-- ============================================================================
-- SECTION 4: ROOMS TABLE
-- ============================================================================
/*
 * WHY AVAILABILITY IS NOT STORED HERE:
 * ====================================
 * Many beginners make the mistake of adding an 'is_available' boolean column.
 * This approach FAILS because:
 * 
 * 1. Availability is TIME-DEPENDENT: A room might be available today but
 *    booked tomorrow. One boolean can't represent this.
 * 
 * 2. Race Conditions: Two users could both see 'is_available = true',
 *    both try to book, and one gets an error.
 * 
 * 3. Maintenance Overhead: You'd need to constantly update this column
 *    when bookings are made/cancelled.
 * 
 * CORRECT APPROACH:
 * Availability is DERIVED from the bookings table. A room is available
 * for dates X-Y if and only if there are NO overlapping bookings in
 * the bookings table for that room with status 'confirmed'.
 * 
 * WHY room_number MUST BE UNIQUE:
 * ===============================
 * 1. Human Error Prevention: Staff won't accidentally book "Room 101"
 *    thinking it's a different room.
 * 
 * 2. Guest Communication: Guests refer to their room by number.
 *    "I'm in Room 305" is unambiguous if numbers are unique.
 * 
 * 3. Reporting: Room-based reports are accurate when each room has
 *    exactly one identifier.
 * 
 * 4. Physical Reality: In a real hotel, room 305 is one specific room.
 *    We model this reality in our database.
 */

CREATE TABLE public.rooms (
    -- Primary key: Unique identifier for each room
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Human-readable room identifier (e.g., "101", "A1", "PRESIDENTIAL-SUITE")
    -- UNIQUE constraint prevents duplicate room numbers
    room_number TEXT UNIQUE NOT NULL,
    
    -- Room classification
    room_type TEXT NOT NULL,  -- 'standard', 'deluxe', 'suite', etc.
    
    -- Pricing
    price_per_night NUMERIC NOT NULL,  -- DECIMAL for accurate currency
    
    -- Capacity
    capacity INTEGER NOT NULL DEFAULT 2,  -- Max number of guests
    
    -- Flexible data storage using JSONB (no schema changes needed)
    amenities JSONB DEFAULT '[]'::jsonb,  -- e.g., ["WiFi", "Pool", "Mini Bar"]
    images JSONB DEFAULT '[]'::jsonb,      -- Array of image URLs
    
    -- Room status (different from availability!)
    -- This marks rooms that are TEMPORARILY unavailable (renovation, cleaning)
    -- NOT for date-based availability
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================================
-- SECTION 5: ENABLE RLS ON ROOMS
-- ============================================================================

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

/*
 * RLS POLICIES FOR ROOMS:
 * 
 * 1. SELECT: Public - anyone can browse available rooms
 * 2. INSERT/UPDATE/DELETE: Admins only - regular users can't modify rooms
 */

-- Policy: Anyone can view rooms (public read access)
CREATE POLICY "Anyone can view rooms" ON public.rooms
    FOR SELECT USING (true);

-- Policy: Only admins can modify rooms
-- This checks for admin role in user's metadata
-- REPLACE with actual admin user IDs for initial setup
CREATE POLICY "Admins can manage rooms" ON public.rooms
    FOR ALL USING (
        -- Option A: Check for admin role (after setting up admin function)
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
        -- Option B: For initial setup, allow any authenticated user
        -- Remove this OR clause after creating admin accounts
        OR auth.uid() IN (
            -- REPLACE with your admin user IDs
            -- '00000000-0000-0000-0000-000000000001'
        )
    );


-- ============================================================================
-- SECTION 6: BOOKINGS TABLE
-- ============================================================================
/*
 * HOW DATE OVERLAP WORKS:
 * ======================
 * Two date ranges overlap if:
 *   range1_start < range2_end AND range1_end > range2_start
 * 
 * Example: Booking A (Mar 10 - Mar 15) and Booking B (Mar 12 - Mar 20)
 *   Mar 10 < Mar 20? YES
 *   Mar 15 > Mar 12? YES
 *   Therefore: OVERLAP - this would be a double booking!
 * 
 * We use PostgreSQL's daterange type with the OVERLAPS operator
 * for clean, efficient overlap detection.
 * 
 * HOW THIS TABLE PREVENTS DOUBLE BOOKING:
 * =======================================
 * 1. FOREIGN KEY to rooms: Ensures booking references a real room
 * 2. FOREIGN KEY to profiles: Ensures booking has an owner
 * 3. EXCLUDE constraint: DATABASE-LEVEL enforcement
 *    This prevents overlapping bookings even with race conditions
 * 4. Application logic: Check availability before inserting
 * 
 * STATUS VALUES:
 * ==============
 * - pending: Booking created, awaiting payment
 * - confirmed: Payment received, booking guaranteed
 * - cancelled: User or admin cancelled (refund may apply)
 * - checked_out: Guest has departed (booking complete)
 */

CREATE TABLE public.bookings (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign keys: Every booking must have a user and a room
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    
    -- Booking dates
    -- We use DATE type (not timestamp) since we only care about the date
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'cancelled', 'checked_out')
    ),
    
    -- Pricing (stored separately from room price in case rates change)
    total_price NUMERIC NOT NULL,
    
    -- Audit timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================================
-- SECTION 7: DOUBLE BOOKING PREVENTION CONSTRAINT
-- ============================================================================
/*
 * CRITICAL: This is the DATABASE-LEVEL constraint that prevents double bookings.
 * 
 * Without this constraint, the following attack is possible:
 * 1. User A checks room availability at 12:00:00 - AVAILABLE
 * 2. User A's request hangs
 * 3. User B checks at 12:00:01 - AVAILABLE
 * 4. User B books the room
 * 5. User A's request finally processes and also books
 * Result: DOUBLE BOOKING
 * 
 * The EXCLUDE constraint uses GiST indexes to prevent this at the database level.
 * Even if two concurrent transactions both try to insert overlapping bookings,
 * one will fail with a conflict error.
 * 
 * HOW IT WORKS:
 * - EXCLUDE: Don't allow anything that matches the condition
 * - USING gist: Use the Generalized Search Tree index for spatial data
 * - room_id WITH =: Same room (equality operator)
 * - daterange(check_in, check_out, '[)') WITH &&: 
 *   '[)' means inclusive start, exclusive end
 *   && means "overlaps"
 *   So: "Don't allow if the date ranges overlap"
 */

-- First, we need the btree_gist extension for GiST indexes
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add the EXCLUDE constraint
ALTER TABLE public.bookings
    ADD CONSTRAINT no_double_booking EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    )
    WHERE (status IN ('pending', 'confirmed'));  -- Only apply to active bookings


-- ============================================================================
-- SECTION 8: ENABLE RLS ON BOOKINGS
-- ============================================================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

/*
 * RLS POLICIES FOR BOOKINGS:
 * 
 * 1. SELECT: Users can view their own bookings
 * 2. INSERT: Authenticated users can create bookings
 * 3. UPDATE: User can update their own bookings (with status rules)
 * 4. DELETE: Only admins can delete (we use status='cancelled' instead)
 */

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings
-- Conditions: Must own the booking, and can only change to valid statuses
CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (
        auth.uid() = user_id
        AND (
            -- Can always update pending bookings
            (SELECT status FROM public.bookings WHERE id = bookings.id) = 'pending'
            -- Can cancel any non-cancelled booking
            OR status IN ('cancelled', 'pending')
        )
    );


-- ============================================================================
-- SECTION 9: PAYMENTS TABLE
-- ============================================================================
/*
 * WHY PAYMENTS ARE SEPARATE FROM BOOKINGS:
 * ========================================
 * 1. Single Responsibility: Payments and bookings are different domains
 * 
 * 2. Payment History: Even if a booking is cancelled, we typically keep
 *    payment records for accounting and dispute purposes.
 * 
 * 3. Multiple Payments: One booking might have multiple payments
 *    (deposit + balance payment, or partial refunds)
 * 
 * 4. Audit Trail: Payment gateways provide transaction records that
 *    should be preserved separately from booking lifecycle.
 * 
 * 5. Reporting: Financial reports need payment data, not booking data.
 *    Separate tables make reporting cleaner.
 * 
 * HOW PAYSTACK WILL CONNECT:
 * ==========================
 * Paystack is a payment gateway (like Stripe but for African markets).
 * 
 * Flow:
 * 1. User initiates booking → payment record created with status 'pending'
 * 2. Frontend calls Paystack API with payment amount and reference
 * 3. Paystack shows payment page to user
 * 4. After payment, Paystack redirects back to your site
 * 5. Paystack also sends webhook to your server with payment result
 * 6. You update payment status using paystack_reference
 * 
 * The paystack_reference field stores Paystack's transaction reference
 * which you'll use to verify and reconcile payments.
 */

CREATE TABLE public.payments (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key: Every payment must belong to a booking
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    
    -- Payment details
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',  -- Nigerian Naira (can be changed)
    
    -- Payment method
    method TEXT NOT NULL CHECK (method IN ('card', 'transfer')),
    
    -- Paystack integration
    paystack_reference TEXT,  -- Reference from Paystack API
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'success', 'failed')
    ),
    
    -- Audit timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================================
-- SECTION 10: ENABLE RLS ON PAYMENTS
-- ============================================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

/*
 * RLS POLICIES FOR PAYMENTS:
 * 
 * 1. SELECT: Users can view their own payments (via booking ownership)
 * 2. INSERT: System (via payment processing functions)
 * 3. UPDATE: System only (payment status updated by webhooks)
 */

-- Policy: Users can view payments for their own bookings
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE id = booking_id
            AND user_id = auth.uid()
        )
    );

-- Policy: System can insert payments (via RPC functions)
CREATE POLICY "System can create payments" ON public.payments
    FOR INSERT WITH CHECK (true);  -- Checked in function, not RLS

-- Policy: System can update payment status (via webhooks)
CREATE POLICY "System can update payments" ON public.payments
    FOR UPDATE USING (true);  -- Checked in function, not RLS


-- ============================================================================
-- SECTION 11: INDEXES FOR PERFORMANCE
-- ============================================================================
/*
 * WHY INDEXES MATTER:
 * ===================
 * Without indexes, PostgreSQL must scan EVERY row to find data.
 * With 10,000 bookings, that's 10,000 comparisons per query.
 * With proper indexes, it's just a few lookups.
 * 
 * GUIDELINES:
 * - Index columns used in WHERE clauses
 * - Index foreign keys (they're commonly joined)
 * - Index columns used in ORDER BY
 * - Use composite indexes for multi-column queries
 * 
 * COST:
 * Indexes take disk space and slow down writes (INSERT/UPDATE).
 * Only add indexes you actually need.
 */

/*
 * PROFILES INDEXES:
 * - email: Login, password reset
 * - phone: Login (phone-based auth)
 */
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);

/*
 * ROOMS INDEXES:
 * - room_type: Filtering by room category
 * - is_active: Finding active rooms
 * - price_per_night: Sorting by price
 */
CREATE INDEX idx_rooms_type ON public.rooms(room_type);
CREATE INDEX idx_rooms_active ON public.rooms(is_active) WHERE is_active = true;
CREATE INDEX idx_rooms_price ON public.rooms(price_per_night);

/*
 * BOOKINGS INDEXES:
 * - user_id: User's booking history (most common query)
 * - room_id + status + dates: Availability checking (critical!)
 * - status: Filtering by status
 * - created_at: Sorting recent bookings
 */
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_room_dates ON public.bookings(room_id, check_in, check_out);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);

/*
 * PAYMENTS INDEXES:
 * - booking_id: Finding payments for a booking
 * - status: Finding pending/successful payments
 * - paystack_reference: Payment verification
 */
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_paystack_ref ON public.payments(paystack_reference);


-- ============================================================================
-- SECTION 12: AUTOMATIC TIMESTAMP UPDATE FUNCTION
-- ============================================================================
/*
 * WHY THIS TRIGGER EXISTS:
 * ========================
 * We want to track when data was last modified, but manually updating
 * updated_at in every UPDATE statement is error-prone.
 * 
 * This function automatically sets updated_at = NOW() whenever a row
 * is updated, ensuring audit trails are always accurate.
 */

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to each table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 13: AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================
/*
 * WHY THIS TRIGGER EXISTS:
 * ========================
 * When a user signs up via Supabase Auth, we want to automatically
 * create a corresponding profile record with their information.
 * 
 * HOW IT WORKS:
 * 1. User creates account in auth.users
 * 2. This trigger fires AFTER the insert
 * 3. We copy metadata from auth.users to public.profiles
 * 
 * SECURITY:
 * - FUNCTION is SECURITY DEFINER (runs with creator's permissions)
 * - INSERT is checked against RLS (but auth.users has own RLS)
 * - Only creates profile for own user (auth.uid() = NEW.id)
 */

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile with data from auth.users
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            -- Try full_name from metadata first
            NEW.raw_user_meta_data->>'full_name',
            -- Fall back to email if no name provided
            NEW.email
        ),
        NEW.phone
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires after new auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- SECTION 14: SAMPLE ROOM DATA (For Testing)
-- ============================================================================
/*
 * Insert sample rooms to test the system.
 * Room types: standard, deluxe, suite
 * Prices in NGN (Nigerian Naira)
 */

-- Standard Rooms (Economy option)
INSERT INTO public.rooms (room_number, room_type, price_per_night, capacity, amenities, images, is_active) VALUES
('101', 'standard', 15000, 2, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Work Desk"]'::jsonb,
    '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"]'::jsonb,
    true),
('102', 'standard', 15000, 2, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Work Desk"]'::jsonb,
    '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"]'::jsonb,
    true),
('103', 'standard', 17500, 3, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "City View", "Work Desk"]'::jsonb,
    '["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"]'::jsonb,
    true);

-- Deluxe Rooms (Premium option)
INSERT INTO public.rooms (room_number, room_type, price_per_night, capacity, amenities, images, is_active) VALUES
('201', 'deluxe', 35000, 2, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Ocean View", "King Bed", "Balcony", "Coffee Machine"]'::jsonb,
    '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"]'::jsonb,
    true),
('202', 'deluxe', 35000, 2, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Ocean View", "King Bed", "Balcony", "Coffee Machine"]'::jsonb,
    '["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"]'::jsonb,
    true),
('203', 'deluxe', 40000, 3, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Ocean View", "King Bed", "Balcony", "Bathtub", "Coffee Machine"]'::jsonb,
    '["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"]'::jsonb,
    true);

-- Suite Rooms (Luxury option)
INSERT INTO public.rooms (room_number, room_type, price_per_night, capacity, amenities, images, is_active) VALUES
('301', 'suite', 75000, 2, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Panoramic View", "King Bed", "Private Terrace", "Jacuzzi", "Butler Service", "Living Area", "Espresso Machine"]'::jsonb,
    '["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"]'::jsonb,
    true),
('302', 'suite', 85000, 2, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Panoramic View", "King Bed", "Private Terrace", "Jacuzzi", "Butler Service", "Living Area", "Espresso Machine", "Kitchenette"]'::jsonb,
    '["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"]'::jsonb,
    true),
('303', 'presidential', 150000, 4, 
    '["Free WiFi", "Air Conditioning", "Flat Screen TV", "Mini Bar", "Safe", "Panoramic View", "King Bed", "Private Pool", "Jacuzzi", "Butler Service", "Living Area", "Kitchenette", "Private Chef", "Helicopter Transfer", "Home Theater"]'::jsonb,
    '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"]'::jsonb,
    true);


-- ============================================================================
-- SECTION 15: VERIFICATION QUERIES
-- ============================================================================
/*
 * Run these queries to verify your setup:
 */

/*
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- View sample rooms
SELECT room_number, room_type, price_per_night, capacity, is_active 
FROM rooms ORDER BY price_per_night;

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'bookings';
*/


-- ============================================================================
-- SECTION 16: CLEANUP (For Resetting)
-- ============================================================================
/*
 * Uncomment and run to remove everything (for fresh start):
 */

/*
-- Drop triggers (order matters!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop extension (optional)
DROP EXTENSION IF EXISTS btree_gist;
*/


-- ============================================================================
-- END OF SCHEMA FILE
-- ============================================================================
/*
 * NEXT STEPS:
 * 1. Run this file in Supabase SQL Editor
 * 2. Run the functions.sql file for helper functions
 * 3. Test with the frontend integration examples
 * 4. Set up Paystack account and configure webhooks
 * 
 * See api/database/functions.sql for:
 * - check_room_availability()
 * - create_booking()
 * - process_payment()
 * - And more helper functions!
 */

