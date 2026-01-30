'use client';

import { useState } from 'react';
import { PublishTime, SortBy } from '@/types/tiktok';

interface SearchFormProps {
  onSearch: (query: string, publishTime: PublishTime, sortBy: SortBy) => void;
  isLoading: boolean;
}

const publishTimeOptions: { value: PublishTime; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'all-time', label: 'All Time' },
];

const sortByOptions: { value: SortBy; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'most-commented', label: 'Most Comments' },
  { value: 'date-posted', label: 'Date Posted' },
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [publishTime, setPublishTime] = useState<PublishTime>('this-week');
  const [sortBy, setSortBy] = useState<SortBy>('most-liked');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), publishTime, sortBy);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label htmlFor="query" className="block text-xs font-medium text-zinc-400 mb-1.5">
            Search
          </label>
          <input
            type="text"
            id="query"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors"
            placeholder="Enter keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div style={{ width: '150px' }}>
          <label htmlFor="publishTime" className="block text-xs font-medium text-zinc-400 mb-1.5">
            Time Period
          </label>
          <select
            id="publishTime"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors cursor-pointer"
            value={publishTime}
            onChange={(e) => setPublishTime(e.target.value as PublishTime)}
            disabled={isLoading}
          >
            {publishTimeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '150px' }}>
          <label htmlFor="sortBy" className="block text-xs font-medium text-zinc-400 mb-1.5">
            Sort By
          </label>
          <select
            id="sortBy"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-colors cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            disabled={isLoading}
          >
            {sortByOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-white text-black text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </form>
  );
}
