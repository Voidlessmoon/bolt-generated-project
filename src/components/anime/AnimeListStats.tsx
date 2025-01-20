import { useAuth } from '@/store/auth';
import { useAnimeListStore } from '@/store/animelist';
import { cn } from '@/lib/utils';
import type { AnimeListStatus } from '@/types/animelist';

const STATUS_COLORS = {
  WATCHING: 'text-blue-400',
  COMPLETED: 'text-green-400',
  PLAN_TO_WATCH: 'text-purple-400',
  ON_HOLD: 'text-yellow-400',
  DROPPED: 'text-red-400',
} as const;

const STATUS_LABELS = {
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  PLAN_TO_WATCH: 'Plan to Watch',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped',
} as const;

export default function AnimeListStats() {
  const { user } = useAuth();
  const getEntriesByStatus = useAnimeListStore(state => state.getEntriesByStatus);

  if (!user) return null;

  const stats = (Object.keys(STATUS_LABELS) as AnimeListStatus[]).map(status => ({
    status,
    count: getEntriesByStatus(user.id, status).length,
  }));

  const totalEntries = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="rounded-lg bg-gray-900/50 p-4">
      <h3 className="text-lg font-medium text-white mb-4">Anime List Stats</h3>
      <div className="space-y-2">
        {stats.map(({ status, count }) => (
          <div key={status} className="flex items-center justify-between">
            <span className={cn('text-sm', STATUS_COLORS[status])}>
              {STATUS_LABELS[status]}
            </span>
            <span className="text-sm text-gray-400">{count}</span>
          </div>
        ))}
        <div className="border-t border-gray-800 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Total</span>
            <span className="text-sm text-white">{totalEntries}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
