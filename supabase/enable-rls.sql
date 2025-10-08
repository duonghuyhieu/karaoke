-- Enable Row Level Security on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
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

-- Create policies for rooms table
CREATE POLICY "Enable read access for all users" ON rooms FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON rooms FOR DELETE USING (true);

-- Create policies for songs table
CREATE POLICY "Enable read access for all users" ON songs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON songs FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON songs FOR DELETE USING (true);

-- Create policies for queue_items table
CREATE POLICY "Enable read access for all users" ON queue_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON queue_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON queue_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON queue_items FOR DELETE USING (true);

-- Create policies for history_items table
CREATE POLICY "Enable read access for all users" ON history_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON history_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON history_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON history_items FOR DELETE USING (true);