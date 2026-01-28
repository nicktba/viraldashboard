'use client';

import { TikTokItem } from '@/types/tiktok';
import VideoCard from './VideoCard';

interface SearchMeta {
  pagesFetched: number;
  totalVideosChecked: number;
  filteredOut: number;
}

interface VideoGridProps {
  videos: TikTokItem[];
  creditsRemaining?: number;
  searchMeta?: SearchMeta | null;
  onPlayVideo: (video: TikTokItem) => void;
}

export default function VideoGrid({ videos, creditsRemaining, searchMeta, onPlayVideo }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="11" cy="11" r="8" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeWidth={1.5} d="M21 21l-4.35-4.35" />
        </svg>
        <p className="text-sm">No videos found matching your time filter</p>
        <p className="text-xs text-zinc-600 mt-1">
          {searchMeta && searchMeta.totalVideosChecked > 0 ? (
            <>Checked {searchMeta.totalVideosChecked} videos across {searchMeta.pagesFetched} page{searchMeta.pagesFetched > 1 ? 's' : ''}, none matched the time range</>
          ) : (
            <>Try adjusting your search or filters</>
          )}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-zinc-400">
            <span className="text-white font-medium">{videos.length}</span> videos found
          </p>
          {searchMeta && searchMeta.filteredOut > 0 && (
            <p className="text-xs text-zinc-600">
              ({searchMeta.filteredOut} filtered out by time range, {searchMeta.pagesFetched} page{searchMeta.pagesFetched > 1 ? 's' : ''} checked)
            </p>
          )}
        </div>
        {creditsRemaining !== undefined && (
          <p className="text-xs text-zinc-600">
            Credits: {creditsRemaining.toLocaleString()}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onPlay={onPlayVideo} />
        ))}
      </div>
    </>
  );
}
