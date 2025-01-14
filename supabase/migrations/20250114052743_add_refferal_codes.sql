-- Drop existing table if it exists
DROP TABLE IF EXISTS referral_codes CASCADE;

-- Recreate the table with all columns
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  used_by_user_id UUID REFERENCES users(id) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add the referral_code_id column to users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'referral_code_id'
  ) THEN
    ALTER TABLE users ADD COLUMN referral_code_id UUID REFERENCES referral_codes(id) UNIQUE;
  END IF;
END $$;