import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useAnimeStore } from '@/store/anime';
import { cn } from '@/lib/utils';

interface AnimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function AnimeSelect({ value, onChange, className }: AnimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { animes } = useAnimeStore();
  const selectedAnime = animes.find(anime => anime.id === value);

  const filteredAnimes = animes.filter(anime =>
    anime.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-2
                 text-white
                 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
      >
        <span className="truncate">
          {selectedAnime ? selectedAnime.title : 'Select Anime'}
        </span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search anime..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md bg-gray-900 pl-10 pr-4 py-2
                         text-white placeholder-gray-400
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-auto">
            <div className="p-2">
              {filteredAnimes.map((anime) => (
                <button
                  key={anime.id}
                  type="button"
                  onClick={() => {
                    onChange(anime.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-md px-4 py-2 text-left",
                    value === anime.id
                      ? "bg-purple-600 text-white"
                      : "text-white hover:bg-gray-700"
                  )}
                >
                  {anime.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
