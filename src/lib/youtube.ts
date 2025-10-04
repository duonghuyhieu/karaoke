import { Song } from '@/store/useQueueStore';
import { 
  YOUTUBE_SEARCH_ENDPOINT, 
  YOUTUBE_VIDEOS_ENDPOINT, 
  DEFAULT_SEARCH_RESULTS,
  ERROR_MESSAGES 
} from './constants';
import { formatDuration } from './utils';

// YouTube API response types
interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface YouTubeVideoItem {
  id: string;
  contentDetails: {
    duration: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
  error?: {
    code: number;
    message: string;
  };
}

interface YouTubeVideosResponse {
  items: YouTubeVideoItem[];
  error?: {
    code: number;
    message: string;
  };
}

// Rate limiting
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 100; // YouTube API quota
  private readonly timeWindow = 100 * 1000; // 100 seconds

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

const rateLimiter = new RateLimiter();

// YouTube API client
export class YouTubeAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn(ERROR_MESSAGES.API_KEY_MISSING);
    }
  }

  private async makeRequest<T>(url: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
    }

    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getTimeUntilNextRequest();
      throw new Error(`${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED} Wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || ERROR_MESSAGES.SEARCH_FAILED);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  async searchVideos(query: string, maxResults: number = DEFAULT_SEARCH_RESULTS): Promise<Song[]> {
    if (!query.trim()) {
      return [];
    }

    // Automatically append "karaoke" to search queries for better results
    const karaokeQuery = query.includes('karaoke') ? query : `${query} karaoke`;
    
    const searchUrl = new URL(YOUTUBE_SEARCH_ENDPOINT);
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('q', karaokeQuery);
    searchUrl.searchParams.set('maxResults', maxResults.toString());
    searchUrl.searchParams.set('key', this.apiKey);
    searchUrl.searchParams.set('videoEmbeddable', 'true');
    searchUrl.searchParams.set('videoSyndicated', 'true');

    const searchResponse = await this.makeRequest<YouTubeSearchResponse>(searchUrl.toString());
    
    if (!searchResponse.items || searchResponse.items.length === 0) {
      return [];
    }

    // Get video IDs for duration lookup
    const videoIds = searchResponse.items.map(item => item.id.videoId);
    
    // Fetch video details to get duration
    const videosUrl = new URL(YOUTUBE_VIDEOS_ENDPOINT);
    videosUrl.searchParams.set('part', 'contentDetails');
    videosUrl.searchParams.set('id', videoIds.join(','));
    videosUrl.searchParams.set('key', this.apiKey);

    const videosResponse = await this.makeRequest<YouTubeVideosResponse>(videosUrl.toString());
    
    // Create a map of video ID to duration
    const durationMap = new Map<string, string>();
    if (videosResponse.items) {
      videosResponse.items.forEach(video => {
        durationMap.set(video.id, formatDuration(video.contentDetails.duration));
      });
    }

    // Convert to Song objects
    return searchResponse.items.map(item => ({
      id: `${item.id.videoId}-${Date.now()}`, // Unique ID for queue management
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: durationMap.get(item.id.videoId) || '0:00',
    }));
  }

  async getVideoDetails(videoId: string): Promise<Song | null> {
    try {
      const videosUrl = new URL(YOUTUBE_VIDEOS_ENDPOINT);
      videosUrl.searchParams.set('part', 'snippet,contentDetails');
      videosUrl.searchParams.set('id', videoId);
      videosUrl.searchParams.set('key', this.apiKey);

      const response = await this.makeRequest<YouTubeVideosResponse & { items: Array<YouTubeVideoItem & { snippet: YouTubeSearchItem['snippet'] }> }>(videosUrl.toString());
      
      if (!response.items || response.items.length === 0) {
        return null;
      }

      const video = response.items[0];
      return {
        id: `${videoId}-${Date.now()}`,
        videoId: videoId,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        thumbnail: video.snippet.thumbnails.medium.url,
        duration: formatDuration(video.contentDetails.duration),
      };
    } catch (error) {
      console.error('Failed to get video details:', error);
      return null;
    }
  }
}

// Export singleton instance
export const youtubeAPI = new YouTubeAPI();
