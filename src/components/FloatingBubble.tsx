'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music, X, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SongSearch } from '@/components/SongSearch';
import { SongQueue } from '@/components/SongQueue';
import { useUIStore, Theme } from '@/store/useUIStore';
import { useQueueStore } from '@/store/useQueueStore';
import { cn } from '@/lib/utils';
import { PANEL_ANIMATION_DURATION, BUBBLE_SIZE, PANEL_WIDTH } from '@/lib/constants';

export function FloatingBubble() {
  const {
    isPanelOpen,
    theme,
    isMobile,
    bubblePosition,
    togglePanel,
    closePanel,
    setTheme,
    setBubblePosition,
  } = useUIStore();

  const { queue, currentIndex } = useQueueStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'search' | 'queue' | 'settings'>('search');
  const bubbleRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentSong = queue[currentIndex];

  // Handle bubble dragging on mobile
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) return;
    
    setIsDragging(true);
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isMobile) return;

    const newX = Math.max(0, Math.min(window.innerWidth - BUBBLE_SIZE, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - BUBBLE_SIZE, e.clientY - dragOffset.y));

    setBubblePosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isPanelOpen &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        bubbleRef.current &&
        !bubbleRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPanelOpen, closePanel]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPanelOpen) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen, closePanel]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const bubbleStyle = isMobile
    ? {
        position: 'fixed' as const,
        left: `${bubblePosition.x}px`,
        top: `${bubblePosition.y}px`,
        zIndex: 40,
      }
    : {
        position: 'fixed' as const,
        bottom: '20px',
        right: '20px',
        zIndex: 40,
      };

  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={closePanel}
        />
      )}

      {/* Floating Bubble */}
      <div
        ref={bubbleRef}
        style={bubbleStyle}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg transition-all duration-200 cursor-pointer',
          'bg-primary text-primary-foreground hover:scale-110',
          isDragging && 'scale-110 shadow-xl',
          isPanelOpen && 'scale-95'
        )}
        onClick={!isDragging ? togglePanel : undefined}
        onMouseDown={handleMouseDown}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          <Music className="h-6 w-6" />
          
          {/* Queue indicator */}
          {queue.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {queue.length > 99 ? '99+' : queue.length}
            </div>
          )}

          {/* Playing indicator */}
          {currentSong && (
            <div className="absolute -bottom-1 -left-1 bg-green-500 rounded-full w-3 h-3 animate-pulse" />
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div
        ref={panelRef}
        className={cn(
          'fixed top-0 right-0 h-full bg-background border-l shadow-xl z-40 transition-transform duration-300 ease-in-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ width: `${PANEL_WIDTH}px` }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Karaoke</h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={closePanel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('search')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'search'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
              activeTab === 'queue'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Queue
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {queue.length > 99 ? '99+' : queue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors',
              activeTab === 'settings'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            {activeTab === 'search' && <SongSearch />}
            {activeTab === 'queue' && <SongQueue />}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Theme Settings */}
                <div>
                  <h3 className="font-medium mb-3">Theme</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'light' as Theme, label: 'Light', icon: Sun },
                      { value: 'dark' as Theme, label: 'Dark', icon: Moon },
                      { value: 'system' as Theme, label: 'System', icon: Monitor },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handleThemeChange(value)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors',
                          theme === value
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{label}</span>
                        {theme === value && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* App Info */}
                <div>
                  <h3 className="font-medium mb-3">About</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Karaoke Web App</p>
                    <p>Built with Next.js 14+ and YouTube API</p>
                    <p className="text-xs">
                      Search for karaoke songs, manage your queue, and sing along!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
