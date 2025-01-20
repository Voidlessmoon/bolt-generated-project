import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPlus, Edit2, Star, X } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { useAnimeStore } from '@/store/anime';
import { useAnimeListStore } from '@/store/animelist';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { AnimeListStatus } from '@/types/animelist';

interface AnimeListButtonProps {
  animeId: string;
  className?: string;
}

const STATUS_COLORS = {
  WATCHING: 'bg-blue-500/10 text-blue-400',
  COMPLETED: 'bg-green-500/10 text-green-400',
  PLAN_TO_WATCH: 'bg-purple-500/10 text-purple-400',
  ON_HOLD: 'bg-yellow-500/10 text-yellow-400',
  DROPPED: 'bg-red-500/10 text-red-400',
} as const;

const STATUS_LABELS = {
  WATCHING: 'Watching',
  COMPLETED: 'Completed',
  PLAN_TO_WATCH: 'Plan to Watch',
  ON_HOLD: 'On Hold',
  DROPPED: 'Dropped',
} as const;

export default function AnimeListButton({ animeId, className }: AnimeListButtonProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const anime = useAnimeStore(state => state.animes.find(a => a.id === animeId));
  const { addEntry, updateEntry, removeEntry, getEntryByAnime } = useAnimeListStore();

  if (!anime) return null;

  const entry = user ? getEntryByAnime(user.id, animeId) : undefined;

  const handleStatusChange = (status: AnimeListStatus) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (entry) {
      // Update existing entry
      updateEntry(entry.id, {
        status,
        startDate: status === 'WATCHING' ? new Date() : entry.startDate,
        completedDate: status === 'COMPLETED' ? new Date() : undefined,
      });
    } else {
      // Create new entry
      addEntry(user.id, animeId, {
        status,
        progress: 0,
        startDate: status === 'WATCHING' ? new Date() : undefined,
        completedDate: status === 'COMPLETED' ? new Date() : undefined,
      });
    }
    setShowModal(false);
  };

  const handleRemove = () => {
    if (entry) {
      removeEntry(entry.id);
      setShowModal(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => user ? setShowModal(true) : navigate('/login')}
        variant={entry ? 'secondary' : 'primary'}
        className={cn('flex items-center gap-2', className)}
      >
        {entry ? (
          <>
            <Edit2 className="h-4 w-4" />
            {STATUS_LABELS[entry.status]}
          </>
        ) : (
          <>
            <ListPlus className="h-4 w-4" />
            Add to List
          </>
        )}
      </Button>

      {/* Status Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                {anime.title}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {(Object.keys(STATUS_LABELS) as AnimeListStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg',
                    'transition-colors duration-200',
                    entry?.status === status
                      ? STATUS_COLORS[status]
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  )}
                >
                  <span>{STATUS_LABELS[status]}</span>
                  {entry?.status === status && (
                    <Star className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>

            {entry && (
              <button
                onClick={handleRemove}
                className="mt-4 w-full px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10"
              >
                Remove from List
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
