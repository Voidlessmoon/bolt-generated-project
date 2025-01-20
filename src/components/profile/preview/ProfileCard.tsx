import { MessageSquare, UserPlus, Calendar, UserMinus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/auth';
import { useAnimeListStore } from '@/store/animelist';
import { useUserStore } from '@/store/user';
import AnimeList from './AnimeList';
import UserStats from './UserStats';

interface ProfileCardProps {
  userId: string;
  isLoading: boolean;
  error: string | null;
  currentUser: ReturnType<typeof useAuth>['user'];
}

export default function ProfileCard({ userId, isLoading, error, currentUser }: ProfileCardProps) {
  const user = useUserStore(state => state.users.find(u => u.id === userId));
  const { getEntriesByUser } = useAnimeListStore();

  if (error) {
    return (
      <div className="w-80 rounded-lg bg-gray-900 p-4 shadow-lg ring-1 ring-gray-800">
        <p className="text-center text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="w-80 rounded-lg bg-gray-900 p-4 shadow-lg ring-1 ring-gray-800">
        <div className="flex animate-pulse space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-800" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 rounded bg-gray-800" />
            <div className="h-3 w-1/2 rounded bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === userId;
  const isFollowing = false; // TODO: Implement following system

  return (
    <div className="w-80 overflow-hidden rounded-lg bg-gray-900 shadow-lg ring-1 ring-gray-800">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.nickname || user.username}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {(user.nickname || user.username)[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">
              {user.nickname || user.username}
            </h3>
            <p className="flex items-center gap-1 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {!isCurrentUser && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" className="flex-1">
              {isFollowing ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Follow
                </>
              )}
            </Button>
            <Button size="sm" variant="secondary" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <UserStats userId={userId} />

      {/* Bio */}
      {user.bio && (
        <div className="border-t border-gray-800 px-4 py-3">
          <p className="text-sm text-gray-300 line-clamp-2">{user.bio}</p>
        </div>
      )}

      {/* Anime Lists */}
      <AnimeList userId={userId} />
    </div>
  );
}
