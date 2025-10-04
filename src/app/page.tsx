'use client';

import React from 'react';
import { YoutubePlayer } from '@/components/YoutubePlayer';
import { FloatingBubble } from '@/components/FloatingBubble';
import { ClientOnly } from '@/components/ClientOnly';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useHydration } from '@/hooks/useHydration';
import { useQueueStore } from '@/store/useQueueStore';
import { Button } from '@/components/ui/Button';


export default function Home() {
  const isHydrated = useHydration();
  const { addToQueue, queue } = useQueueStore();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const addTestSong = () => {
    const testSong = {
      id: 'kJQP7kiw5Fk',
      videoId: 'kJQP7kiw5Fk',
      title: 'Despacito - Luis Fonsi ft. Daddy Yankee (Karaoke Version)',
      channelTitle: 'Karaoke Mugen',
      thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/mqdefault.jpg',
      duration: '4:42'
    };
    addToQueue(testSong);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading karaoke app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🎤 Karaoke Web App
            </h1>
            <p className="text-muted-foreground">
              Search for karaoke songs, manage your queue, and sing along!
            </p>
          </div>

          {/* YouTube Player */}
          <div className="mb-8">
            <ClientOnly
              fallback={
                <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading player...</p>
                  </div>
                </div>
              }
            >
              <YoutubePlayer />
            </ClientOnly>
          </div>

          {/* Test Controls */}
          {queue.length === 0 && (
            <div className="text-center mb-8">
              <Button onClick={addTestSong} className="mb-4">
                Add Test Song (Despacito Karaoke)
              </Button>
              <p className="text-sm text-muted-foreground">
                Click to add a test song and try video playback
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              Click the floating music button to search for songs and manage your queue
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <span>⌨️ Keyboard shortcuts:</span>
              <span>Space (Play/Pause)</span>
              <span>N (Next)</span>
              <span>P (Previous)</span>
              <span>F (Fullscreen)</span>
              <span>M (Menu)</span>
              <span>↑↓ (Volume)</span>
              <span>←→ (Seek)</span>
              <span>Esc (Close)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bubble Interface */}
      <ClientOnly>
        <FloatingBubble />
      </ClientOnly>
    </div>
  );
}
