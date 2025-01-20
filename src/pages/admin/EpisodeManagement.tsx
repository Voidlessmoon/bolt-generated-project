import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2, Plus, Trash } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAnimeStore } from '@/store/anime';
import { useEpisodeStore } from '@/store/episode';
import Toast from '@/components/ui/Toast';
import { episodeSchema, type EpisodeInput } from '@/types/anime';

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

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1312527548353089557/A6b-5GxwkWU8U2eyxY5kaTHkVEqHxnmOBiwWu1yH9iPT1wf7vUDm6Qj4QLtQwsgRTMLZ';

export default function EpisodeManagement() {
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnail, setThumbnail] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { animes } = useAnimeStore();
  const addEpisode = useEpisodeStore((state) => state.addEpisode);

  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<EpisodeInput>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      sources: [{ type: 'VIDEA', url: '', quality: '720p' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sources',
  });

  const uploadThumbnail = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const imageUrl = data.attachments[0].url;
      setThumbnail(imageUrl);
      setValue('thumbnail', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: 'Failed to upload thumbnail', type: 'error' });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: EpisodeInput) => {
    try {
      if (!thumbnail) {
        setToast({ message: 'Thumbnail is required', type: 'error' });
        return;
      }

      addEpisode({
        ...data,
        thumbnail,
      });

      // Reset form
      setValue('animeId', '');
      setValue('number', 0);
      setValue('title', '');
      setValue('duration', 0);
      setValue('sources', [{ type: 'VIDEA', url: '', quality: '720p' }]);
      setThumbnail('');

      setToast({ message: 'Episode added successfully!', type: 'success' });
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to add episode', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Episode Management</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800">
        {/* Anime Selection */}
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
            {animes.map((anime) => (
              <option key={anime.id} value={anime.id}>
                {anime.title}
              </option>
            ))}
          </select>
          {errors.animeId && (
            <p className="mt-1 text-sm text-red-400">{errors.animeId.message}</p>
          )}
        </div>

        {/* Episode Number and Title */}
        <div className="grid gap-6 md:grid-cols-2">
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

          <div>
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

        {/* Duration and Thumbnail */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Duration (minutes)
            </label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                       text-white placeholder-gray-400
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              placeholder="Enter duration in minutes"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-400">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Thumbnail
            </label>
            <div className="mt-1">
              {thumbnail ? (
                <div className="relative">
                  <img
                    src={thumbnail}
                    alt="Thumbnail preview"
                    className="h-[150px] w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail('');
                      setValue('thumbnail', '');
                    }}
                    className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-700 px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-400">
                      <label className="relative cursor-pointer rounded-md font-medium text-purple-500 hover:text-purple-400">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadThumbnail(file);
                            }
                          }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
              {isUploading && (
                <div className="mt-2 flex items-center justify-center gap-2 text-purple-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Sources */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-200">
              Video Sources
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ type: 'VIDEA', url: '', quality: '720p' })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
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

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {errors.sources && (
            <p className="mt-2 text-sm text-red-400">{errors.sources.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Add Episode'}
        </Button>
      </form>

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
