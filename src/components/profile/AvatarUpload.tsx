import { useState, useRef } from 'react';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading: boolean;
}

export default function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  onRemove,
  isUploading 
}: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      // TODO: Show error toast
      return;
    }
    await onUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      {currentAvatar ? (
        <div className="relative inline-block group">
          <img
            src={currentAvatar}
            alt="Avatar"
            className="h-24 w-24 rounded-full object-cover transition-opacity group-hover:opacity-75"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-900/90 hover:bg-gray-900"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={onRemove}
                className="bg-red-600/90 hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-center h-24 w-24 rounded-full",
            "border-2 border-dashed transition-colors",
            isDragging
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 bg-gray-800 hover:border-purple-500/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <Upload className={cn(
              "mx-auto h-8 w-8 transition-colors",
              isDragging ? "text-purple-500" : "text-gray-400"
            )} />
            <label className="mt-2 block text-sm font-medium text-purple-500 hover:text-purple-400 cursor-pointer">
              <span>Upload</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-purple-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}
