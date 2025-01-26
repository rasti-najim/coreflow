ALTER TABLE users
ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN last_checkin_date DATE;

CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_checkin date;
BEGIN
  -- Get the user's last checkin date
  SELECT last_checkin_date INTO last_checkin
  FROM users
  WHERE id = NEW.user_id;
  
  -- If this is a completed session
  IF NEW.status = 'completed' THEN
    -- If no previous checkin, start new streak
    IF last_checkin IS NULL THEN
      UPDATE users
      SET 
        current_streak = 1,
        longest_streak = 1,
        last_checkin_date = CURRENT_DATE
      WHERE id = NEW.user_id;
    -- If it's a different day (not same day)
    ELSIF last_checkin < CURRENT_DATE THEN
      -- Check if streak is continuous
      IF last_checkin = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Increment streak
        UPDATE users
        SET 
          current_streak = current_streak + 1,
          longest_streak = GREATEST(current_streak + 1, longest_streak),
          last_checkin_date = CURRENT_DATE
        WHERE id = NEW.user_id;
      ELSE
        -- Break streak and start new one
        UPDATE users
        SET 
          current_streak = 1,
          longest_streak = GREATEST(1, longest_streak),
          last_checkin_date = CURRENT_DATE
        WHERE id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update streak when a session is marked as completed
CREATE TRIGGER session_streak_trigger
AFTER INSERT OR UPDATE OF status
ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_streak();
