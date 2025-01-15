DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referral_codes' 
    AND column_name = 'used_by_user_id'
  ) THEN
    ALTER TABLE referral_codes ADD COLUMN used_by_user_id UUID REFERENCES users(id) UNIQUE;
  END IF;
END $$;
