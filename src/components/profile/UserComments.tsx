import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { useCommentStore } from '@/store/comment';
import { useAnimeStore } from '@/store/anime';
import { useEpisodeStore } from '@/store/episode';

interface UserCommentsProps {
  userId: string;
  initiallyExpanded?: boolean;
}

export default function UserComments({ userId, initiallyExpanded = false }: UserCommentsProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const comments = useCommentStore(state => state.comments.filter(c => c.userId === userId));
  const animes = useAnimeStore(state => state.animes);
  const episodes = useEpisodeStore(state => state.episodes);

  // Sort comments by date, newest first
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Get display comments based on expanded state
  const displayComments = isExpanded ? sortedComments : sortedComments.slice(0, 3);

  const handleCommentClick = (episodeId: string) => {
    const episode = episodes.find(ep => ep.id === episodeId);
    if (episode) {
      navigate(`/anime/${episode.animeId}/episode/${episodeId}`);
    }
  };

  if (comments.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
        <MessageSquare className="h-5 w-5" />
        Comments
      </h2>

      <div className="space-y-4">
        {displayComments.map(comment => {
          const episode = episodes.find(ep => ep.id === comment.episodeId);
          const anime = episode ? animes.find(a => a.id === episode.animeId) : null;

          return (
            <div
              key={comment.id}
              onClick={() => handleCommentClick(comment.episodeId)}
              className="group cursor-pointer rounded-lg bg-gray-900/50 p-4 hover:bg-gray-900/75 transition-colors"
            >
              {/* Episode Info */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {anime && (
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="h-10 w-7 rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-white">
                      {anime?.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Episode {episode?.number}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              {/* Comment Content */}
              <p className="text-gray-300">{comment.content}</p>

              {/* Comment Meta */}
              <div className="mt-2 text-sm text-gray-400">
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.updatedAt && ' (edited)'}
              </div>
            </div>
          );
        })}
      </div>

      {comments.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full rounded-lg border border-gray-800 px-4 py-2 text-sm text-purple-400 hover:bg-gray-900/50"
        >
          {isExpanded ? 'Show Less' : `Show All (${comments.length})`}
        </button>
      )}
    </div>
  );
}
