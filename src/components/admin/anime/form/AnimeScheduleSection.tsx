import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import type { AnimeEditInput } from '@/types/anime';

const DAYS = [
  'MONDAY',
  'TUESDAY', 
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
] as const;

interface AnimeScheduleSectionProps {
  register: UseFormRegister<AnimeEditInput>;
  errors: FieldErrors<AnimeEditInput>;
  showSchedule: boolean;
}

export default function AnimeScheduleSection({ register, errors, showSchedule }: AnimeScheduleSectionProps) {
  if (!showSchedule) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Episode Schedule</h3>
      
      <div className="rounded-lg bg-gray-800/50 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            {...register('schedule.day')}
            className="w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {errors.schedule?.day && (
          <p className="mt-1 text-sm text-red-400">{errors.schedule.day.message}</p>
        )}

        <p className="text-sm text-gray-400">
          Select the day when new episodes will be released. This helps viewers know when to expect new content.
        </p>
      </div>
    </div>
  );
}
