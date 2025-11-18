/*
  # Add user_id to contents table for logged-in users

  1. Changes
    - Add user_id column to contents table (nullable for guest users)
    - Add foreign key constraint to auth.users
    - Update RLS policies to support both authenticated and anonymous users

  2. Security
    - Maintain existing public access for sharing functionality
    - Allow both authenticated and anonymous users to create content
    - Users can optionally be associated with their content
*/

-- Add user_id column to contents table (nullable for guest users)
ALTER TABLE contents 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance when querying by user_id
CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);

-- Update RLS policies to support both authenticated and anonymous users
DROP POLICY IF EXISTS "Allow public insert for shared content" ON contents;

-- Allow both authenticated and anonymous users to insert content
CREATE POLICY "Allow public insert for shared content"
  ON contents
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own content (optional - for future features)
CREATE POLICY "Users can view own content"
  ON contents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);