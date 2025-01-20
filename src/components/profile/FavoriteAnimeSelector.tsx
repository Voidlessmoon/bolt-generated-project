import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useAnimeStore } from '@/store/anime';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

export default function FavoriteAnimeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, updateProfile } = useAuth();
  const animes = useAnimeStore(state => state.animes);

  if (!user) return null;

  // Initialize favoriteAnimes array if it doesn't exist
  const favoriteAnimes = user.preferences?.favoriteAnimes || [];
  const selectedAnimes = favoriteAnimes
    .map(id => animes.find(a => a.id === id))
    .filter(Boolean);

  const searchResults = animes
    .filter(anime => 
      anime.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !favoriteAnimes.includes(anime.id)
    )
    .slice(0, 5);

  const handleAddFavorite = async (animeId: string) => {
    if (favoriteAnimes.length >= 5) return;

    const newFavorites = [...favoriteAnimes, animeId];
    await updateProfile({
      ...user,
      preferences: {
        ...user.preferences,
        favoriteAnimes: newFavorites,
      }
    });
    setSearchTerm('');
  };

  const handleRemoveFavorite = async (animeId: string) => {
    const newFavorites = favoriteAnimes.filter(id => id !== animeId);
    await updateProfile({
      ...user,
      preferences: {
        ...user.preferences,
        favoriteAnimes: newFavorites,
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Selected Favorites */}
      <div className="space-y-3">
        {selectedAnimes.map(anime => (
          <div key={anime.id} className="flex items-center gap-3 rounded-lg border border-gray-800 p-3">
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="h-16 w-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate">
                {anime.title}
              </h4>
              <p className="text-sm text-gray-400">
                {anime.status}
              </p>
            </div>
            <button
              onClick={() => handleRemoveFavorite(anime.id)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Button */}
      {favoriteAnimes.length < 5 && (
        <div>
          {isOpen ? (
            <div className="space-y-3">
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

              {/* Search Results */}
              {searchTerm && (
                <div className="space-y-2">
                  {searchResults.map(anime => (
                    <button
                      key={anime.id}
                      onClick={() => handleAddFavorite(anime.id)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-gray-800"
                    >
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="h-16 w-12 rounded object-cover"
                      />
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-white">{anime.title}</h4>
                        <p className="text-sm text-gray-400">{anime.status}</p>
                      </div>
                      <Plus className="h-4 w-4 text-purple-400" />
                    </button>
                  ))}

                  {searchResults.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-2">
                      No results found
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="w-full rounded-lg border border-gray-800 px-4 py-2 text-gray-400 hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4",
                "text-purple-400 hover:text-purple-300 hover:border-purple-500/50",
                "transition-colors duration-200",
                favoriteAnimes.length === 0 ? "border-purple-500/50" : "border-gray-800"
              )}
            >
              <Plus className="h-5 w-5" />
              {favoriteAnimes.length === 0 ? (
                <span>Add your favorite anime</span>
              ) : (
                <span>Add another favorite ({5 - favoriteAnimes.length} remaining)</span>
              )}
            </button>
          )}
        </div>
      )}

      <p className="text-sm text-gray-400">
        You can select up to 5 favorite anime to display on your profile.
      </p>
    </div>
  );
}
