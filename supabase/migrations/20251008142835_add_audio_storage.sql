-- Add audio_urls column to candidates table
ALTER TABLE candidates ADD COLUMN audio_urls JSONB;

-- Create storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-audio', 'candidate-audio', true);

-- Set up storage policies for the bucket
-- Allow public to insert (for form submissions)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'candidate-audio');

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'candidate-audio');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'candidate-audio');
