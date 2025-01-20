import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Comment, CommentInput } from '@/types/comment';
import { storage } from '@/lib/storage';

interface CommentState {
  comments: Comment[];
  addComment: (episodeId: string, userId: string, userNickname: string, userAvatar: string | undefined, data: CommentInput, parentId?: string) => void;
  deleteComment: (id: string) => void;
  updateComment: (id: string, content: string) => void;
  toggleLike: (commentId: string, userId: string) => void;
  toggleDislike: (commentId: string, userId: string) => void;
  getEpisodeComments: (episodeId: string) => Comment[];
  updateUserInfo: (userId: string, nickname: string, avatar?: string) => void;
}

export const useCommentStore = create<CommentState>()(
  persist(
    (set, get) => ({
      comments: storage.getComments(),
      addComment: (episodeId, userId, userNickname, userAvatar, data, parentId) => {
        const newComment: Comment = {
          id: uuidv4(),
          episodeId,
          userId,
          userNickname,
          userAvatar,
          content: data.content,
          likes: [],
          dislikes: [],
          parentId,
          createdAt: new Date(),
        };
        
        storage.addComment(newComment);
        set((state) => ({ comments: [...state.comments, newComment] }));
      },
      deleteComment: (id) => {
        storage.deleteComment(id);
        set((state) => ({
          comments: state.comments.filter((comment) => 
            comment.id !== id && comment.parentId !== id
          ),
        }));
      },
      updateComment: (id, content) => {
        const updatedComment = {
          content,
          updatedAt: new Date()
        };
        storage.updateComment(id, updatedComment);
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.id === id
              ? { ...comment, ...updatedComment }
              : comment
          ),
        }));
      },
      toggleLike: (commentId, userId) => {
        set((state) => {
          const updatedComments = state.comments.map((comment) => {
            if (comment.id !== commentId) return comment;

            const hasLiked = comment.likes.includes(userId);
            const hasDisliked = comment.dislikes.includes(userId);

            const updatedComment = {
              ...comment,
              likes: hasLiked
                ? comment.likes.filter((id) => id !== userId)
                : [...comment.likes, userId],
              dislikes: hasDisliked
                ? comment.dislikes.filter((id) => id !== userId)
                : comment.dislikes,
            };

            storage.updateComment(commentId, updatedComment);
            return updatedComment;
          });

          return { comments: updatedComments };
        });
      },
      toggleDislike: (commentId, userId) => {
        set((state) => {
          const updatedComments = state.comments.map((comment) => {
            if (comment.id !== commentId) return comment;

            const hasLiked = comment.likes.includes(userId);
            const hasDisliked = comment.dislikes.includes(userId);

            const updatedComment = {
              ...comment,
              likes: hasLiked
                ? comment.likes.filter((id) => id !== userId)
                : comment.likes,
              dislikes: hasDisliked
                ? comment.dislikes.filter((id) => id !== userId)
                : [...comment.dislikes, userId],
            };

            storage.updateComment(commentId, updatedComment);
            return updatedComment;
          });

          return { comments: updatedComments };
        });
      },
      getEpisodeComments: (episodeId) => {
        const { comments } = get();
        return comments
          .filter((comment) => comment.episodeId === episodeId)
          .map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
          }));
      },
      updateUserInfo: (userId, nickname, avatar) => {
        storage.updateUserComments(userId, nickname, avatar);
        set((state) => ({
          comments: state.comments.map((comment) =>
            comment.userId === userId
              ? {
                  ...comment,
                  userNickname: nickname,
                  ...(avatar !== undefined && { userAvatar: avatar }),
                }
              : comment
          ),
        }));
      },
    }),
    {
      name: 'comment-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.comments) {
          state.comments = state.comments.map(comment => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
            updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
          }));
        }
      },
    }
  )
);

// Listen for auth changes
window.addEventListener('authChange', ((event: CustomEvent) => {
  const { user } = event.detail;
  if (user) {
    useCommentStore.getState().updateUserInfo(
      user.id,
      user.nickname || user.username,
      user.avatar
    );
  }
}) as EventListener);

// Listen for profile updates
window.addEventListener('profileUpdate', ((event: CustomEvent) => {
  const { user } = event.detail;
  useCommentStore.getState().updateUserInfo(
    user.id,
    user.nickname || user.username,
    user.avatar
  );
}) as EventListener);
