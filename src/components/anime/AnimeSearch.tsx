import { Search, Filter } from 'lucide-react';
import { useAnimeStore } from '@/store/anime';

export default function AnimeSearch() {
  const { searchTerm, filters, setSearchTerm, setFilter } = useAnimeStore();

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-gray-800/50 border border-gray-700 pl-10 pr-4 py-2
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          />
        </div>
        <button
          onClick={() => document.getElementById('filters')?.classList.toggle('hidden')}
          className="flex items-center gap-2 rounded-lg bg-gray-800/50 px-4 py-2 text-gray-300 hover:bg-gray-700"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div id="filters" className="hidden space-y-4 rounded-lg bg-gray-800/50 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            >
              <option value="">All</option>
              <option value="ONGOING">Ongoing</option>
              <option value="FINISHED">Finished</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => setFilter('genre', e.target.value)}
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            >
              <option value="">All</option>
              <option value="Action">Action</option>
              <option value="Adventure">Adventure</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
              <option value="Fantasy">Fantasy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Year</label>
            <input
              type="number"
              value={filters.year || ''}
              onChange={(e) => setFilter('year', e.target.value ? Number(e.target.value) : null)}
              min="1950"
              max={new Date().getFullYear() + 1}
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Minimum Rating</label>
            <input
              type="number"
              value={filters.rating || ''}
              onChange={(e) => setFilter('rating', e.target.value ? Number(e.target.value) : null)}
              min="0"
              max="10"
              step="0.1"
              className="mt-1 w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
