import { Link } from 'react-router-dom';
import { Play, Star, Book, Scroll, Timer } from 'lucide-react';
import { type Anime } from '@/types/anime';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link
      to={`/anime/${anime.id}`}
      className="group relative overflow-hidden rounded-lg bg-gray-900 transition-transform hover:scale-105"
    >
      <div className="aspect-[3/4]">
        <img
          src={anime.coverImage}
          alt={anime.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        <div className="absolute bottom-0 p-4">
          <h3 className="text-lg font-semibold text-white">{anime.title}</h3>
          
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-200">{anime.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-4 w-4 text-gray-200" />
              <span className="text-sm text-gray-200">{anime.episodes} eps</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="absolute right-2 top-2 flex flex-col gap-1">
        <div className={cn(
          "rounded px-2 py-1 text-xs font-medium",
          {
            "bg-blue-500/80 text-white": anime.status === "ONGOING",
            "bg-green-500/80 text-white": anime.status === "FINISHED",
            "bg-yellow-500/80 text-white": anime.status === "UPCOMING",
          }
        )}>
          {anime.status}
        </div>

        {/* Source Badge */}
        {anime.adaptedFrom && anime.adaptedFrom.type !== 'ORIGINAL' && (
          <div className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
            anime.adaptedFrom.type === 'MANGA'
              ? "bg-purple-500/80 text-white"
              : "bg-indigo-500/80 text-white"
          )}>
            {anime.adaptedFrom.type === 'MANGA' ? (
              <Book className="h-3 w-3" />
            ) : (
              <Scroll className="h-3 w-3" />
            )}
            {anime.adaptedFrom.status === 'ONGOING' && (
              <Timer className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
