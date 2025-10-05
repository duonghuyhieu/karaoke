import { NextRequest, NextResponse } from 'next/server'
import { youtubeAPI } from '@/lib/youtube'

// GET /api/songs/search?q=search+term - Search for songs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const maxResults = parseInt(searchParams.get('maxResults') || '10')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const results = await youtubeAPI.searchVideos(query, maxResults)
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching songs:', error)
    return NextResponse.json(
      { error: 'Failed to search songs' },
      { status: 500 }
    )
  }
}
