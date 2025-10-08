-- Create candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  availability TEXT NOT NULL,
  age_verified BOOLEAN NOT NULL,
  product_comfort TEXT,
  previous_experience TEXT,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  overall_score INTEGER,
  trait_scores JSONB,
  strengths TEXT[],
  red_flags TEXT[],
  recommendation TEXT,
  interview_focus TEXT[],
  raw_ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Policies for candidates table
-- Allow anyone to insert (public form submission)
CREATE POLICY "Enable insert for all users" ON candidates 
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read
CREATE POLICY "Enable read for authenticated users" ON candidates 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for analyses table
-- Only authenticated users can do everything
CREATE POLICY "Enable all for authenticated users" ON analyses 
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX idx_analyses_candidate_id ON analyses(candidate_id);
