import { useAnimeStore } from '@/store/anime';
import { useAnimeListStore } from '@/store/animelist';
import { cn } from '@/lib/utils';

interface AnimeListProps {
  userId: string;
}

export default function AnimeList({ userId }: AnimeListProps) {
  const animes = useAnimeStore(state => state.animes);
  const { getEntriesByStatus } = useAnimeListStore();

  const watchingEntries = getEntriesByStatus(userId, 'WATCHING')
    .slice(0, 3)
    .map(entry => animes.find(a => a.id === entry.animeId))
    .filter(Boolean);

  const completedEntries = getEntriesByStatus(userId, 'COMPLETED')
    .slice(0, 3)
    .map(entry => animes.find(a => a.id === entry.animeId))
    .filter(Boolean);

  if (watchingEntries.length === 0 && completedEntries.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-800">
      {watchingEntries.length > 0 && (
        <div className="p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-400">
            Currently Watching
          </h4>
          <div className="space-y-2">
            {watchingEntries.map(anime => (
              <div
                key={anime?.id}
                className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-800"
              >
                <img
                  src={anime?.coverImage}
                  alt={anime?.title}
                  className="h-8 w-6 rounded object-cover"
                />
                <span className="flex-1 truncate text-sm text-gray-300">
                  {anime?.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedEntries.length > 0 && (
        <div className={cn(
          "p-4",
          watchingEntries.length > 0 && "border-t border-gray-800"
        )}>
          <h4 className="mb-2 text-sm font-medium text-gray-400">
            Completed
          </h4>
          <div className="space-y-2">
            {completedEntries.map(anime => (
              <div
                key={anime?.id}
                className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-800"
              >
                <img
                  src={anime?.coverImage}
                  alt={anime?.title}
                  className="h-8 w-6 rounded object-cover"
                />
                <span className="flex-1 truncate text-sm text-gray-300">
                  {anime?.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
