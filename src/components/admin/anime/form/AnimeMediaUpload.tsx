import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Upload, Loader2, Trash } from 'lucide-react';
import type { AnimeEditInput } from '@/types/anime';

interface AnimeMediaUploadProps {
  register: UseFormRegister<AnimeEditInput>;
  errors: FieldErrors<AnimeEditInput>;
  setValue: UseFormSetValue<AnimeEditInput>;
  watch: UseFormWatch<AnimeEditInput>;
  isUploading: boolean;
  onUpload: (file: File, type: 'cover' | 'background') => Promise<void>;
}

export default function AnimeMediaUpload({ 
  register, 
  errors, 
  setValue, 
  watch,
  isUploading,
  onUpload 
}: AnimeMediaUploadProps) {
  const coverImage = watch('coverImage');
  const backgroundImage = watch('backgroundImage');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Media</h3>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-200">Cover Image</label>
          <div className="mt-1">
            {coverImage ? (
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="aspect-[2/3] w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue('coverImage', '')}
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
                      <span>Upload cover image</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUpload(file, 'cover');
                        }}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          {errors.coverImage && (
            <p className="mt-1 text-sm text-red-400">{errors.coverImage.message}</p>
          )}
        </div>

        {/* Background Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-200">Background Image</label>
          <div className="mt-1">
            {backgroundImage ? (
              <div className="relative">
                <img
                  src={backgroundImage}
                  alt="Background preview"
                  className="aspect-video w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue('backgroundImage', '')}
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
                      <span>Upload background image</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onUpload(file, 'background');
                        }}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
          </div>
          {errors.backgroundImage && (
            <p className="mt-1 text-sm text-red-400">{errors.backgroundImage.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
