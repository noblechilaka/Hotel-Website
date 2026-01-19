# Luxury Hotel Booking Website

A production-ready, luxury hotel booking website with intentional asymmetry, editorial layout, and discovery-based UX.

## 🏨 Features

- **Frontend**: HTML5, CSS3 (custom), Vanilla JavaScript ES6+, GSAP animations
- **Backend**: Supabase (Auth & Database), Vercel Serverless Functions
- **Payments**: Paystack API (Card & Bank Transfer)
- **Design**: Editorial, cinematic, calm luxury with asymmetric layouts

## 📁 Project Structure

```
/
├── public/
│   └── index.html              # Landing page
├── src/
│   ├── api/
│   │   ├── create-booking.js   # Create booking endpoint
│   │   ├── init-paystack.js    # Initialize payment
│   │   └── verify-payment.js   # Verify payment status
│   ├── pages/
│   │   ├── home.html           # Home page
│   │   ├── rooms.html          # Rooms listing
│   │   ├── room-details.html   # Room details & booking widget
│   │   ├── booking.html        # Multi-step booking flow
│   │   ├── login.html          # Login page
│   │   ├── signup.html         # Signup page
│   │   ├── dashboard.html      # User dashboard
│   │   ├── confirmation.html   # Booking confirmation
│   │   ├── about.html          # About page
│   │   └── contact.html        # Contact page
│   ├── scripts/
│   │   ├── main.js             # Core utilities & state
│   │   ├── animations.js       # GSAP animations
│   │   ├── supabase.js         # Database operations
│   │   ├── auth.js             # Authentication
│   │   ├── booking.js          # Booking flow logic
│   │   └── paystack.js         # Payment integration
│   └── styles/
│       ├── global.css          # Variables & reset
│       ├── typography.css      # Fonts & text styles
│       ├── layout.css          # Grid & component layouts
│       ├── components.css      # UI components
│       └── animations.css      # CSS animations
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Paystack account

### Installation

1. **Clone the repository**

   ```bash
   cd /Users/mac/Desktop/untitled\ folder\ 2
   ```

2. **Install dependencies for serverless functions**

   ```bash
   npm init -y
   npm install @supabase/supabase-js
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

4. **Set up Supabase**

   Create a new Supabase project and run these SQL commands:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Rooms table
   CREATE TABLE rooms (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     slug TEXT UNIQUE NOT NULL,
     description TEXT,
     short_description TEXT,
     price_per_night DECIMAL NOT NULL,
     max_guests INTEGER DEFAULT 2,
     size INTEGER DEFAULT 50,
     bed_type TEXT,
     amenities TEXT[],
     images TEXT[],
     is_featured BOOLEAN DEFAULT FALSE,
     is_active BOOLEAN DEFAULT TRUE
   );

   -- Bookings table
   CREATE TABLE bookings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     room_id TEXT REFERENCES rooms(id),
     check_in DATE NOT NULL,
     check_out DATE NOT NULL,
     guests INTEGER NOT NULL,
     total_price DECIMAL NOT NULL,
     guest_name TEXT NOT NULL,
     guest_email TEXT NOT NULL,
     guest_phone TEXT,
     special_requests TEXT,
     payment_status TEXT DEFAULT 'pending',
     booking_status TEXT DEFAULT 'confirmed',
     transaction_ref TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can only see their own bookings
   CREATE POLICY "Users can view own bookings" ON bookings
     FOR SELECT USING (auth.uid() = user_id);
   ```

5. **Seed room data**

   ```sql
   INSERT INTO rooms (id, name, slug, description, short_description, price_per_night, max_guests, size, bed_type, amenities, images, is_featured) VALUES
   ('room-1', 'Ocean View Suite', 'ocean-view-suite', 'A luxurious suite with panoramic ocean views, featuring a private terrace and elegant contemporary design.', 'Panoramic ocean views with private terrace', 450, 2, 65, 'King', ARRAY['Ocean View', 'Private Terrace', 'Mini Bar', 'Free WiFi', 'Room Service'], ARRAY['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'], true),
   ('room-2', 'Garden Retreat', 'garden-retreat', 'Nestled within our lush tropical gardens, this sanctuary offers complete privacy and tranquility.', 'Private sanctuary in tropical gardens', 320, 2, 55, 'Queen', ARRAY['Garden View', 'Rain Shower', 'Private Garden', 'Free WiFi'], ARRAY['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200'], true),
   ('room-3', 'Presidential Suite', 'presidential-suite', 'The ultimate in luxury living with expansive space, exclusive amenities, and breathtaking views.', 'Ultimate luxury with exclusive amenities', 1200, 4, 150, 'King', ARRAY['Panoramic Views', 'Private Pool', 'Butler Service', 'Jacuzzi', 'Kitchen'], ARRAY['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200'], true),
   ('room-4', 'Beach Villa', 'beach-villa', 'Direct beach access with your own private stretch of pristine shoreline and infinity pool.', 'Direct beach access with private pool', 850, 6, 200, 'King + Twins', ARRAY['Beach Access', 'Private Pool', 'Kitchen', 'Butler Service', 'Outdoor Lounge'], ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'], true);
   ```

6. **Deploy Serverless Functions (Vercel)**

   ```bash
   npm install -g vercel
   vercel
   ```

   Add environment variables in Vercel dashboard:

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `PAYSTACK_SECRET_KEY`

## 🎨 Design System

### Color Palette

```css
--bg-dark: #0e0e0e;
--bg-light: #f5f1eb;
--gold: #c6a86b;
--brown: #7a6a58;
--text-light: #ffffff;
--text-dark: #1a1a1a;
--divider: rgba(198, 168, 107, 0.3);
```

### Typography

- **Headings**: Playfair Display
- **Body**: Inter
- **Meta**: Inter uppercase, wide letter spacing

## 💳 Payment Integration

### Paystack Setup

1. Create a Paystack merchant account
2. Get your test/live API keys
3. Add to environment variables:
   ```
   PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_SECRET_KEY=sk_test_...
   ```

### Supported Payment Methods

- Card payments (Visa, Mastercard, Verve)
- Bank transfer
- USSD

## 🔐 Authentication

Supabase handles:

- Email/password authentication
- Password hashing (handled by Supabase)
- Session management
- JWT tokens

## 📱 Responsive Design

- Desktop-first approach
- Fully responsive across all devices
- Mobile navigation with slide-out menu

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Add environment variables
3. Deploy

### Other Platforms

- Netlify: Works with proper configuration
- Traditional hosting: Requires API endpoints setup

## 🧪 Testing

1. Open `public/index.html` in browser
2. Browse rooms and amenities
3. Test booking flow (demo mode works without API keys)
4. Test authentication pages

## 📝 Notes

- Demo mode is active when API credentials are not configured
- All Unsplash images are placeholders - replace with your own
- Production deployment requires proper API credentials
- Always use HTTPS in production

## 📄 License

MIT License - feel free to use for personal or commercial projects.
