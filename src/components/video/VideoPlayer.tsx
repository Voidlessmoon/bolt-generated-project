import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { VideoSource } from '@/types/anime';

interface VideoPlayerProps {
  source: VideoSource;
}

export default function VideoPlayer({ source }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [source]);

  // Extract video ID from URL for various platforms
  const getEmbedUrl = (source: VideoSource) => {
    const { type, url } = source;

    switch (type) {
      case 'VIDEA': {
        const videoId = url.split('v=')[1];
        return `//videa.hu/player?v=${videoId}`;
      }
      case 'STREAMWISH': {
        const videoId = url.split('/').pop();
        return `//streamwish.to/e/${videoId}`;
      }
      case 'DAILYMOTION': {
        const videoId = url.split('/').pop();
        return `//www.dailymotion.com/embed/video/${videoId}`;
      }
      case 'YOURUPLOAD': {
        const videoId = url.split('/').pop();
        return `//www.yourupload.com/embed/${videoId}`;
      }
      case 'MP4UPLOAD': {
        const videoId = url.split('/').pop();
        return `//www.mp4upload.com/embed-${videoId}.html`;
      }
      case 'OKRU': {
        const videoId = url.split('/').pop();
        return `//ok.ru/videoembed/${videoId}`;
      }
      case 'VKRU': {
        const videoId = url.split('/').pop();
        return `//vk.com/video_ext.php?oid=${videoId}`;
      }
      default:
        return url;
    }
  };

  const embedUrl = getEmbedUrl(source);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      )}
      
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError('Failed to load video');
        }}
      />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
