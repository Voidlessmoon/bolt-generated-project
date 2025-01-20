import usersData from '@/data/users.json';
import commentsData from '@/data/comments.json';
import { User } from '@/types/auth';
import { Comment } from '@/types/comment';
import { getDefaultAdmin } from '@/lib/admin';

// Initialize users with admin and data from JSON
let users = [
  getDefaultAdmin(),
  ...usersData.users.map(user => ({
    ...user,
    createdAt: new Date(user.createdAt)
  }))
];

let comments = [...commentsData.comments];

// Persist data to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('comments', JSON.stringify(comments));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Load data from localStorage on init
const loadFromStorage = () => {
  try {
    const storedUsers = localStorage.getItem('users');
    const storedComments = localStorage.getItem('comments');
    
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      // Ensure default admin is always present
      const adminExists = parsedUsers.some((u: any) => u.id === 'admin-default');
      users = [
        ...(adminExists ? [] : [getDefaultAdmin()]),
        ...parsedUsers.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
          bannedAt: user.bannedAt ? new Date(user.bannedAt) : undefined,
          status: user.status || 'ACTIVE'
        }))
      ];
    }
    
    if (storedComments) {
      comments = JSON.parse(storedComments).map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined
      }));
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    // Fallback to default state
    users = [getDefaultAdmin()];
    comments = [];
  }
};

// Load data on initialization
loadFromStorage();

export const storage = {
  // User operations
  getUsers: () => {
    loadFromStorage(); // Refresh from storage before returning
    return users;
  },
  
  addUser: (user: User) => {
    const newUser = {
      ...user,
      status: 'ACTIVE',
      createdAt: new Date(),
      preferences: {
        theme: 'dark',
        emailNotifications: false,
        language: 'en',
        ...user.preferences
      }
    };
    
    // Get current users and add new one
    const currentUsers = users || [];
    users = [...currentUsers, newUser];
    
    // Save to localStorage
    saveToStorage();
    
    console.log('Added new user:', newUser);
    console.log('Updated users:', users);
    
    return newUser;
  },
  
  updateUser: (userId: string, userData: Partial<User>) => {
    const isDefaultAdmin = userId === 'admin-default';
    users = users.map(user => {
      if (user.id !== userId) return user;
      
      // Prevent modifying critical admin properties
      if (isDefaultAdmin) {
        const { password, role, email, status, ...allowedUpdates } = userData;
        return { ...user, ...allowedUpdates };
      }
      
      return { ...user, ...userData };
    });
    
    saveToStorage();
    return users.find(u => u.id === userId);
  },
  
  deleteUser: (userId: string) => {
    if (userId !== 'admin-default') {
      users = users.filter(user => user.id !== userId);
      comments = comments.filter(comment => comment.userId !== userId);
      saveToStorage();
    }
  },
  
  findUserByEmail: (email: string) => 
    users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  
  findUserById: (id: string) => 
    users.find(u => u.id === id),

  // Comment operations
  getComments: () => comments,
  
  addComment: (comment: Comment) => {
    const newComment = {
      ...comment,
      createdAt: new Date()
    };
    comments.push(newComment);
    saveToStorage();
    return newComment;
  },
  
  updateComment: (commentId: string, data: Partial<Comment>) => {
    comments = comments.map(comment =>
      comment.id === commentId
        ? { ...comment, ...data, updatedAt: new Date() }
        : comment
    );
    saveToStorage();
    return comments.find(c => c.id === commentId);
  },
  
  deleteComment: (commentId: string) => {
    comments = comments.filter(comment => 
      comment.id !== commentId && comment.parentId !== commentId
    );
    saveToStorage();
  },
  
  getEpisodeComments: (episodeId: string) =>
    comments.filter(comment => comment.episodeId === episodeId),
  
  updateUserComments: (userId: string, nickname: string, avatar?: string) => {
    comments = comments.map(comment =>
      comment.userId === userId
        ? {
            ...comment,
            userNickname: nickname,
            ...(avatar !== undefined && { userAvatar: avatar }),
          }
        : comment
    );
    saveToStorage();
  },

  // Image persistence
  saveImage: (imageUrl: string, type: 'avatar' | 'thumbnail') => {
    try {
      const images = JSON.parse(localStorage.getItem('persistedImages') || '{}');
      images[imageUrl] = {
        url: imageUrl,
        type,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('persistedImages', JSON.stringify(images));
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  },

  getImage: (imageUrl: string) => {
    try {
      const images = JSON.parse(localStorage.getItem('persistedImages') || '{}');
      return images[imageUrl];
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  },

  // Clear all data (useful for testing)
  clearStorage: () => {
    users = [getDefaultAdmin()];
    comments = [];
    localStorage.removeItem('users');
    localStorage.removeItem('comments');
    localStorage.removeItem('persistedImages');
  }
};
