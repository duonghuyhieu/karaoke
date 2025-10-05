'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Search, Plus, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { SongAddModal } from '@/components/remote/SongAddModal'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'
import type { SearchResult } from '@/types'

interface RemoteSongSearchProps {
  onAddToQueue: (song: SearchResult, addPosition?: 'next' | 'end') => void
  disabled?: boolean
}

export function RemoteSongSearch({ onAddToQueue, disabled = false }: RemoteSongSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [addingToQueue, setAddingToQueue] = useState<string | null>(null)
  const [selectedSong, setSelectedSong] = useState<SearchResult | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&maxResults=10`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Search failed')
      }

      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchError(error instanceof Error ? error.message : 'Search failed')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(query)
    }, SEARCH_DEBOUNCE_MS)
  }

  const handleSongSelect = (song: SearchResult) => {
    if (disabled || addingToQueue) return

    setSelectedSong(song)
    setShowAddModal(true)
  }

  const handleAddAsNext = async (song: SearchResult) => {
    setAddingToQueue(song.id)
    try {
      await onAddToQueue(song, 'next')
      // Show success feedback
      setRecentlyAdded(song.id)
      setTimeout(() => setRecentlyAdded(null), 2000)
      // Keep search results and query to allow continued searching
    } catch (error) {
      console.error('Failed to add song as next:', error)
    } finally {
      setAddingToQueue(null)
    }
  }

  const handleAddToEnd = async (song: SearchResult) => {
    setAddingToQueue(song.id)
    try {
      await onAddToQueue(song, 'end')
      // Show success feedback
      setRecentlyAdded(song.id)
      setTimeout(() => setRecentlyAdded(null), 2000)
      // Keep search results and query to allow continued searching
    } catch (error) {
      console.error('Failed to add song to end:', error)
    } finally {
      setAddingToQueue(null)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setSelectedSong(null)
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Tìm kiếm bài karaoke..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10"
          disabled={disabled}
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search Error */}
      {searchError && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{searchError}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Kết quả tìm kiếm ({searchResults.length})
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((song) => {
              const isAdding = addingToQueue === song.id
              const wasRecentlyAdded = recentlyAdded === song.id

              return (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-3 bg-card border rounded-lg cursor-pointer transition-all hover:bg-accent hover:border-primary/50 ${isAdding ? 'opacity-50 cursor-not-allowed' : ''
                    } ${wasRecentlyAdded ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : ''
                    }`}
                  onClick={() => handleSongSelect(song)}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-16 h-12 rounded object-cover"
                    />
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {song.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {song.channelTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {song.duration}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {addingToQueue === song.id ? (
                      <div className="flex items-center gap-2 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Đang thêm...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Chạm để thêm</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {searchQuery && !isSearching && searchResults.length === 0 && !searchError && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Không tìm thấy bài hát cho &quot;{searchQuery}&quot;</p>
          <p className="text-sm">Thử các từ khóa khác</p>
        </div>
      )}

      {/* Initial State */}
      {!searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Tìm kiếm bài karaoke</p>
          <p className="text-sm">Nhập tên bài hát, ca sĩ hoặc từ khóa</p>
        </div>
      )}

      {/* Song Add Modal */}
      <SongAddModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        song={selectedSong}
        onAddAsNext={handleAddAsNext}
        onAddToEnd={handleAddToEnd}
        isLoading={!!addingToQueue}
      />
    </div>
  )
}
