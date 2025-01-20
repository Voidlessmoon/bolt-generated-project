import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Upload, Loader2, Trash } from 'lucide-react';
import type { EpisodeInput } from '@/types/anime';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1312527548353089557/A6b-5GxwkWU8U2eyxY5kaTHkVEqHxnmOBiwWu1yH9iPT1wf7vUDm6Qj4QLtQwsgRTMLZ';

interface EpisodeMediaProps {
  register: UseFormRegister<EpisodeInput>;
  errors: FieldErrors<EpisodeInput>;
  setValue: UseFormSetValue<EpisodeInput>;
  watch: UseFormWatch<EpisodeInput>;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

export default function EpisodeMedia({
  register,
  errors,
  setValue,
  watch,
  isUploading,
  setIsUploading,
}: EpisodeMediaProps) {
  const thumbnail = watch('thumbnail');

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
      setValue('thumbnail', data.attachments[0].url);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
                onClick={() => setValue('thumbnail', '')}
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
                        if (file) uploadThumbnail(file);
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
        {errors.thumbnail && (
          <p className="mt-1 text-sm text-red-400">{errors.thumbnail.message}</p>
        )}
      </div>
    </div>
  );
}
