import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Book, Scroll, Timer } from 'lucide-react';
import { useAnimeStore } from '@/store/anime';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function PinnedAnimeSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { animes } = useAnimeStore();
  const pinnedAnimes = animes
    .filter(anime => anime.isPinned)
    .sort((a, b) => {
      if (!a.pinnedAt || !b.pinnedAt) return 0;
      return new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime();
    })
    .slice(0, 5);

  const slideToIndex = (index: number) => {
    if (isAnimating || !containerRef.current) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrevious = () => {
    if (pinnedAnimes.length <= 1) return;
    const newIndex = currentIndex === 0 ? pinnedAnimes.length - 1 : currentIndex - 1;
    slideToIndex(newIndex);
  };

  const handleNext = () => {
    if (pinnedAnimes.length <= 1) return;
    const newIndex = currentIndex === pinnedAnimes.length - 1 ? 0 : currentIndex + 1;
    slideToIndex(newIndex);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, pinnedAnimes.length]);

  // Auto-advance slides every 5 seconds if not hovering
  useEffect(() => {
    if (pinnedAnimes.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, pinnedAnimes.length]);

  if (pinnedAnimes.length === 0) return null;

  return (
    <div 
      className="relative overflow-hidden bg-gray-900/50 rounded-lg p-6 backdrop-blur-sm"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="text-2xl font-bold text-white mb-6">Featured Anime</h2>

      {pinnedAnimes.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white 
                     opacity-75 transition-opacity hover:opacity-100 backdrop-blur-sm"
            aria-label="Previous anime"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white 
                     opacity-75 transition-opacity hover:opacity-100 backdrop-blur-sm"
            aria-label="Next anime"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div ref={containerRef} className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {pinnedAnimes.map((anime) => (
            <Link
              key={anime.id}
              to={`/anime/${anime.id}`}
              className="w-full flex-shrink-0 px-4 group"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img
                  src={anime.backgroundImage || anime.coverImage}
                  alt={anime.title}
                  className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-sm font-medium",
                      {
                        "bg-blue-500/80 text-white": anime.status === "ONGOING",
                        "bg-green-500/80 text-white": anime.status === "FINISHED",
                        "bg-yellow-500/80 text-white": anime.status === "UPCOMING",
                      }
                    )}>
                      {anime.status}
                    </span>

                    {anime.adaptedFrom && anime.adaptedFrom.type !== 'ORIGINAL' && (
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium",
                        anime.adaptedFrom.type === 'MANGA'
                          ? "bg-purple-500/80 text-white"
                          : "bg-indigo-500/80 text-white"
                      )}>
                        {anime.adaptedFrom.type === 'MANGA' ? (
                          <Book className="h-4 w-4" />
                        ) : (
                          <Scroll className="h-4 w-4" />
                        )}
                        {anime.adaptedFrom.status === 'ONGOING' && (
                          <Timer className="h-4 w-4" />
                        )}
                        {anime.adaptedFrom.type}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {anime.title}
                  </h3>
                  
                  <p className="text-gray-200 line-clamp-2 mb-4">{anime.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-gray-300">
                      {anime.episodes} Episodes
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {anime.genres.slice(0, 3).map((genre) => (
                        <span 
                          key={genre}
                          className="rounded-full bg-gray-800/60 px-2 py-1 text-xs text-gray-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {pinnedAnimes.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {pinnedAnimes.map((_, index) => (
            <button
              key={index}
              onClick={() => slideToIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-purple-500 w-4"
                  : "bg-gray-600 w-2 hover:bg-gray-500"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
