'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Search, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/useUIStore';
import { useQueueStore, Song } from '@/store/useQueueStore';
import { youtubeAPI } from '@/lib/youtube';

import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';

export function SongSearch() {
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    setSearchQuery,
    setSearchResults,
    setSearching,
    setSearchError,
  } = useUIStore();

  const { addToQueue } = useQueueStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Debounced search function using ref to avoid stale closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      setSearchError(null);

      try {
        const results = await youtubeAPI.searchVideos(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchError(error instanceof Error ? error.message : 'Search failed');
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  }, [setSearchResults, setSearching, setSearchError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocalQuery(query);
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleAddToQueue = (song: Song) => {
    addToQueue(song);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search for karaoke songs..."
          value={localQuery}
          onChange={handleInputChange}
          className="pl-10 pr-4"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Error Message */}
      {searchError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {searchResults.map((song) => (
          <div
            key={song.id}
            className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:bg-accent/50 transition-colors"
          >
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-16 h-12 object-cover rounded"
                loading="lazy"
              />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {song.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{song.channelTitle}</span>
                <span>•</span>
                <span>{song.duration}</span>
              </div>
            </div>

            {/* Add Button */}
            <Button
              size="sm"
              onClick={() => handleAddToQueue(song)}
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        ))}

        {/* Empty State */}
        {!isSearching && searchQuery && searchResults.length === 0 && !searchError && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No karaoke songs found for &quot;{searchQuery}&quot;</p>
            <p className="text-xs mt-1">Try different keywords or check your spelling</p>
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Search for your favorite karaoke songs</p>
            <p className="text-xs mt-1">We&apos;ll automatically add &quot;karaoke&quot; to your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
