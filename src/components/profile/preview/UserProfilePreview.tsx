import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { useAnimeListStore } from '@/store/animelist';
import { useUserStore } from '@/store/user';
import { cn } from '@/lib/utils';
import { MessageSquare, UserPlus, Calendar, UserMinus } from 'lucide-react';
import Button from '@/components/ui/Button';
import AnimeList from './AnimeList';
import UserStats from './UserStats';

interface UserProfilePreviewProps {
  userId: string;
  children: React.ReactNode;
  showOnClick?: boolean;
  placement?: 'top' | 'bottom';
}

export default function UserProfilePreview({ 
  userId, 
  children,
  showOnClick = false,
  placement = 'bottom'
}: UserProfilePreviewProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuth();
  const users = useUserStore(state => state.users);
  const user = users.find(u => u.id === userId);

  // Ensure user store is initialized
  useEffect(() => {
    useUserStore.getState().initializeUsers();
  }, []);

  useEffect(() => {
    const calculatePosition = () => {
      if (!triggerRef.current || !previewRef.current || !isOpen) return;
      
      const trigger = triggerRef.current.getBoundingClientRect();
      const preview = previewRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let x = trigger.left;
      let y = placement === 'bottom' ? trigger.bottom + 8 : trigger.top - preview.height - 8;

      if (x + preview.width > viewportWidth - 16) {
        x = viewportWidth - preview.width - 16;
      }
      if (x < 16) {
        x = 16;
      }

      if (y + preview.height > viewportHeight - 16) {
        y = trigger.top - preview.height - 8;
      }
      if (y < 16) {
        y = trigger.bottom + 8;
      }

      setPosition({ x, y });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [isOpen, placement]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        previewRef.current && 
        !previewRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (showOnClick) {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    navigate(`/profile/${userId}`);
  };

  if (!user) return <>{children}</>;

  const isCurrentUser = currentUser?.id === userId;
  const isFollowing = false; // TODO: Implement following system

  return (
    <div ref={triggerRef} className="relative inline-block">
      <div 
        onClick={handleClick}
        className="cursor-pointer"
      >
        {children}
      </div>
      
      {isOpen && showOnClick && (
        <div 
          ref={previewRef}
          className="fixed z-50 w-80 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <div className="overflow-hidden rounded-lg bg-gray-900 shadow-lg ring-1 ring-gray-800">
            {/* Banner */}
            <div className="relative">
              <div className="h-24 w-full overflow-hidden">
                {user.banner ? (
                  <img
                    src={user.banner}
                    alt="Profile banner"
                    className="h-full w-full object-cover"
                    key={user.banner}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-gray-800 to-gray-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
              </div>

              {/* Profile Info */}
              <div className="absolute -bottom-8 left-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.nickname || user.username}
                    className="h-16 w-16 rounded-full border-2 border-gray-900 object-cover"
                    key={user.avatar}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full border-2 border-gray-900 bg-purple-600 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {(user.nickname || user.username)[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 p-4">
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-lg font-semibold text-white">
                  {user.nickname || user.username}
                </h3>
                <p className="flex items-center gap-1 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>

              {!isCurrentUser && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">
                    {isFollowing ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <UserStats userId={userId} />

            {/* Bio */}
            {user.bio && (
              <div className="border-t border-gray-800 px-4 py-3">
                <p className="text-sm text-gray-300 line-clamp-2">{user.bio}</p>
              </div>
            )}

            {/* Anime Lists */}
            <AnimeList userId={userId} />

            {/* View Profile Button */}
            <button
              onClick={handleViewProfile}
              className="w-full border-t border-gray-800 p-2 text-sm text-purple-400 hover:bg-gray-800"
            >
              View Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
