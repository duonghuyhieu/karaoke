-- =====================================================
-- Supabase Real-time Performance Optimizations
-- =====================================================
-- This script optimizes the database for real-time performance
-- Run this in the Supabase SQL Editor

-- 1. Add indexes for faster RLS policy evaluation
CREATE INDEX IF NOT EXISTS idx_queue_items_room_id ON queue_items(room_id);
CREATE INDEX IF NOT EXISTS idx_queue_items_position ON queue_items(position);
CREATE INDEX IF NOT EXISTS idx_history_items_room_id ON history_items(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_room_id ON rooms(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active) WHERE is_active = true;

-- 2. Optimize RLS policies for real-time (simplify evaluation)
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON rooms;
DROP POLICY IF EXISTS "Enable insert for all users" ON rooms;
DROP POLICY IF EXISTS "Enable update for all users" ON rooms;
DROP POLICY IF EXISTS "Enable delete for all users" ON rooms;

DROP POLICY IF EXISTS "Enable read access for all users" ON songs;
DROP POLICY IF EXISTS "Enable insert for all users" ON songs;
DROP POLICY IF EXISTS "Enable update for all users" ON songs;
DROP POLICY IF EXISTS "Enable delete for all users" ON songs;

DROP POLICY IF EXISTS "Enable read access for all users" ON queue_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON queue_items;
DROP POLICY IF EXISTS "Enable update for all users" ON queue_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON queue_items;

DROP POLICY IF EXISTS "Enable read access for all users" ON history_items;
DROP POLICY IF EXISTS "Enable insert for all users" ON history_items;
DROP POLICY IF EXISTS "Enable update for all users" ON history_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON history_items;

-- Create single permissive policies (faster than 4 separate policies)
CREATE POLICY "Allow all operations" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON songs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON queue_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON history_items FOR ALL USING (true) WITH CHECK (true);

-- 3. Enable real-time for all tables (if not already enabled)
-- This adds tables to the supabase_realtime publication
DO $$
BEGIN
  -- Check if tables are already in publication, add if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'queue_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE queue_items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'songs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE songs;
  END IF;
END $$;

-- 4. Add composite index for common queue queries
CREATE INDEX IF NOT EXISTS idx_queue_items_room_position ON queue_items(room_id, position);

-- 5. Analyze tables to update statistics for query planner
ANALYZE rooms;
ANALYZE songs;
ANALYZE queue_items;
ANALYZE history_items;

-- 6. Optional: Set replica identity to FULL for better real-time change tracking
-- This allows real-time to see the full row data in updates/deletes
ALTER TABLE queue_items REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify indexes were created
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('rooms', 'songs', 'queue_items', 'history_items')
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify real-time publication
SELECT
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
