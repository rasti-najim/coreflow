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

-- First, let's clear any existing data (optional)
-- TRUNCATE TABLE exercises;

-- Warmup Exercises
INSERT INTO exercises (name, description, focus, skill_level, is_two_sided, lottie_file_url) VALUES
    ('Seated Spine Roll',
     'Sit tall, knees bent, feet flat, and hands resting on your thighs. Inhale to lengthen your spine, then exhale as you gently tuck your pelvis, round your back, and roll down into a C-curve. Pause, breathe deeply, then inhale to roll back up, stacking your spine one vertebra at a time.',
     ARRAY['Breathing'],
     'beginner',
     false,
     'exercise_animations/warmups/SeatedSpineRoll.json'),
     
    ('Abdominal Breathing',
     'Lie on your back, knees bent, feet grounded. Rest your hands gently on your belly. Take a deep inhale through your nose, letting your belly rise under your hands. Exhale slowly through your mouth, feeling your belly soften and sink. Let each breath flow naturally, connecting your body and breath.',
     ARRAY['Breathing'],
     'beginner',
     false,
     'exercise_animations/warmups/AbdominalBreathing.json'),
     
    ('Pilates Half Roll-Up',
     'Sit tall, knees bent, feet flat, and arms reaching forward. Inhale to prepare, then exhale as you tuck your pelvis, creating a C-curve with your spine, and slowly roll back halfway. Hold for a breath, keeping your core engaged, then inhale to roll back up with control. Feel your abs working the entire time!',
     ARRAY['Abs'],
     'intermediate',
     false,
     'exercise_animations/warmups/PilatesHalfRollUp.json'),
     
    ('Donkey Kick',
     'Come onto all fours with wrists under shoulders and knees under hips. Keep your core engaged and back flat. Lift one leg, bending at 90 degrees, with your foot flexed. Exhale as you press your heel toward the ceiling, squeezing your glute. Inhale to lower slightly without touching down, then repeat on the opposite side.',
     ARRAY['Mobility & Flexibility'],
     'intermediate',
     true,
     'exercise_animations/warmups/DonkeyKick.json'),
     
    ('Spine Stretch Forward',
     'Sit tall with your legs straight and slightly apart, arms reaching forward. Inhale to grow taller, then exhale as you round forward, reaching past your toes. Inhale to sit back up tall, stacking your spine one vertebra at a time.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     false,
     'exercise_animations/warmups/SpineStretchForward.json'),
     
    ('Cat-Cow Stretch',
     'Come onto all fours, hands under shoulders, knees under hips. Inhale as you arch your back, lifting your head and tailbone. Exhale as you round your spine, tucking your chin and pelvis. Flow gently between the two.',
     ARRAY['Mobility & Flexibility', 'Breathing'],
     'beginner',
     false,
     'exercise_animations/warmups/CatCowStretch.json'),
     
    ('Chest Lift',
     'Lie on your back, knees bent, hands behind your head. Inhale to prepare, exhale as you curl your head, neck, and shoulders off the mat, engaging your core. Inhale to lower back down with control.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/warmups/ChestLift.json'),
     
    ('Leg Slides',
     'Lie on your back, knees bent. Inhale to prepare, then exhale as you slide one leg straight out along the mat. Inhale to bring it back in, keeping your pelvis stable.',
     ARRAY['Core', 'Breathing'],
     'beginner',
     true,
     'exercise_animations/warmups/LegSlides.json');

