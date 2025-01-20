import { useAnimeListStore } from '@/store/animelist';
import { useCommentStore } from '@/store/comment';

interface UserStatsProps {
  userId: string;
}

export default function UserStats({ userId }: UserStatsProps) {
  const getEntriesByUser = useAnimeListStore(state => state.getEntriesByUser);
  const getEpisodeComments = useCommentStore(state => state.getEpisodeComments);

  const entries = getEntriesByUser(userId);
  const comments = getEpisodeComments(''); // TODO: Get all user comments

  return (
    <div className="grid grid-cols-2 divide-x divide-gray-800 border-t border-gray-800">
      <div className="px-4 py-3 text-center">
        <p className="text-lg font-semibold text-white">{entries.length}</p>
        <p className="text-xs text-gray-400">Anime Listed</p>
      </div>
      <div className="px-4 py-3 text-center">
        <p className="text-lg font-semibold text-white">{comments.length}</p>
        <p className="text-xs text-gray-400">Comments</p>
      </div>
    </div>
  );
}
