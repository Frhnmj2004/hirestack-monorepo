'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();

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
        <div className="min-h-screen bg-brand-midnight flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-lavender flex items-center justify-center shadow-glow-sm">
                        <span className="text-white font-bold text-2xl leading-none">H</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-white/60">
                    Or{' '}
                    <Link href="/register" className="font-medium text-brand-lavender hover:text-white transition-colors">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card p-8">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80">Email address</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="input-dark px-4 py-2.5 rounded-lg"
                                placeholder="you@company.com"
                            />
                            {errors.email && <span className="text-red-400 text-xs">{errors.email.message}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-white/80">Password</label>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-brand-lavender hover:text-white transition-colors">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                            <input
                                type="password"
                                {...register('password')}
                                className="input-dark px-4 py-2.5 rounded-lg"
                            />
                            {errors.password && <span className="text-red-400 text-xs">{errors.password.message}</span>}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm h-11"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
