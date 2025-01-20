import { useState, useEffect } from 'react';
import { User, List, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileSettings from './ProfileSettings';
import AnimeList from './AnimeList';
import UserComments from '@/components/profile/UserComments';
import { useAuth } from '@/store/auth';

type Tab = 'settings' | 'animelist' | 'comments';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure profile data is loaded
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) return null;
  if (isLoading) return <div>Loading...</div>;

  const tabs = [
    { id: 'settings', label: 'Profile Settings', icon: User },
    { id: 'animelist', label: 'Anime List', icon: List },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Banner and Profile Info */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 w-full overflow-hidden">
          {user.banner ? (
            <img
              src={user.banner}
              alt="Profile banner"
              className="h-full w-full object-cover"
              key={user.banner} // Force re-render on banner change
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-gray-900 to-gray-800" />
          )}
        </div>

        {/* Profile Info */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative -mt-16">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.nickname || user.username}
                  className="h-32 w-32 rounded-full border-4 border-gray-950 object-cover ring-2 ring-purple-500/20"
                  key={user.avatar} // Force re-render on avatar change
                />
              ) : (
                <div className="h-32 w-32 rounded-full border-4 border-gray-950 bg-purple-600 flex items-center justify-center ring-2 ring-purple-500/20">
                  <span className="text-4xl font-medium text-white">
                    {(user.nickname || user.username)[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {user.nickname || user.username}
                </h1>
                <p className="mt-1 text-gray-400">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
                {user.bio && (
                  <p className="mt-2 text-gray-300 max-w-2xl">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-800">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-2 border-b-2 py-4 text-sm font-medium',
                    activeTab === id
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-300'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="py-8">
            {activeTab === 'settings' && <ProfileSettings />}
            {activeTab === 'animelist' && <AnimeList />}
            {activeTab === 'comments' && <UserComments userId={user.id} initiallyExpanded={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}
