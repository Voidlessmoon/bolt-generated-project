import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { animeEditSchema } from '@/types/anime';
import type { Anime, AnimeEditInput } from '@/types/anime';
import Button from '@/components/ui/Button';
import AnimeBasicInfo from './form/AnimeBasicInfo';
import AnimeMediaUpload from './form/AnimeMediaUpload';
import AnimeScheduleSection from './form/AnimeScheduleSection';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1312527548353089557/A6b-5GxwkWU8U2eyxY5kaTHkVEqHxnmOBiwWu1yH9iPT1wf7vUDm6Qj4QLtQwsgRTMLZ';

interface AnimeEditModalProps {
  anime: Anime;
  onSave: (data: AnimeEditInput) => void;
  onClose: () => void;
}

export default function AnimeEditModal({ anime, onSave, onClose }: AnimeEditModalProps) {
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AnimeEditInput>({
    resolver: zodResolver(animeEditSchema),
    defaultValues: {
      ...anime,
      schedule: anime.schedule || { day: 'MONDAY' }
    },
  });

  const status = watch('status');

  const handleImageUpload = async (file: File, type: 'cover' | 'background') => {
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
      
      setValue(type === 'cover' ? 'coverImage' : 'backgroundImage', imageUrl);
      return imageUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: AnimeEditInput) => {
    // Only include schedule if anime is ongoing
    const animeData = {
      ...data,
      schedule: data.status === 'ONGOING' ? data.schedule : undefined
    };
    onSave(animeData);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative w-full max-w-4xl rounded-lg bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Edit Anime</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Media Upload Section */}
              <AnimeMediaUpload
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
                isUploading={isUploading}
                onUpload={handleImageUpload}
              />

              {/* Basic Info Section */}
              <AnimeBasicInfo
                register={register}
                errors={errors}
                watch={watch}
              />

              {/* Schedule Section - Only show for ongoing anime */}
              {status === 'ONGOING' && (
                <AnimeScheduleSection
                  register={register}
                  errors={errors}
                  showSchedule={true}
                />
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
