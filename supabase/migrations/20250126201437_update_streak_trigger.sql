CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_checkin date;
  user_timezone text;
  current_date_in_user_tz date;
BEGIN
  -- Get the user's timezone
  SELECT timezone INTO user_timezone
  FROM user_preferences
  WHERE user_id = NEW.user_id;
  
  -- Get current date in user's timezone
  SELECT (CURRENT_TIMESTAMP AT TIME ZONE COALESCE(user_timezone, 'UTC'))::date 
  INTO current_date_in_user_tz;
  
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
        last_checkin_date = current_date_in_user_tz
      WHERE id = NEW.user_id;
    -- If it's a different day (not same day)
    ELSIF last_checkin < current_date_in_user_tz THEN
      -- Check if streak is continuous
      IF last_checkin = current_date_in_user_tz - INTERVAL '1 day' THEN
        -- Increment streak
        UPDATE users
        SET 
          current_streak = current_streak + 1,
          longest_streak = GREATEST(current_streak + 1, longest_streak),
          last_checkin_date = current_date_in_user_tz
        WHERE id = NEW.user_id;
      ELSE
        -- Break streak and start new one
        UPDATE users
        SET 
          current_streak = 1,
          longest_streak = GREATEST(1, longest_streak),
          last_checkin_date = current_date_in_user_tz
        WHERE id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;