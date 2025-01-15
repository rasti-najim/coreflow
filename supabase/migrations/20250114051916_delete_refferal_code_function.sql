-- Drop the old function if it exists
DROP FUNCTION IF EXISTS validate_referral_code(p_code TEXT, p_user_id UUID);

-- Then add your new functions
CREATE OR REPLACE FUNCTION check_referral_code(p_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM referral_codes 
    WHERE code = p_code 
    AND status = 'active'
    AND used_by_user_id IS NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Function to claim the code for a user
CREATE OR REPLACE FUNCTION claim_referral_code(p_code TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  p_referral_id UUID;
BEGIN
  -- Get and lock the referral code
  WITH referral AS (
    SELECT id 
    FROM referral_codes 
    WHERE code = p_code 
    AND status = 'active'
    AND used_by_user_id IS NULL
    FOR UPDATE SKIP LOCKED
  )
  UPDATE referral_codes rc
  SET 
    used_by_user_id = p_user_id,
    updated_at = CURRENT_TIMESTAMP
  FROM referral AS r
  WHERE rc.id = r.id
  RETURNING rc.id INTO STRICT p_referral_id;

  -- Update user with referral code
  UPDATE users 
  SET referral_code_id = p_referral_id
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;