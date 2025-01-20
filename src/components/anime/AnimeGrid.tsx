import { useAnimeStore } from '@/store/anime';
import AnimeCard from '@/components/AnimeCard';

export default function AnimeGrid() {
  const { animes, searchTerm, filters } = useAnimeStore();

  console.log('Current animes:', animes); // Debug log

  const filteredAnimes = animes.filter((anime) => {
    const matchesSearch = anime.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || anime.status === filters.status;
    const matchesGenre = !filters.genre || anime.genres.includes(filters.genre);
    const matchesYear = !filters.year || anime.year === filters.year;
    const matchesRating = !filters.rating || anime.rating >= filters.rating;

    return matchesSearch && matchesStatus && matchesGenre && matchesYear && matchesRating;
  });

  if (animes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">No anime found. Add some from the admin panel!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {filteredAnimes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
      
      {filteredAnimes.length === 0 && animes.length > 0 && (
        <div className="col-span-full flex items-center justify-center py-12">
          <p className="text-gray-400">No anime matches your search criteria.</p>
        </div>
      )}
    </div>
  );
}
