import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThumbsUp, ThumbsDown, Reply, Trash2, Edit2, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/store/auth';
import { useCommentStore } from '@/store/comment';
import { commentSchema, type CommentInput, type Comment } from '@/types/comment';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/user';
import UserProfilePreview from '@/components/profile/preview/UserProfilePreview';

interface CommentSectionProps {
  episodeId: string;
}

export default function CommentSection({ episodeId }: CommentSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const comments = useCommentStore((state) => state.getEpisodeComments(episodeId));

  // Sort comments by date, newest first
  const sortedComments = [...comments].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  // Separate top-level comments and replies
  const topLevelComments = sortedComments.filter(comment => !comment.parentId);
  const replies = sortedComments.filter(comment => comment.parentId);

  const handleCommentSubmit = (data: CommentInput) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const { addComment } = useCommentStore.getState();
    addComment(
      episodeId,
      user.id,
      user.nickname || user.username,
      user.avatar,
      data
    );
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <CommentForm onSubmit={handleCommentSubmit} />

      {/* Comments List */}
      <div className="space-y-6">
        {topLevelComments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            replies={replies.filter(reply => reply.parentId === comment.id)}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
          />
        ))}
      </div>
    </div>
  );
}

function CommentForm({ 
  onSubmit,
  initialValue = '',
  placeholder = 'Write a comment...',
  submitLabel = 'Post',
  onCancel,
}: { 
  onSubmit: (data: CommentInput) => void;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: initialValue,
    },
  });

  const onSubmitHandler = (data: CommentInput) => {
    if (!user) {
      navigate('/login');
      return;
    }
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
      <textarea
        {...register('content')}
        className={cn(
          "w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3",
          "text-white placeholder-gray-400",
          "focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50",
          "resize-none",
          errors.content && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        rows={3}
        placeholder={placeholder}
      />
      {errors.content && (
        <p className="text-sm text-red-400">{errors.content.message}</p>
      )}
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function CommentThread({ 
  comment, 
  replies,
  replyingTo,
  setReplyingTo,
}: { 
  comment: Comment;
  replies: Comment[];
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
}) {
  const { user } = useAuth();
  const users = useUserStore((state) => state.users);
  const [isEditing, setIsEditing] = useState(false);
  const { toggleLike, toggleDislike, deleteComment, updateComment, addComment } = useCommentStore();

  // Find the user who made the comment to check if they're an admin
  const commentUser = users.find(u => u.id === comment.userId);
  const isAdmin = commentUser?.role === 'ADMIN';

  const handleLike = () => {
    if (!user) return;
    toggleLike(comment.id, user.id);
  };

  const handleDislike = () => {
    if (!user) return;
    toggleDislike(comment.id, user.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(comment.id);
    }
  };

  const handleEdit = (data: CommentInput) => {
    updateComment(comment.id, data.content);
    setIsEditing(false);
  };

  const handleReply = (data: CommentInput) => {
    if (!user) return;
    addComment(
      comment.episodeId,
      user.id,
      user.nickname || user.username,
      user.avatar,
      data,
      comment.id
    );
    setReplyingTo(null);
  };

  const canDelete = user?.id === comment.userId || user?.role === 'ADMIN';
  const canEdit = user?.id === comment.userId;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-900/50 p-4">
        {/* Comment Header */}
        <div className="flex items-center gap-3">
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              alt={comment.userNickname}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {comment.userNickname[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <UserProfilePreview userId={comment.userId} showOnClick={true}>
              <p className="font-medium text-white cursor-pointer hover:text-purple-400 transition-colors">
                {comment.userNickname}
              </p>
            </UserProfilePreview>
            {isAdmin && (
              <div className="group relative">
                <div className="flex items-center gap-1 rounded bg-purple-600/10 px-2 py-0.5">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Admin</span>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-400">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.updatedAt && ' (edited)'}
            </p>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mt-3">
          {isEditing ? (
            <CommentForm
              onSubmit={handleEdit}
              initialValue={comment.content}
              submitLabel="Save"
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        {/* Comment Actions */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1 text-sm",
              comment.likes.includes(user?.id || '')
                ? "text-purple-400"
                : "text-gray-400 hover:text-purple-400"
            )}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{comment.likes.length}</span>
          </button>

          <button
            onClick={handleDislike}
            className={cn(
              "flex items-center gap-1 text-sm",
              comment.dislikes.includes(user?.id || '')
                ? "text-red-400"
                : "text-gray-400 hover:text-red-400"
            )}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{comment.dislikes.length}</span>
          </button>

          {user && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
            >
              <Reply className="h-4 w-4" />
              Reply
            </button>
          )}

          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <div className="ml-8">
          <CommentForm
            onSubmit={handleReply}
            placeholder="Write a reply..."
            submitLabel="Reply"
            onCancel={() => setReplyingTo(null)}
          />
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 space-y-4">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={[]}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
