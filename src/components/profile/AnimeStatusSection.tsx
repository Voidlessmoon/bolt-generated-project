import { Link } from 'react-router-dom';
import type { Anime } from '@/types/anime';
import type { AnimeListEntry } from '@/types/animelist';

interface AnimeStatusSectionProps {
  title: string;
  entries: AnimeListEntry[];
  animes: Anime[];
}

export default function AnimeStatusSection({ title, entries, animes }: AnimeStatusSectionProps) {
  const animeEntries = entries
    .map(entry => ({
      entry,
      anime: animes.find(a => a.id === entry.animeId),
    }))
    .filter(({ anime }) => anime);

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {animeEntries.map(({ entry, anime }) => (
          <Link
            key={entry.id}
            to={`/anime/${anime?.id}`}
            className="flex gap-4 rounded-lg bg-gray-900/50 p-4 hover:bg-gray-900/75 transition-colors"
          >
            <img
              src={anime?.coverImage}
              alt={anime?.title}
              className="h-24 w-16 rounded object-cover"
            />
            <div>
              <h3 className="font-medium text-white">{anime?.title}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-400">
                {entry.progress > 0 && (
                  <p>Progress: {entry.progress} / {anime?.episodes} episodes</p>
                )}
                {entry.rating && (
                  <p>Rating: {entry.rating}/10</p>
                )}
                {entry.startDate && (
                  <p>Started: {new Date(entry.startDate).toLocaleDateString()}</p>
                )}
                {entry.completedDate && (
                  <p>Completed: {new Date(entry.completedDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
