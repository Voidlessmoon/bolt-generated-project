import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { EpisodeInput } from '@/types/anime';

interface EpisodeScheduleProps {
  register: UseFormRegister<EpisodeInput>;
  errors: FieldErrors<EpisodeInput>;
}

export default function EpisodeSchedule({ register, errors }: EpisodeScheduleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Episode Schedule</h3>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Release Date
          </label>
          <input
            type="date"
            {...register('releaseDate', {
              setValueAs: (value) => value ? new Date(value) : undefined,
            })}
            className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
          {errors.releaseDate && (
            <p className="mt-1 text-sm text-red-400">{errors.releaseDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200">
            Release Time
          </label>
          <input
            type="time"
            {...register('releaseTime')}
            className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
          {errors.releaseTime && (
            <p className="mt-1 text-sm text-red-400">{errors.releaseTime.message}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400">
        Set the release date and time for this episode. Leave empty if the episode is already available.
      </p>
    </div>
  );
}
