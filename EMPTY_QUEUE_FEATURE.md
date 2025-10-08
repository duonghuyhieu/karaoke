# Empty Queue Display Feature

## Overview
When the song queue is empty on the `/host` route, the display automatically transitions to a full-screen black background with the message "Hãy chọn thêm bài hát" (Please select more songs).

## Implementation Details

### Trigger Condition
The empty queue screen is displayed when:
1. **No current song is playing** (`room.currentSong === null`)
2. **AND** the queue is empty (`room.queue.length === 0`)

### Visual Design

#### Full-Screen Empty Queue Display
When triggered, the entire host view is replaced with:
- **Background:** Solid black (`bg-black`)
- **Layout:** Full-screen overlay (`fixed inset-0`) with centered content
- **Icon:** Music icon (24x24) with 20% white opacity
- **Main Message:** "Hãy chọn thêm bài hát" in large, bold white text (4xl-6xl responsive)
- **Subtitle:** "Sử dụng điều khiển từ xa để thêm bài hát vào danh sách phát" in white with 60% opacity
- **Room Code Display:** Prominent display of the room code with frosted glass effect

#### YouTube Player Empty State
When no song is selected (but queue might have songs):
- **Background:** Black with subtle music note icon
- **Message:** "Chưa có bài hát" (No song yet)
- **Subtitle:** "Thêm bài hát để bắt đầu karaoke"

### Return to Normal Playback
The display automatically returns to normal playback mode when:
1. A song is added to the queue via the remote control
2. The real-time update triggers a re-render
3. The `room.currentSong` or `room.queue` state updates

### Files Modified

1. **`src/components/host/HostView.tsx`**
   - Added `isQueueEmpty` check
   - Added conditional rendering for empty queue state
   - Full-screen black overlay with Vietnamese message

2. **`src/components/host/HostYouTubePlayer.tsx`**
   - Updated empty state to use black background
   - Changed text to Vietnamese
   - Updated icon to music note

## User Flow

```
┌─────────────────────────────────────────────────────────┐
│  Host creates/joins room                                │
│  Queue: [] (empty)                                      │
│  Current Song: null                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  🖥️  BLACK SCREEN DISPLAYED                            │
│  "Hãy chọn thêm bài hát"                               │
│  Room Code: XXXX                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 │  Remote user adds song
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Queue updated via real-time broadcast                  │
│  Queue: [Song 1]                                        │
│  Current Song: Song 1 (auto-set if queue was empty)    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  🎵 NORMAL VIEW DISPLAYED                              │
│  YouTube player loads                                   │
│  Song info shown                                        │
│  Queue sidebar visible                                  │
└─────────────────────────────────────────────────────────┘
                 │
                 │  Last song completes
                 │  Auto-advance removes it from queue
                 │  Queue becomes empty
                 ▼
┌─────────────────────────────────────────────────────────┐
│  🖥️  BLACK SCREEN DISPLAYED AGAIN                      │
│  "Hãy chọn thêm bài hát"                               │
│  (Cycle repeats)                                        │
└─────────────────────────────────────────────────────────┘
```

## Real-time Behavior

The empty queue check is **reactive** and updates immediately when:

1. **Songs are added:** Real-time broadcast from API routes triggers state update
2. **Songs are removed:** Queue updates via real-time subscription
3. **Auto-advance:** When a song ends, the auto-next removes it and may trigger empty state

Thanks to the Supabase real-time optimizations, the transition between empty and normal states happens in **< 200ms**.

## Testing

### Test Case 1: Initial Empty Queue
1. Create a new room on `/host`
2. ✅ Should see black screen with "Hãy chọn thêm bài hát"
3. Open remote on another device/tab
4. Add a song
5. ✅ Black screen should transition to normal view with YouTube player

### Test Case 2: Queue Empties After Playback
1. Add a single song to the queue
2. ✅ Normal view should be visible
3. Let the song play to completion (or skip it)
4. ✅ Should transition back to black screen with message

### Test Case 3: Multiple Songs
1. Add multiple songs to queue
2. ✅ Normal view should remain visible
3. Let all songs complete
4. ✅ After last song, should show black screen

### Test Case 4: Real-time Updates
1. Open host view with empty queue (black screen)
2. Open remote in another browser/device
3. Add a song from remote
4. ✅ Host should update to normal view in < 200ms

## Styling Details

### Empty Queue Screen
```tsx
<div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
  {/* Content */}
</div>
```

- **Fixed positioning:** Covers entire viewport
- **Z-index 50:** Ensures it's on top of all other content
- **Centered:** Flexbox centering for both axes
- **Responsive text:** 4xl on mobile, 6xl on large screens

### Room Code Display
```tsx
<div className="flex items-center justify-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
  {/* Room code */}
</div>
```

- **Frosted glass effect:** `bg-white/10 backdrop-blur-sm`
- **Prominent code:** `text-3xl font-mono font-bold`
- **Subtle border:** `border-white/20`

## Performance Considerations

- **Conditional rendering:** The empty check (`isQueueEmpty`) is computed on every render but is extremely fast (simple boolean checks)
- **No additional API calls:** State is already available from `useRoom` hook
- **Smooth transitions:** React's reconciliation handles the switch between empty and normal states efficiently
- **Real-time updates:** Optimized broadcast system ensures < 200ms latency

## Future Enhancements

Potential improvements for this feature:

1. **Transition animations:** Add fade-in/fade-out when switching states
2. **QR code display:** Show QR code for easy mobile access to remote control
3. **Countdown timer:** Show how long the queue has been empty
4. **Background music:** Play ambient music when queue is empty
5. **Customizable message:** Allow room host to customize the empty queue message
6. **Statistics:** Show total songs played, session duration, etc.

## Localization

Currently, messages are in Vietnamese:
- "Hãy chọn thêm bài hát" = "Please select more songs"
- "Sử dụng điều khiển từ xa để thêm bài hát vào danh sách phát" = "Use the remote control to add songs to the playlist"
- "Mã phòng" = "Room code"
- "Chưa có bài hát" = "No song yet"
- "Thêm bài hát để bắt đầu karaoke" = "Add songs to start karaoke"

To add English or other languages, implement a translation system or add language toggle.
