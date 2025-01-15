CREATE TABLE streak_levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  streak_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO streak_levels (name, emoji, streak_count) VALUES ('Beginner Pose', '🧘', 2);
INSERT INTO streak_levels (name, emoji, streak_count) VALUES ('Strong Footing', '🦶', 4);
INSERT INTO streak_levels (name, emoji, streak_count) VALUES ('Core Strength', '💪', 8);
INSERT INTO streak_levels (name, emoji, streak_count) VALUES ('Dynamic Flow', '🤸', 15);
INSERT INTO streak_levels (name, emoji, streak_count) VALUES ('Summit Flow', '🏔', 31);
INSERT INTO streak_levels (name, emoji, streak_count) VALUES ('Serenity Flow', '🕊', 91);
