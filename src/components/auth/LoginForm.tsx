import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/auth';
import { loginUser } from '@/lib/api';
import type { LoginInput } from '@/types/auth';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/store/auth';

export default function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const setAuth = useAuth(state => state.setAuth);

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      const { token, user } = await loginUser(data);
      setAuth(user, token);
      setToast({ message: 'Successfully logged in!', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Login failed', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            disabled={isLoading}
            className="mt-2 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                     disabled:opacity-50 transition-all duration-200"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            autoComplete="current-password"
            disabled={isLoading}
            className="mt-2 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                     text-white placeholder-gray-400
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                     disabled:opacity-50 transition-all duration-200"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 bg-gray-800/50 text-purple-600 
                       focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <button
            type="button"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </button>
        </div>

        <Button 
          type="submit" 
          className="w-full py-3 text-base font-medium transition-all duration-200 
                   hover:translate-y-[-1px] hover:shadow-lg" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Sign up
          </button>
        </p>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
