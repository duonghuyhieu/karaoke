# 🎤 Karaoke Web App

A modern karaoke web application with real-time synchronization between host display and mobile remote controls. Built with Next.js 15, Prisma, Supabase, and Pusher Channels.

## ✨ Features

### 🏠 Host Display
- 📺 **TV-Optimized Interface**: Large screen display perfect for TVs and projectors
- 🎵 **YouTube Player**: Embedded YouTube player with karaoke video playback
- 📋 **Live Queue Display**: Real-time queue updates from mobile devices
- 🎮 **Playback Controls**: Play, pause, skip, and stop controls
- 🔴 **Room Management**: Create and manage karaoke rooms with unique codes

### 📱 Mobile Remote Control
- 🔍 **Song Search**: Search YouTube for karaoke songs
- ➕ **Queue Management**: Add songs to queue, view upcoming songs
- 🎮 **Remote Playback Control**: Control host playback from mobile device
- 📱 **Mobile-Optimized**: Touch-friendly interface designed for phones
- 🔗 **Room Joining**: Join karaoke sessions with 4-digit room codes

### 🚀 Real-time Features
- ⚡ **Live Synchronization**: Instant updates between host and mobile devices
- 🔄 **Multi-room Support**: Multiple concurrent karaoke sessions
- 📡 **Pusher Integration**: Real-time communication via Pusher Channels
- 🗄️ **Database Persistence**: Songs and queues stored in Supabase/PostgreSQL

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- YouTube Data API v3 key
- Pusher Channels account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd karaoke
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

4. Set up environment variables:
```bash
cp .env.example .env.local
```

5. Configure your `.env.local` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/karaoke?schema=public"

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY="your_youtube_api_key_here"

# Pusher Channels
NEXT_PUBLIC_PUSHER_APP_KEY="your_pusher_app_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_SECRET="your_pusher_secret"
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Dual-Route System
- **`/host`**: TV/computer display interface for karaoke playback
- **`/remote`**: Mobile controller interface for song management
- **`/`**: Landing page with mode selection

### Real-time Synchronization
- **Pusher Channels**: WebSocket-based real-time communication
- **Room-based Sessions**: Unique 4-digit room codes for multiple concurrent sessions
- **Event Broadcasting**: Queue updates, playback controls, and song changes

### Database Schema
- **Songs**: YouTube video metadata and karaoke track information
- **Rooms**: Karaoke session management with current song tracking
- **Queue**: Per-room song queues with position ordering

### API Routes
- `POST /api/rooms` - Create new karaoke room
- `GET /api/rooms?roomId=1234` - Get room details
- `POST /api/rooms/[roomId]/queue` - Add song to queue
- `DELETE /api/rooms/[roomId]/queue` - Remove song from queue
- `POST /api/rooms/[roomId]/playback` - Control playback
- `GET /api/songs/search` - Search YouTube for karaoke songs

## 🔑 Setting up Required Services

### YouTube Data API v3
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Restrict the API key to YouTube Data API v3 (recommended)

### Pusher Channels
1. Sign up at [Pusher.com](https://pusher.com/)
2. Create a new Channels app
3. Copy the app credentials to your `.env.local` file

### Database (Supabase)
1. Sign up at [Supabase.com](https://supabase.com/)
2. Create a new project
3. Copy the database URL to your `.env.local` file
4. Run `npx prisma migrate deploy` to set up tables

## 🎯 How to Use

### For Host (TV/Computer)
1. Navigate to `/host` or click "Launch Host Display" on the home page
2. Create a new room or join an existing one
3. Share the 4-digit room code with participants
4. Control playback using the on-screen controls or keyboard shortcuts

### For Participants (Mobile)
1. Navigate to `/remote` or click "Open Remote Control" on the home page
2. Enter the 4-digit room code provided by the host
3. Search for karaoke songs and add them to the queue
4. Use playback controls to manage the session

## ⌨️ Keyboard Shortcuts

- **Space**: Play/Pause
- **N**: Next song
- **P**: Previous song
- **F**: Toggle fullscreen
- **M**: Toggle menu panel
- **↑/↓**: Volume up/down
- **←/→**: Seek backward/forward
- **Esc**: Close panel/exit fullscreen

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── FloatingBubble.tsx # Floating interface
│   ├── SongSearch.tsx    # Search functionality
│   ├── SongQueue.tsx     # Queue management
│   └── YoutubePlayer.tsx # Video player
├── store/                # Zustand stores
│   ├── useQueueStore.ts  # Queue state
│   ├── usePlayerStore.ts # Player state
│   └── useUIStore.ts     # UI state
├── lib/                  # Utilities
│   ├── youtube.ts        # YouTube API
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # App constants
└── hooks/                # Custom hooks
    └── useKeyboardShortcuts.ts
```

## 🎯 Core Technologies

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **@dnd-kit**: Drag and drop functionality
- **YouTube APIs**: Video search and playback
- **Lucide React**: Icon library

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_YOUTUBE_API_KEY`: Your YouTube API key
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/karaoke)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 key | Yes |

## 📱 Mobile Features

- Touch-friendly interface
- Draggable floating bubble
- Swipe gestures for queue management
- Responsive fullscreen player
- Mobile-optimized controls

## 🎨 Customization

### Themes
The app supports light, dark, and system themes. Users can switch themes in the settings panel.

### Styling
Customize the appearance by modifying:
- `src/app/globals.css` - CSS variables and global styles
- `tailwind.config.js` - Tailwind configuration
- Component-specific styles in individual files

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Code Quality

The project includes:
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Pre-commit hooks (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- YouTube for providing the video platform and APIs
- Next.js team for the excellent framework
- All open-source contributors whose libraries make this possible

## 🐛 Known Issues

- Some YouTube videos may not be available for embedding
- API rate limits may affect search functionality with heavy usage
- Fullscreen mode behavior varies across browsers and devices

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include browser version, device type, and steps to reproduce

---

Made with ❤️ and Next.js