-- Cooldown Exercises
INSERT INTO exercises (name, description, skill_level, is_two_sided, lottie_file_url) VALUES
    ('Child''s Pose',
     'Start on all fours, then gently sit back onto your heels, reaching your arms forward and lowering your forehead to the mat. Inhale deeply, feeling your ribs expand. Exhale to soften your hips and stretch through your spine. Let your body relax as you breathe.',
     ARRAY['Breathing'],
     'beginner',
     false,
     'exercise_animations/cooldowns/ChildsPose.json'),
     
    ('Seal Pose',
     'Lie face down on your mat, legs extended long and feet hip-width apart. Place your hands under your shoulders, elbows tucked close to your sides. Inhale as you press into your hands, lifting your chest and head off the mat, keeping your elbows soft. Hold for a breath, then exhale as you gently lower back down. Repeat with control.',
     ARRAY['Breathing', 'Mobility & Flexibility'],
     'intermediate',
     false,
     'exercise_animations/cooldowns/SealPose.json'),
     
    ('Cat-Cow Stretch',
     'Come onto all fours, hands under shoulders, knees under hips. Inhale as you arch your back, lifting your head and tailbone. Exhale as you round your spine, tucking your chin and pelvis. Flow gently between the two.',
     ARRAY['Mobility & Flexibility', 'Breathing'],
     'beginner',
     false,
     'exercise_animations/cooldowns/CatCowStretch.json'),
     
    ('Sit & Breathe',
     'Sit comfortably with legs crossed, back tall, and shoulders relaxed. Place your hands lightly on your ribcage. Inhale deeply through your nose, feeling your ribs expand outward. Exhale slowly through your mouth, drawing your belly button gently toward your spine. Focus on the rhythm of your breath, staying present and centered.',
     ARRAY['Breathing'],
     'beginner',
     false,
     'exercise_animations/cooldowns/SitAndBreathe.json'),
     
    ('Seated Forward Hold',
     'Sit tall with your legs extended straight in front of you. Inhale to lengthen your spine, then exhale as you hinge forward, reaching for your feet or shins. Let your head relax as you stretch your hamstrings and back',
     ARRAY['Mobility & Flexibility', 'Breathing'],
     'beginner',
     false,
     'exercise_animations/cooldowns/SeatedForwardHold.json'),
     
    ('Spine Twist',
     'Sit tall with your legs extended and arms out to the sides. Inhale to prepare, then exhale as you twist your torso to one side, reaching your arm behind you. Inhale to return to center, and exhale to switch sides.',
     ARRAY['Mobility & Flexibility', 'Breathing'],
     'beginner',
     false,
     'exercise_animations/cooldowns/SpineTwist.json'),
     
    ('Knee-to-Chest Stretch',
     'Lie on your back, hug one knee into your chest, and extend the other leg straight on the mat. Inhale deeply, then exhale to pull the knee closer. Switch legs when ready, relaxing into the stretch.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     false,
     'exercise_animations/cooldowns/KneeToChestStretch.json'),
     
    ('Roll Down',
     'Stand tall, feet hip-width apart. Inhale to prepare, then exhale as you roll down one vertebra at a time, reaching toward the floor. Inhale at the bottom, then exhale as you slowly roll back up, stacking your spine.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     false,
     'exercise_animations/cooldowns/RollDown.json'),
     
    ('Breathe & Relax',
     'Lie on your back, arms relaxed at your sides, and legs extended or knees bent. Inhale deeply through your nose, feeling your belly rise. Exhale slowly through your mouth, letting your body completely relax. Stay present with your breath.',
     ARRAY['Breathing'],
     'beginner',
     false,
     'exercise_animations/cooldowns/BreatheAndRelax.json');

