import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { EpisodeInput } from '@/types/anime';
import { useAnimeStore } from '@/store/anime';

interface EpisodeBasicInfoProps {
  register: UseFormRegister<EpisodeInput>;
  errors: FieldErrors<EpisodeInput>;
  setValue: UseFormSetValue<EpisodeInput>;
  watch: UseFormWatch<EpisodeInput>;
}

export default function EpisodeBasicInfo({ 
  register, 
  errors,
  setValue,
  watch 
}: EpisodeBasicInfoProps) {
  const animes = useAnimeStore(state => state.animes);
  const selectedAnimeId = watch('animeId');

  // Only show ongoing anime in the dropdown
  const ongoingAnimes = animes.filter(anime => anime.status === 'ONGOING');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-200">
          Anime
        </label>
        <select
          {...register('animeId')}
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          <option value="">Select an anime</option>
          {ongoingAnimes.map((anime) => (
            <option key={anime.id} value={anime.id}>
              {anime.title}
            </option>
          ))}
        </select>
        {errors.animeId && (
          <p className="mt-1 text-sm text-red-400">{errors.animeId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200">
          Episode Number
        </label>
        <input
          type="number"
          {...register('number', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white placeholder-gray-400
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          placeholder="Enter episode number"
        />
        {errors.number && (
          <p className="mt-1 text-sm text-red-400">{errors.number.message}</p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-200">
          Episode Title
        </label>
        <input
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                   text-white placeholder-gray-400
                   focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          placeholder="Enter episode title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>
    </div>
  );
}
