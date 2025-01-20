import { useAnimeStore } from '@/store/anime';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY', 
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
] as const;

export default function Schedule() {
  const animes = useAnimeStore(state => state.animes);

  // Filter only ongoing animes and group by day
  const scheduleByDay = DAYS.reduce((acc, day) => {
    const animesForDay = animes.filter(
      anime => 
        // Only show anime that are:
        // 1. Currently ongoing
        // 2. Have a schedule
        // 3. Are scheduled for this day
        anime.status === 'ONGOING' && 
        anime.schedule?.day === day
    );
    return { ...acc, [day]: animesForDay };
  }, {} as Record<string, typeof animes>);

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Weekly Schedule</h1>
        </div>

        <div className="space-y-8">
          {DAYS.map(day => {
            const dayAnimes = scheduleByDay[day] || [];
            
            return (
              <div key={day} className="rounded-lg bg-gray-900/50 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </h2>

                {dayAnimes.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {dayAnimes.map(anime => (
                      <Link
                        key={anime.id}
                        to={`/anime/${anime.id}`}
                        className="flex gap-4 rounded-lg bg-gray-800/50 p-4 hover:bg-gray-800 transition-colors"
                      >
                        <img
                          src={anime.coverImage}
                          alt={anime.title}
                          className="h-24 w-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {anime.title}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                              "bg-blue-500/10 text-blue-400"
                            )}>
                              {anime.episodes} Episodes
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No releases scheduled</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
