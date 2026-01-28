export interface TikTokStatistics {
  aweme_id: string;
  collect_count: number;
  comment_count: number;
  digg_count: number;
  download_count: number;
  forward_count: number;
  lose_comment_count: number;
  lose_count: number;
  play_count: number;
  repost_count: number;
  share_count: number;
  whatsapp_share_count: number;
}

export interface TikTokCover {
  uri: string;
  url_list: string[];
  url_prefix: string | null;
}

export interface TikTokPlayAddr {
  data_size: number;
  file_cs: string;
  file_hash: string;
  height: number;
  uri: string;
  url_key: string;
  url_list: string[];
  url_prefix: string | null;
  width: number;
}

export interface TikTokBitRate {
  bit_rate: number;
  fps: number;
  gear_name: string;
  is_bytevc1: number;
  play_addr: TikTokPlayAddr;
  quality_type: number;
}

export interface TikTokVideo {
  CoverTsp: number;
  ai_dynamic_cover: TikTokCover;
  ai_dynamic_cover_bak: TikTokCover;
  animated_cover: TikTokCover;
  cover?: TikTokCover;
  origin_cover?: TikTokCover;
  duration?: number;
  bit_rate?: TikTokBitRate[];
  play_addr?: TikTokPlayAddr;
}

export interface TikTokAuthor {
  uid: string;
  unique_id: string;
  nickname: string;
  avatar_thumb?: TikTokCover;
  avatar_medium?: TikTokCover;
  follower_count?: number;
}

export interface TikTokItem {
  id: string;
  desc: string;
  content_type: string;
  create_time: string;
  desc_language: string;
  region: string;
  is_top: number;
  statistics: TikTokStatistics;
  video: TikTokVideo;
  author?: TikTokAuthor;
}

export interface TikTokSearchResponse {
  success: boolean;
  credits_remaining: number;
  items: TikTokItem[];
  cursor?: number;
  has_more?: boolean;
}

// Extended response with pagination metadata
export interface TikTokSearchResultWithMeta {
  success: boolean;
  credits_remaining: number;
  items: TikTokItem[];
  cursor?: number;
  has_more?: boolean;
  pages_fetched: number;
  total_videos_checked: number;
  filtered_out: number;
}

export type PublishTime = 
  | 'yesterday'
  | 'this-week'
  | 'this-month'
  | 'last-3-months'
  | 'last-6-months'
  | 'all-time';

export type SortBy = 'relevance' | 'most-liked' | 'date-posted';

export interface SearchParams {
  query: string;
  publish_time: PublishTime;
  sort_by: SortBy;
}
