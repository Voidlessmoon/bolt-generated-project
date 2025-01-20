import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { episodeSchema } from '@/types/anime';
import type { Episode, EpisodeInput } from '@/types/anime';
import { useEpisodeStore } from '@/store/episode';
import Button from '@/components/ui/Button';
import EpisodeBasicInfo from './form/EpisodeBasicInfo';
import EpisodeMedia from './form/EpisodeMedia';
import EpisodeSourceList from './form/EpisodeSourceList';

interface EpisodeFormProps {
  episode?: Episode;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EpisodeForm({ episode, onClose, onSuccess }: EpisodeFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const addEpisode = useEpisodeStore(state => state.addEpisode);
  const updateEpisode = useEpisodeStore(state => state.updateEpisode);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<EpisodeInput>({
    resolver: zodResolver(episodeSchema),
    defaultValues: episode || {
      sources: [{ type: 'VIDEA', url: '', quality: '720p' }]
    }
  });

  const onSubmit = async (data: EpisodeInput) => {
    try {
      if (episode) {
        // Update existing episode
        updateEpisode(episode.id, {
          ...episode,
          ...data,
        });
      } else {
        // Add new episode
        addEpisode(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit episode:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg bg-[#1a1d24] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {episode ? 'Edit Episode' : 'Add New Episode'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <EpisodeBasicInfo
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
          />

          <EpisodeMedia
            register={register}
            errors={errors}
            setValue={setValue}
            watch={watch}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />

          <EpisodeSourceList
            control={control}
            register={register}
            errors={errors}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {episode ? 'Save Changes' : 'Add Episode'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
