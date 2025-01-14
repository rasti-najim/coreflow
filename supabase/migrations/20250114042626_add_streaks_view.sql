CREATE OR REPLACE VIEW user_streak_levels AS
WITH user_streaks AS (
  WITH RECURSIVE dates AS (
    SELECT 
      user_id,
      completed_date::date as streak_date,
      1 as streak_count
    FROM sessions
    WHERE status = 'completed'
      AND type = 'scheduled'
      AND completed_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
      d.user_id,
      d.streak_date + 1,
      d.streak_count + 1
    FROM dates d
    INNER JOIN sessions s ON 
      s.user_id = d.user_id AND 
      s.completed_date::date = d.streak_date + 1 AND
      s.status = 'completed' AND
      s.type = 'scheduled'
  )
  SELECT 
    user_id,
    MAX(streak_count) as daily_streak
  FROM dates
  GROUP BY user_id
)
SELECT 
  us.user_id,
  us.daily_streak,
  sl.name as streak_level_name,
  sl.emoji as streak_level_emoji
FROM user_streaks us
LEFT JOIN LATERAL (
  SELECT name, emoji
  FROM streak_levels
  WHERE streak_count <= us.daily_streak
  ORDER BY streak_count DESC
  LIMIT 1
) sl ON true;