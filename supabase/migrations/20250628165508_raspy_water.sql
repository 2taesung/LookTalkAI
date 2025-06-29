/*
  # Setup RLS policies for content sharing

  1. Security Changes
    - Enable RLS on `contents` table
    - Add policy for public read access to shared content
    - Add policy for public insert access for creating shared content
    - Add policy for storage bucket access

  2. Storage Policies
    - Allow public uploads to media bucket
    - Allow public downloads from media bucket

  This migration enables the sharing functionality by allowing:
  - Anyone to create shared content (insert into contents table)
  - Anyone to read shared content (for viewing shared links)
  - Anyone to upload/download from the media storage bucket
*/

-- Enable RLS on contents table
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read shared content
CREATE POLICY "Allow public read access to shared content"
  ON contents
  FOR SELECT
  TO public
  USING (true);

-- Policy to allow anyone to create shared content
CREATE POLICY "Allow public insert for shared content"
  ON contents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Storage policies for media bucket
-- Note: These need to be created in the Supabase dashboard under Storage > media bucket > Policies
-- But we can document them here for reference:

/*
Storage Policies to create in Supabase Dashboard:

1. Allow public uploads:
   - Policy name: "Allow public uploads"
   - Allowed operation: INSERT
   - Target roles: public
   - Policy definition: true

2. Allow public downloads:
   - Policy name: "Allow public downloads" 
   - Allowed operation: SELECT
   - Target roles: public
   - Policy definition: true
*/