'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import VideoGrid from '@/components/VideoGrid';
import VideoModal from '@/components/VideoModal';
import { TikTokItem, TikTokSearchResultWithMeta, PublishTime, SortBy } from '@/types/tiktok';

interface SearchMeta {
  pagesFetched: number;
  totalVideosChecked: number;
  filteredOut: number;
}

export default function Home() {
  const [videos, setVideos] = useState<TikTokItem[]>([]);
  const [creditsRemaining, setCreditsRemaining] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TikTokItem | null>(null);
  const [searchMeta, setSearchMeta] = useState<SearchMeta | null>(null);

  const handleSearch = async (query: string, publishTime: PublishTime, sortBy: SortBy) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchMeta(null);

    try {
      const params = new URLSearchParams({
        query,
        publish_time: publishTime,
        sort_by: sortBy,
      });

      const response = await fetch(`/api/search?${params}`);
      const data: TikTokSearchResultWithMeta = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to fetch videos');
      }

      if (data.success) {
        setVideos(data.items || []);
        setCreditsRemaining(data.credits_remaining);
        setSearchMeta({
          pagesFetched: data.pages_fetched,
          totalVideosChecked: data.total_videos_checked,
          filteredOut: data.filtered_out,
        });
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVideos([]);
      setSearchMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Viral Dashboard</h1>
              <p className="text-xs text-zinc-500">TikTok Trend Discovery</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg className="animate-spin mb-3" width="32" height="32" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm">Searching and filtering videos...</p>
            <p className="text-xs text-zinc-600 mt-1">May fetch multiple pages to find matches</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && hasSearched && (
          <VideoGrid 
            videos={videos} 
            creditsRemaining={creditsRemaining}
            searchMeta={searchMeta}
            onPlayVideo={setSelectedVideo}
          />
        )}

        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mb-3 text-zinc-600">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            <p className="text-sm">Search for trending TikTok videos</p>
            <p className="text-xs text-zinc-600 mt-1">Enter a keyword to get started</p>
          </div>
        )}
      </div>

      {/* Video modal */}
      {selectedVideo && (
        <VideoModal 
          video={selectedVideo}
          videos={videos}
          currentIndex={videos.findIndex(v => v.id === selectedVideo.id)}
          onClose={() => setSelectedVideo(null)}
          onNavigate={(index) => setSelectedVideo(videos[index])}
        />
      )}
    </main>
  );
}
