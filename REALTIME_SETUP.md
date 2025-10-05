# Supabase Real-time Setup for Karaoke Application

This guide will help you enable real-time functionality for automatic queue updates and proper YouTube video playback.

## 🚀 **Step 1: Enable Supabase Real-time**

### **1.1 Enable Real-time in Supabase Dashboard**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `miysoqdylmpiljgekook`
3. Navigate to **Database** > **Publications** in the left sidebar
4. Under `supabase_realtime`, toggle ON the following tables:
   - ✅ `queue_items`
   - ✅ `rooms`
   - ✅ `songs`

### **1.2 Run SQL Script (Alternative Method)**
If the dashboard method doesn't work, run this SQL in the **SQL Editor**:

```sql
-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE songs;

-- Enable Row Level Security (RLS)
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now)
CREATE POLICY "Allow all operations on queue_items" ON queue_items
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on rooms" ON rooms
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on songs" ON songs
FOR ALL USING (true) WITH CHECK (true);
```

## 🎵 **Step 2: Test Real-time Queue Updates**

### **2.1 Start Your Application**
```bash
npm run dev
```

### **2.2 Test the Flow**
1. **Open Host Display**: Visit `http://localhost:3000/host`
2. **Create a Room**: Click "Create Room" and note the 4-digit room code
3. **Open Remote Control**: In a new browser tab/window, visit `http://localhost:3000/remote`
4. **Join the Room**: Enter the room code from step 2
5. **Add a Song**: Search for a song and add it to the queue
6. **Verify Real-time Update**: The host display should immediately show the new song in the queue

### **2.3 Expected Behavior**
- ✅ **Immediate Queue Updates**: When you add a song via remote, the host queue updates instantly
- ✅ **Database Changes**: Real-time listening to `queue_items` table changes
- ✅ **Broadcast Fallback**: Immediate broadcast events for faster updates
- ✅ **Connection Status**: Green "Connected" indicator on host display

## 📺 **Step 3: Fix YouTube Player Issues**

### **3.1 Common YouTube Player Problems**
- **Video not loading**: Check browser console for errors
- **Player not initializing**: Verify YouTube API script loads correctly
- **Autoplay blocked**: Modern browsers block autoplay without user interaction

### **3.2 Debugging YouTube Player**
1. **Open Browser Console** (F12)
2. **Look for these messages**:
   - ✅ `"YouTube API script loaded"`
   - ✅ `"YouTube API ready"`
   - ✅ `"Initializing YouTube player..."`
   - ✅ `"YouTube player ready"`

### **3.3 Test YouTube Playback**
1. **Add a song to queue** via remote control
2. **Set as current song** (this should happen automatically for first song)
3. **Verify video loads** in the host display
4. **Test playback controls** (play, pause, stop)

## 🔧 **Step 4: Troubleshooting**

### **4.1 Real-time Not Working**
```bash
# Check connection
npm run db:test-supabase
```

**Expected Output:**
```
✅ Supabase client created successfully
✅ Database connection successful!
✅ Table 'songs': 0 records
✅ Table 'rooms': 0 records
✅ Table 'queue_items': 0 records
✅ Real-time connection successful!
```

### **4.2 Queue Not Updating**
1. **Check Browser Console** for real-time subscription logs
2. **Verify RLS Policies** are enabled in Supabase
3. **Check Publications** in Supabase Dashboard
4. **Test Manual Refresh** - queue should update when you refresh the page

### **4.3 YouTube Player Not Working**
1. **Check Console Errors** for YouTube API issues
2. **Verify Internet Connection** for YouTube API access
3. **Test with Different Video** - try a different YouTube video ID
4. **Check CORS Issues** - YouTube API should work from localhost

## 📋 **Step 5: Verification Checklist**

### **Real-time Functionality**
- [ ] Host display shows "Connected" status
- [ ] Adding song via remote immediately updates host queue
- [ ] Multiple browser tabs sync in real-time
- [ ] Console shows real-time subscription messages

### **YouTube Player**
- [ ] Video player loads on host display
- [ ] Video changes when song is selected
- [ ] Playback controls work (play, pause, stop)
- [ ] No console errors related to YouTube API

### **End-to-End Flow**
- [ ] Create room on host display
- [ ] Join room from remote control
- [ ] Add multiple songs to queue
- [ ] Queue updates in real-time on host
- [ ] Video plays correctly on host display

## 🎯 **Expected Real-time Architecture**

### **Dual Real-time System**
1. **Postgres Changes**: Automatic database change detection
   - Listens to `queue_items` table changes
   - Triggers when songs are added/removed
   - More reliable for data consistency

2. **Broadcast Events**: Immediate updates
   - Faster than database polling
   - Used for playback controls
   - Fallback for queue updates

### **Connection Flow**
```
Remote Control → API Route → Database Update → Postgres Changes → Host Display
                     ↓
                Broadcast Event → Host Display (immediate)
```

## 🚨 **Common Issues & Solutions**

### **Issue: "Could not find the table 'public.songs' in the schema cache"**
**Solution**: Tables exist but not in real-time publication
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE songs;
```

### **Issue: Queue updates but with delay**
**Solution**: Check if Postgres Changes are enabled
- Verify publications in Supabase Dashboard
- Check RLS policies are not blocking access

### **Issue: YouTube player shows black screen**
**Solution**: Check video ID and API access
- Verify YouTube video ID is valid
- Check browser console for API errors
- Try with a known working video ID

Your karaoke application should now have fully functional real-time queue updates and YouTube video playback! 🎤🎵
