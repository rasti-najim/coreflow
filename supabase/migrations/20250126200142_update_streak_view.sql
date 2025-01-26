CREATE OR REPLACE VIEW user_streak_levels AS
SELECT 
  u.id as user_id,
  u.current_streak as daily_streak,
  sl.name as streak_level_name,
  sl.emoji as streak_level_emoji
FROM users u
LEFT JOIN LATERAL (
  SELECT name, emoji
  FROM streak_levels
  WHERE streak_count <= u.current_streak
  ORDER BY streak_count DESC
  LIMIT 1
) sl ON true;
