import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import type { AnimeEditInput } from '@/types/anime';
import { ANIME_GENRES, ANIME_SEASONS } from '@/constants/anime';

interface AnimeBasicInfoProps {
  register: UseFormRegister<AnimeEditInput>;
  errors: FieldErrors<AnimeEditInput>;
  watch?: UseFormWatch<AnimeEditInput>;
}

export default function AnimeBasicInfo({ register, errors, watch }: AnimeBasicInfoProps) {
  const status = watch?.('status');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">Basic Information</h3>
      
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-200">Title</label>
        <input
          {...register('title')}
          type="text"
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white placeholder-gray-400
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          placeholder="Enter anime title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-200">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white placeholder-gray-400
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                   resize-none"
          placeholder="Enter anime description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-200">Status</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          <option value="ONGOING">Ongoing</option>
          <option value="FINISHED">Finished</option>
          <option value="UPCOMING">Upcoming</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-400">{errors.status.message}</p>
        )}
      </div>

      {/* Episodes and Rating */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-200">Episodes</label>
          <input
            {...register('episodes', { valueAsNumber: true })}
            type="number"
            min="1"
            className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
          {errors.episodes && (
            <p className="mt-1 text-sm text-red-400">{errors.episodes.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Rating</label>
          <input
            {...register('rating', { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="10"
            className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-400">{errors.rating.message}</p>
          )}
        </div>
      </div>

      {/* Season and Year */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-200">Season</label>
          <select
            {...register('season')}
            className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            {ANIME_SEASONS.map((season) => (
              <option key={season} value={season}>
                {season.charAt(0) + season.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {errors.season && (
            <p className="mt-1 text-sm text-red-400">{errors.season.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">Year</label>
          <input
            {...register('year', { valueAsNumber: true })}
            type="number"
            min="1950"
            max={new Date().getFullYear() + 1}
            className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-400">{errors.year.message}</p>
          )}
        </div>
      </div>

      {/* Genres */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Genres</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {ANIME_GENRES.map((genre) => (
            <label key={genre} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={genre}
                {...register('genres')}
                className="rounded border-gray-700 bg-gray-800/50 text-purple-600 
                         focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              />
              <span className="text-sm text-gray-300">{genre}</span>
            </label>
          ))}
        </div>
        {errors.genres && (
          <p className="mt-1 text-sm text-red-400">{errors.genres.message}</p>
        )}
      </div>

      {/* Source Material */}
      <div>
        <label className="block text-sm font-medium text-gray-200">Source Material</label>
        <select
          {...register('adaptedFrom.type')}
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          <option value="ORIGINAL">Original</option>
          <option value="MANGA">Manga</option>
          <option value="NOVEL">Novel</option>
        </select>
      </div>
    </div>
  );
}
