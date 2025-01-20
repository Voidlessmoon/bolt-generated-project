import AnimeSearch from '@/components/anime/AnimeSearch';
import AnimeGrid from '@/components/anime/AnimeGrid';
import PinnedAnimeSection from '@/components/anime/PinnedAnimeSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Pinned Anime Section */}
        <div className="mb-12">
          <PinnedAnimeSection />
        </div>

        <h1 className="text-3xl font-bold text-white mb-8">Explore Anime</h1>
        
        {/* Search and Filters */}
        <div className="mb-8">
          <AnimeSearch />
        </div>

        {/* Anime Grid */}
        <AnimeGrid />
      </div>
    </div>
  );
}
