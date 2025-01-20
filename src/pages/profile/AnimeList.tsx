import { useState } from 'react';
import { useAuth } from '@/store/auth';
import { useAnimeStore } from '@/store/anime';
import { useAnimeListStore } from '@/store/animelist';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnimeListStatus } from '@/types/animelist';
import AnimeListStats from '@/components/anime/AnimeListStats';

const STATUS_COLORS = {
  WATCHING: 'border-blue-500/50 bg-blue-500/5',
  COMPLETED: 'border-green-500/50 bg-green-500/5',
  PLAN_TO_WATCH: 'border-purple-500/50 bg-purple-500/5',
  ON_HOLD: 'border-yellow-500/50 bg-yellow-500/5',
  DROPPED: 'border-red-500/50 bg-red-500/5',
} as const;

const STATUS_LABELS = {
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  PLAN_TO_WATCH: 'Plan to Watch',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped',
} as const;

export default function AnimeList() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<AnimeListStatus>('WATCHING');
  const [searchTerm, setSearchTerm] = useState('');
  
  const animes = useAnimeStore(state => state.animes);
  const { getEntriesByStatus } = useAnimeListStore();

  if (!user) return null;

  // Get entries for the selected status
  const entries = getEntriesByStatus(user.id, selectedStatus);
  
  // Filter entries by search term
  const filteredEntries = entries.filter(entry => {
    const anime = animes.find(a => a.id === entry.animeId);
    return anime?.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AnimeListStats />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-4">My Anime List</h1>
              
              {/* Status Tabs */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as AnimeListStatus[]).map((status) => {
                  const statusEntries = getEntriesByStatus(user.id, status);
                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        selectedStatus === status
                          ? `${STATUS_COLORS[status]} text-white`
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                      )}
                    >
                      {STATUS_LABELS[status]}
                      <span className="ml-2 text-xs">
                        ({statusEntries.length})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg bg-gray-800/50 border border-gray-700 pl-10 pr-4 py-2
                           text-white placeholder-gray-400
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                />
              </div>
            </div>

            {/* Anime List */}
            <div className="space-y-4">
              {filteredEntries.map(entry => {
                const anime = animes.find(a => a.id === entry.animeId);
                if (!anime) return null;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'rounded-lg border p-4',
                      STATUS_COLORS[entry.status]
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="h-20 w-14 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{anime.title}</h3>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                          <div>
                            Progress: {entry.progress} / {anime.episodes}
                          </div>
                          {entry.rating && (
                            <div>Rating: {entry.rating}/10</div>
                          )}
                          {entry.startDate && (
                            <div>Started: {new Date(entry.startDate).toLocaleDateString()}</div>
                          )}
                          {entry.completedDate && (
                            <div>Completed: {new Date(entry.completedDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="mt-2 text-sm text-gray-400">{entry.notes}</p>
                    )}
                  </div>
                );
              })}

              {filteredEntries.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">
                    No anime found in your {STATUS_LABELS[selectedStatus].toLowerCase()} list
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
