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