import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="mt-2 text-gray-400">Welcome to AnimeStream</p>
        </div>
        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-800">
          {children}
        </div>
      </div>
    </div>
  );
}
