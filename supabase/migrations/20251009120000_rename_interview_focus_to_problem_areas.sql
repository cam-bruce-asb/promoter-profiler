-- Rename interview_focus column to problem_areas in analyses table
ALTER TABLE analyses RENAME COLUMN interview_focus TO problem_areas;
