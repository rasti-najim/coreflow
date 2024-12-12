CREATE VIEW exercises_focus AS
SELECT DISTINCT unnest(focus) FROM exercises;
