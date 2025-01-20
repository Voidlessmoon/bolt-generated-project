import { UseFormRegister, FieldErrors, Control, useFieldArray } from 'react-hook-form';
import { Plus, Trash } from 'lucide-react';
import type { EpisodeInput } from '@/types/anime';

const VIDEO_SOURCES = [
  { value: 'VIDEA', label: 'Videa' },
  { value: 'STREAMWISH', label: 'StreamWish' },
  { value: 'DAILYMOTION', label: 'Dailymotion' },
  { value: 'YOURUPLOAD', label: 'YourUpload' },
  { value: 'MP4UPLOAD', label: 'MP4Upload' },
  { value: 'OKRU', label: 'OK.ru' },
  { value: 'VKRU', label: 'VK.ru' },
  { value: 'GDRIVE', label: 'Google Drive' },
  { value: 'YOUTUBE', label: 'YouTube' },
];

interface EpisodeSourceListProps {
  control: Control<EpisodeInput>;
  register: UseFormRegister<EpisodeInput>;
  errors: FieldErrors<EpisodeInput>;
}

export default function EpisodeSourceList({
  control,
  register,
  errors,
}: EpisodeSourceListProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sources',
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-200">
          Video Sources
        </label>
        <button
          type="button"
          onClick={() => append({ type: 'VIDEA', url: '', quality: '720p' })}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-4">
            <select
              {...register(`sources.${index}.type`)}
              className="w-40 rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2
                       text-white
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              {VIDEO_SOURCES.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>

            <input
              type="url"
              {...register(`sources.${index}.url`)}
              placeholder="Enter video URL"
              className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2
                       text-white placeholder-gray-400
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            />

            <select
              {...register(`sources.${index}.quality`)}
              className="w-28 rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2
                       text-white
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              <option value="360p">360p</option>
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>

            <button
              type="button"
              onClick={() => remove(index)}
              className="rounded p-1 text-red-400 hover:bg-gray-700"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {errors.sources && (
        <p className="mt-2 text-sm text-red-400">{errors.sources.message}</p>
      )}
    </div>
  );
}
