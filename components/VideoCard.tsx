'use client';

import { useState } from 'react';
import { TikTokItem } from '@/types/tiktok';

interface VideoCardProps {
  video: TikTokItem;
  onPlay: (video: TikTokItem) => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCoverUrls(video: TikTokItem): string[] {
  const urls: string[] = [];
  
  // Try different cover sources in order of preference
  const sources = [
    video.video?.origin_cover?.url_list,
    video.video?.cover?.url_list,
    video.video?.ai_dynamic_cover?.url_list,
    video.video?.animated_cover?.url_list,
    video.video?.ai_dynamic_cover_bak?.url_list,
  ];

  for (const source of sources) {
    if (source && source.length > 0) {
      // Add all URLs from this source
      urls.push(...source.filter(url => url && !url.includes('tplv-tiktokx-dmt-logom')));
    }
  }

  return urls;
}

export default function VideoCard({ video, onPlay }: VideoCardProps) {
  const coverUrls = getCoverUrls(video);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    if (currentUrlIndex < coverUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      setImageError(true);
    }
  };

  const currentCoverUrl = coverUrls[currentUrlIndex];

  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Thumbnail */}
      <button
        onClick={() => onPlay(video)}
        className="relative w-full aspect-[9/16] bg-zinc-800 overflow-hidden cursor-pointer"
      >
        {currentCoverUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentCoverUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-zinc-600">
            <svg className="w-12 h-12 mb-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            <span className="text-xs">No preview</span>
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm text-zinc-300 line-clamp-2 mb-3 min-h-[40px]">
          {video.desc || 'No description'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {formatNumber(video.statistics.play_count)}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {formatNumber(video.statistics.digg_count)}
            </span>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {formatNumber(video.statistics.comment_count)}
            </span>
          </div>
          <span className="text-zinc-600">{formatDate(video.create_time)}</span>
        </div>
      </div>
    </div>
  );
}
