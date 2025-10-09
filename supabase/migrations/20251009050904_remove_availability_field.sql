-- Remove availability column from candidates table
ALTER TABLE candidates DROP COLUMN IF EXISTS availability;
