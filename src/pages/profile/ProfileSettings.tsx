import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema } from '@/lib/auth/validation';
import { useAuth } from '@/store/auth';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import AvatarUpload from '@/components/profile/AvatarUpload';
import BannerUpload from '@/components/profile/BannerUpload';
import type { ProfileInput } from '@/types/auth';

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1312527548353089557/A6b-5GxwkWU8U2eyxY5kaTHkVEqHxnmOBiwWu1yH9iPT1wf7vUDm6Qj4QLtQwsgRTMLZ';

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: user?.nickname,
      bio: user?.bio,
      avatar: user?.avatar,
      banner: user?.banner,
      preferences: user?.preferences,
    },
  });

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
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
      
      // Update the form value
      setValue(type, imageUrl);
      
      // Also update the profile immediately
      await updateProfile({
        ...user,
        [type]: imageUrl,
        preferences: user?.preferences,
      });
      
      setToast({ message: `${type} updated successfully`, type: 'success' });
    } catch (error) {
      setToast({ message: `Failed to upload ${type}`, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (type: 'avatar' | 'banner') => {
    try {
      setValue(type, '');
      await updateProfile({
        ...user,
        [type]: '',
        preferences: user?.preferences,
      });
      setToast({ message: `${type} removed successfully`, type: 'success' });
    } catch (error) {
      setToast({ message: `Failed to remove ${type}`, type: 'error' });
    }
  };

  const onSubmit = async (data: ProfileInput) => {
    try {
      await updateProfile({
        ...data,
        preferences: user?.preferences,
      });
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to update profile', 
        type: 'error' 
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Banner Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Profile Banner</h3>
        <BannerUpload
          currentBanner={watch('banner')}
          onUpload={(file) => handleImageUpload(file, 'banner')}
          onRemove={() => handleRemoveImage('banner')}
          isUploading={isUploading}
        />
      </div>

      {/* Basic Info */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-white">Basic Information</h3>
        
        <div className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Avatar
            </label>
            <AvatarUpload
              currentAvatar={watch('avatar')}
              onUpload={(file) => handleImageUpload(file, 'avatar')}
              onRemove={() => handleRemoveImage('avatar')}
              isUploading={isUploading}
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Display Name
            </label>
            <input
              type="text"
              {...register('nickname')}
              className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                       text-white placeholder-gray-400
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              placeholder="Enter your display name"
            />
            {errors.nickname && (
              <p className="mt-1 text-sm text-red-400">{errors.nickname.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-400">
              This is how you'll appear to other users.
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="mt-1 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                       text-white placeholder-gray-400
                       focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                       resize-none"
              placeholder="Tell us about yourself..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-400">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isUploading}>
          Save Changes
        </Button>
      </div>

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
