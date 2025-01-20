import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function generateCaptcha(length: number = 6): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
}

export function generateUsername(): string {
  const adjectives = [
    'Happy', 'Lucky', 'Sunny', 'Cool', 'Epic', 'Swift', 'Brave', 'Noble',
    'Royal', 'Rapid', 'Wild', 'Bold', 'Wise', 'Pure', 'Free', 'Elite'
  ];
  
  const nouns = [
    'Panda', 'Tiger', 'Eagle', 'Wolf', 'Lion', 'Bear', 'Hawk', 'Fox',
    'Dragon', 'Phoenix', 'Falcon', 'Raven', 'Shark', 'Cobra', 'Viper'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 9999);
  
  return `${randomAdjective}${randomNoun}${randomNum}`;
}
