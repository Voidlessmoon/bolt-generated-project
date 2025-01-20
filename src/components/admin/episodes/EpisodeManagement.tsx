import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import EpisodeList from './EpisodeList';
import EpisodeForm from './EpisodeForm';
import AnimeSelect from './AnimeSelect';
import { useAnimeStore } from '@/store/anime';
import { useEpisodeStore } from '@/store/episode';
import Toast from '@/components/ui/Toast';
import type { Episode } from '@/types/anime';

export default function EpisodeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { animes } = useAnimeStore();
  const { episodes, deleteEpisode } = useEpisodeStore();

  const filteredEpisodes = episodes.filter(episode => {
    const matchesAnime = !selectedAnimeId || episode.animeId === selectedAnimeId;
    const matchesSearch = episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         episode.number.toString().includes(searchTerm);
    return matchesAnime && matchesSearch;
  });

  const handleBulkDelete = async () => {
    if (!selectedEpisodes.length) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedEpisodes.length} episodes?`)) {
      try {
        selectedEpisodes.forEach(id => deleteEpisode(id));
        setToast({ message: 'Episodes deleted successfully', type: 'success' });
        setSelectedEpisodes([]);
      } catch (error) {
        setToast({ message: 'Failed to delete episodes', type: 'error' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Episode Management</h1>
        <div className="flex items-center gap-2">
          {selectedEpisodes.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleBulkDelete}
              className="text-red-400 hover:text-red-300"
            >
              Delete Selected ({selectedEpisodes.length})
            </Button>
          )}
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Episode
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-gray-800/50 border border-gray-700 pl-10 pr-4 py-2
                       text-white placeholder-gray-400
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            />
          </div>

          <div className="flex gap-2">
            <AnimeSelect
              value={selectedAnimeId}
              onChange={setSelectedAnimeId}
              className="w-64"
            />
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Episode List */}
        <EpisodeList
          episodes={filteredEpisodes}
          selectedEpisodes={selectedEpisodes}
          onSelectionChange={setSelectedEpisodes}
          onDelete={(id) => {
            deleteEpisode(id);
            setToast({ message: 'Episode deleted successfully', type: 'success' });
          }}
        />
      </div>

      {/* Add Episode Modal */}
      {showAddForm && (
        <EpisodeForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            setToast({ message: 'Episode added successfully', type: 'success' });
          }}
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
