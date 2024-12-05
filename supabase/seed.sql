-- Clear existing data (if needed)
TRUNCATE TABLE progress CASCADE;
TRUNCATE TABLE user_goals CASCADE;
TRUNCATE TABLE user_preferences CASCADE;
TRUNCATE TABLE users CASCADE;

-- Insert sample users
INSERT INTO users (user_id, email, phone_number, experience_level) 
VALUES
  ('11111111-1111-1111-1111-111111111111', 'sarah@example.com', '+1234567890', 'beginner'),
  ('22222222-2222-2222-2222-222222222222', 'mike@example.com', '+1234567891', 'intermediate'),
  ('33333333-3333-3333-3333-333333333333', 'emma@example.com', '+1234567892', 'advanced'),
  ('44444444-4444-4444-4444-444444444444', 'james@example.com', '+1234567893', 'beginner'),
  ('55555555-5555-5555-5555-555555555555', 'lisa@example.com', '+1234567894', 'intermediate');

-- Insert user preferences
INSERT INTO user_preferences (preference_id, user_id, weekly_sessions, session_duration, tracking_method)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '1-2', '5-10', 'mood'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '3', '30-45', 'pictures'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '5', '60-75', 'pictures'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '1-2', '10-20', 'neither'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', '3', '30-45', 'mood');

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
INSERT INTO progress (progress_id, user_id, mood_description, picture_url, notes, recorded_at)
VALUES
  -- Mood tracking user (Sarah)
  ('11111111-bbbb-1111-bbbb-111111111111', 
   '11111111-1111-1111-1111-111111111111',
   'Feeling energized after first session. Some muscle soreness but excited to continue.',
   NULL,
   'Completed 10 minute session',
   CURRENT_TIMESTAMP - INTERVAL '7 days'),
   
  ('22222222-bbbb-2222-bbbb-222222222222',
   '11111111-1111-1111-1111-111111111111',
   'More confident with the basic moves. Less soreness today.',
   NULL,
   'Completed 15 minute session',
   CURRENT_TIMESTAMP - INTERVAL '3 days'),

  -- Picture tracking user (Mike)
  ('33333333-bbbb-3333-bbbb-333333333333',
   '22222222-2222-2222-2222-222222222222',
   NULL,
   'progress_pics/mike_week1.jpg',
   'Working on shoulder flexibility',
   CURRENT_TIMESTAMP - INTERVAL '14 days'),

  ('44444444-bbbb-4444-bbbb-444444444444',
   '22222222-2222-2222-2222-222222222222',
   NULL,
   'progress_pics/mike_week2.jpg',
   'Noticeable improvement in form',
   CURRENT_TIMESTAMP - INTERVAL '7 days'),

  -- Picture tracking user (Emma)
  ('55555555-bbbb-5555-bbbb-555555555555',
   '33333333-3333-3333-3333-333333333333',
   NULL,
   'progress_pics/emma_week1.jpg',
   'Advanced sequence practice',
   CURRENT_TIMESTAMP - INTERVAL '10 days'),

  -- Mood tracking user (Lisa)
  ('66666666-bbbb-6666-bbbb-666666666666',
   '55555555-5555-5555-5555-555555555555',
   'Back pain has reduced significantly after three weeks of practice',
   NULL,
   'Focused on spine alignment exercises',
   CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Verify the data
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
    UNION ALL
SELECT 'Preferences', COUNT(*) FROM user_preferences
    UNION ALL
SELECT 'Goals', COUNT(*) FROM user_goals
    UNION ALL
SELECT 'Progress', COUNT(*) FROM progress;