
-- Create the clients table with all the needed fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  user_type TEXT NOT NULL CHECK (user_type IN ('developer', 'client')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  image TEXT DEFAULT '/placeholder.svg',
  location TEXT,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  languages TEXT[] DEFAULT '{}',
  preferred_working_hours TEXT,
  description TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  username TEXT,
  UNIQUE(email),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Create the client-specific fields table
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id),
  looking_for TEXT[] DEFAULT '{}',
  completed_projects INTEGER DEFAULT 0,
  profile_completion_percentage INTEGER DEFAULT 0,
  preferred_help_format TEXT[] DEFAULT '{}',
  budget NUMERIC(10, 2), -- Set to numeric(10,2) to allow values up to 99,999,999.99
  payment_method TEXT CHECK (payment_method IN ('Stripe', 'PayPal')),
  bio TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  budget_per_hour NUMERIC(10, 2), -- Set to numeric(10,2) to allow values up to 99,999,999.99
  company TEXT,
  position TEXT,
  project_types TEXT[] DEFAULT '{}',
  industry TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  time_zone TEXT,
  availability JSONB DEFAULT '{}'::jsonb,
  communication_preferences TEXT[] DEFAULT '{}'
);

-- Create RLS policies for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for the client_profiles table
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public client profiles are viewable by everyone"
  ON client_profiles FOR SELECT
  USING (true);

CREATE POLICY "Clients can insert their own profile"
  ON client_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Clients can update their own profile"
  ON client_profiles FOR UPDATE
  USING (auth.uid() = id);
