CREATE OR REPLACE FUNCTION gen_ulid() RETURNS text AS $$
DECLARE
  -- Crockford's Base32
  encoding   CHAR(32) := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  timestamp  BIGINT;
  output     TEXT := '';
  unix_time  BIGINT;
  ulid_chars CHAR(2);
  counter    INT;
BEGIN
  -- Get current Unix timestamp in milliseconds
  unix_time := (EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000)::BIGINT;

  -- Generate timestamp part (first 10 chars)
  timestamp := unix_time;
  FOR i IN REVERSE 9..0 LOOP
    output := output || substr(encoding, (timestamp % 32)::integer + 1, 1);
    timestamp := timestamp >> 5;
  END LOOP;

  -- Generate random part (last 16 chars)
  FOR i IN 0..15 LOOP
    output := output || substr(encoding, 1 + (random() * 31)::integer, 1);
  END LOOP;

  RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create users table
CREATE TABLE public.users (
  id TEXT PRIMARY KEY DEFAULT gen_ulid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMPTZ DEFAULT NULL,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create profiles table
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_ulid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own record"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid()::text = user_id);

