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
declare
  v_reminder_time time;
begin
  -- Convert reminder_time to proper time type if provided
  if p_reminder_time is not null then
    begin
      v_reminder_time := p_reminder_time::time;
    exception when others then
      v_reminder_time := '09:00:00'::time; -- Default to 9 AM if invalid
    end;
  end if;

  -- Start transaction
  begin
    -- Insert user data with proper enum casting and null handling
    insert into users (
      id,
      phone_number,
      email,
      experience_level,
      push_token
    ) values (
      p_user_id,
      nullif(p_phone_number, ''),
      nullif(p_email, ''),
      p_experience_level::experience_level_enum,
      nullif(p_push_token, '')
    )
    on conflict (id) do update set
      phone_number = EXCLUDED.phone_number,
      email = EXCLUDED.email,
      experience_level = EXCLUDED.experience_level,
      push_token = EXCLUDED.push_token;

    -- Insert goals if provided
    if p_goals is not null and array_length(p_goals, 1) > 0 then
      insert into user_goals (user_id, name)
      select p_user_id, unnest(p_goals)
      on conflict (user_id, name) do nothing;
    end if;

    -- Insert preferences with proper enum casting and null handling
    insert into user_preferences (
      user_id,
      weekly_sessions,
      session_duration,
      tracking_method,
      reminder_time,
      timezone
    ) values (
      p_user_id,
      p_weekly_sessions::weekly_sessions_enum,
      p_session_duration::session_duration_enum,
      p_tracking_method::tracking_method_enum,
      v_reminder_time,
      nullif(p_timezone, '')
    )
    on conflict (user_id) do update set
      weekly_sessions = EXCLUDED.weekly_sessions,
      session_duration = EXCLUDED.session_duration,
      tracking_method = EXCLUDED.tracking_method,
      reminder_time = EXCLUDED.reminder_time,
      timezone = EXCLUDED.timezone;

    -- If any of the above operations fail, the entire transaction will be rolled back
  end;
end;
$$ language plpgsql;