'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-brand-midnight flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-lavender flex items-center justify-center shadow-glow-sm">
                        <span className="text-white font-bold text-2xl leading-none">H</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-white/60">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-brand-lavender hover:text-white transition-colors">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-card p-8">
                    <form className="space-y-6">

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80">Full Name</label>
                            <input type="text" className="input-dark px-4 py-2.5 rounded-lg" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80">Email address</label>
                            <input type="email" className="input-dark px-4 py-2.5 rounded-lg" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80">Password</label>
                            <input type="password" className="input-dark px-4 py-2.5 rounded-lg" />
                        </div>

                        <Button type="button" className="w-full bg-brand-violet hover:bg-brand-violet/80 text-white shadow-glow-sm h-11">
                            Create Account
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
