# Grand Emily Hotel - Supabase Authentication Setup

## Quick Setup Guide

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to **Settings** > **API**
3. Copy your project URL and anon/public key

### 2. Configure the Client

Open `/scripts/supabase.js` and replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
  SUPABASE_URL: "https://your-project-id.supabase.co", // Your project URL
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Your anon key
  SESSION_KEY: "hotel_auth_session",
  USER_KEY: "hotel_user_data",
};
```

### 3. Enable Phone Authentication (Optional)

For phone OTP login:

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Enable **Phone** provider
3. Configure SMS template if needed

### 4. Configure Email Templates (Optional)

For email verification:

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Set your site URL (e.g., `http://localhost:5500`)
3. Configure redirect URLs

## API Reference

### Authentication Methods

#### Sign Up with Email

```javascript
const result = await window.HotelAuth.signUpWithEmail(email, password, {
  fullName: "John Doe",
  phone: "+2348001234567",
});
```

#### Login with Email

```javascript
const result = await window.HotelAuth.loginWithEmail(email, password);
```

#### Send Phone OTP

```javascript
const result = await window.HotelAuth.sendPhoneOTP(phone);
// Returns { success: true, needsVerification: true, message: "..." }
```

#### Verify OTP

```javascript
const result = await window.HotelAuth.verifyPhoneOTP(otpCode);
```

#### Get Current User

```javascript
const user = await window.HotelAuth.getCurrentUser();
// Returns { id, email, phone, name, ... } or null
```

#### Logout

```javascript
const result = await window.HotelAuth.logout();
// Returns { success: true, message: "..." }
```

### Event Listeners

```javascript
// User logged in
window.addEventListener("auth:login", (event) => {
  const user = event.detail.user;
  console.log("User logged in:", user);
});

// User logged out
window.addEventListener("auth:logout", () => {
  console.log("User logged out");
});
```

## Security Best Practices

1. **Never expose sensitive keys in client-side code** - The anon key is safe to expose
2. **Enable RLS (Row Level Security)** in your Supabase database
3. **Validate all inputs** on both client and server sides
4. **Use HTTPS** in production
5. **Set up email confirmation** for production use

## Database Schema (Optional)

Create a `profiles` table for additional user data:

```sql
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policy
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
```

## Testing

1. Start your local development server
2. Navigate to `/signup.html` to test email signup
3. Navigate to `/login.html` to test email and phone login
4. Check browser console for debug logs

## Production Checklist

- [ ] Replace placeholder URLs with production Supabase project
- [ ] Enable email confirmation in Supabase
- [ ] Set up custom email template
- [ ] Configure redirect URLs
- [ ] Enable phone provider if using SMS OTP
- [ ] Test all authentication flows
- [ ] Set up RLS policies
- [ ] Use HTTPS
