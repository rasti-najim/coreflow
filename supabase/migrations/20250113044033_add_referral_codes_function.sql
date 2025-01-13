CREATE OR REPLACE FUNCTION validate_referral_code(p_code TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  p_referral_id UUID;
BEGIN
  -- Check if user already has a referral code
  IF EXISTS (
    SELECT 1 FROM referral_codes 
    WHERE used_by_user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User has already used a referral code';
  END IF;

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
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE EXCEPTION 'Invalid or expired referral code';
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;
