import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAnimeStore } from '@/store/anime';
import { animeEditSchema } from '@/types/anime';
import type { AnimeEditInput } from '@/types/anime';
import Toast from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import AnimeBasicInfo from '@/components/admin/anime/form/AnimeBasicInfo';
import AnimeMediaUpload from '@/components/admin/anime/form/AnimeMediaUpload';
import AnimeScheduleSection from '@/components/admin/anime/form/AnimeScheduleSection';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1312527548353089557/A6b-5GxwkWU8U2eyxY5kaTHkVEqHxnmOBiwWu1yH9iPT1wf7vUDm6Qj4QLtQwsgRTMLZ';

export default function CreateAnime() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const addAnime = useAnimeStore((state) => state.addAnime);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AnimeEditInput>({
    resolver: zodResolver(animeEditSchema),
    defaultValues: {
      status: 'ONGOING',
      genres: [],
      rating: 0,
      year: new Date().getFullYear(),
      adaptedFrom: {
        type: 'ORIGINAL'
      },
      schedule: {
        day: 'MONDAY'
      }
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
      setToast({ message: `Failed to upload ${type} image`, type: 'error' });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: AnimeEditInput) => {
    try {
      // Only include schedule if anime is ongoing
      const animeData = {
        ...data,
        schedule: data.status === 'ONGOING' ? data.schedule : undefined
      };

      addAnime(animeData);
      setToast({ message: 'Anime created successfully!', type: 'success' });
      setTimeout(() => navigate('/admin/anime'), 1500);
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to create anime', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Create New Anime</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-gray-900/50 backdrop-blur-sm p-6 rounded-lg border border-gray-800">
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
          />

          {/* Schedule Section - Only show for ongoing anime */}
          {status === 'ONGOING' && (
            <AnimeScheduleSection
              register={register}
              errors={errors}
              showSchedule={true}
            />
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isUploading}>
            Create Anime
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
    </div>
  );
}
