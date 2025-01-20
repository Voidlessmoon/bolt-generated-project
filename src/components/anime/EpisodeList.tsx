import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Play } from 'lucide-react';
import { useEpisodeStore } from '@/store/episode';
import type { Episode } from '@/types/anime';

interface EpisodeListProps {
  animeId: string;
}

export default function EpisodeList({ animeId }: EpisodeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const episodes = useEpisodeStore((state) => state.getAnimeEpisodes(animeId));

  const filteredEpisodes = episodes
    .filter((episode) =>
      episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.number.toString().includes(searchTerm)
    )
    .sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Episodes</h2>
        <div className="relative w-64">
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEpisodes.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} animeId={animeId} />
        ))}
      </div>

      {filteredEpisodes.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-400">No episodes found</p>
        </div>
      )}
    </div>
  );
}

function EpisodeCard({ episode, animeId }: { episode: Episode; animeId: string }) {
  return (
    <Link
      to={`/anime/${animeId}/episode/${episode.id}`}
      className="group relative overflow-hidden rounded-lg bg-gray-800"
    >
      <div className="aspect-video">
        <img
          src={episode.thumbnail}
          alt={`Episode ${episode.number}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-purple-600 p-4 text-white">
            <Play className="h-6 w-6" />
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">
            Episode {episode.number}
          </span>
          <span className="text-sm text-gray-500">
            {episode.duration} min
          </span>
        </div>
        <h3 className="mt-1 text-lg font-medium text-white line-clamp-1">
          {episode.title}
        </h3>
      </div>
    </Link>
  );
}
