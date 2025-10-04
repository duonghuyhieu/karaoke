# 🎤 Karaoke Web App

A modern karaoke web application built with Next.js 14+ that allows users to search for karaoke songs from YouTube, manage a playback queue, and sing along in fullscreen mode.

## ✨ Features

- 🔍 **YouTube Integration**: Search for karaoke songs using YouTube Data API v3
- 🎵 **Queue Management**: Add, remove, and reorder songs with drag-and-drop
- 📺 **Fullscreen Player**: YouTube player with custom controls and fullscreen mode
- 💬 **Floating UI**: Intuitive floating bubble interface with slide-out panel
- 📱 **Mobile-First**: Responsive design optimized for all devices
- 🎨 **Theme System**: Dark/light mode with system preference detection
- ⌨️ **Keyboard Shortcuts**: Full keyboard navigation support
- 🔄 **State Persistence**: Queue and preferences saved to localStorage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- YouTube Data API v3 key

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

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your YouTube API key to `.env.local`:
```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Restrict the API key to YouTube Data API v3 (recommended)
6. Add the API key to your `.env.local` file

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
