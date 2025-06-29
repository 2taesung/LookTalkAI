/*
  # Create media storage bucket and RLS policies

  1. Storage Setup
    - Create 'media' bucket for storing shared images and audio files
    - Set bucket to be public for easy access to shared content
    
  2. Storage Policies
    - Allow public uploads to media bucket
    - Allow public downloads from media bucket
    - Allow public updates and deletes for cleanup
    
  3. Contents Table Policies
    - Ensure public can insert and read shared content
*/

-- Create the media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads from media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to media bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from media bucket" ON storage.objects;

-- Create storage policies for the media bucket
CREATE POLICY "Allow public uploads to media bucket"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public reads from media bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

CREATE POLICY "Allow public updates to media bucket"
  ON storage.objects
  FOR UPDATE
  TO public
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public deletes from media bucket"
  ON storage.objects
  FOR DELETE
  TO public
  USING (bucket_id = 'media');

-- Ensure contents table has correct policies
DROP POLICY IF EXISTS "Allow public read access to shared content" ON contents;
DROP POLICY IF EXISTS "Allow public insert for shared content" ON contents;

CREATE POLICY "Allow public read access to shared content"
  ON contents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert for shared content"
  ON contents
  FOR INSERT
  TO public
  WITH CHECK (true);