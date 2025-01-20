import { z } from 'zod';

export interface Comment {
  id: string;
  episodeId: string;
  userId: string;
  userNickname: string;
  userAvatar?: string;
  content: string;
  likes: string[]; // Array of user IDs who liked
  dislikes: string[]; // Array of user IDs who disliked
  parentId?: string; // For replies
  createdAt: Date;
  updatedAt?: Date;
}

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

export type CommentInput = z.infer<typeof commentSchema>;
