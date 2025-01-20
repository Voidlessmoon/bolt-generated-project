// Update the existing AnimePage.tsx to include the AnimeListButton
import { useParams } from 'react-router-dom';
import { useAnimeStore } from '@/store/anime';
import { Star, Calendar, Clock, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import EpisodeList from '@/components/anime/EpisodeList';
import AnimeListButton from '@/components/anime/AnimeListButton';

export default function AnimePage() {
  const { id } = useParams();
  const { animes } = useAnimeStore();
  const anime = animes.find((a) => a.id === id);

  if (!anime) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-400">Anime not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      {/* Hero Section */}
      <div className="relative h-[50vh]">
        <img
          src={anime.coverImage}
          alt={anime.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-4xl font-bold text-white">{anime.title}</h1>
              <AnimeListButton animeId={anime.id} />
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-gray-300">{anime.rating}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">{anime.season} {anime.year}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">{anime.episodes} Episodes</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">{anime.status}</span>
              </div>
            </div>

            <p className="mt-6 text-gray-300">{anime.description}</p>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white">Genres</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Episodes Section */}
            <div className="mt-12">
              <EpisodeList animeId={anime.id} />
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6 lg:border-l lg:border-gray-800 lg:pl-8">
            <div>
              <h2 className="text-xl font-semibold text-white">Information</h2>
              <dl className="mt-4 space-y-4">
                <div>
                  <dt className="text-sm text-gray-400">Status</dt>
                  <dd className="text-gray-300">{anime.status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Episodes</dt>
                  <dd className="text-gray-300">{anime.episodes}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Season</dt>
                  <dd className="text-gray-300">{anime.season}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-400">Year</dt>
                  <dd className="text-gray-300">{anime.year}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
