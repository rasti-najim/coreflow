-- First drop the existing foreign key constraint
ALTER TABLE referral_codes
DROP CONSTRAINT IF EXISTS referral_codes_used_by_user_id_fkey;

-- Add the new constraint with ON DELETE CASCADE
ALTER TABLE referral_codes
ADD CONSTRAINT referral_codes_used_by_user_id_fkey
    FOREIGN KEY (used_by_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;