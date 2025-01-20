import { useState } from 'react';
import { Edit, Trash, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Episode } from '@/types/anime';
import { useAnimeStore } from '@/store/anime';
import EpisodeForm from './EpisodeForm';

interface EpisodeListProps {
  episodes: Episode[];
  selectedEpisodes: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

export default function EpisodeList({
  episodes,
  selectedEpisodes,
  onSelectionChange,
  onDelete,
}: EpisodeListProps) {
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const { animes } = useAnimeStore();

  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? episodes.map(ep => ep.id) : []);
  };

  const handleSelectEpisode = (id: string, checked: boolean) => {
    onSelectionChange(
      checked
        ? [...selectedEpisodes, id]
        : selectedEpisodes.filter(epId => epId !== id)
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this episode?')) {
      onDelete(id);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedEpisodes.length === episodes.length && episodes.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-800/50 text-purple-600 
                           focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Anime</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Episode</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Sources</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {episodes.map((episode) => {
              const anime = animes.find(a => a.id === episode.animeId);
              
              return (
                <tr key={episode.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedEpisodes.includes(episode.id)}
                      onChange={(e) => handleSelectEpisode(episode.id, e.target.checked)}
                      className="rounded border-gray-700 bg-gray-800/50 text-purple-600 
                               focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={anime?.coverImage}
                        alt={anime?.title}
                        className="h-12 w-8 object-cover rounded"
                      />
                      <span className="font-medium text-white">{anime?.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    Episode {episode.number}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {episode.title}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {episode.duration} min
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {episode.sources.map((source, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300"
                        >
                          {source.type} ({source.quality})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingEpisode(episode)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(episode.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {episodes.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            No episodes found
          </div>
        )}
      </div>

      {/* Edit Episode Modal */}
      {editingEpisode && (
        <EpisodeForm
          episode={editingEpisode}
          onClose={() => setEditingEpisode(null)}
          onSuccess={() => setEditingEpisode(null)}
        />
      )}
    </>
  );
}
