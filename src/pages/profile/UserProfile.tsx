import { useParams } from 'react-router-dom';
import { useUserStore } from '@/store/user';
import { useAuth } from '@/store/auth';
import { useAnimeStore } from '@/store/anime';
import { useAnimeListStore } from '@/store/animelist';
import { MessageSquare, Calendar } from 'lucide-react';
import UserComments from '@/components/profile/UserComments';
import AnimeStatusSection from '@/components/profile/AnimeStatusSection';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const user = useUserStore(state => state.users.find(u => u.id === userId));
  const animes = useAnimeStore(state => state.animes);
  const { getEntriesByStatus } = useAnimeListStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-center text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  // Get entries for each status
  const watchingEntries = getEntriesByStatus(user.id, 'WATCHING');
  const completedEntries = getEntriesByStatus(user.id, 'COMPLETED');
  const planToWatchEntries = getEntriesByStatus(user.id, 'PLAN_TO_WATCH');

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden">
        {user.banner ? (
          <div className="relative h-full w-full">
            <img
              src={user.banner}
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950/80" />
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-gray-900 to-gray-800" />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-8">
          <div className="flex items-end gap-6">
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nickname || user.username}
                className="h-32 w-32 rounded-full border-4 border-gray-950 object-cover ring-2 ring-purple-500/20"
              />
            ) : (
              <div className="h-32 w-32 rounded-full border-4 border-gray-950 bg-purple-600 flex items-center justify-center ring-2 ring-purple-500/20">
                <span className="text-4xl font-medium text-white">
                  {(user.nickname || user.username)[0].toUpperCase()}
                </span>
              </div>
            )}

            {/* User Info */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-white">
                {user.nickname || user.username}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-gray-400">
                <Calendar className="h-4 w-4" />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
              {user.bio && (
                <p className="mt-4 text-gray-300 max-w-2xl">{user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Anime Lists */}
        <div className="space-y-8">
          {/* Currently Watching */}
          {watchingEntries.length > 0 && (
            <AnimeStatusSection
              title="Currently Watching"
              entries={watchingEntries}
              animes={animes}
            />
          )}

          {/* Completed */}
          {completedEntries.length > 0 && (
            <AnimeStatusSection
              title="Completed"
              entries={completedEntries}
              animes={animes}
            />
          )}

          {/* Plan to Watch */}
          {planToWatchEntries.length > 0 && (
            <AnimeStatusSection
              title="Plan to Watch"
              entries={planToWatchEntries}
              animes={animes}
            />
          )}
        </div>

        {/* User Comments */}
        <div className="mt-12">
          <UserComments userId={user.id} />
        </div>

        {/* No Content Message */}
        {watchingEntries.length === 0 && 
         completedEntries.length === 0 && 
         planToWatchEntries.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No anime added yet
          </div>
        )}
      </div>
    </div>
  );
}
