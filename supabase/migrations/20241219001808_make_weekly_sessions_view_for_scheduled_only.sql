CREATE OR REPLACE VIEW weekly_sessions AS
WITH week_dates AS (
  SELECT 
    id as session_id,
    user_id,
    scheduled_date,
    focus,
    status,
    is_custom,
    DATE_TRUNC('week', scheduled_date)::date as week_start,
    (DATE_TRUNC('week', scheduled_date) + INTERVAL '6 days')::date as week_end
  FROM sessions
  WHERE scheduled_date IS NOT NULL
  AND is_custom = false  -- Add this line
)
SELECT 
  user_id,
  week_start,
  week_end,
  ARRAY_AGG(
    json_build_object(
      'session_id', session_id,
      'scheduled_date', scheduled_date,
      'focus', focus,
      'status', status,
      'is_custom', is_custom
    ) ORDER BY scheduled_date
  ) as sessions,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_sessions
FROM week_dates
GROUP BY user_id, week_start, week_end
ORDER BY week_start DESC;