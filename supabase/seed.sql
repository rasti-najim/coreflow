-- Clear existing data (if needed)
TRUNCATE TABLE progress CASCADE;
TRUNCATE TABLE user_goals CASCADE;
TRUNCATE TABLE user_preferences CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE exercises CASCADE;
TRUNCATE TABLE sessions CASCADE;

-- Insert sample users
INSERT INTO users (user_id, email, phone_number, experience_level) 
VALUES
  ('11111111-1111-1111-1111-111111111111', 'sarah@example.com', '+1234567890', 'beginner'),
  ('22222222-2222-2222-2222-222222222222', 'mike@example.com', '+1234567891', 'intermediate'),
  ('33333333-3333-3333-3333-333333333333', 'emma@example.com', '+1234567892', 'advanced'),
  ('44444444-4444-4444-4444-444444444444', 'james@example.com', '+1234567893', 'beginner'),
  ('55555555-5555-5555-5555-555555555555', 'lisa@example.com', '+1234567894', 'intermediate');

-- Insert user preferences
INSERT INTO user_preferences (id, user_id, weekly_sessions, session_duration, tracking_method)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000001', '1-2', '5-10', 'mood'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000002', '3', '30-45', 'pictures');

-- Insert user goals
INSERT INTO user_goals (goal_id, user_id, name)
VALUES
  ('11111111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', 'Improve core strength'),
  ('22222222-aaaa-2222-aaaa-222222222222', '11111111-1111-1111-1111-111111111111', 'Better posture'),
  ('33333333-aaaa-3333-aaaa-333333333333', '22222222-2222-2222-2222-222222222222', 'Increase flexibility'),
  ('44444444-aaaa-4444-aaaa-444444444444', '33333333-3333-3333-3333-333333333333', 'Master advanced poses'),
  ('55555555-aaaa-5555-aaaa-555555555555', '33333333-3333-3333-3333-333333333333', 'Improve balance'),
  ('66666666-aaaa-6666-aaaa-666666666666', '44444444-4444-4444-4444-444444444444', 'Build strength'),
  ('77777777-aaaa-7777-aaaa-777777777777', '55555555-5555-5555-5555-555555555555', 'Reduce back pain');

-- Insert progress records
INSERT INTO progress (id, user_id, entry_type, mood_description, picture_url, created_at)
VALUES
  -- Mood tracking user (Sarah)
  ('11111111-bbbb-1111-bbbb-111111111111', 
   '11111111-1111-1111-1111-111111111111',
   'mood',
   'Feeling energized after first session. Some muscle soreness but excited to continue.',
   NULL,
   CURRENT_TIMESTAMP - INTERVAL '7 days'),
   
  ('22222222-bbbb-2222-bbbb-222222222222',
   '11111111-1111-1111-1111-111111111111',
   'mood',
   'More confident with the basic moves. Less soreness today.',
   NULL,
   CURRENT_TIMESTAMP - INTERVAL '3 days'),

  -- Picture tracking user (Mike)
  ('33333333-bbbb-3333-bbbb-333333333333',
   '22222222-2222-2222-2222-222222222222',
   'picture',
   NULL,
   'progress_pics/mike_week1.jpg',
   CURRENT_TIMESTAMP - INTERVAL '14 days'),

  ('44444444-bbbb-4444-bbbb-444444444444',
   '22222222-2222-2222-2222-222222222222',
   'picture',
   NULL,
   'progress_pics/mike_week2.jpg',
   CURRENT_TIMESTAMP - INTERVAL '7 days'),

  -- Picture tracking user (Emma)
  ('55555555-bbbb-5555-bbbb-555555555555',
   '33333333-3333-3333-3333-333333333333',
   'picture',
   NULL,
   'progress_pics/emma_week1.jpg',
   CURRENT_TIMESTAMP - INTERVAL '10 days'),

  -- Mood tracking user (Lisa)
  ('66666666-bbbb-6666-bbbb-666666666666',
   '55555555-5555-5555-5555-555555555555',
   'mood',
   'Back pain has reduced significantly after three weeks of practice',
   NULL,
   CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Insert sample exercises first (minimal set for seeding)
INSERT INTO exercises (id, name, description, skill_level, focus, type)
VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Basic Warmup', 'Simple warmup routine', 'beginner', ARRAY['full body'], 'warmup'),
  ('e2222222-2222-2222-2222-222222222222', 'Core Strengthening', 'Basic core exercise', 'beginner', ARRAY['core'], 'target'),
  ('e3333333-3333-3333-3333-333333333333', 'Basic Cooldown', 'Simple cooldown routine', 'beginner', ARRAY['full body'], 'cooldown');

-- Insert sessions
INSERT INTO sessions (id, user_id, focus, scheduled_date, status, warmup_exercise, target_exercise, cooldown_exercise, is_custom)
VALUES
  -- Sarah's sessions (beginner)
  ('11111111-cccc-1111-cccc-111111111111',
   '11111111-1111-1111-1111-111111111111',
   'full body',
   CURRENT_DATE + INTERVAL '1 day',
   'scheduled',
   'e1111111-1111-1111-1111-111111111111',
   'e2222222-2222-2222-2222-222222222222',
   'e3333333-3333-3333-3333-333333333333',
   false),

  -- Mike's completed session
  ('22222222-cccc-2222-cccc-222222222222',
   '22222222-2222-2222-2222-222222222222',
   'core',
   CURRENT_DATE - INTERVAL '1 day',
   'completed',
   'e1111111-1111-1111-1111-111111111111',
   'e2222222-2222-2222-2222-222222222222', 
   'e3333333-3333-3333-3333-333333333333',
   false),

  -- Emma's future session
  ('33333333-cccc-3333-cccc-333333333333',
   '33333333-3333-3333-3333-333333333333',
   'upper body',
   CURRENT_DATE + INTERVAL '3 days',
   'scheduled',
   'e1111111-1111-1111-1111-111111111111',
   'e2222222-2222-2222-2222-222222222222',
   'e3333333-3333-3333-3333-333333333333',
   false);

-- Update verification query to include sessions
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
    UNION ALL
SELECT 'Preferences', COUNT(*) FROM user_preferences
    UNION ALL
SELECT 'Goals', COUNT(*) FROM user_goals
    UNION ALL
SELECT 'Progress', COUNT(*) FROM progress
    UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercises
    UNION ALL
SELECT 'Sessions', COUNT(*) FROM sessions;

