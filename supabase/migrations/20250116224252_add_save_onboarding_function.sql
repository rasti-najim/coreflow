create or replace function save_onboarding_data(
  p_user_id uuid,
  p_phone_number text,
  p_email text,
  p_experience_level text,
  p_push_token text,
  p_goals text[],
  p_weekly_sessions text,
  p_session_duration text,
  p_tracking_method text,
  p_reminder_time text,
  p_timezone text
) returns void as $$
begin
  -- Start transaction
  begin
    -- Insert user data
    insert into users (
      id,
      phone_number,
      email,
      experience_level,
      push_token
    ) values (
      p_user_id,
      p_phone_number,
      p_email,
      p_experience_level,
      p_push_token
    );

    -- Insert goals
    insert into user_goals (user_id, name)
    select p_user_id, unnest(p_goals);

    -- Insert preferences
    insert into user_preferences (
      user_id,
      weekly_sessions,
      session_duration,
      tracking_method,
      reminder_time,
      timezone
    ) values (
      p_user_id,
      p_weekly_sessions,
      p_session_duration,
      p_tracking_method,
      p_reminder_time,
      p_timezone
    );

    -- If any of the above operations fail, the entire transaction will be rolled back
  end;
end;
$$ language plpgsql;