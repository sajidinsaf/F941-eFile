import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setAuth(response.user, response.accessToken, response.refreshToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start filing Form 941 electronically today.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="input-label">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
              placeholder="John"
              {...register('firstName')}
            />
            {errors.firstName && <p className="input-error">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="input-label">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
              placeholder="Doe"
              {...register('lastName')}
            />
            {errors.lastName && <p className="input-error">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="input-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="you@company.com"
            {...register('email')}
          />
          {errors.email && <p className="input-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Min. 8 characters"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="input-error">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="input-label">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="Repeat your password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="input-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Cloudflare Turnstile CAPTCHA placeholder */}
        <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-xs text-gray-400">CAPTCHA verification will appear here</p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isLoading}>
          {isLoading ? (
            <LoadingSpinner size={20} />
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
