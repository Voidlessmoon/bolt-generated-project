import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/auth/validation';
import { authService } from '@/lib/auth/service';
import { useAuth } from '@/store/auth';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { generateCaptcha } from '@/lib/utils';
import type { RegisterInput } from '@/types/auth';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const setAuth = useAuth(state => state.setAuth);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaCode(newCaptcha);
    setValue('captcha', '');
  };

  const onSubmit = async (data: RegisterInput) => {
    if (data.captcha !== captchaCode) {
      setToast({ message: 'Invalid captcha code', type: 'error' });
      refreshCaptcha();
      return;
    }

    try {
      setIsLoading(true);
      const { token, user } = await authService.register(data);
      setAuth(user, token);
      setToast({ message: 'Registration successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setToast({ 
        message: error instanceof Error ? error.message : 'Registration failed', 
        type: 'error' 
      });
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-gray-400">Join Anime Wizard today</p>
        </div>

        <div className="mt-8 bg-gray-900/50 backdrop-blur-sm py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-800">
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
              <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                Username
              </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                autoComplete="username"
                disabled={isLoading}
                className="mt-2 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                         text-white placeholder-gray-400
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                         disabled:opacity-50 transition-all duration-200"
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-400">{errors.username.message}</p>
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
                autoComplete="new-password"
                disabled={isLoading}
                className="mt-2 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                         text-white placeholder-gray-400
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                         disabled:opacity-50 transition-all duration-200"
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                disabled={isLoading}
                className="mt-2 block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                         text-white placeholder-gray-400
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                         disabled:opacity-50 transition-all duration-200"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-200">
                Verification Code
              </label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex-1">
                  <input
                    {...register('captcha')}
                    type="text"
                    id="captcha"
                    disabled={isLoading}
                    className="block w-full rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3
                             text-white placeholder-gray-400
                             focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                             disabled:opacity-50 transition-all duration-200"
                    placeholder="Enter code"
                  />
                  {errors.captcha && (
                    <p className="mt-2 text-sm text-red-400">{errors.captcha.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded bg-gray-800 px-4 py-3 font-mono text-lg text-white tracking-wider">
                    {captchaCode}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={refreshCaptcha}
                    disabled={isLoading}
                  >
                    ↻
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 text-base font-medium transition-all duration-200 
                       hover:translate-y-[-1px] hover:shadow-lg" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
