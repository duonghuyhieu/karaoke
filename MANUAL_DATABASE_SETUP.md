# Manual Database Setup Guide

Since Prisma migrations are having issues with the connection, let's set up the database tables manually using Supabase's SQL Editor.

## 🚀 **Quick Setup Steps**

### **Step 1: Access Supabase SQL Editor**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `miysoqdylmpiljgekook`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Run Database Schema**
Copy and paste the following SQL into the editor and click **Run**:

```sql
-- Karaoke Application Database Schema

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  "youtubeId" TEXT UNIQUE NOT NULL,
  duration TEXT NOT NULL,
  thumbnail TEXT,
  "channelTitle" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for songs table
CREATE INDEX IF NOT EXISTS songs_title_idx ON songs(title);
CREATE INDEX IF NOT EXISTS songs_artist_idx ON songs(artist);
CREATE INDEX IF NOT EXISTS songs_createdAt_idx ON songs("createdAt");

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "roomId" TEXT UNIQUE NOT NULL,
  "currentSongId" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("currentSongId") REFERENCES songs(id)
);

-- Create indexes for rooms table
CREATE INDEX IF NOT EXISTS rooms_isActive_idx ON rooms("isActive");
CREATE INDEX IF NOT EXISTS rooms_createdAt_idx ON rooms("createdAt");

-- Create queue_items table
CREATE TABLE IF NOT EXISTS queue_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "roomId" TEXT NOT NULL,
  "songId" TEXT NOT NULL,
  position INTEGER NOT NULL,
  "addedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY ("roomId") REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY ("songId") REFERENCES songs(id),
  UNIQUE("roomId", position)
);

-- Create indexes for queue_items table
CREATE INDEX IF NOT EXISTS queue_items_roomId_position_idx ON queue_items("roomId", position);
CREATE INDEX IF NOT EXISTS queue_items_addedAt_idx ON queue_items("addedAt");

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('songs', 'rooms', 'queue_items')
ORDER BY tablename;
```

### **Step 3: Verify Tables Created**
After running the SQL, you should see:
- ✅ **Success message** indicating tables were created
- 📋 **Verification query results** showing 3 tables: `queue_items`, `rooms`, `songs`

### **Step 4: Test Application Connection**
Now test that your application can connect to the database:

```bash
npm run db:test
```

You should see:
- ✅ Successfully connected to database!
- 📋 Current table counts (all showing 0, which is correct for new tables)

### **Step 5: Start Your Application**
```bash
npm run dev
```

## 🔍 **Troubleshooting**

### **If SQL Editor Shows Errors:**
- Make sure you're in the correct project
- Check that you have admin permissions
- Try running each CREATE TABLE statement individually

### **If Connection Test Fails:**
- Verify your `.env.local` has the correct DATABASE_URL
- Make sure your password is correct in the connection string
- Check that no `.env` file is overriding your settings

### **If Application Can't Connect:**
- Restart your development server after creating tables
- Check browser console for connection errors
- Verify Supabase real-time is enabled for your project

## 📋 **Database Schema Overview**

### **Songs Table**
- Stores YouTube video metadata for karaoke tracks
- Unique constraint on `youtubeId` to prevent duplicates
- Indexed for fast search by title and artist

### **Rooms Table**
- Manages karaoke sessions with 4-digit room codes
- Tracks current playing song via foreign key
- Indexed for active room queries

### **Queue Items Table**
- Stores song queue for each room
- Position-based ordering with unique constraint
- Cascading delete when rooms are removed
- Optimized for real-time queue updates

## 🎯 **Next Steps After Setup**

1. **Test Room Creation**: Visit `/host` to create a room
2. **Test Mobile Remote**: Visit `/remote` to join a room
3. **Test Real-time Sync**: Add songs and verify updates
4. **Test Playback Controls**: Verify YouTube player synchronization

## 🔧 **Alternative: Using Prisma Studio**

If you prefer a GUI approach:
1. Run `npx prisma studio` (after tables are created)
2. View and manage your data through the web interface
3. Verify all relationships are working correctly

The manual setup ensures your database is properly configured for the karaoke application with all necessary tables, indexes, and relationships.
