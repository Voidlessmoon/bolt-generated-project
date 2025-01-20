import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash, Edit, Pin, PinOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAnimeStore } from '@/store/anime';
import Toast from '@/components/ui/Toast';
import AnimeEditModal from '@/components/admin/anime/AnimeEditModal';
import type { Anime, AnimeEditInput } from '@/types/anime';

export default function AnimeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const { animes, deleteAnime, updateAnime, togglePin } = useAnimeStore();

  // Sort animes with pinned items first
  const sortedAnimes = [...animes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isPinned && b.isPinned && a.pinnedAt && b.pinnedAt) {
      return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
    }
    return 0;
  });

  const filteredAnime = sortedAnimes.filter(anime => {
    const matchesSearch = anime.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || anime.status === selectedStatus;
    const matchesGenre = !selectedGenre || anime.genres.includes(selectedGenre);
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this anime?')) {
      try {
        deleteAnime(id);
        setToast({ message: 'Anime deleted successfully', type: 'success' });
      } catch (error) {
        setToast({ message: 'Failed to delete anime', type: 'error' });
      }
    }
  };

  const handleEdit = (data: AnimeEditInput) => {
    if (!editingAnime) return;
    
    try {
      updateAnime(editingAnime.id, data);
      setToast({ message: 'Anime updated successfully', type: 'success' });
      setEditingAnime(null);
    } catch (error) {
      setToast({ message: 'Failed to update anime', type: 'error' });
    }
  };

  const handleTogglePin = (id: string) => {
    try {
      togglePin(id);
      setToast({ 
        message: animes.find(a => a.id === id)?.isPinned 
          ? 'Anime unpinned successfully' 
          : 'Anime pinned successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({ message: 'Failed to toggle pin status', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Anime List</h1>
        <Button onClick={() => navigate('/admin/anime/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Anime
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
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

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <option value="">All Status</option>
            <option value="ONGOING">Ongoing</option>
            <option value="FINISHED">Finished</option>
            <option value="UPCOMING">Upcoming</option>
          </select>

          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Horror">Horror</option>
            <option value="Mystery">Mystery</option>
            <option value="Romance">Romance</option>
            <option value="Sci-Fi">Sci-Fi</option>
          </select>
        </div>
      </div>

      {/* Anime List */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Episodes</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Rating</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredAnime.map((anime) => (
              <tr key={anime.id} className={cn(
                "hover:bg-gray-800/50",
                anime.isPinned && "bg-purple-900/10"
              )}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="h-12 w-8 object-cover rounded"
                    />
                    <span className="font-medium text-white">{anime.title}</span>
                    {anime.isPinned && (
                      <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400">
                        Pinned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    {
                      "bg-green-500/10 text-green-400": anime.status === "FINISHED",
                      "bg-blue-500/10 text-blue-400": anime.status === "ONGOING",
                      "bg-yellow-500/10 text-yellow-400": anime.status === "UPCOMING",
                    }
                  )}>
                    {anime.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{anime.episodes}</td>
                <td className="px-4 py-3 text-gray-300">{anime.rating}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePin(anime.id)}
                      className={cn(
                        "rounded p-1 hover:bg-gray-700",
                        anime.isPinned
                          ? "text-purple-400 hover:text-purple-300"
                          : "text-gray-400 hover:text-purple-400"
                      )}
                      title={anime.isPinned ? "Unpin" : "Pin"}
                    >
                      {anime.isPinned ? (
                        <PinOff className="h-4 w-4" />
                      ) : (
                        <Pin className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingAnime(anime)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(anime.id)}
                      className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAnime.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            No anime found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAnime && (
        <AnimeEditModal
          anime={editingAnime}
          onSave={handleEdit}
          onClose={() => setEditingAnime(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