-- Target Exercises
INSERT INTO exercises (name, description, skill_level, is_two_sided, lottie_file_url) VALUES
    ('Pilates Ab Curl',
     'Lie on your back, knees bent, feet grounded, hands supporting your head with elbows wide. Inhale deeply, and as you exhale, draw your belly in and curl your head, neck, and shoulders off the mat. Pause at the top, then slowly lower down with control. Feel your core do the work!',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/PilatesAbCurl.json'),
     
    ('Ab Curl With Reaches',
     'Lie on your back, knees bent, feet grounded. Place one hand lightly behind your head, and extend the other arm forward. Pulse your forward arm up and down, inhaling in through your nose and out through your mouth.',
     ARRAY['Core', 'Upper Body'],
     'advanced',
     true,
     'exercise_animations/targets/AbCurlWithReaches.json'),
     
    ('Single Leg Lift',
     'Lie on your back, one knee bent with your foot flat and the other leg extended long. Inhale to prepare, then exhale as you lift your extended leg to about 90 degrees, keeping your core engaged and hips steady. Inhale as you lower the leg with control, staying grounded through your center.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/SingleLegLift.json'),
     
    ('Modified Dead Bugs',
     'Lie on your back, legs extended at a diagonal tabletop. Extend one arm overhead. Inhale to prepare, then exhale as you engage your core, reaching one arm and your opposite leg away from each other. Keep your back grounded and your movements slow. Inhale to return.',
     ARRAY['Core'],
     'advanced',
     false,
     'exercise_animations/targets/ModifiedDeadBugs.json'),
     
    ('Double Leg Lowers',
     'Lie on your back, legs extended straight up, and curl your head, neck, and shoulders off the mat, hands lightly behind your head. Inhale to prepare, and as you exhale, lower your legs slowly toward the mat, keeping your core tight and back stable. Inhale to lift them back up with control.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/DoubleLegLowers.json'),
     
    ('Criss Cross',
     'Lie on your back, hands behind your head, legs in tabletop. Curl your head, neck, and shoulders up. Inhale to prepare, then exhale as you twist your torso, bringing your elbow to the opposite knee while extending the other leg. Inhale to center, exhale to switch sides.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/CrissCross.json'),
     
    ('Glute Bridge with Leg Lift',
     'Lie on your back, knees bent, feet hip-width apart, and arms by your sides. Press into your heels and lift your hips into a bridge. Once stable, lift one leg into tabletop, keeping your hips level. Inhale to hold, exhale to lower your opposite leg or pulse your hips.',
     ARRAY['Glutes', 'Core'],
     'advanced',
     true,
     'exercise_animations/targets/GluteBridgeWithLegLift.json'),
     
    ('Pulsed Glute Bridge',
     'Lie on your back, knees bent, feet hip-width apart, and arms reaching straight up. Press into your heels and lift your hips into a bridge. Hold at the top, then begin small pulses—lower an inch, lift an inch—keeping your glutes tight and core engaged.',
     ARRAY['Core'],
     'advanced',
     false,
     'exercise_animations/targets/PulsedGluteBridge.json'),
     
    ('Clams',
     'Lie on your side, knees bent and stacked, with your head resting on your arm. Keep your feet together and inhale to prepare. Exhale as you lift your top knee, keeping your hips steady and core engaged. Inhale to lower with control.',
     ARRAY['Glutes'],
     'intermediate',
     true,
     'exercise_animations/targets/Clams.json'),
     
    ('Clams With Leg Extension',
     'Lie on your side, knees bent and stacked, head resting on your arm. Inhale to prepare, exhale as you lift your top knee into a clam position. Pause, then extend your top leg straight out. Inhale to bend the knee back into clam, then lower with control.',
     ARRAY['Glutes', 'Core'],
     'advanced',
     true,
     'exercise_animations/targets/ClamsWithLegExtension.json'),
     
    ('Mermaid Stretch',
     'Sit tall with your legs folded to one side, one hand resting on the mat. Inhale to reach your opposite arm up and over, lengthening through your side. Exhale as you deepen the stretch, keeping both hips grounded. Inhale to return to center.',
     ARRAY['Mobility & Flexibility'],
     'intermediate',
     true,
     'exercise_animations/targets/MermaidStretch.json'),
     
    ('Pilates Kneeling Pushup',
     'Start on your knees, hands under shoulders, and core engaged. Inhale to prepare, then exhale as you bend your elbows, lowering your chest toward the mat. Keep a straight line from your head to your knees. Inhale to press back up.',
     ARRAY['Upper Body'],
     'beginner',
     false,
     'exercise_animations/targets/PilatesKneelingPushup.json'),
     
    ('Plank to Downward Dog',
     'Start in a strong plank, hands under shoulders and core engaged. Inhale to prepare, then exhale as you lift your hips toward the ceiling, pressing back into a downward dog. Keep your spine long and heels reaching toward the mat. Inhale to return to plank with control.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     false,
     'exercise_animations/targets/PlankToDownwardDog.json'),
     
    ('Plank Hold',
     'Come into a plank position with hands under shoulders, legs extended, and core engaged. Inhale to lengthen your spine, and exhale to draw your belly button toward your spine. Hold steady, keeping your body in one straight line from head to heels.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/PlankHold.json'),
     
    ('Deadbugs',
     'Lie on your back, knees bent at tabletop, arms reaching to the ceiling. Inhale to prepare, then exhale as you lower one arm and the opposite leg toward the mat, keeping your core engaged and back stable. Inhale to return to center, then switch sides.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/DeadBugs.json'),
     
    ('Scissors',
     'Lie on your back, legs in a tabletop position. Inhale to prepare, then exhale as you lower one leg at a time. Switch legs smoothly with each breath, keeping your core engaged and movements controlled.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/Scissors.json'),
     
    ('Pilates Hundreds',
     'Lie on your back, legs in tabletop, and curl your head, neck, and shoulders off the mat. Extend your arms by your sides, hovering just above the mat. Inhale for 5 counts as you pump your arms, then exhale for 5 counts.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/PilatesHundreds.json'),
     
    ('Hip Bridge',
     'Lie on your back, knees bent, feet hip-width apart, and arms by your sides. Inhale to prepare, then exhale as you press into your heels, lifting your hips toward the ceiling. Engage your glutes and core at the top.',
     ARRAY['Glutes', 'Core'],
     'beginner',
     false,
     'exercise_animations/targets/HipBridge.json'),
     
    ('Bird-Dog',
     'Start on all fours, hands under shoulders and knees under hips. Inhale to prepare, then exhale as you extend one arm forward and the opposite leg back, creating a straight line from your fingers to your toes.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/BirdDog.json'),
     
    ('Tabletop Leg Circles',
     'Start on all fours, hands under shoulders and knees under hips. Extend one leg straight back, keeping it lifted at hip height. Inhale to prepare, then exhale as you draw small circles with your lifted leg.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/TabletopLegCircles.json'),
     ('Tabletop Side Leg Extensions',
     'Start on all fours, hands under shoulders and knees under hips. Extend one leg straight out to the side at hip height. Inhale to prepare, then exhale as you lift the leg slightly higher, keeping your core engaged and your body stable.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/TabletopSideLegExtensions.json'),
     
    ('Lying Knee Pull-Ins',
     'Lie on your back with one leg extended and the other knee pulled into your chest. Curl your head, neck, and shoulders off the mat, engaging your core. Inhale to switch legs, extending one while pulling the opposite knee in.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/LyingKneePullIns.json'),
     
    ('Deadbug Leg Raises',
     'Lie on your back with one knee bent in tabletop, your other leg straight in the air, and arms by your sides. Inhale to prepare, then exhale as you lower one leg toward the mat, keeping the other leg stable.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/DeadbugLegRaises.json'),
     
    ('Full Pilates Roll-Up',
     'Start lying flat on your back, legs extended and arms reaching overhead. Inhale to prepare, then exhale as you sweep your arms forward, lifting your head, neck, and shoulders off the mat. Roll up one vertebra at a time, reaching toward your toes.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/FullPilatesRollUp.json'),
     
    ('Seated Leg Pumps',
     'Sit tall with your hands supporting you behind your back, fingers pointing outward, and legs extended straight. Inhale to prepare, then exhale as you lift one leg, pointing your toes, and pump it up and down with control.',
     ARRAY['Core'],
     'beginner',
     true,
     'exercise_animations/targets/SeatedLegPumps.json'),
     
    ('Flutter Kicks',
     'Lie on your back with your legs extended straight up toward the ceiling and hands under your hips for support. Inhale to prepare, then exhale as you alternate your legs in a fluttering motion.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/FlutterKicks.json'),
     
    ('Shallow Lift-Lowers',
     'Lie on your back with legs extended and hovering slightly above the mat. Curl your head, neck, and shoulders off the mat, engaging your core. Inhale as you lift your legs a few inches higher, and exhale as you lower them slightly.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/ShallowLiftLowers.json'),

    ('Boat Hold',
     'Sit tall on your mat, knees bent and feet flat. Lean back slightly, engaging your core, and lift one leg, then the other, so you''re balancing on your sit bones. Extend your arms forward, keeping your chest open and shoulders relaxed.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/BoatHold.json'),
     
    ('Single Leg Crunch',
     'Lie on your back, one leg bent with the foot flat and the other leg lifted in tabletop. Place your hands behind your head, elbows wide. Inhale to prepare, then exhale as you curl your head, neck, and shoulders up toward the lifted leg.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/SingleLegCrunch.json'),
     
    ('Side Leg Lift',
     'Lie on your side, propped up on your forearm with your legs extended straight. Inhale to prepare, then exhale as you lift your top leg to hip height or slightly higher, keeping it straight.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/SideLegLift.json'),
     
    ('Plank Kick-back',
     'Start in a plank position, resting on your hands with your body in a straight line. Keep your core engaged and hips stable. Inhale to prepare, then exhale as you extend one leg back and kick it upward, keeping it straight.',
     ARRAY['Glutes'],
     'beginner',
     true,
     'exercise_animations/targets/PlankKickback.json'),
     
    ('Tabletop Pulse',
     'Start on all fours, wrists under shoulders and knees under hips. Extend one leg straight back and the opposite arm straight forward. Inhale to prepare, then exhale as you pulse the lifted leg upward in small, controlled movements.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/TabletopPulse.json'),
     
    ('Downward Dog Walks',
     'Start in a downward dog position with your hips lifted high, hands and feet pressing firmly into the mat. Inhale to prepare, then exhale as you bend one knee while keeping the opposite leg straight.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     false,
     'exercise_animations/targets/DownwardDogWalks.json'),
     
    ('Plank Shift',
     'Start in a high plank position, hands under shoulders and body in a straight line. Engage your core and inhale as you shift your weight slightly in front of you, keeping your hips level.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/PlankShift.json'),
     
    ('Kneeling Reach Through',
     'Start on all fours with wrists under shoulders and knees under hips. Inhale as you reach one arm up toward the ceiling, opening your chest. Exhale as you thread that arm under your body.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     true,
     'exercise_animations/targets/KneelingReachThrough.json'),
     
    ('Tabletop to Childs Pose',
     'Start on all fours in a tabletop position, with your wrists under shoulders and knees under hips. Inhale as you hold steady, then exhale as you sit back onto your heels, stretching your arms forward into a childs pose.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     false,
     'exercise_animations/targets/TabletopToChildsPose.json'),
     
    ('Boat Hold w/ Arm Pulses',
     'Sit tall with your knees bent and feet flat on the mat. Lean back slightly, engaging your core, and extend your arms forward at shoulder height. Inhale to prepare, then exhale as you make small, controlled pulsing movements with your arms up and down.',
     ARRAY['Arms', 'Core'],
     'intermediate',
     false,
     'exercise_animations/targets/BoatHoldWithArmPulses.json'),
     
    ('Lean Back Cross Crunch',
     'Sit tall with knees bent and feet flat on the mat. Place your hands lightly behind your head, elbows wide. Lean back slightly, engaging your core. Exhale as you twist, bringing one elbow toward the opposite knee.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/LeanBackCrossCrunch.json'),
     
    ('Side Arm Opener',
     'Sit tall with your knees bent, feet flat on the mat, and arms extended forward at shoulder height. Lean back slightly, engaging your core. Inhale to prepare, then exhale as you open one arm out to the side.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/SideArmOpener.json'),
     
    ('Reverse Plank Lifts',
     'Sit on your mat with legs extended and hands placed slightly behind you, fingers pointing forward. Press into your hands and heels as you lift your hips into a straight line, forming a reverse plank.',
     ARRAY['Core'],
     'advanced',
     false,
     'exercise_animations/targets/ReversePlankLifts.json'),
     
    ('Side Plank With Clam',
     'Start in a side plank on your forearm, with your knees bent and feet stacked. Keep your hips lifted and your core engaged. Inhale as you hold steady, then exhale to open your top knee like a clam.',
     ARRAY['Core'],
     'advanced',
     true,
     'exercise_animations/targets/SidePlankWithClam.json'),
     
    ('Side Plank Rotation With Knee Opener',
     'Start in a side plank on your forearm with your knees bent and hips lifted. Extend your top arm toward the ceiling. Inhale as you rotate your torso, threading your top arm under your body.',
     ARRAY['Core'],
     'advanced',
     true,
     'exercise_animations/targets/SidePlankRotationWithKneeOpener.json'),
     
    ('Side Plank Crunch With Reach Out',
     'Come into a side plank position on your forearm with your bottom knee bent and your top leg extended out. Rest your top hand lightly behind your head. Exhale, crunching your top elbow toward your lifted leg.',
     ARRAY['Core'],
     'advanced',
     true,
     'exercise_animations/targets/SidePlankCrunchWithReachOut.json'),
     
    ('Side Plank Leg Pulses',
     'Settle into a modified side plank on your forearm, with your bottom knee bent and your top leg extended straight. Engage your core, and lift your top leg to hip height. Begin small, controlled pulses with your top leg.',
     ARRAY['Core'],
     'advanced',
     true,
     'exercise_animations/targets/SidePlankLegPulses.json'),
     
    ('Side Plank Leg Hold',
     'Start in a side plank on your forearm, with your bottom knee bent and your top leg extended. Lift your top leg to hip height and hold it steady. Keep your hips stacked and your core engaged.',
     ARRAY['Core'],
     'advanced',
     true,
     'exercise_animations/targets/SidePlankLegHold.json'),
     
    ('Side Plank Hold',
     'Start by lying on your side with your elbow directly under your shoulder and legs extended, stacking your feet one on top of the other. Engage your core and lift your hips off the mat.',
     ARRAY['Core'],
     'advanced',
     true,
     'exercise_animations/targets/SidePlankHold.json'),
     
    ('Straight Leg Stretch',
     'Take a seat with one leg extended out and the other folded in comfortably. Inhale and lengthen your spine. As you exhale, reach your arm over towards your extended leg.',
     ARRAY['Mobility & Flexibility'],
     'beginner',
     true,
     'exercise_animations/targets/StraightLegStretch.json'),
     
    ('Twist Crunch',
     'Start seated with your knees bent and feet flat on the mat. Gently recline your torso, engaging your core. Place your right hand behind your head, keeping your elbow wide.',
     ARRAY['Core'],
     'beginner',
     false,
     'exercise_animations/targets/TwistCrunch.json'),
     
    ('Bear Crawl Lifts',
     'Come onto all fours, with your hands stacked under your shoulders and knees under your hips. Tuck your toes under and engage your core, creating a neutral spine.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/BearCrawlLifts.json'),
     
    ('Plank Walk In and Outs',
     'Start in a high plank position, with your hands directly under your shoulders and your body forming a straight line from head to heels. Engage your core and keep your hips steady.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/PlankWalkInsAndOuts.json'),
     
    ('Reverse Tabletop',
     'Sit on your mat with your feet flat and hip-width apart, and your hands placed just behind your hips, fingers pointing forward. Press through your palms and heels as you lift your hips toward the ceiling.',
     ARRAY['Core'],
     'advanced',
     false,
     'exercise_animations/targets/ReverseTabletop.json'),
     
    ('Scissor Crunch',
     'Lie on your back with your hands lightly supporting your head, elbows wide. Bring your legs into tabletop position, knees bent at 90 degrees. Lift your head, neck, and shoulders off the mat as you twist your torso.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/ScissorCrunch.json'),
     
    ('Scissor Leg Extension',
     'Begin seated with your forearms supporting your upper body, hands planted on the mat behind you. Extend both legs outward, lifting them slightly off the floor.',
     ARRAY['Core'],
     'intermediate',
     false,
     'exercise_animations/targets/ScissorLegExtension.json'),
     
    ('Single Leg Flutter Kick',
     'Start by lying on your back with your legs extended and arms by your sides or hands under your hips for support. Engage your core, lifting both legs off the mat.',
     ARRAY['Core'],
     'intermediate',
     true,
     'exercise_animations/targets/SingleLegFlutterKick.json');