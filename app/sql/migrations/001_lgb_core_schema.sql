-- ======================================================================
-- Let Go Buddy Database Schema - Core Tables
-- ======================================================================

-- Sessions table with denormalized counters for performance
CREATE TABLE IF NOT EXISTS lgb_sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario text NOT NULL CHECK (scenario IN ('A','B','C','D','E')),
  title text,
  move_date date,     -- for B
  region text,        -- for B/D  
  trade_method text CHECK (trade_method IN ('meet','ship','both')),   -- for B
  status text DEFAULT 'active' CHECK (status IN ('active','archived','completed')),
  -- Denormalized counters for performance
  item_count integer DEFAULT 0,
  decided_count integer DEFAULT 0,
  expected_revenue numeric DEFAULT 0,
  -- AI plan tracking
  ai_plan_generated boolean DEFAULT FALSE,
  ai_plan_generated_at timestamp NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items table
CREATE TABLE IF NOT EXISTS lgb_items (
  item_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES lgb_sessions(session_id) ON DELETE CASCADE,
  title text,
  notes text,
  category text,
  condition text,
  decision text CHECK (decision IN ('keep','sell','donate','dispose')),
  decision_reason text,
  price_low numeric,
  price_mid numeric,
  price_high numeric,
  price_confidence numeric,
  usage_score integer CHECK (usage_score >= 0 AND usage_score <= 100),
  sentiment text,
  ai_recommendation text,
  ai_rationale text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Item photos
CREATE TABLE IF NOT EXISTS lgb_item_photos (
  photo_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES lgb_items(item_id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Listings (generated for marketplaces)
CREATE TABLE IF NOT EXISTS lgb_listings (
  listing_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES lgb_items(item_id) ON DELETE CASCADE,
  lang text NOT NULL CHECK (lang IN ('en','ko')),
  title text NOT NULL,
  body text NOT NULL,
  hashtags text[] DEFAULT array[]::text[],
  channels text[] DEFAULT array[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Challenge calendar items (unified table for challenges and moving tasks)
CREATE TABLE IF NOT EXISTS challenge_calendar_items (
  item_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  scheduled_date timestamp NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp,
  reflection text,
  tip text, -- For AI-generated tips
  scenario text CHECK (scenario IN ('A','B','C','D','E')) DEFAULT 'C', -- Scenario for categorizing tasks
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);