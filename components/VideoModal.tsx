'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TikTokItem } from '@/types/tiktok';

interface VideoModalProps {
  video: TikTokItem;
  videos: TikTokItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
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
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getVideoUrls(video: TikTokItem): string[] {
  const urls: string[] = [];
  
  // Get all video URLs from bit_rate array
  if (video.video?.bit_rate && Array.isArray(video.video.bit_rate)) {
    for (const br of video.video.bit_rate) {
      if (br.play_addr?.url_list && Array.isArray(br.play_addr.url_list)) {
        urls.push(...br.play_addr.url_list);
      }
    }
  }
  
  // Also try play_addr directly on video object
  if (video.video?.play_addr?.url_list && Array.isArray(video.video.play_addr.url_list)) {
    urls.push(...video.video.play_addr.url_list);
  }
  
  // Filter to only include actual video URLs (tiktokcdn)
  return urls.filter(url => url && (url.includes('tiktokcdn') || url.includes('tiktokv')));
}

export default function VideoModal({ video, videos, currentIndex, onClose, onNavigate }: VideoModalProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const videoUrls = getVideoUrls(video);
  const currentUrl = videoUrls[currentUrlIndex];

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(currentIndex - 1);
    }
  }, [hasPrev, currentIndex, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      onNavigate(currentIndex + 1);
    }
  }, [hasNext, currentIndex, onNavigate]);

  // Reset video state when video changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [video.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goToPrev, goToNext]);

  const handleVideoError = () => {
    console.log('Video error, trying next URL. Current index:', currentUrlIndex, 'Total URLs:', videoUrls.length);
    if (currentUrlIndex < videoUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      setHasError(true);
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      <div 
        className="relative bg-zinc-900 rounded-lg overflow-hidden flex flex-col lg:flex-row"
        style={{ maxWidth: '900px', maxHeight: '90vh', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation arrows */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
            aria-label="Previous video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 rounded-full transition-colors lg:right-[calc(18rem+12px)]"
            aria-label="Next video"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Video counter */}
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 bg-black/60 rounded-full text-xs text-white">
          {currentIndex + 1} / {videos.length}
        </div>

        {/* Video player area */}
        <div 
          className="flex-1 bg-black flex items-center justify-center relative"
          style={{ minHeight: '400px', aspectRatio: '9/16', maxHeight: '80vh' }}
        >
          {videoUrls.length > 0 && !hasError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              <video
                ref={videoRef}
                key={currentUrl}
                src={currentUrl}
                controls
                autoPlay
                loop
                playsInline
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                style={{ maxHeight: '80vh', maxWidth: '100%' }}
              />
            </>
          ) : (
            <div className="text-center p-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-zinc-600">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-zinc-400 mb-4">Video not available for direct playback</p>
              <a
                href={`https://www.tiktok.com/@user/video/${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md text-sm font-medium hover:bg-zinc-200 transition-colors"
              >
                Watch on TikTok
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Video info sidebar */}
        <div className="w-full lg:w-72 p-4 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col">
          <p className="text-sm text-zinc-300 leading-relaxed mb-3">
            {video.desc || 'No description'}
          </p>

          <div className="text-xs text-zinc-500 mb-4">
            Posted {formatDate(video.create_time)}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-zinc-800/50 rounded p-2">
              <div className="text-sm font-semibold text-white">
                {formatNumber(video.statistics.play_count)}
              </div>
              <div className="text-xs text-zinc-500">Views</div>
            </div>
            <div className="bg-zinc-800/50 rounded p-2">
              <div className="text-sm font-semibold text-white">
                {formatNumber(video.statistics.digg_count)}
              </div>
              <div className="text-xs text-zinc-500">Likes</div>
            </div>
            <div className="bg-zinc-800/50 rounded p-2">
              <div className="text-sm font-semibold text-white">
                {formatNumber(video.statistics.comment_count)}
              </div>
              <div className="text-xs text-zinc-500">Comments</div>
            </div>
            <div className="bg-zinc-800/50 rounded p-2">
              <div className="text-sm font-semibold text-white">
                {formatNumber(video.statistics.share_count)}
              </div>
              <div className="text-xs text-zinc-500">Shares</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800">
            <a
              href={`https://www.tiktok.com/@user/video/${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded hover:border-zinc-600 transition-colors"
            >
              Open in TikTok
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
          
          {/* Debug info - remove in production */}
          {videoUrls.length === 0 && (
            <div className="mt-3 p-2 bg-zinc-800 rounded text-xs text-zinc-500">
              No video URLs found in API response
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
