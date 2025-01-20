import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEpisodeStore } from '@/store/episode';
import { useAnimeStore } from '@/store/anime';
import { Play, Monitor, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import Button from '@/components/ui/Button';
import VideoPlayer from '@/components/video/VideoPlayer';
import CommentSection from '@/components/comments/CommentSection';
import { cn } from '@/lib/utils';
import type { VideoSource } from '@/types/anime';

export default function EpisodePage() {
  const navigate = useNavigate();
  const { animeId, episodeId } = useParams();
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  
  const episode = useEpisodeStore(state => 
    state.episodes.find(ep => ep.id === episodeId)
  );
  const anime = useAnimeStore(state => 
    state.animes.find(a => a.id === animeId)
  );

  // Set initial source when episode loads or changes
  useEffect(() => {
    if (episode?.sources.length > 0 && !selectedSource) {
      // Try to get previously selected quality from localStorage
      const preferredQuality = localStorage.getItem('preferredQuality');
      const source = preferredQuality
        ? episode.sources.find(s => s.quality === preferredQuality) || episode.sources[0]
        : episode.sources[0];
      setSelectedSource(source);
    }
  }, [episode, selectedSource]);

  if (!episode || !anime) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-400">Episode not found</p>
      </div>
    );
  }

  const handleSourceChange = (source: VideoSource) => {
    setSelectedSource(source);
    // Save quality preference
    localStorage.setItem('preferredQuality', source.quality);
  };

  const navigateToEpisode = (targetNumber: number) => {
    const targetEpisode = useEpisodeStore.getState().episodes
      .find(ep => ep.animeId === animeId && ep.number === targetNumber);
    
    if (targetEpisode) {
      navigate(`/anime/${animeId}/episode/${targetEpisode.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Video Player Section */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
          {selectedSource ? (
            <VideoPlayer source={selectedSource} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-400">No video source available</p>
            </div>
          )}
        </div>

        {/* Server Selection */}
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-medium text-white">Video Servers</h3>
          <div className="flex flex-wrap gap-2">
            {episode.sources.map((source, index) => (
              <Button
                key={index}
                variant={selectedSource === source ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleSourceChange(source)}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  selectedSource === source && "ring-2 ring-purple-500 ring-opacity-50"
                )}
              >
                <Monitor className="h-4 w-4" />
                {source.type} - {source.quality}
              </Button>
            ))}
          </div>
        </div>

        {/* Episode Info */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-white">
            {anime.title} - Episode {episode.number}
          </h1>
          <h2 className="mt-2 text-xl text-gray-300">{episode.title}</h2>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">{episode.duration} minutes</span>
            </div>
          </div>
        </div>

        {/* Episode Navigation */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="secondary"
            disabled={episode.number === 1}
            onClick={() => navigateToEpisode(episode.number - 1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Episode
          </Button>
          <Button
            variant="secondary"
            disabled={episode.number === anime.episodes}
            onClick={() => navigateToEpisode(episode.number + 1)}
            className="flex items-center gap-2"
          >
            Next Episode
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-white">Comments</h2>
          </div>
          <CommentSection episodeId={episode.id} />
        </div>
      </div>
    </div>
  );
}
