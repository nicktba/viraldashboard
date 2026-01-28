import { NextRequest, NextResponse } from 'next/server';
import { TikTokItem, PublishTime, TikTokSearchResultWithMeta } from '@/types/tiktok';

const MAX_PAGES = 5;
const VIDEOS_PER_PAGE = 30; // TikTok API typically returns 30 per page

// Get the date range for a given publish time filter
function getDateRangeForFilter(publishTime: PublishTime): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start: Date;

  switch (publishTime) {
    case 'yesterday': {
      // Yesterday through today: yesterday 00:00:00 to today 23:59:59
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      start = new Date(yesterday);
      start.setHours(0, 0, 0, 0);
      // End is today's end (already set above)
      break;
    }
    case 'this-week': {
      // Last 7 days
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'this-month': {
      // Last 30 days
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'last-3-months': {
      // Last 90 days
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'last-6-months': {
      // Last 180 days
      start = new Date(now);
      start.setDate(start.getDate() - 180);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case 'all-time':
    default: {
      // All time - set start to a very old date
      start = new Date(0);
      break;
    }
  }

  return { start, end };
}

// Check if a video's create_time falls within the specified range
function isVideoInTimeRange(video: TikTokItem, publishTime: PublishTime): boolean {
  if (publishTime === 'all-time') {
    return true;
  }

  const { start, end } = getDateRangeForFilter(publishTime);
  const videoDate = new Date(video.create_time);

  return videoDate >= start && videoDate <= end;
}

// Fetch a single page from the API
async function fetchPage(
  apiKey: string,
  query: string,
  publishTime: string,
  sortBy: string,
  cursor?: number
): Promise<{ items: TikTokItem[]; cursor?: number; has_more?: boolean; credits_remaining: number }> {
  const apiUrl = new URL('https://api.scrapecreators.com/v1/tiktok/search/top');
  apiUrl.searchParams.set('query', query);
  apiUrl.searchParams.set('publish_time', publishTime);
  apiUrl.searchParams.set('sort_by', sortBy);
  apiUrl.searchParams.set('region', 'US');
  
  if (cursor !== undefined) {
    apiUrl.searchParams.set('cursor', cursor.toString());
  }

  const response = await fetch(apiUrl.toString(), {
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API responded with status ${response.status}`);
  }

  const data = await response.json();
  return {
    items: data.items || [],
    cursor: data.cursor,
    has_more: data.has_more ?? (data.cursor !== undefined),
    credits_remaining: data.credits_remaining,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const publishTime = (searchParams.get('publish_time') || 'this-week') as PublishTime;
  const sortBy = searchParams.get('sort_by') || 'most-liked';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.TIKTOK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch all pages in parallel for speed
    // Cursors are typically 0, 30, 60, 90, 120 (30 per page)
    const cursors = [0, 30, 60, 90, 120];
    
    const pagePromises = cursors.slice(0, MAX_PAGES).map(cursor => 
      fetchPage(apiKey, query, publishTime, sortBy, cursor === 0 ? undefined : cursor)
        .catch(err => {
          console.error(`Error fetching page with cursor ${cursor}:`, err);
          return null;
        })
    );

    const pageResults = await Promise.all(pagePromises);
    
    // Process all results
    const filteredVideos: TikTokItem[] = [];
    const seenIds = new Set<string>(); // Dedupe videos
    let totalVideosChecked = 0;
    let filteredOut = 0;
    let creditsRemaining = 0;
    let pagesFetched = 0;

    for (const pageData of pageResults) {
      if (!pageData) continue;
      
      pagesFetched++;
      creditsRemaining = pageData.credits_remaining;

      for (const video of pageData.items) {
        // Skip duplicates
        if (seenIds.has(video.id)) continue;
        seenIds.add(video.id);
        
        totalVideosChecked++;

        // Filter by create_time
        if (isVideoInTimeRange(video, publishTime)) {
          filteredVideos.push(video);
        } else {
          filteredOut++;
        }
      }
    }

    const result: TikTokSearchResultWithMeta = {
      success: true,
      credits_remaining: creditsRemaining,
      items: filteredVideos,
      pages_fetched: pagesFetched,
      total_videos_checked: totalVideosChecked,
      filtered_out: filteredOut,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching TikTok data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TikTok data' },
      { status: 500 }
    );
  }
}
