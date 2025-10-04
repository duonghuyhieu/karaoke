'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePlayerStore, PlayerState } from '@/store/usePlayerStore';
import { useQueueStore } from '@/store/useQueueStore';
import { DEFAULT_PLAYER_OPTIONS } from '@/lib/constants';
import { formatTime } from '@/lib/utils';

// YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function YoutubePlayer() {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isYTReady, setIsYTReady] = useState(false);
  const {
    player,
    playerState,
    isFullscreen,
    volume,
    currentTime,
    duration,
    isLoading,
    error,
    setPlayer,
    setPlayerState,
    setCurrentTime,
    setDuration,
    setLoading,
    setError,
    play,
    pause,
    seekTo,
    setVolume,
    toggleFullscreen,
  } = usePlayerStore();

  const {
    getCurrentSong,
    nextSong,
    previousSong,
    queue,
    currentIndex
  } = useQueueStore();

  const currentSong = getCurrentSong();

  // Load YouTube API
  useEffect(() => {

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setIsYTReady(true);
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Script exists, wait for it to load
      const checkAPI = () => {
        if (window.YT && window.YT.Player) {
          setIsYTReady(true);
        } else {
          setTimeout(checkAPI, 100);
        }
      };
      checkAPI();
      return;
    }

    // Load YouTube API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;

    // Set up the callback before adding script
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API ready');
      setIsYTReady(true);
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove script as it might be used by other components
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  const onPlayerReady = useCallback((event: any) => {
    const ytPlayer = event.target;
    ytPlayer.setVolume(volume);
    setLoading(false);

    // Don't auto-load video here, let the effect handle it
    console.log('YouTube player ready');
  }, [volume, setLoading]);

  const onPlayerStateChange = useCallback((event: any) => {
    const state = event.data;
    let playerState: PlayerState;

    switch (state) {
      case window.YT.PlayerState.UNSTARTED:
        playerState = 'unstarted';
        break;
      case window.YT.PlayerState.ENDED:
        playerState = 'ended';
        // Auto-advance to next song
        nextSong();
        break;
      case window.YT.PlayerState.PLAYING:
        playerState = 'playing';
        setDuration(event.target.getDuration());
        break;
      case window.YT.PlayerState.PAUSED:
        playerState = 'paused';
        break;
      case window.YT.PlayerState.BUFFERING:
        playerState = 'buffering';
        break;
      case window.YT.PlayerState.CUED:
        playerState = 'cued';
        break;
      default:
        playerState = 'unstarted';
    }

    setPlayerState(playerState);
  }, [setPlayerState, setDuration, nextSong]);

  const onPlayerError = useCallback((event: any) => {
    const errorCode = event.data;
    let errorMessage = 'Video playback error';

    switch (errorCode) {
      case 2:
        errorMessage = 'Invalid video ID';
        break;
      case 5:
        errorMessage = 'HTML5 player error';
        break;
      case 100:
        errorMessage = 'Video not found or private';
        break;
      case 101:
      case 150:
        errorMessage = 'Video not available for embedded playback';
        break;
    }

    setError(errorMessage);
    // Auto-advance to next song on error
    setTimeout(() => {
      nextSong();
      setError(null);
    }, 3000);
  }, [setError, nextSong]);

  const initializePlayer = useCallback(() => {
    if (!playerRef.current || !window.YT || !window.YT.Player || !isYTReady) {
      console.log('Cannot initialize player:', {
        hasRef: !!playerRef.current,
        hasYT: !!window.YT,
        hasPlayer: !!(window.YT && window.YT.Player),
        isReady: isYTReady
      });
      return;
    }

    console.log('Initializing YouTube player');

    try {
      const ytPlayer = new window.YT.Player(playerRef.current, {
        ...DEFAULT_PLAYER_OPTIONS,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });

      setPlayer(ytPlayer);
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  }, [setPlayer, isYTReady, onPlayerReady, onPlayerStateChange, onPlayerError]);

  // Initialize player when API is ready
  useEffect(() => {
    if (isYTReady) {
      initializePlayer();
    }
  }, [initializePlayer, isYTReady]);

  // Update current time
  useEffect(() => {
    if (!player || playerState !== 'playing') return;

    const interval = setInterval(() => {
      if (player.getCurrentTime) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, playerState, setCurrentTime]);

  // Load new video when current song changes
  useEffect(() => {
    if (!player || !currentSong || !player.loadVideoById) return;

    console.log('Loading video:', currentSong.title, currentSong.videoId);
    setLoading(true);
    setError(null);

    try {
      player.loadVideoById({
        videoId: currentSong.videoId,
        startSeconds: 0,
        suggestedQuality: 'default'
      });
    } catch (error) {
      console.error('Error loading video:', error);
      setError('Failed to load video');
      setLoading(false);
    }
  }, [player, currentSong, setLoading, setError]);

  const handlePlayPause = () => {
    if (playerState === 'playing') {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seekTo(time);
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No song selected</p>
          <p className="text-sm">Add songs to your queue to start playing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}>
      {/* YouTube Player */}
      <div ref={playerRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75">
          <div className="text-center text-white">
            <p className="mb-2">{error}</p>
            <p className="text-sm opacity-75">Skipping to next song...</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Song Info */}
        <div className="mb-4 text-white">
          <h3 className="font-medium line-clamp-1 mb-1">{currentSong.title}</h3>
          <p className="text-sm opacity-75 line-clamp-1">{currentSong.channelTitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-white/75 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={previousSong}
              disabled={queue.length <= 1}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {playerState === 'playing' ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={nextSong}
              disabled={queue.length <= 1}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setVolume(volume > 0 ? 0 : 80)}
                className="text-white hover:bg-white/20"
              >
                {volume > 0 ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Fullscreen Toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
