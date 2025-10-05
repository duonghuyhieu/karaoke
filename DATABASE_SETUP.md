# Database Setup Guide

This guide will help you configure Prisma to connect directly to your Supabase PostgreSQL database with real-time functionality.

## Step 1: Get Your Supabase Database Password

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `miysoqdylmpiljgekook`
3. Navigate to **Settings** → **Database**
4. In the **Connection string** section, find your database password
5. Copy the password (it's the part after `postgres:` and before `@`)

## Step 2: Update Environment Variables

Open your `.env.local` file and replace `[YOUR-PASSWORD]` with your actual password:

```env
# Database - Connection pooling endpoint for better performance
DATABASE_URL="postgresql://postgres.miysoqdylmpiljgekook:YOUR_ACTUAL_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Supabase Configuration (for real-time functionality)
NEXT_PUBLIC_SUPABASE_URL="https://miysoqdylmpiljgekook.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY="your_youtube_api_key_here"
```

## Step 3: Test Database Connection

Run the connection test script:

```bash
node scripts/test-db-connection.js
```

If successful, you should see:
- ✅ Successfully connected to database!
- 📊 Database version information
- ⚠️ Tables not yet created (expected before migration)

## Step 4: Run Database Migration

Create the database tables:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the `songs`, `rooms`, and `queue_items` tables
- Set up all relationships and indexes
- Generate the migration files

## Step 5: Verify Setup

Run the connection test again to verify tables were created:

```bash
node scripts/test-db-connection.js
```

You should now see:
- ✅ Successfully connected to database!
- 📋 Current table counts (all showing 0, which is correct for a new database)

## Step 6: Test API Routes

Start your development server:

```bash
npm run dev
```

Test the API endpoints:

### Create a Room
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json"
```

### Search for Songs
```bash
curl "http://localhost:3000/api/songs/search?q=karaoke"
```

## Database Schema Overview

### Songs Table
- Stores karaoke song metadata
- Unique YouTube video IDs
- Indexed for fast search by title and artist

### Rooms Table  
- Manages karaoke sessions
- 4-digit room codes (e.g., "1234")
- Tracks current playing song
- Session status and timestamps

### Queue Items Table
- Song queue for each room
- Proper ordering with position field
- Cascading deletes when rooms are removed
- Optimized for real-time updates

## Troubleshooting

### Connection Issues

**Error: "password authentication failed"**
- Double-check your password in `.env.local`
- Ensure no extra spaces or characters

**Error: "Can't reach database server"**
- Try the alternative connection string format
- Check if your IP is whitelisted in Supabase

**Error: "SSL connection required"**
- Add `?sslmode=require` to your DATABASE_URL

### Migration Issues

**Error: "Table already exists"**
- Reset your database: `npx prisma migrate reset`
- Or use: `npx prisma db push` for development

**Error: "Migration failed"**
- Check your DATABASE_URL format
- Ensure database permissions are correct

## Next Steps

Once your database is set up:

1. **Test the Application**:
   - Open `/host` to create a karaoke room
   - Open `/remote` on mobile to join the room
   - Add songs and test real-time synchronization

2. **Monitor Database**:
   - Use `npx prisma studio` to view data
   - Check Supabase dashboard for query performance

3. **Production Deployment**:
   - Use connection pooling URL for production
   - Set up proper environment variables
   - Configure database backups in Supabase
