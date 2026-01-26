# Hotel Booking System - Database Implementation Plan

## Analysis of Current vs Required Schema

### Current Issues:

1. Table name `users` should be `profiles` to avoid confusion with `auth.users`
2. Column `check_in_date` should be `check_in` (shorter, clearer)
3. Column `type` should be `room_type` for clarity
4. `is_available` column on rooms - violates requirement that availability is determined by date ranges only
5. Payment table missing `currency` (NGN default) and `paystack_reference`
6. Payment method values differ from requirements
7. Missing `checked_out` status for booking lifecycle
8. **NO EXCLUSIVE CONSTRAINT to prevent double bookings** - critical gap!

---

## Plan: Complete Schema Rewrite

### Phase 1: Create Tables with Proper Structure

#### 1.1 `profiles` table

- Matches auth.users (NOT named `users` to avoid confusion)
- Explains why we don't store auth data ourselves
- Uses proper foreign key constraint

#### 1.2 `rooms` table

- NO `is_available` column (availability = no overlapping bookings)
- `room_number` with UNIQUE constraint (why it's critical)
- `room_type` instead of `type`
- `amenities` and `images` as JSONB for flexibility

#### 1.3 `bookings` table

- `check_in` and `check_out` (not `_date`)
- `checked_out` status included
- **EXCLUSIVE constraint** on (room_id, date_range) to prevent double booking

#### 1.4 `payments` table

- `currency` default 'NGN'
- `paystack_reference` for Paystack integration
- Status: `pending | success | failed`

---

### Phase 2: Add Database-Level Double Booking Prevention

**CRITICAL FEATURE:**

- Add a PostgreSQL EXCLUDE constraint that prevents overlapping bookings
- Uses `OVERLAPS` operator or custom GiST index
- This ensures rooms can NEVER be double-booked, even with race conditions

```sql
-- Example concept (will be properly implemented)
ADD CONSTRAINT no_double_booking EXCLUDE USING gist (
    room_id WITH =,
    daterange(check_in, check_out, '[)') WITH &&
);
```

---

### Phase 3: RLS Policies

| Table    | Operation     | Policy                                      |
| -------- | ------------- | ------------------------------------------- |
| profiles | SELECT        | User sees own profile                       |
| profiles | UPDATE        | User updates own profile                    |
| rooms    | SELECT        | Public (anyone can view rooms)              |
| rooms    | INSERT/UPDATE | Admins only                                 |
| bookings | SELECT        | User sees own bookings                      |
| bookings | INSERT        | Authenticated users                         |
| bookings | UPDATE        | User owns booking + status transition rules |
| payments | SELECT        | User sees own payments                      |
| payments | INSERT        | System (via payment processing)             |

---

### Phase 4: Helper Functions

1. `check_room_availability(room_id, check_in, check_out)` → boolean
2. `get_available_rooms(check_in, check_out, room_type)` → room[]
3. `create_booking(room_id, check_in, check_out)` → booking
4. `calculate_total_price(room_id, check_in, check_out)` → numeric
5. Process payment with Paystack webhook support

---

### Phase 5: Comments & Documentation

Every table/column/policy will have:

- **WHY** it exists (purpose)
- **WHY** certain decisions were made
- Examples of usage

---

## Files to Create/Update

1. `/api/database/schema.sql` - Complete rewrite with:

   - Drop statements (for clean setup)
   - All 4 table definitions
   - RLS enablement
   - RLS policies
   - Triggers for autotimestamps
   - Trigger for auto profile creation
   - EXCLUDE constraint for double-booking prevention
   - Indexes for performance

2. `/api/database/functions.sql` - Rewrite with:
   - All helper functions
   - Booking creation with availability check
   - Payment processing with Paystack reference
   - User booking/payment history

---

## Output Format

The final output will be:

1. SQL to create tables
2. SQL to enable RLS
3. SQL policies
4. Inline comments explaining logic

Each section will have clear headers and explanations suitable for a frontend developer with no backend experience.
