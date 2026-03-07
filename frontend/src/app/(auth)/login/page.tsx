'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators';
import { z } from 'zod';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockUser = { id: '1', name: 'Admin User', email: data.email, role: 'admin' as const };
        login(mockUser, 'mock_token_123');
        router.push(ROUTES.DASHBOARD);
    };

    return (
        <div className="w-full h-full min-h-screen bg-[#0B0726] flex items-center justify-center p-4 sm:p-8">
            <div className="flex flex-col md:flex-row w-full max-w-5xl h-full min-h-[600px] bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                {/* Left Panel */}
                <div className="flex-1 relative overflow-hidden hidden md:block p-2 pl-2 rounded-l-[2rem]">
                    <div className="absolute top-8 left-8 z-10">
                        <button
                            onClick={() => router.push('/')}
                            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all cursor-pointer border border-white/10"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative">
                        <img
                            src="https://i.ibb.co/dJxBbFks/brandasset.png"
                            alt="Brand Asset"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-sans tracking-tight">Log in</h1>
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-brand-violet hover:text-brand-lavender font-medium transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email Field */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                placeholder="you@company.com"
                                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-brand-violet focus:ring-brand-violet/20'} rounded-xl focus:ring-2 outline-none transition-all text-gray-900 bg-gray-50/50`}
                            />
                            {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <a href="#" className="text-sm font-medium text-brand-violet hover:text-brand-lavender transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-3 pr-12 border ${errors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-brand-violet focus:ring-brand-violet/20'} rounded-xl focus:ring-2 outline-none transition-all text-gray-900 bg-gray-50/50`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#0B0726] text-white py-3.5 px-4 rounded-xl font-medium hover:bg-[#1A1147] transition-all shadow-lg hover:shadow-xl mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                            {isSubmitting ? 'Signing in...' : 'Log In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
